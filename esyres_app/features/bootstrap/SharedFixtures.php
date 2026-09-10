<?php

use App\BusyLevel\Occupancy;
use App\Models\AssistantIntake;
use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use App\Models\Worker;
use App\Models\Favorite;
use App\Models\PushSubscription;
use App\Models\QrScan;
use App\Qr\QrHold;
use App\Push\FakePushGateway;
use App\Push\PushGateway;
use App\SalonHours\WeeklyHours;
use App\Sms\FakeSmsGateway;
use App\Sms\SmsGateway;
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
     * @Given that owner is email unverified
     */
    public function thatOwnerIsEmailUnverified(): void
    {
        $this->user->email_verified_at = null;
        $this->user->save();
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
     * @Given that booking is cancelled
     */
    public function thatBookingIsCancelled(): void
    {
        $this->booking->status = Booking::CANCELLED;
        $this->booking->cancelled_at = now();
        $this->booking->save();
    }

    /**
     * @Given the salon cancellation notice hours is :hours
     */
    public function theSalonCancellationNoticeHoursIs(string $hours): void
    {
        $this->salon->cancellation_notice_hours = (int) $hours;
        $this->salon->save();
    }

    /**
     * @When I remember occupancy percent for :date
     */
    public function iRememberOccupancyPercentFor(string $date): void
    {
        $this->occupancyPercent = Occupancy::percent($this->salon->fresh(), $date);
    }

    /**
     * @Then occupancy percent for :date is lower
     */
    public function occupancyPercentForIsLower(string $date): void
    {
        $this->assertNotNull($this->occupancyPercent);
        $now = Occupancy::percent($this->salon->fresh(), $date);
        $this->assertLessThan($this->occupancyPercent, $now);
    }

    /**
     * @Given that booking is confirmed
     */
    public function thatBookingIsConfirmed(): void
    {
        $this->booking->status = Booking::CONFIRMED;
        $this->booking->save();
        $this->ownerRespondedAt = $this->booking->fresh()->owner_responded_at?->utc()->toIso8601String();
    }

    /**
     * @Given that booking recorded an owner response
     */
    public function thatBookingRecordedAnOwnerResponse(): void
    {
        $this->booking->owner_responded_at = now();
        $this->booking->save();
        $this->ownerRespondedAt = $this->booking->fresh()->owner_responded_at->utc()->toIso8601String();
    }

    /**
     * @Given that booking has a reschedule overlay on :date at :time
     */
    public function thatBookingHasARescheduleOverlay(string $date, string $time): void
    {
        $starts = Carbon::createFromFormat('Y-m-d H:i', $date.' '.$time, 'Europe/Sarajevo');
        $this->booking->reschedule_date = $date;
        $this->booking->reschedule_starts_at = $starts;
        $this->booking->save();
    }

    /**
     * @Given the salon reschedule cap is :cap
     */
    public function theSalonRescheduleCapIs(string $cap): void
    {
        $this->salon->reschedule_cap = (int) $cap;
        $this->salon->save();
    }

    /**
     * @Then that booking has no reschedule overlay
     */
    public function thatBookingHasNoRescheduleOverlay(): void
    {
        $this->booking->refresh();
        $this->assertSame(null, $this->booking->reschedule_starts_at);
        $this->assertSame(null, $this->booking->reschedule_date);
    }

    /**
     * @Given that booking is time proposed
     */
    public function thatBookingIsTimeProposed(): void
    {
        $this->booking->status = Booking::TIME_PROPOSED;
        $this->booking->proposed_starts_at = $this->booking->preferred_starts_at;
        $this->booking->proposed_worker_id = $this->booking->worker_id;
        $this->booking->save();
    }

    /**
     * @Given the salon is open :weekday from :opens to :closes
     */
    public function theSalonIsOpenFromTo(string $weekday, string $opens, string $closes): void
    {
        $week = WeeklyHours::closedWeek();
        $week[strtolower($weekday)] = [
            'closed' => false,
            'opens_at' => $opens,
            'closes_at' => $closes,
        ];
        $this->salon->hours = $week;
        $this->salon->save();
    }

    /**
     * @Given the salon is open :weekday from :opens to :closes with break :breakStart to :breakEnd
     */
    public function theSalonIsOpenWithBreak(string $weekday, string $opens, string $closes, string $breakStart, string $breakEnd): void
    {
        $week = WeeklyHours::closedWeek();
        $week[strtolower($weekday)] = [
            'closed' => false,
            'opens_at' => $opens,
            'closes_at' => $closes,
            'break_starts_at' => $breakStart,
            'break_ends_at' => $breakEnd,
        ];
        $this->salon->hours = $week;
        $this->salon->save();
    }

    /**
     * @param  Salon  $salon
     */
    private function insertRequestedBooking(Salon $salon, string $date, string $time, string $name, ?Worker $worker): void
    {
        $customer = User::factory()->create([
            'name' => $name,
            'email_verified_at' => now(),
            'phone' => '+38761'.substr(sha1($name.$date.$time.uniqid('', true)), 0, 6),
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

    protected function insertCustomerBooking(User $customer, Salon $salon, string $date, string $time): Booking
    {
        $starts = Carbon::createFromFormat('Y-m-d H:i', $date.' '.$time, 'Europe/Sarajevo');
        $booking = new Booking;
        $booking->salon_id = $salon->id;
        $booking->customer_id = $customer->id;
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
        if ($this->firstCustomerBooking === null) {
            $this->firstCustomerBooking = $booking;
        }
        Carbon::setTestNow(now()->addMinute());

        return $booking;
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
     * @Given the salon has an in-flight intake
     */
    public function theSalonHasAnInFlightIntake(): void
    {
        $this->intake = AssistantIntake::factory()->create([
            'salon_id' => $this->salon->id,
            'service_ids' => $this->services === [] ? [] : [(string) $this->services[0]->id],
        ]);
        $this->intakeToken = $this->intake->token;
    }

    /**
     * @Given that intake prefers :date at :time
     */
    public function thatIntakePrefers(string $date, string $time): void
    {
        if ($this->intake === null) {
            throw new RuntimeException('Intake fixture is missing');
        }
        $this->intake->preferred_date = $date;
        $this->intake->preferred_time = $time;
        $this->intake->save();
    }

    /**
     * @Given the other salon has an in-flight intake
     */
    public function theOtherSalonHasAnInFlightIntake(): void
    {
        AssistantIntake::factory()->create([
            'salon_id' => $this->otherSalon->id,
            'service_ids' => [],
        ]);
    }

    /**
     * @Given that intake is stale
     */
    public function thatIntakeIsStale(): void
    {
        if ($this->intake === null) {
            throw new RuntimeException('Intake fixture is missing');
        }
        $this->intake->timestamps = false;
        $this->intake->updated_at = now()->subHours(25);
        $this->intake->save();
    }

    /**
     * @Given that intake is converted
     */
    public function thatIntakeIsConverted(): void
    {
        if ($this->intake === null) {
            throw new RuntimeException('Intake fixture is missing');
        }
        if ($this->booking === null) {
            $this->insertRequestedBooking($this->salon, '2026-08-31', '10:00', 'Ana', null);
        }
        $this->intake->booking_id = $this->booking->id;
        $this->intake->save();
    }

    /**
     * @Given that intake is taken over
     */
    public function thatIntakeIsTakenOver(): void
    {
        if ($this->intake === null) {
            throw new RuntimeException('Intake fixture is missing');
        }
        $this->intake->taken_over_at = now();
        $this->intake->updated_at = now();
        $this->intake->save();
    }

    /**
     * @Given the salon dnd is on
     */
    public function theSalonDndIsOn(): void
    {
        $this->salon->dnd = true;
        $this->salon->save();
    }

    /**
     * @When I query salon takeover fields as a guest
     */
    public function iQuerySalonTakeoverFieldsAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->salonTakeoverQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I take over the intake as a guest
     */
    public function iTakeOverTheIntakeAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        if ($this->intake === null) {
            throw new RuntimeException('Intake fixture is missing');
        }
        $this->graphql($this->takeOverIntakeMutation(), ['id' => (string) $this->intake->id]);
    }

    /**
     * @When I ping the assistant intake as a guest
     */
    public function iPingTheAssistantIntakeAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->postPingIntake($this->intakeToken);
    }

    /**
     * @When I ping an unknown assistant intake as a guest
     */
    public function iPingAnUnknownAssistantIntakeAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->postPingIntake('00000000-0000-4000-8000-000000000000');
    }

    /**
     * @When I ping an invalid salon as a guest
     */
    public function iPingAnInvalidSalonAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->pingAssistantIntakeMutation(), ['salonId' => '999999']);
    }

    /**
     * @When I release the intake as a guest
     */
    public function iReleaseTheIntakeAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        if ($this->intake === null) {
            throw new RuntimeException('Intake fixture is missing');
        }
        $this->graphql($this->releaseIntakeMutation(), ['id' => (string) $this->intake->id]);
    }

    /**
     * @When I set salon dnd to :dnd as a guest
     */
    public function iSetSalonDndToAsAGuest(string $dnd): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->updateSalonDndMutation(), [
            'salonId' => (string) $this->salon->id,
            'dnd' => $dnd === 'true',
        ]);
    }

    /**
     * @When I take over the intake
     */
    public function iTakeOverTheIntake(): void
    {
        if ($this->intake === null) {
            throw new RuntimeException('Intake fixture is missing');
        }
        $this->graphql($this->takeOverIntakeMutation(), ['id' => (string) $this->intake->id]);
        $this->intake = AssistantIntake::query()->find($this->intake->id);
    }

    /**
     * @When I take over an unknown intake
     */
    public function iTakeOverAnUnknownIntake(): void
    {
        $this->graphql($this->takeOverIntakeMutation(), ['id' => '999999']);
    }

    /**
     * @When I release the intake
     */
    public function iReleaseTheIntake(): void
    {
        if ($this->intake === null) {
            throw new RuntimeException('Intake fixture is missing');
        }
        $this->graphql($this->releaseIntakeMutation(), ['id' => (string) $this->intake->id]);
        $this->intake = AssistantIntake::query()->find($this->intake->id);
    }

    /**
     * @When I set salon dnd to :dnd
     */
    public function iSetSalonDndTo(string $dnd): void
    {
        $this->graphql($this->updateSalonDndMutation(), [
            'salonId' => (string) $this->salon->id,
            'dnd' => $dnd === 'true',
        ]);
        $this->salon = Salon::query()->find($this->salon->id);
    }

    /**
     * @When I query salon takeover fields
     */
    public function iQuerySalonTakeoverFields(): void
    {
        $this->graphql($this->salonTakeoverQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @Then the intake takenOver is :flag
     */
    public function theIntakeTakenOverIs(string $flag): void
    {
        $this->assertNoGraphqlErrors();
        $expected = $flag === 'true';
        $row = $this->graphql['data']['takeOverAssistantIntake']
            ?? $this->graphql['data']['releaseAssistantIntake']
            ?? $this->graphql['data']['upsertAssistantIntake']
            ?? $this->graphql['data']['assistantIntake']
            ?? ($this->graphql['data']['inFlightIntakes'][0] ?? null);
        $this->assertNotNull($row);
        $this->assertSame($expected, $row['takenOver']);
    }

    /**
     * @Then the intake pinged is :flag
     */
    public function theIntakePingedIs(string $flag): void
    {
        $this->assertNoGraphqlErrors();
        $expected = $flag === 'true';
        $row = $this->graphql['data']['pingAssistantIntake']
            ?? $this->graphql['data']['upsertAssistantIntake']
            ?? $this->graphql['data']['assistantIntake']
            ?? ($this->graphql['data']['inFlightIntakes'][0] ?? null);
        $this->assertNotNull($row);
        $this->assertSame($expected, $row['pinged']);
    }

    /**
     * @Then salon dnd is :flag
     */
    public function salonDndIs(string $flag): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($flag === 'true', $this->graphql['data']['salon']['dnd'] ?? $this->graphql['data']['updateSalonDnd']['dnd']);
    }

    /**
     * @Then takeoverAllowed is :flag
     */
    public function takeoverAllowedIs(string $flag): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($flag === 'true', $this->graphql['data']['salon']['takeoverAllowed'] ?? $this->graphql['data']['updateSalonDnd']['takeoverAllowed']);
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
     * @Given the other salon has a worker:
     */
    public function theOtherSalonHasAWorker(PyStringNode $payload): void
    {
        $input = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->otherWorker = Worker::factory()->create([
            'salon_id' => $this->otherSalon->id,
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
     * @Given the salon address is :address
     */
    public function theSalonAddressIs(string $address): void
    {
        $this->salon->address = $address;
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

    private function takeOverIntakeMutation(): string
    {
        return <<<'GQL'
mutation TakeOver($id: ID!) {
  takeOverAssistantIntake(id: $id) {
    id
    takenOver
    updatedAt
  }
}
GQL;
    }

    private function releaseIntakeMutation(): string
    {
        return <<<'GQL'
mutation Release($id: ID!) {
  releaseAssistantIntake(id: $id) {
    id
    takenOver
    updatedAt
  }
}
GQL;
    }

    private function updateSalonDndMutation(): string
    {
        return <<<'GQL'
mutation Dnd($salonId: ID!, $dnd: Boolean!) {
  updateSalonDnd(salonId: $salonId, dnd: $dnd) {
    id
    dnd
    takeoverAllowed
  }
}
GQL;
    }

    private function salonTakeoverQuery(): string
    {
        return <<<'GQL'
query SalonTakeover($id: ID!) {
  salon(id: $id) {
    id
    dnd
    takeoverAllowed
  }
}
GQL;
    }

    private function postPingIntake(?string $token): void
    {
        $variables = ['salonId' => (string) $this->salon->id];
        if ($token !== null && $token !== '') {
            $variables['token'] = $token;
        }
        $this->graphql($this->pingAssistantIntakeMutation(), $variables);
        if (isset($this->graphql['data']['pingAssistantIntake']['token'])) {
            $this->intakeToken = $this->graphql['data']['pingAssistantIntake']['token'];
            $this->intake = AssistantIntake::query()->where('token', $this->intakeToken)->first();
        }
    }

    /**
     * @When I subscribe to push
     */
    public function iSubscribeToPush(): void
    {
        $this->graphql($this->subscribePushMutation(), [
            'endpoint' => 'https://push.example/1',
            'p256dh' => 'p256',
            'auth' => 'auth',
        ]);
    }

    /**
     * @When I subscribe to push as a guest
     */
    public function iSubscribeToPushAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->subscribePushMutation(), [
            'endpoint' => 'https://push.example/1',
            'p256dh' => 'p256',
            'auth' => 'auth',
        ]);
    }

    /**
     * @When I query vapid public key as a guest
     */
    public function iQueryVapidPublicKeyAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql('query { vapidPublicKey }');
    }

    /**
     * @Then subscribe push succeeds
     */
    public function subscribePushSucceeds(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(true, $this->graphql['data']['subscribePush']);
    }

    /**
     * @Then vapid public key is :key
     */
    public function vapidPublicKeyIs(string $key): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($key, $this->graphql['data']['vapidPublicKey']);
    }

    /**
     * @Then push subscription count is :count
     */
    public function pushSubscriptionCountIs(string $count): void
    {
        $this->assertSame((int) $count, PushSubscription::query()->count());
    }

    /**
     * @Given the booking customer subscribes to push
     */
    public function theBookingCustomerSubscribesToPush(): void
    {
        $row = new PushSubscription;
        $row->user_id = $this->booking->customer_id;
        $row->endpoint = 'https://push.example/customer';
        $row->p256dh = 'p256';
        $row->auth = 'auth';
        $row->save();
    }

    /**
     * @Given the booking customer's phone is not verified
     */
    public function theBookingCustomersPhoneIsNotVerified(): void
    {
        $customer = $this->booking->customer;
        $customer->phone_verified_at = null;
        $customer->save();
    }

    /**
     * @Given the next push send fails
     */
    public function theNextPushSendFails(): void
    {
        $this->fakePush()->failNext = true;
    }

    /**
     * @Then the last owner push type is :type
     */
    public function theLastOwnerPushTypeIs(string $type): void
    {
        $last = $this->fakePush()->lastFor((int) $this->salon->owner_id);
        $this->assertNotNull($last);
        $payload = $last['payload'];
        $this->assertSame($type, $payload['type'] ?? null);
        $this->assertSame((string) $this->salon->id, $payload['salonId'] ?? null);
        $this->assertSame($this->salon->name, $payload['body'] ?? null);
        $titles = [
            'requested' => 'Novi zahtjev',
            'confirmed' => 'Gost je prihvatio',
            'rejected' => 'Gost je odbio',
            'ask_other_time' => 'Gost traži drugo vrijeme',
            'reschedule' => 'Gost traži premještaj',
        ];
        $this->assertSame($titles[$type] ?? $type, $payload['title'] ?? null);
        $this->assertSame('/owner?salon='.$this->salon->id, $payload['url'] ?? null);
        $bookingId = (string) ($this->booking?->id ?? $this->graphql['data']['createBooking']['id'] ?? '');
        $this->assertSame($bookingId, (string) ($payload['bookingId'] ?? ''));
    }

    /**
     * @Then the last owner push user is the salon owner
     */
    public function theLastOwnerPushUserIsTheSalonOwner(): void
    {
        $last = $this->fakePush()->lastFor((int) $this->salon->owner_id);
        $this->assertNotNull($last);
        $this->assertSame((int) $this->salon->owner_id, $last['userId']);
    }

    /**
     * @Then no owner push was sent
     */
    public function noOwnerPushWasSent(): void
    {
        $this->assertSame(null, $this->fakePush()->lastFor((int) $this->salon->owner_id));
    }

    /**
     * @Then the last customer push type is :type
     */
    public function theLastCustomerPushTypeIs(string $type): void
    {
        $last = $this->fakePush()->lastFor((int) $this->booking->customer_id);
        $this->assertNotNull($last);
        $payload = $last['payload'];
        $this->assertSame($type, $payload['type'] ?? null);
        $this->assertSame((string) $this->salon->id, $payload['salonId'] ?? null);
        $this->assertSame($this->salon->name, $payload['body'] ?? null);
        $titles = [
            'time_proposed' => 'Predloženo vrijeme',
            'confirmed' => 'Potvrđeno',
            'declined' => 'Odbijeno',
        ];
        $this->assertSame($titles[$type] ?? $type, $payload['title'] ?? null);
        $this->assertSame('/bookings', $payload['url'] ?? null);
        $this->assertSame((string) $this->booking->id, (string) ($payload['bookingId'] ?? ''));
        $this->assertSame((int) $this->booking->customer_id, $last['userId']);
    }

    /**
     * @Then no customer push was sent
     */
    public function noCustomerPushWasSent(): void
    {
        $id = (int) ($this->booking?->customer_id ?? $this->user?->id ?? 0);
        $this->assertSame(null, $this->fakePush()->lastFor($id));
    }

    /**
     * @Then the last status SMS is :body
     */
    public function theLastStatusSmsIs(string $body): void
    {
        $sms = $this->fakeSms();
        $this->assertSame($body, $sms->lastStatusBody);
        $this->assertSame($this->booking->customer->fresh()->phone, $sms->lastStatusPhone);
    }

    /**
     * @Then no status SMS was sent
     */
    public function noStatusSmsWasSent(): void
    {
        $this->assertSame(null, $this->fakeSms()->lastStatusBody);
    }

    private function fakePush(): FakePushGateway
    {
        $push = $this->app->make(PushGateway::class);
        if (! $push instanceof FakePushGateway) {
            throw new RuntimeException('PushGateway is not fake');
        }

        return $push;
    }

    private function fakeSms(): FakeSmsGateway
    {
        $sms = $this->app->make(SmsGateway::class);
        if (! $sms instanceof FakeSmsGateway) {
            throw new RuntimeException('SmsGateway is not fake');
        }

        return $sms;
    }

    private function subscribePushMutation(): string
    {
        return <<<'GQL'
mutation SubscribePush($endpoint: String!, $p256dh: String!, $auth: String!) {
  subscribePush(endpoint: $endpoint, p256dh: $p256dh, auth: $auth)
}
GQL;
    }

    private function pingAssistantIntakeMutation(): string
    {
        return <<<'GQL'
mutation PingIntake($salonId: ID!, $token: String) {
  pingAssistantIntake(salonId: $salonId, token: $token) {
    id
    token
    customerName
    serviceIds
    workerConfirmed
    preferredDate
    preferredTime
    takenOver
    pinged
  }
}
GQL;
    }

    /**
     * @When I visit the QR for the salon
     */
    public function iVisitTheQrForTheSalon(): void
    {
        $this->getQr('/qr/'.$this->salon->id);
    }

    /**
     * @When I visit the QR for salon :id
     */
    public function iVisitTheQrForSalonId(string $id): void
    {
        $this->getQr('/qr/'.$id);
    }

    /**
     * @When I visit the salon profile URL
     */
    public function iVisitTheSalonProfileUrl(): void
    {
        $this->forgetRequestUser();
        $response = $this->get('/salon/'.$this->salon->id);
        $this->lastLocation = $response->headers->get('Location');
        $this->rememberCookies($response);
        $this->forgetRequestUser();
    }

    /**
     * @When the QR cookie is :value
     */
    public function theQrCookieIs(string $value): void
    {
        $this->withCookie(QrHold::COOKIE, $value);
    }

    /**
     * @When the salon is deleted
     */
    public function theSalonIsDeleted(): void
    {
        $this->salon->delete();
    }

    /**
     * @Then the QR cookie is the salon id
     */
    public function theQrCookieIsTheSalonId(): void
    {
        $live = $this->liveQrCookie();
        if ($live !== null) {
            $this->assertSame((string) $this->salon->id, $live->getValue());
            if (! $live->isHttpOnly()) {
                throw new RuntimeException('Expected httpOnly esyres_qr');
            }
            $this->assertSame('lax', strtolower((string) $live->getSameSite()));
            $age = $live->getMaxAge();
            if ($age < QrHold::MINUTES * 60 - 30 || $age > QrHold::MINUTES * 60) {
                throw new RuntimeException('Expected ~7 day max-age, got '.$age);
            }
        }
        $value = $live?->getValue() ?? $this->qrCookieValueFromJar();
        $this->assertSame((string) $this->salon->id, $value);
    }

    /**
     * @Then I am redirected to the salon profile
     */
    public function iAmRedirectedToTheSalonProfile(): void
    {
        $this->assertSame('http://localhost/salon/'.$this->salon->id, $this->lastLocation);
    }

    /**
     * @Then I am redirected to the spa home
     */
    public function iAmRedirectedToTheSpaHome(): void
    {
        $this->assertSame('http://localhost/', $this->lastLocation);
    }

    /**
     * @Then there is no QR cookie
     */
    public function thereIsNoQrCookie(): void
    {
        if ($this->liveQrCookie() !== null) {
            throw new RuntimeException('Expected no live esyres_qr cookie');
        }
        if ($this->qrCookieValueFromJar() !== null) {
            throw new RuntimeException('Expected esyres_qr cookie to be cleared');
        }
    }

    /**
     * @Then me favorite salon ids are empty
     */
    public function meFavoriteSalonIdsAreEmpty(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame([], $this->graphql['data']['me']['favoriteSalonIds']);
    }

    /**
     * @Then me favorite salon ids are the salon
     */
    public function meFavoriteSalonIdsAreTheSalon(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame([(string) $this->salon->id], $this->graphql['data']['me']['favoriteSalonIds']);
    }

    /**
     * @When I query QR scans
     */
    public function iQueryQrScans(): void
    {
        $this->graphql($this->qrScansQuery(), ['salonId' => (string) $this->salon->id]);
    }

    /**
     * @When I query QR scans as a guest
     */
    public function iQueryQrScansAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->qrScansQuery(), ['salonId' => '1']);
    }

    /**
     * @When I query QR scans for salon :id
     */
    public function iQueryQrScansForSalon(string $id): void
    {
        $this->graphql($this->qrScansQuery(), ['salonId' => $id]);
    }

    /**
     * @When I query QR scans limit :limit offset :offset
     */
    public function iQueryQrScansLimitOffset(string $limit, string $offset): void
    {
        $this->graphql($this->qrScansQuery(), [
            'salonId' => (string) $this->salon->id,
            'limit' => (int) $limit,
            'offset' => (int) $offset,
        ]);
    }

    /**
     * @Then QR scans have :count rows
     */
    public function qrScansHaveRows(string $count): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame((int) $count, count($this->graphql['data']['qrScans']));
    }

    /**
     * @Then the first QR scan is for the customer and salon
     */
    public function theFirstQrScanIsForTheCustomerAndSalon(): void
    {
        $this->assertNoGraphqlErrors();
        $row = $this->graphql['data']['qrScans'][0] ?? null;
        if (! is_array($row)) {
            throw new RuntimeException('Expected a QR scan row');
        }
        $this->assertSame((string) $this->salon->id, $row['salonId']);
        $this->assertSame((string) $this->user->id, $row['customerId']);
    }

    /**
     * @Then the customer has :count favorite rows
     */
    public function theCustomerHasFavoriteRows(string $count): void
    {
        $this->assertSame((int) $count, Favorite::query()->where('user_id', $this->user->id)->count());
    }

    /**
     * @Then the salon has :count QR scan rows
     */
    public function theSalonHasQrScanRows(string $count): void
    {
        $this->assertSame((int) $count, QrScan::query()->where('salon_id', $this->salon->id)->count());
    }

    /**
     * @Then the customer has :count QR scan rows for the salon
     */
    public function theCustomerHasQrScanRowsForTheSalon(string $count): void
    {
        $this->assertSame(
            (int) $count,
            QrScan::query()->where('user_id', $this->user->id)->where('salon_id', $this->salon->id)->count(),
        );
    }

    private function getQr(string $uri): void
    {
        $this->forgetRequestUser();
        $response = $this->get($uri);
        $this->lastLocation = $response->headers->get('Location');
        $this->rememberCookies($response);
        $this->forgetRequestUser();
    }

    private function qrCookieValueFromJar(): ?string
    {
        $value = $this->defaultCookies[QrHold::COOKIE] ?? null;
        if (! is_string($value) || $value === '') {
            return null;
        }

        return $value;
    }

    private function liveQrCookie(): ?\Symfony\Component\HttpFoundation\Cookie
    {
        foreach ($this->lastSetCookies as $cookie) {
            if ($cookie->getName() !== QrHold::COOKIE) {
                continue;
            }
            $value = (string) $cookie->getValue();
            if ($value === '') {
                return null;
            }
            $expires = $cookie->getExpiresTime();
            if ($expires !== 0 && $expires < time()) {
                return null;
            }

            return $cookie;
        }

        return null;
    }

    private function qrScansQuery(): string
    {
        return <<<'GQL'
query QrScans($salonId: ID!, $limit: Int = 20, $offset: Int = 0) {
  qrScans(salonId: $salonId, limit: $limit, offset: $offset) {
    id
    salonId
    customerId
    createdAt
  }
}
GQL;
    }
}
