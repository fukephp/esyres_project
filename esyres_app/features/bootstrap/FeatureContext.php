<?php

use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use App\Models\Worker;
use App\SalonHours\WeeklyHours;
use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Illuminate\Contracts\Console\Kernel as ConsoleKernel;
use Illuminate\Foundation\Testing\Concerns\MakesHttpRequests;
use Illuminate\Support\Facades\Artisan;

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

    private ?User $otherUser = null;

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
        $this->putEnv('LIGHTHOUSE_SCHEMA_CACHE_ENABLE', 'false');
        $this->putEnv('LIGHTHOUSE_QUERY_CACHE_ENABLE', 'false');

        $this->defaultHeaders = [];
        $this->defaultCookies = [];
        $this->graphql = [];
        $this->user = null;
        $this->salon = null;
        $this->service = null;
        $this->worker = null;
        $this->otherUser = null;

        $this->app = require dirname(__DIR__, 2).'/bootstrap/app.php';
        $this->app->make(ConsoleKernel::class)->bootstrap();
        Artisan::call('migrate:fresh');
        $this->withCredentials();
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
