<?php

use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use App\Models\Worker;
use App\Notifications\VerifyEmail;
use App\SalonHours\WeeklyHours;
use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Illuminate\Contracts\Console\Kernel as ConsoleKernel;
use Illuminate\Foundation\Testing\Concerns\MakesHttpRequests;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schema;

class FeatureContext implements Context
{
    use MakesHttpRequests;

    /** @var \Illuminate\Foundation\Application */
    protected $app;

    /** @var array<string, mixed> */
    private array $graphql = [];

    private ?User $user = null;

    private ?Salon $salon = null;

    private ?Service $service = null;

    private ?Worker $worker = null;

    /** @var list<Service> */
    private array $services = [];

    private ?User $otherUser = null;

    private static bool $schemaReady = false;

    /** @var \Illuminate\Foundation\Application|null */
    private static $sharedApp = null;

    /** @BeforeScenario */
    public function bootApplication(): void
    {
        $this->putEnv('APP_ENV', 'local');
        $this->putEnv('APP_URL', 'http://localhost');
        $this->putEnv('DB_CONNECTION', 'mysql');
        $this->putEnv('DB_HOST', 'mysql');
        $this->putEnv('DB_PORT', '3306');
        $this->putEnv('DB_DATABASE', 'esyres_test');
        $this->putEnv('DB_USERNAME', 'esyres');
        $this->putEnv('DB_PASSWORD', 'secret');
        $this->putEnv('CACHE_STORE', 'array');
        $this->putEnv('SESSION_DRIVER', 'database');
        $this->putEnv('QUEUE_CONNECTION', 'sync');
        $this->putEnv('APP_TIMEZONE', 'Europe/Sarajevo');
        $this->putEnv('LIGHTHOUSE_SCHEMA_CACHE_ENABLE', 'false');
        $this->putEnv('LIGHTHOUSE_QUERY_CACHE_ENABLE', 'false');

        $this->defaultHeaders = [];
        $this->defaultCookies = [];
        $this->graphql = [];
        $this->user = null;
        $this->salon = null;
        $this->service = null;
        $this->worker = null;
        $this->services = [];
        $this->otherUser = null;

        if (self::$sharedApp === null) {
            self::$sharedApp = require dirname(__DIR__, 2).'/bootstrap/app.php';
            self::$sharedApp->make(ConsoleKernel::class)->bootstrap();
            Artisan::call('migrate:fresh');
            self::$schemaReady = true;
        }
        $this->app = self::$sharedApp;
        $this->truncateData();
        $this->resetAuth();
        $this->withCredentials();
        Notification::fake();
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
        foreach (Schema::getTableListing() as $table) {
            if ($table === 'migrations') {
                continue;
            }
            DB::table($table)->truncate();
        }
        Schema::enableForeignKeyConstraints();
    }

    /**
     * @Given a verified owner :email with password :password owns salon :name
     */
    public function aVerifiedOwnerOwnsSalon(string $email, string $password, string $name): void
    {
        $this->user = User::factory()->create([
            'email' => $email,
            'password' => $password,
            'email_verified_at' => now(),
        ]);
        $this->salon = Salon::factory()->create([
            'owner_id' => $this->user->id,
            'name' => $name,
        ]);
    }

    /**
     * @Given an unverified owner :email with password :password owns salon :name
     */
    public function anUnverifiedOwnerOwnsSalon(string $email, string $password, string $name): void
    {
        $this->user = User::factory()->unverified()->create([
            'email' => $email,
            'password' => $password,
        ]);
        $this->salon = Salon::factory()->create([
            'owner_id' => $this->user->id,
            'name' => $name,
        ]);
    }

    /**
     * @Given another verified user :email with password :password
     */
    public function anotherVerifiedUser(string $email, string $password): void
    {
        $this->otherUser = User::factory()->create([
            'email' => $email,
            'password' => $password,
            'email_verified_at' => now(),
        ]);
    }

    /**
     * @Given the salon has a service:
     */
    public function theSalonHasAService(PyStringNode $payload): void
    {
        $input = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->service = Service::factory()->create([
            'salon_id' => $this->salon->id,
            'name' => $input['name'],
            'category' => $input['category'],
            'duration_minutes' => $input['durationMinutes'],
            'price_feninga' => $input['priceFeninga'],
        ]);
        $this->services[] = $this->service;
    }

    /**
     * @Given the salon has a worker:
     */
    public function theSalonHasAWorker(PyStringNode $payload): void
    {
        $input = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->worker = Worker::factory()->create([
            'salon_id' => $this->salon->id,
            'name' => $input['name'],
        ]);
    }

    /**
     * @Given the salon has hours:
     */
    public function theSalonHasHours(PyStringNode $payload): void
    {
        $this->salon->hours = WeeklyHours::fromInput(json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR));
        $this->salon->save();
    }

    /**
     * @When I fetch the CSRF cookie
     */
    public function iFetchTheCsrfCookie(): void
    {
        $response = $this->get('/sanctum/csrf-cookie');
        if ($response->status() !== 204) {
            throw new RuntimeException('CSRF cookie endpoint returned '.$response->status());
        }
        $this->rememberCookies($response);
        $this->withHeader('X-CSRF-TOKEN', $this->app['session']->token());
        $this->withHeader('Accept', 'application/json');
        $this->withHeader('Referer', 'http://localhost');
        $this->withHeader('Origin', 'http://localhost');
    }

    /**
     * @When I log in as :email with password :password
     */
    public function iLogInAs(string $email, string $password): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->loginMutation(), [
            'email' => $email,
            'password' => $password,
        ]);
    }

    /**
     * @When I register as :email with password :password
     */
    public function iRegisterAs(string $email, string $password): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->registerMutation(), [
            'email' => $email,
            'password' => $password,
        ]);
    }

    /**
     * @When I register as :email with password :password and phone :phone
     */
    public function iRegisterAsWithPhone(string $email, string $password, string $phone): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->registerMutation(), [
            'email' => $email,
            'password' => $password,
            'phone' => $phone,
        ]);
    }

    /**
     * @When I log out
     */
    public function iLogOut(): void
    {
        $this->graphql($this->logoutMutation());
    }

    /**
     * @When I query me as a guest
     */
    public function iQueryMeAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->meQuery());
    }

    /**
     * @When I query me
     */
    public function iQueryMe(): void
    {
        $this->graphql($this->meQuery());
    }

    /**
     * @Then register succeeds for :email
     */
    public function registerSucceedsFor(string $email): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($email, $this->graphql['data']['register']['email']);
        $this->assertSame(false, $this->graphql['data']['register']['emailVerified']);
        $this->user = User::query()->where('email', $email)->first();
    }

    /**
     * @Then me is null
     */
    public function meIsNull(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(null, $this->graphql['data']['me']);
    }

    /**
     * @Then me email is :email
     */
    public function meEmailIs(string $email): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($email, $this->graphql['data']['me']['email']);
    }

    /**
     * @Then me email is not verified
     */
    public function meEmailIsNotVerified(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(false, $this->graphql['data']['me']['emailVerified']);
    }

    /**
     * @Then the customer has no phone
     */
    public function theCustomerHasNoPhone(): void
    {
        $this->assertSame(null, $this->customer()->phone);
    }

    /**
     * @Then the customer phone is :phone
     */
    public function theCustomerPhoneIs(string $phone): void
    {
        $this->assertSame($phone, $this->customer()->phone);
    }

    /**
     * @Then the customer phone is not verified
     */
    public function theCustomerPhoneIsNotVerified(): void
    {
        $this->assertSame(null, $this->customer()->phone_verified_at);
    }

    /**
     * @Then the customer name is :name
     */
    public function theCustomerNameIs(string $name): void
    {
        $this->assertSame($name, $this->customer()->name);
    }

    /**
     * @Then a verify-email notification was sent
     */
    public function aVerifyEmailNotificationWasSent(): void
    {
        Notification::assertSentTo($this->customer(), VerifyEmail::class);
    }

    /**
     * @Then the customer email is not verified in the database
     */
    public function theCustomerEmailIsNotVerifiedInTheDatabase(): void
    {
        $this->assertSame(null, $this->customer()->fresh()->email_verified_at);
    }

    /**
     * @Given a verified customer :email with password :password
     */
    public function aVerifiedCustomer(string $email, string $password): void
    {
        $this->user = User::factory()->create([
            'email' => $email,
            'password' => $password,
            'email_verified_at' => now(),
            'phone' => '+38761'.substr(sha1($email), 0, 6),
            'phone_verified_at' => now(),
        ]);
    }

    /**
     * @Given an unverified customer :email with password :password
     */
    public function anUnverifiedCustomer(string $email, string $password): void
    {
        $this->user = User::factory()->unverified()->create([
            'email' => $email,
            'password' => $password,
            'phone' => '+38761'.substr(sha1($email), 0, 6),
            'phone_verified_at' => now(),
        ]);
    }

    /**
     * @Given a customer :email with password :password whose phone is not verified
     */
    public function aCustomerWhosePhoneIsNotVerified(string $email, string $password): void
    {
        $this->user = User::factory()->create([
            'email' => $email,
            'password' => $password,
            'email_verified_at' => now(),
            'phone' => '+38761'.substr(sha1($email), 0, 6),
            'phone_verified_at' => null,
        ]);
    }

    /**
     * @When I create a booking as a guest on :date at :time with the salon services
     */
    public function iCreateABookingAsAGuestWithSalonServices(string $date, string $time): void
    {
        $this->iFetchTheCsrfCookie();
        $this->postCreateBooking($date, $time, $this->salonServiceIds(), null);
    }

    /**
     * @When I create a booking on :date at :time with the salon services
     */
    public function iCreateABookingWithSalonServices(string $date, string $time): void
    {
        $this->postCreateBooking($date, $time, $this->salonServiceIds(), null);
    }

    /**
     * @When I create a booking on :date at :time with no services
     */
    public function iCreateABookingWithNoServices(string $date, string $time): void
    {
        $this->postCreateBooking($date, $time, [], null);
    }

    /**
     * @When I create a booking on :date at :time with duplicate services
     */
    public function iCreateABookingWithDuplicateServices(string $date, string $time): void
    {
        $id = (string) $this->services[0]->id;
        $this->postCreateBooking($date, $time, [$id, $id], null);
    }

    /**
     * @When I create a booking on :date at :time with a foreign service
     */
    public function iCreateABookingWithAForeignService(string $date, string $time): void
    {
        $foreign = Service::factory()->create();
        $this->postCreateBooking($date, $time, [(string) $foreign->id], null);
    }

    /**
     * @When I create a booking on :date at :time with a foreign worker
     */
    public function iCreateABookingWithAForeignWorker(string $date, string $time): void
    {
        $foreign = Worker::factory()->create();
        $this->postCreateBooking($date, $time, $this->salonServiceIds(), (string) $foreign->id);
    }

    /**
     * @Then the booking status is :status
     */
    public function theBookingStatusIs(string $status): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($status, $this->graphql['data']['createBooking']['status']);
    }

    /**
     * @Then the booking has :count snapshots
     */
    public function theBookingHasSnapshots(string $count): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame((int) $count, count($this->graphql['data']['createBooking']['services']));
    }

    /**
     * @Then booking duration minutes is :minutes
     */
    public function bookingDurationMinutesIs(string $minutes): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame((int) $minutes, $this->graphql['data']['createBooking']['durationMinutes']);
    }

    /**
     * @Then booking snapshots match:
     */
    public function bookingSnapshotsMatch(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $actual = [];
        foreach ($this->graphql['data']['createBooking']['services'] as $row) {
            $actual[] = [
                'name' => $row['name'],
                'durationMinutes' => $row['durationMinutes'],
                'priceFeninga' => $row['priceFeninga'],
            ];
        }
        $this->assertSame($expected, $actual);
    }

    /**
     * @Then booking has no worker
     */
    public function bookingHasNoWorker(): void
    {
        $this->assertNoGraphqlErrors();
        $id = $this->graphql['data']['createBooking']['id'];
        $booking = \App\Models\Booking::query()->find($id);
        if ($booking === null || $booking->worker_id !== null) {
            throw new RuntimeException('Expected no worker, got '.json_encode($booking));
        }
    }

    /**
     * @param  list<string>  $serviceIds
     */
    private function postCreateBooking(string $date, string $time, array $serviceIds, ?string $workerId): void
    {
        $input = [
            'salonId' => (string) $this->salon->id,
            'serviceIds' => $serviceIds,
            'preferredDate' => $date,
            'preferredTime' => $time,
        ];
        if ($workerId !== null) {
            $input['workerId'] = $workerId;
        }
        $this->graphql($this->createBookingMutation(), ['input' => $input]);
    }

    /** @return list<string> */
    private function salonServiceIds(): array
    {
        $ids = [];
        foreach ($this->services as $service) {
            $ids[] = (string) $service->id;
        }

        return $ids;
    }

    /**
     * @Given the salon is at lat :lat lng :lng
     */
    public function theSalonIsAt(string $lat, string $lng): void
    {
        $this->salon->lat = (float) $lat;
        $this->salon->lng = (float) $lng;
        $this->salon->save();
    }

    /**
     * @Given that owner also owns salon :name
     */
    public function thatOwnerAlsoOwnsSalon(string $name): void
    {
        $this->salon = Salon::factory()->create([
            'owner_id' => $this->user->id,
            'name' => $name,
        ]);
    }

    /**
     * @Given that owner also owns salon :name at lat :lat lng :lng
     */
    public function thatOwnerAlsoOwnsSalonAt(string $name, string $lat, string $lng): void
    {
        $this->salon = Salon::factory()->create([
            'owner_id' => $this->user->id,
            'name' => $name,
            'lat' => (float) $lat,
            'lng' => (float) $lng,
        ]);
    }

    /**
     * @When I query salonsNearby lat :lat lng :lng as a guest
     */
    public function iQuerySalonsNearbyAsAGuest(string $lat, string $lng): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->salonsNearbyQuery(), [
            'lat' => (float) $lat,
            'lng' => (float) $lng,
        ]);
    }

    /**
     * @When I query salonsNearby lat :lat lng :lng limit :limit offset :offset as a guest
     */
    public function iQuerySalonsNearbyPagedAsAGuest(string $lat, string $lng, string $limit, string $offset): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->salonsNearbyQuery(), [
            'lat' => (float) $lat,
            'lng' => (float) $lng,
            'limit' => (int) $limit,
            'offset' => (int) $offset,
        ]);
    }

    /**
     * @When I query popularInSarajevo as a guest
     */
    public function iQueryPopularInSarajevoAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->popularInSarajevoQuery(), []);
    }

    /**
     * @When I query popularInSarajevo limit :limit offset :offset as a guest
     */
    public function iQueryPopularInSarajevoPagedAsAGuest(string $limit, string $offset): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->popularInSarajevoQuery(), [
            'limit' => (int) $limit,
            'offset' => (int) $offset,
        ]);
    }

    /**
     * @When I query salonsNearby lat :lat lng :lng with:
     */
    public function iQuerySalonsNearbyWith(string $lat, string $lng, PyStringNode $payload): void
    {
        $extra = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->salonsNearbyQuery(), array_merge([
            'lat' => (float) $lat,
            'lng' => (float) $lng,
        ], $extra));
    }

    /**
     * @When I query popularInSarajevo with:
     */
    public function iQueryPopularInSarajevoWith(PyStringNode $payload): void
    {
        $extra = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->popularInSarajevoQuery(), $extra);
    }

    /**
     * @Then the listed salon names are:
     */
    public function theListedSalonNamesAre(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $data = $this->graphql['data'];
        $list = $data['salonsNearby'] ?? $data['popularInSarajevo'] ?? null;
        if (! is_array($list)) {
            throw new RuntimeException('Expected a salon list, got '.json_encode($this->graphql));
        }
        $actual = [];
        foreach ($list as $salon) {
            $actual[] = $salon['name'];
        }
        $this->assertSame($expected, $actual);
    }

    /**
     * @When I query salon hours
     */
    public function iQuerySalonHours(): void
    {
        $this->graphql($this->salonQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I query the public salon as a guest
     */
    public function iQueryThePublicSalonAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->publicSalonQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I query salon :id as a guest
     */
    public function iQuerySalonAsAGuest(string $id): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->publicSalonQuery(), ['id' => $id]);
    }

    /**
     * @When I query salon owner fields as a guest
     */
    public function iQuerySalonOwnerFieldsAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->salonOwnerFieldsQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I query salon owner fields
     */
    public function iQuerySalonOwnerFields(): void
    {
        $this->graphql($this->salonOwnerFieldsQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I query salon busy level :date as a guest
     */
    public function iQuerySalonBusyLevelAsAGuest(string $date): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->busyLevelQuery(), [
            'id' => (string) $this->salon->id,
            'date' => $date,
        ]);
    }

    /**
     * @When I query salon services
     */
    public function iQuerySalonServices(): void
    {
        $this->graphql($this->salonServicesQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I create a salon service:
     */
    public function iCreateASalonService(PyStringNode $payload): void
    {
        $this->graphql($this->createServiceMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I create a salon service as a guest:
     */
    public function iCreateASalonServiceAsAGuest(PyStringNode $payload): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->createServiceMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I update the salon service:
     */
    public function iUpdateTheSalonService(PyStringNode $payload): void
    {
        $this->graphql($this->updateServiceMutation(), [
            'id' => (string) $this->service->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I query salon workers
     */
    public function iQuerySalonWorkers(): void
    {
        $this->graphql($this->salonWorkersQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I create a salon worker:
     */
    public function iCreateASalonWorker(PyStringNode $payload): void
    {
        $this->graphql($this->createWorkerMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I create a salon worker as a guest:
     */
    public function iCreateASalonWorkerAsAGuest(PyStringNode $payload): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->createWorkerMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I update the salon worker:
     */
    public function iUpdateTheSalonWorker(PyStringNode $payload): void
    {
        $this->graphql($this->updateWorkerMutation(), [
            'id' => (string) $this->worker->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I update salon hours with notice :hours:
     */
    public function iUpdateSalonHours(string $hours, PyStringNode $payload): void
    {
        $days = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->graphql($this->updateMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => [
                'hours' => $days,
                'cancellationNoticeHours' => (int) $hours,
            ],
        ]);
    }

    /**
     * @When I update salon hours as a guest with notice :hours:
     */
    public function iUpdateAsGuest(string $hours, PyStringNode $payload): void
    {
        $this->iFetchTheCsrfCookie();
        $days = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->graphql($this->updateMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => [
                'hours' => $days,
                'cancellationNoticeHours' => (int) $hours,
            ],
        ]);
    }

    /**
     * @Then the public salon name is :name
     */
    public function thePublicSalonNameIs(string $name): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($name, $this->graphql['data']['salon']['name']);
    }

    /**
     * @Then the salon is null
     */
    public function theSalonIsNull(): void
    {
        if (isset($this->graphql['errors'])) {
            $codes = [];
            foreach ($this->graphql['errors'] as $error) {
                $codes[] = $error['extensions']['code'] ?? $error['message'];
            }
            if (in_array('UNAUTHENTICATED', $codes, true) || in_array('FORBIDDEN', $codes, true)) {
                throw new RuntimeException('Expected salon null without UNAUTHENTICATED/FORBIDDEN, got '.json_encode($this->graphql));
            }
        }
        if (! array_key_exists('data', $this->graphql)
            || ! array_key_exists('salon', $this->graphql['data'])
            || $this->graphql['data']['salon'] !== null) {
            throw new RuntimeException('Expected salon null, got '.json_encode($this->graphql));
        }
    }

    /**
     * @Then busy level is :level
     */
    public function busyLevelIs(string $level): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($level, $this->graphql['data']['salon']['busyLevel']);
    }

    /**
     * @Then login succeeds
     */
    public function loginSucceeds(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($this->user->email, $this->graphql['data']['login']['email']);
        $this->assertTrue($this->graphql['data']['login']['emailVerified']);
    }

    /**
     * @Then the GraphQL error code is :code
     */
    public function theGraphqlErrorCodeIs(string $code): void
    {
        $payload = json_encode($this->graphql);
        if (! isset($this->graphql['errors'])) {
            throw new RuntimeException("Expected GraphQL error {$code}, got {$payload}");
        }
        $codes = [];
        foreach ($this->graphql['errors'] as $error) {
            $codes[] = $error['extensions']['code'] ?? $error['message'];
        }
        if (! in_array($code, $codes, true)) {
            throw new RuntimeException("Expected error {$code}, got {$payload}");
        }
    }

    /**
     * @Then the salon is closed every weekday
     */
    public function theSalonIsClosedEveryWeekday(): void
    {
        $this->assertNoGraphqlErrors();
        foreach ($this->graphql['data']['salon']['hours'] as $day) {
            $this->assertTrue($day['closed'], $day['weekday'].' should be closed');
        }
    }

    /**
     * @Then cancellation notice hours is :hours
     */
    public function cancellationNoticeHoursIs(string $hours): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame((int) $hours, $this->graphql['data']['salon']['cancellationNoticeHours']);
    }

    /**
     * @Then salon services are empty
     */
    public function salonServicesAreEmpty(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame([], $this->graphql['data']['salon']['services']);
    }

    /**
     * @Then salon services match:
     */
    public function salonServicesMatch(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $actual = [];
        foreach ($this->graphql['data']['salon']['services'] as $service) {
            $actual[] = [
                'name' => $service['name'],
                'category' => $service['category'],
                'durationMinutes' => $service['durationMinutes'],
                'priceFeninga' => $service['priceFeninga'],
            ];
        }
        $this->assertSame($expected, $actual);
    }

    /**
     * @Then salon workers are empty
     */
    public function salonWorkersAreEmpty(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame([], $this->graphql['data']['salon']['workers']);
    }

    /**
     * @Then salon workers match:
     */
    public function salonWorkersMatch(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $actual = [];
        foreach ($this->graphql['data']['salon']['workers'] as $worker) {
            $actual[] = [
                'name' => $worker['name'],
            ];
        }
        $this->assertSame($expected, $actual);
    }

    /**
     * @Then salon hours match:
     */
    public function salonHoursMatch(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame($expected, $this->graphql['data']['salon']['hours']);
    }

    /**
     * @param  array<string, mixed>  $variables
     */
    private function graphql(string $query, array $variables = []): void
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

    private function rememberCookies(\Illuminate\Testing\TestResponse $response): void
    {
        foreach ($response->headers->getCookies() as $cookie) {
            $this->withCookie($cookie->getName(), $cookie->getValue());
        }
    }

    private function assertNoGraphqlErrors(): void
    {
        if (isset($this->graphql['errors']) || ! isset($this->graphql['data'])) {
            throw new RuntimeException('Unexpected GraphQL payload: '.json_encode($this->graphql));
        }
    }

    private function assertTrue(mixed $value, string $message = ''): void
    {
        if ($value !== true) {
            throw new RuntimeException($message !== '' ? $message : 'Expected true');
        }
    }

    private function assertSame(mixed $expected, mixed $actual): void
    {
        if ($expected !== $actual) {
            throw new RuntimeException('Expected '.json_encode($expected).' got '.json_encode($actual));
        }
    }

    private function salonsNearbyQuery(): string
    {
        return <<<'GQL'
query Nearby($lat: Float!, $lng: Float!, $limit: Int, $offset: Int, $category: ServiceCategory, $name: String) {
  salonsNearby(lat: $lat, lng: $lng, limit: $limit, offset: $offset, category: $category, name: $name) {
    id
    name
  }
}
GQL;
    }

    private function popularInSarajevoQuery(): string
    {
        return <<<'GQL'
query Popular($limit: Int, $offset: Int, $category: ServiceCategory, $name: String) {
  popularInSarajevo(limit: $limit, offset: $offset, category: $category, name: $name) {
    id
    name
  }
}
GQL;
    }

    private function loginMutation(): string
    {
        return <<<'GQL'
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    id
    email
    emailVerified
  }
}
GQL;
    }

    private function registerMutation(): string
    {
        return <<<'GQL'
mutation Register($email: String!, $password: String!, $phone: String) {
  register(email: $email, password: $password, phone: $phone) {
    id
    email
    emailVerified
  }
}
GQL;
    }

    private function logoutMutation(): string
    {
        return <<<'GQL'
mutation {
  logout
}
GQL;
    }

    private function meQuery(): string
    {
        return <<<'GQL'
query Me {
  me {
    id
    email
    emailVerified
  }
}
GQL;
    }

    private function customer(): User
    {
        if ($this->user === null) {
            throw new RuntimeException('Expected a customer in the scenario');
        }

        return $this->user->fresh() ?? $this->user;
    }

    private function createBookingMutation(): string
    {
        return <<<'GQL'
mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    id
    status
    preferredDate
    preferredStartsAt
    durationMinutes
    services {
      name
      durationMinutes
      priceFeninga
    }
  }
}
GQL;
    }

    private function salonQuery(): string
    {
        return <<<'GQL'
query Salon($id: ID!) {
  salon(id: $id) {
    id
    name
    cancellationNoticeHours
    hours {
      weekday
      closed
      opensAt
      closesAt
      breakStartsAt
      breakEndsAt
    }
  }
}
GQL;
    }

    private function publicSalonQuery(): string
    {
        return <<<'GQL'
query PublicSalon($id: ID!) {
  salon(id: $id) {
    id
    name
    hours {
      weekday
      closed
      opensAt
      closesAt
      breakStartsAt
      breakEndsAt
    }
    services {
      id
      name
      category
      durationMinutes
      priceFeninga
    }
  }
}
GQL;
    }

    private function salonOwnerFieldsQuery(): string
    {
        return <<<'GQL'
query SalonOwnerFields($id: ID!) {
  salon(id: $id) {
    id
    cancellationNoticeHours
    workers {
      id
      name
    }
  }
}
GQL;
    }

    private function busyLevelQuery(): string
    {
        return <<<'GQL'
query SalonBusy($id: ID!, $date: String!) {
  salon(id: $id) {
    id
    busyLevel(date: $date)
  }
}
GQL;
    }

    private function updateMutation(): string
    {
        return <<<'GQL'
mutation Update($salonId: ID!, $input: UpdateSalonHoursInput!) {
  updateSalonHours(salonId: $salonId, input: $input) {
    id
    cancellationNoticeHours
    hours {
      weekday
      closed
      opensAt
      closesAt
      breakStartsAt
      breakEndsAt
    }
  }
}
GQL;
    }

    private function salonServicesQuery(): string
    {
        return <<<'GQL'
query Salon($id: ID!) {
  salon(id: $id) {
    id
    services {
      id
      name
      category
      durationMinutes
      priceFeninga
    }
  }
}
GQL;
    }

    private function createServiceMutation(): string
    {
        return <<<'GQL'
mutation Create($salonId: ID!, $input: CreateSalonServiceInput!) {
  createSalonService(salonId: $salonId, input: $input) {
    id
    name
    category
    durationMinutes
    priceFeninga
  }
}
GQL;
    }

    private function updateServiceMutation(): string
    {
        return <<<'GQL'
mutation UpdateService($id: ID!, $input: UpdateSalonServiceInput!) {
  updateSalonService(id: $id, input: $input) {
    id
    name
    category
    durationMinutes
    priceFeninga
  }
}
GQL;
    }

    private function salonWorkersQuery(): string
    {
        return <<<'GQL'
query Salon($id: ID!) {
  salon(id: $id) {
    id
    workers {
      id
      name
    }
  }
}
GQL;
    }

    private function createWorkerMutation(): string
    {
        return <<<'GQL'
mutation CreateWorker($salonId: ID!, $input: CreateSalonWorkerInput!) {
  createSalonWorker(salonId: $salonId, input: $input) {
    id
    name
  }
}
GQL;
    }

    private function updateWorkerMutation(): string
    {
        return <<<'GQL'
mutation UpdateWorker($id: ID!, $input: UpdateSalonWorkerInput!) {
  updateSalonWorker(id: $id, input: $input) {
    id
    name
  }
}
GQL;
    }

    private function putEnv(string $key, string $value): void
    {
        putenv($key.'='.$value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}
