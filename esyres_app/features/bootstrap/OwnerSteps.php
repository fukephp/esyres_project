<?php

use App\Models\Booking;
use App\Models\Worker;
use Behat\Gherkin\Node\PyStringNode;

trait OwnerSteps
{
    /**
     * @When I accept the preferred time
     */
    public function iAcceptThePreferredTime(): void
    {
        $this->graphql($this->acceptPreferredTimeMutation(), [
            'bookingId' => (string) $this->booking->id,
        ]);
    }

    /**
     * @When I accept the preferred time for :name
     */
    public function iAcceptThePreferredTimeFor(string $name): void
    {
        $this->booking = Booking::query()
            ->where('salon_id', $this->salon->id)
            ->whereHas('customer', static fn ($query) => $query->where('name', $name))
            ->firstOrFail();
        $this->iAcceptThePreferredTime();
    }

    /**
     * @When I accept the preferred time as a guest
     */
    public function iAcceptThePreferredTimeAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iAcceptThePreferredTime();
    }

    /**
     * @When I accept preferred time for booking id :id
     */
    public function iAcceptPreferredTimeForBookingId(string $id): void
    {
        $this->graphql($this->acceptPreferredTimeMutation(), [
            'bookingId' => $id,
        ]);
    }

    /**
     * @Then the accepted booking status is :status
     */
    public function theAcceptedBookingStatusIs(string $status): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($status, $this->graphql['data']['acceptPreferredTime']['status']);
    }

    /**
     * @Then that booking has owner_responded_at set
     */
    public function thatBookingHasOwnerRespondedAtSet(): void
    {
        $this->booking->refresh();
        if ($this->booking->owner_responded_at === null) {
            throw new RuntimeException('Expected owner_responded_at');
        }
    }

    /**
     * @Then that booking has no owner_responded_at
     */
    public function thatBookingHasNoOwnerRespondedAt(): void
    {
        $this->booking->refresh();
        $this->assertSame(null, $this->booking->owner_responded_at);
    }

    /**
     * @When I query pending bookings for date :date
     */
    public function iQueryPendingBookingsForDate(string $date): void
    {
        $this->graphql($this->pendingBookingsQuery(), [
            'salonId' => (string) $this->salon->id,
            'date' => $date,
        ]);
    }

    /**
     * @When I query pending bookings for date :date limit :limit offset :offset
     */
    public function iQueryPendingBookingsPaged(string $date, string $limit, string $offset): void
    {
        $this->graphql($this->pendingBookingsQuery(), [
            'salonId' => (string) $this->salon->id,
            'date' => $date,
            'limit' => (int) $limit,
            'offset' => (int) $offset,
        ]);
    }

    /**
     * @When I query pending bookings as a guest for date :date
     */
    public function iQueryPendingBookingsAsAGuest(string $date): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->pendingBookingsQuery(), [
            'salonId' => (string) $this->salon->id,
            'date' => $date,
        ]);
    }

    /**
     * @When I query my salons
     */
    public function iQueryMySalons(): void
    {
        $this->graphql($this->meSalonsQuery());
    }

    /**
     * @When I propose time :time on the salon worker
     */
    public function iProposeTimeOnTheSalonWorker(string $time): void
    {
        $this->graphql($this->proposeTimeMutation(), [
            'bookingId' => (string) $this->booking->id,
            'workerId' => (string) $this->worker->id,
            'proposedTime' => $time,
        ]);
    }

    /**
     * @When I propose time :time on worker :name
     */
    public function iProposeTimeOnWorker(string $time, string $name): void
    {
        $this->worker = Worker::query()
            ->where('salon_id', $this->salon->id)
            ->where('name', $name)
            ->firstOrFail();
        $this->iProposeTimeOnTheSalonWorker($time);
    }

    /**
     * @When I propose time :time on worker :workerName for :customerName
     */
    public function iProposeTimeOnWorkerFor(string $time, string $workerName, string $customerName): void
    {
        $this->booking = Booking::query()
            ->where('salon_id', $this->salon->id)
            ->whereHas('customer', static fn ($query) => $query->where('name', $customerName))
            ->firstOrFail();
        $this->iProposeTimeOnWorker($time, $workerName);
    }

    /**
     * @When I propose time :time on the other salon worker
     */
    public function iProposeTimeOnTheOtherSalonWorker(string $time): void
    {
        $this->graphql($this->proposeTimeMutation(), [
            'bookingId' => (string) $this->booking->id,
            'workerId' => (string) $this->otherWorker->id,
            'proposedTime' => $time,
        ]);
    }

    /**
     * @When I propose time :time on the salon worker for :name
     */
    public function iProposeTimeOnTheSalonWorkerFor(string $time, string $name): void
    {
        $this->booking = Booking::query()
            ->where('salon_id', $this->salon->id)
            ->whereHas('customer', static fn ($query) => $query->where('name', $name))
            ->firstOrFail();
        $this->iProposeTimeOnTheSalonWorker($time);
    }

    /**
     * @When I propose time :time on the salon worker as a guest
     */
    public function iProposeTimeAsAGuest(string $time): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iProposeTimeOnTheSalonWorker($time);
    }

    /**
     * @When I propose time :time for booking id :id
     */
    public function iProposeTimeForBookingId(string $time, string $id): void
    {
        $this->graphql($this->proposeTimeMutation(), [
            'bookingId' => $id,
            'workerId' => (string) $this->worker->id,
            'proposedTime' => $time,
        ]);
    }

    /**
     * @When I query occupying bookings for date :date
     */
    public function iQueryOccupyingBookingsForDate(string $date): void
    {
        $this->graphql($this->occupyingBookingsQuery(), [
            'salonId' => (string) $this->salon->id,
            'date' => $date,
        ]);
    }

    /**
     * @When I query occupying bookings as a guest for date :date
     */
    public function iQueryOccupyingBookingsAsAGuest(string $date): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->occupyingBookingsQuery(), [
            'salonId' => (string) $this->salon->id,
            'date' => $date,
        ]);
    }

    /**
     * @Then the proposed booking matches:
     */
    public function theProposedBookingMatches(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $row = $this->graphql['data']['proposeTime'];
        $this->assertSame($expected['status'], $row['status']);
        $this->assertSame($expected['preferredDate'], $row['preferredDate']);
        $this->assertSame($expected['worker'], $row['worker'] === null ? null : $row['worker']['name']);
        $this->assertSame($expected['proposedWorker'], $row['proposedWorker'] === null ? null : $row['proposedWorker']['name']);
        $this->assertNotNull($row['proposedStartsAt']);
    }

    /**
     * @Then occupying bookings are empty
     */
    public function occupyingBookingsAreEmpty(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame([], $this->graphql['data']['occupyingBookings']);
    }

    /**
     * @Then occupying booking names are:
     */
    public function occupyingBookingNamesAre(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $actual = [];
        foreach ($this->graphql['data']['occupyingBookings'] as $row) {
            $actual[] = $row['customerName'];
        }
        $this->assertSame($expected, $actual);
    }

    /**
     * @Then public salon has no occupying field
     */
    public function publicSalonHasNoOccupyingField(): void
    {
        $this->graphql(<<<'GQL'
query Salon($id: ID!) {
  salon(id: $id) {
    id
    occupyingBookings
  }
}
GQL, ['id' => (string) $this->salon->id]);
        $payload = json_encode($this->graphql);
        if (! isset($this->graphql['errors']) || ! str_contains($payload, 'occupyingBookings')) {
            throw new RuntimeException("Expected occupying field rejected, got {$payload}");
        }
    }

    /**
     * @Then pending bookings are empty
     */
    public function pendingBookingsAreEmpty(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame([], $this->graphql['data']['pendingBookings']);
    }

    /**
     * @Then pending booking names are:
     */
    public function pendingBookingNamesAre(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $actual = [];
        foreach ($this->graphql['data']['pendingBookings'] as $row) {
            $actual[] = $row['customerName'];
        }
        $this->assertSame($expected, $actual);
    }

    /**
     * @Then the first pending booking matches:
     */
    public function theFirstPendingBookingMatches(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $row = $this->graphql['data']['pendingBookings'][0];
        $actual = [
            'customerName' => $row['customerName'],
            'preferredDate' => $row['preferredDate'],
            'durationMinutes' => $row['durationMinutes'],
            'worker' => $row['worker'] === null ? null : $row['worker']['name'],
            'services' => array_map(static fn (array $s): array => [
                'name' => $s['name'],
                'durationMinutes' => $s['durationMinutes'],
            ], $row['services']),
        ];
        $this->assertSame($expected, $actual);
    }

    /**
     * @Then my salons match:
     */
    public function mySalonsMatch(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $actual = [];
        foreach ($this->graphql['data']['me']['salons'] as $salon) {
            $actual[] = ['name' => $salon['name']];
        }
        $this->assertSame($expected, $actual);
    }

    /**
     * @When I query salon hours
     */
    public function iQuerySalonHours(): void
    {
        $this->graphql($this->salonHoursQuery(), ['id' => (string) $this->salon->id]);
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
        $this->graphql($this->updateHoursMutation(), [
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
        $this->graphql($this->updateHoursMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => [
                'hours' => $days,
                'cancellationNoticeHours' => (int) $hours,
            ],
        ]);
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

    private function acceptPreferredTimeMutation(): string
    {
        return <<<'GQL'
mutation Accept($bookingId: ID!) {
  acceptPreferredTime(bookingId: $bookingId) {
    id
    status
  }
}
GQL;
    }

    private function proposeTimeMutation(): string
    {
        return <<<'GQL'
mutation Propose($bookingId: ID!, $workerId: ID!, $proposedTime: String!) {
  proposeTime(bookingId: $bookingId, workerId: $workerId, proposedTime: $proposedTime) {
    id
    status
    preferredDate
    preferredStartsAt
    proposedStartsAt
    worker { id name }
    proposedWorker { id name }
  }
}
GQL;
    }

    private function occupyingBookingsQuery(): string
    {
        return <<<'GQL'
query Occupying($salonId: ID!, $date: String!) {
  occupyingBookings(salonId: $salonId, date: $date) {
    id
    status
    customerName
    preferredStartsAt
    proposedStartsAt
    worker { id name }
    proposedWorker { id name }
  }
}
GQL;
    }

    private function pendingBookingsQuery(): string
    {
        return <<<'GQL'
query Pending($salonId: ID!, $date: String!, $limit: Int = 20, $offset: Int = 0) {
  pendingBookings(salonId: $salonId, date: $date, limit: $limit, offset: $offset) {
    id
    status
    customerName
    preferredDate
    preferredStartsAt
    durationMinutes
    worker { id name }
    services { name durationMinutes }
  }
}
GQL;
    }

    private function meSalonsQuery(): string
    {
        return <<<'GQL'
query MeSalons {
  me {
    id
    salons { id name }
  }
}
GQL;
    }

    private function salonHoursQuery(): string
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

    private function updateHoursMutation(): string
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
}
