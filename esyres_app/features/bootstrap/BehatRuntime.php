<?php

use App\Models\AssistantIntake;
use App\Models\Booking;
use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use App\Models\Worker;
use App\Push\FakePushGateway;
use App\Push\PushGateway;
use App\Sms\FakeSmsGateway;
use App\Sms\SmsGateway;
use Dotenv\Dotenv;
use Illuminate\Contracts\Console\Kernel as ConsoleKernel;
use Illuminate\Foundation\Testing\Concerns\MakesHttpRequests;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schema;

trait BehatRuntime
{
    use MakesHttpRequests;

    /** @var \Illuminate\Foundation\Application */
    protected $app;

    /** @var array<string, mixed> */
    protected array $graphql = [];

    protected ?User $user = null;

    protected ?Salon $salon = null;

    protected ?Service $service = null;

    protected ?Worker $worker = null;

    /** @var list<Service> */
    protected array $services = [];

    protected ?User $otherUser = null;

    protected ?Salon $otherSalon = null;

    protected ?Worker $otherWorker = null;

    protected ?Booking $booking = null;

    protected ?Booking $firstCustomerBooking = null;

    protected ?AssistantIntake $intake = null;

    protected ?string $intakeToken = null;

    protected ?string $verifyUrl = null;

    protected ?User $verifyUser = null;

    protected ?string $lastLocation = null;

    protected ?string $ownerRespondedAt = null;

    protected ?int $occupancyPercent = null;

    protected ?string $rememberedDayStamp = null;

    protected ?string $rememberedHourStamp = null;

    /** @BeforeScenario */
    public function bootApplication(): void
    {
        $this->defaultHeaders = [];
        $this->defaultCookies = [];
        $this->graphql = [];
        $this->user = null;
        $this->salon = null;
        $this->service = null;
        $this->worker = null;
        $this->services = [];
        $this->otherUser = null;
        $this->otherSalon = null;
        $this->otherWorker = null;
        $this->booking = null;
        $this->firstCustomerBooking = null;
        $this->intake = null;
        $this->intakeToken = null;
        $this->verifyUrl = null;
        $this->verifyUser = null;
        $this->lastLocation = null;
        $this->ownerRespondedAt = null;
        $this->occupancyPercent = null;
        $this->rememberedDayStamp = null;
        $this->rememberedHourStamp = null;

        if (BehatKernel::$app === null) {
            $this->bootEnvironment();
            BehatKernel::$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
            BehatKernel::$app->loadEnvironmentFrom('.env.behat');
            BehatKernel::$app->make(ConsoleKernel::class)->bootstrap();
            $hasher = Hash::driver();
            if (method_exists($hasher, 'setRounds')) {
                $hasher->setRounds(4);
            }
            $database = DB::connection()->getDatabaseName();
            if ($database !== 'esyres_test' || config('database.connections.mysql.database') !== 'esyres_test') {
                throw new RuntimeException('Behat connected to '.$database.' instead of esyres_test');
            }
            Artisan::call('migrate:fresh');
            BehatKernel::$tablesToTruncate = [];
            foreach (Schema::getTableListing($database, false) as $table) {
                if ($table !== 'migrations' && ! str_contains($table, '.')) {
                    BehatKernel::$tablesToTruncate[] = $table;
                }
            }
        }
        $this->app = BehatKernel::$app;
        $this->app['env'] = 'testing';
        $this->truncateData();
        Cache::flush();
        Carbon::setTestNow(Carbon::parse('2026-08-29 09:00:00', 'Europe/Sarajevo'));
        $sms = $this->app->make(SmsGateway::class);
        if ($sms instanceof FakeSmsGateway) {
            $sms->reset();
        }
        $push = $this->app->make(PushGateway::class);
        if ($push instanceof FakePushGateway) {
            $push->reset();
        }
        $this->resetAuth();
        $this->withCredentials();
        Notification::fake();
    }

    private function bootEnvironment(): void
    {
        $base = dirname(__DIR__, 2);
        $path = $base.DIRECTORY_SEPARATOR.'.env.behat';
        if (! is_file($path)) {
            throw new RuntimeException('.env.behat is missing');
        }
        Dotenv::createUnsafeMutable($base, '.env.behat')->load();
        $key = (string) ($_ENV['APP_KEY'] ?? getenv('APP_KEY') ?: '');
        if ($key === '') {
            $this->putEnv('APP_KEY', 'base64:'.base64_encode(random_bytes(32)));
        }
        $appEnv = (string) ($_ENV['APP_ENV'] ?? '');
        $database = (string) ($_ENV['DB_DATABASE'] ?? '');
        if ($appEnv !== 'testing' || $database !== 'esyres_test') {
            throw new RuntimeException('Behat must use APP_ENV=testing and DB_DATABASE=esyres_test');
        }
    }

    private function resetAuth(): void
    {
        if ($this->app->bound('session')) {
            $this->app['session']->flush();
        }
        $this->forgetRequestUser();
        $this->app['auth']->forgetGuards();
    }

    protected function forgetRequestUser(): void
    {
        $this->app['auth']->guard('web')->forgetUser();
    }

    private function truncateData(): void
    {
        Schema::disableForeignKeyConstraints();
        foreach (BehatKernel::$tablesToTruncate ?? [] as $table) {
            DB::table($table)->truncate();
        }
        Schema::enableForeignKeyConstraints();
    }

    /**
     * @param  array<string, mixed>  $variables
     */
    protected function graphql(string $query, array $variables = []): void
    {
        $this->forgetRequestUser();
        $response = $this->postJson('/graphql', [
            'query' => $query,
            'variables' => $variables,
        ]);
        if ($response->status() === 419) {
            throw new RuntimeException('CSRF mismatch on /graphql');
        }
        $this->rememberCookies($response);
        $this->withHeader('X-CSRF-TOKEN', $this->app['session']->token());
        $this->graphql = $response->json() ?? [
            'raw' => $response->getContent(),
            'status' => $response->status(),
        ];
    }

    protected function rememberCookies(\Illuminate\Testing\TestResponse $response): void
    {
        foreach ($response->headers->getCookies() as $cookie) {
            $this->withCookie($cookie->getName(), $cookie->getValue());
        }
    }

    protected function assertNoGraphqlErrors(): void
    {
        if (isset($this->graphql['errors']) || ! isset($this->graphql['data'])) {
            throw new RuntimeException('Unexpected GraphQL payload: '.json_encode($this->graphql));
        }
    }

    protected function assertTrue(mixed $value, string $message = ''): void
    {
        if ($value !== true) {
            throw new RuntimeException($message !== '' ? $message : 'Expected true');
        }
    }

    protected function assertSame(mixed $expected, mixed $actual): void
    {
        if ($expected !== $actual) {
            throw new RuntimeException('Expected '.json_encode($expected).' got '.json_encode($actual));
        }
    }

    protected function assertNotNull(mixed $value): void
    {
        if ($value === null) {
            throw new RuntimeException('Expected not null');
        }
    }

    protected function assertLessThan(int $expected, int $actual): void
    {
        if ($actual >= $expected) {
            throw new RuntimeException("Expected {$actual} < {$expected}");
        }
    }

    protected function assertIsArray(mixed $value): void
    {
        if (! is_array($value)) {
            throw new RuntimeException('Expected array, got '.json_encode($value));
        }
    }

    /**
     * @Given the app environment is local
     */
    public function theAppEnvironmentIsLocal(): void
    {
        $this->app['env'] = 'local';
    }

    /** @AfterScenario */
    public function restoreTestingEnvironment(): void
    {
        if (isset($this->app)) {
            $this->app['env'] = 'testing';
        }
    }

    private function putEnv(string $key, string $value): void
    {
        putenv($key.'='.$value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}
