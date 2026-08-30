<?php

use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use App\Models\Worker;
use Illuminate\Contracts\Console\Kernel as ConsoleKernel;
use Illuminate\Foundation\Testing\Concerns\MakesHttpRequests;
use Illuminate\Support\Facades\Artisan;
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

        if (BehatKernel::$app === null) {
            $this->bootEnvironment();
            BehatKernel::$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
            BehatKernel::$app->make(ConsoleKernel::class)->bootstrap();
            $hasher = Hash::driver();
            if (method_exists($hasher, 'setRounds')) {
                $hasher->setRounds(4);
            }
            Artisan::call('migrate:fresh');
            BehatKernel::$tablesToTruncate = [];
            foreach (Schema::getTableListing() as $table) {
                if ($table !== 'migrations') {
                    BehatKernel::$tablesToTruncate[] = $table;
                }
            }
        }
        $this->app = BehatKernel::$app;
        $this->truncateData();
        $this->resetAuth();
        $this->withCredentials();
        Notification::fake();
    }

    private function bootEnvironment(): void
    {
        $this->putEnv('APP_ENV', 'testing');
        $this->putEnv('APP_URL', 'http://localhost');
        $this->putEnv('BCRYPT_ROUNDS', '4');
        $this->putEnv('DB_CONNECTION', 'mysql');
        $this->putEnv('DB_HOST', 'mysql');
        $this->putEnv('DB_PORT', '3306');
        $this->putEnv('DB_DATABASE', 'esyres_test');
        $this->putEnv('DB_USERNAME', 'esyres');
        $this->putEnv('DB_PASSWORD', 'secret');
        $this->putEnv('CACHE_STORE', 'array');
        $this->putEnv('SESSION_DRIVER', 'array');
        $this->putEnv('QUEUE_CONNECTION', 'sync');
        $this->putEnv('APP_TIMEZONE', 'Europe/Sarajevo');
        $this->putEnv('LIGHTHOUSE_SCHEMA_CACHE_ENABLE', 'false');
        $this->putEnv('LIGHTHOUSE_QUERY_CACHE_ENABLE', 'false');
    }

    private function resetAuth(): void
    {
        if ($this->app->bound('session')) {
            $this->app['session']->flush();
        }
        $this->app['auth']->guard('web')->forgetUser();
        $this->app['auth']->forgetGuards();
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

    private function putEnv(string $key, string $value): void
    {
        putenv($key.'='.$value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}
