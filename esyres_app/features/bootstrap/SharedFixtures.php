<?php

use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use App\Models\Worker;
use App\SalonHours\WeeklyHours;
use Behat\Gherkin\Node\PyStringNode;
use Illuminate\Support\Carbon;

trait SharedFixtures
{
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
     * @Given another verified owner :email with password :password owns salon :name
     */
    public function anotherVerifiedOwnerOwnsSalon(string $email, string $password, string $name): void
    {
        $this->otherUser = User::factory()->create([
            'email' => $email,
            'password' => $password,
            'email_verified_at' => now(),
        ]);
        $this->otherSalon = Salon::factory()->create([
            'owner_id' => $this->otherUser->id,
            'name' => $name,
        ]);
    }

    /**
     * @Given the salon has a requested booking on :date at :time for :name
     */
    public function theSalonHasARequestedBooking(string $date, string $time, string $name): void
    {
        $this->insertRequestedBooking($this->salon, $date, $time, $name, null);
    }

    /**
     * @Given the other salon has a requested booking on :date at :time for :name
     */
    public function theOtherSalonHasARequestedBooking(string $date, string $time, string $name): void
    {
        $this->insertRequestedBooking($this->otherSalon, $date, $time, $name, null);
    }

    /**
     * @Given that booking is for the salon worker
     */
    public function thatBookingIsForTheSalonWorker(): void
    {
        $this->booking->worker_id = $this->worker->id;
        $this->booking->save();
    }

    /**
     * @Given that booking is confirmed
     */
    public function thatBookingIsConfirmed(): void
    {
        $this->booking->status = Booking::CONFIRMED;
        $this->booking->save();
    }

    /**
     * @Given that booking is time proposed
     */
    public function thatBookingIsTimeProposed(): void
    {
        $this->booking->status = Booking::TIME_PROPOSED;
        $this->booking->save();
    }

    /**
     * @param  Salon  $salon
     */
    private function insertRequestedBooking(Salon $salon, string $date, string $time, string $name, ?Worker $worker): void
    {
        $customer = User::factory()->create([
            'name' => $name,
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);
        $starts = Carbon::createFromFormat('Y-m-d H:i', $date.' '.$time, 'Europe/Sarajevo');
        $booking = new Booking;
        $booking->salon_id = $salon->id;
        $booking->customer_id = $customer->id;
        $booking->worker_id = $worker?->id;
        $booking->preferred_date = $date;
        $booking->preferred_starts_at = $starts;
        $booking->status = Booking::REQUESTED;
        $booking->duration_minutes = 30;
        $booking->save();
        $row = new BookingService;
        $row->booking_id = $booking->id;
        $row->name = 'Šišanje';
        $row->duration_minutes = 30;
        $row->price_feninga = 2500;
        $row->save();
        $this->booking = $booking;
        Carbon::setTestNow(now()->addMinute());
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
}
