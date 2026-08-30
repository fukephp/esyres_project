<?php

use App\Models\Service;
use App\Models\User;
use App\Models\Worker;
use App\Notifications\VerifyEmail;
use Behat\Gherkin\Node\PyStringNode;
use Illuminate\Support\Facades\Notification;

trait GuestSteps
{
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

    private function customer(): User
    {
        if ($this->user === null) {
            throw new RuntimeException('Expected a customer in the scenario');
        }

        return $this->user->fresh() ?? $this->user;
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
}
