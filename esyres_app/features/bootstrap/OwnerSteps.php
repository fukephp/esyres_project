<?php

use App\Models\Booking;
use App\Models\Salon;
use App\Models\SalonServiceCategory;
use App\Models\User;
use App\Models\Worker;
use App\SalonHours\WeeklyHours;
use Behat\Gherkin\Node\PyStringNode;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\LocalDemoSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

trait OwnerSteps
{
    private ?\Throwable $seederException = null;

    /**
     * @When I subscribe to booking customer responded
     */
    public function iSubscribeToBookingCustomerResponded(): void
    {
        $this->graphql($this->bookingCustomerRespondedSubscription(), [
            'salonId' => (string) $this->salon->id,
        ]);
    }

    /**
     * @When I subscribe to booking customer responded as a guest
     */
    public function iSubscribeToBookingCustomerRespondedAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iSubscribeToBookingCustomerResponded();
    }

    /**
     * @When I subscribe to booking customer responded for the other salon
     */
    public function iSubscribeToBookingCustomerRespondedForTheOtherSalon(): void
    {
        $this->graphql($this->bookingCustomerRespondedSubscription(), [
            'salonId' => (string) $this->otherSalon->id,
        ]);
    }

    /**
     * @When I subscribe to booking customer responded for salon id :id
     */
    public function iSubscribeToBookingCustomerRespondedForSalonId(string $id): void
    {
        $this->graphql($this->bookingCustomerRespondedSubscription(), [
            'salonId' => $id,
        ]);
    }

    /**
     * @Then the subscription channel is present
     */
    public function theSubscriptionChannelIsPresent(): void
    {
        $this->assertNoGraphqlErrors();
        $channel = $this->graphql['extensions']['lighthouse_subscriptions']['channel'] ?? null;
        if (! is_string($channel) || $channel === '') {
            throw new RuntimeException('Expected subscription channel, got '.json_encode($this->graphql));
        }
    }

    /**
     * @When I accept the reschedule
     */
    public function iAcceptTheReschedule(): void
    {
        $this->graphql($this->acceptRescheduleMutation(), [
            'bookingId' => (string) $this->booking->id,
        ]);
    }

    /**
     * @When I accept the reschedule as a guest
     */
    public function iAcceptTheRescheduleAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iAcceptTheReschedule();
    }

    /**
     * @When I accept reschedule for booking id :id
     */
    public function iAcceptRescheduleForBookingId(string $id): void
    {
        $this->graphql($this->acceptRescheduleMutation(), [
            'bookingId' => $id,
        ]);
    }

    /**
     * @When I dismiss the reschedule
     */
    public function iDismissTheReschedule(): void
    {
        $this->graphql($this->dismissRescheduleMutation(), [
            'bookingId' => (string) $this->booking->id,
        ]);
    }

    /**
     * @When I dismiss the reschedule as a guest
     */
    public function iDismissTheRescheduleAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iDismissTheReschedule();
    }

    /**
     * @Then accept reschedule matches:
     */
    public function acceptRescheduleMatches(PyStringNode $payload): void
    {
        $this->assertRescheduleOwnerBooking('acceptReschedule', $payload);
    }

    /**
     * @Then dismiss reschedule matches:
     */
    public function dismissRescheduleMatches(PyStringNode $payload): void
    {
        $this->assertRescheduleOwnerBooking('dismissReschedule', $payload);
    }

    /**
     * @Then occupying bookings include this booking as :status
     */
    public function occupyingBookingsIncludeThisBookingAs(string $status): void
    {
        $this->assertBookingListed('occupyingBookings', $status, true);
    }

    /**
     * @Then occupying bookings do not include this booking
     */
    public function occupyingBookingsDoNotIncludeThisBooking(): void
    {
        $this->assertBookingListed('occupyingBookings', null, false);
    }

    /**
     * @Then pending bookings include this booking as :status
     */
    public function pendingBookingsIncludeThisBookingAs(string $status): void
    {
        $this->assertBookingListed('pendingBookings', $status, true);
    }

    /**
     * @Then pending bookings do not include this booking
     */
    public function pendingBookingsDoNotIncludeThisBooking(): void
    {
        $this->assertBookingListed('pendingBookings', null, false);
    }

    /**
     * @Then that booking still has the same owner_responded_at
     */
    public function thatBookingStillHasTheSameOwnerRespondedAt(): void
    {
        $this->booking->refresh();
        $after = $this->booking->owner_responded_at?->utc()->toIso8601String();
        $this->assertSame($this->ownerRespondedAt, $after);
    }

    /**
     * @When I subscribe to booking rescheduled
     */
    public function iSubscribeToBookingRescheduled(): void
    {
        $this->graphql($this->bookingRescheduledSubscription(), [
            'salonId' => (string) $this->salon->id,
        ]);
    }

    /**
     * @When I subscribe to booking rescheduled as a guest
     */
    public function iSubscribeToBookingRescheduledAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iSubscribeToBookingRescheduled();
    }

    /**
     * @When I subscribe to booking rescheduled for the other salon
     */
    public function iSubscribeToBookingRescheduledForTheOtherSalon(): void
    {
        $this->graphql($this->bookingRescheduledSubscription(), [
            'salonId' => (string) $this->otherSalon->id,
        ]);
    }

    /**
     * @When I subscribe to booking rescheduled for salon id :id
     */
    public function iSubscribeToBookingRescheduledForSalonId(string $id): void
    {
        $this->graphql($this->bookingRescheduledSubscription(), [
            'salonId' => $id,
        ]);
    }

    /**
     * @When I subscribe to booking cancelled
     */
    public function iSubscribeToBookingCancelled(): void
    {
        $this->graphql($this->bookingCancelledSubscription(), [
            'salonId' => (string) $this->salon->id,
        ]);
    }

    /**
     * @When I subscribe to booking cancelled as a guest
     */
    public function iSubscribeToBookingCancelledAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iSubscribeToBookingCancelled();
    }

    /**
     * @When I subscribe to booking cancelled for the other salon
     */
    public function iSubscribeToBookingCancelledForTheOtherSalon(): void
    {
        $this->graphql($this->bookingCancelledSubscription(), [
            'salonId' => (string) $this->otherSalon->id,
        ]);
    }

    /**
     * @When I subscribe to booking cancelled for salon id :id
     */
    public function iSubscribeToBookingCancelledForSalonId(string $id): void
    {
        $this->graphql($this->bookingCancelledSubscription(), [
            'salonId' => $id,
        ]);
    }

    /**
     * @When I decline the booking
     */
    public function iDeclineTheBooking(): void
    {
        $this->graphql($this->declineBookingMutation(), [
            'bookingId' => (string) $this->booking->id,
        ]);
    }

    /**
     * @When I decline the booking with reason :reason
     */
    public function iDeclineTheBookingWithReason(string $reason): void
    {
        $this->graphql($this->declineBookingMutation(), [
            'bookingId' => (string) $this->booking->id,
            'reason' => $reason,
        ]);
    }

    /**
     * @When I decline the booking with a reason of :count characters
     */
    public function iDeclineTheBookingWithReasonLength(string $count): void
    {
        $this->graphql($this->declineBookingMutation(), [
            'bookingId' => (string) $this->booking->id,
            'reason' => str_repeat('a', (int) $count),
        ]);
    }

    /**
     * @When I decline the booking as a guest
     */
    public function iDeclineTheBookingAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iDeclineTheBooking();
    }

    /**
     * @When I decline booking id :id
     */
    public function iDeclineBookingId(string $id): void
    {
        $this->graphql($this->declineBookingMutation(), [
            'bookingId' => $id,
        ]);
    }

    /**
     * @Then the declined booking status is :status
     */
    public function theDeclinedBookingStatusIs(string $status): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($status, $this->graphql['data']['declineBooking']['status']);
    }

    /**
     * @Then the declined booking has no reason
     */
    public function theDeclinedBookingHasNoReason(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(null, $this->graphql['data']['declineBooking']['declineReason']);
    }

    /**
     * @Then the declined booking reason is :reason
     */
    public function theDeclinedBookingReasonIs(string $reason): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($reason, $this->graphql['data']['declineBooking']['declineReason']);
    }

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
     * @When I query salon stats
     */
    public function iQuerySalonStats(): void
    {
        $this->graphql($this->salonStatsQuery(), [
            'salonId' => (string) $this->salon->id,
        ]);
    }

    /**
     * @When I query salon stats as a guest
     */
    public function iQuerySalonStatsAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iQuerySalonStats();
    }

    /**
     * @When I query salon stats for the other salon
     */
    public function iQuerySalonStatsForTheOtherSalon(): void
    {
        $this->graphql($this->salonStatsQuery(), [
            'salonId' => (string) $this->otherSalon->id,
        ]);
    }

    /**
     * @Then salon stats window is :from to :to
     */
    public function salonStatsWindowIs(string $from, string $to): void
    {
        $this->assertNoGraphqlErrors();
        $stats = $this->graphql['data']['salonStats'];
        $this->assertSame($from, $stats['fromDate']);
        $this->assertSame($to, $stats['toDate']);
        $this->assertSame(7, count($stats['days']));
        $this->assertSame($from, $stats['days'][0]['date']);
        $this->assertSame($to, $stats['days'][6]['date']);
    }

    /**
     * @Then salon stats day weekdays are:
     */
    public function salonStatsDayWeekdaysAre(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $actual = array_map(fn (array $day) => $day['weekday'], $this->graphql['data']['salonStats']['days']);
        $this->assertSame($expected, $actual);
    }

    /**
     * @Then salon stats bookings count is :count
     */
    public function salonStatsBookingsCountIs(string $count): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame((int) $count, $this->graphql['data']['salonStats']['bookingsCount']);
    }

    /**
     * @Then salon stats cancellation rate is :percent and late cancels is :late
     */
    public function salonStatsCancellationRateIs(string $percent, string $late): void
    {
        $this->assertNoGraphqlErrors();
        $stats = $this->graphql['data']['salonStats'];
        $this->assertSame((int) $percent, $stats['cancellationRatePercent']);
        $this->assertSame((int) $late, $stats['lateCancels']);
    }

    /**
     * @Then salon stats day :date bookings count is :count and busy percent is :percent
     */
    public function salonStatsDayBookingsAndBusy(string $date, string $count, string $percent): void
    {
        $this->assertNoGraphqlErrors();
        foreach ($this->graphql['data']['salonStats']['days'] as $day) {
            if ($day['date'] === $date) {
                $this->assertSame((int) $count, $day['bookingsCount']);
                $this->assertSame((int) $percent, $day['busyPercent']);

                return;
            }
        }

        throw new RuntimeException('Expected stats day '.$date);
    }

    /**
     * @Then salon stats hours are:
     */
    public function salonStatsHoursAre(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame($expected, $this->graphql['data']['salonStats']['hours']);
    }

    /**
     * @When I query in-flight intakes
     */
    public function iQueryInFlightIntakes(): void
    {
        $this->graphql($this->inFlightIntakesQuery(), [
            'salonId' => (string) $this->salon->id,
        ]);
    }

    /**
     * @When I query in-flight intakes limit :limit offset :offset
     */
    public function iQueryInFlightIntakesPaged(string $limit, string $offset): void
    {
        $this->graphql($this->inFlightIntakesQuery(), [
            'salonId' => (string) $this->salon->id,
            'limit' => (int) $limit,
            'offset' => (int) $offset,
        ]);
    }

    /**
     * @When I query in-flight intake count
     */
    public function iQueryInFlightIntakeCount(): void
    {
        $this->graphql($this->inFlightIntakeCountQuery(), [
            'salonId' => (string) $this->salon->id,
        ]);
    }

    /**
     * @When I query in-flight intakes as a guest
     */
    public function iQueryInFlightIntakesAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->inFlightIntakesQuery(), [
            'salonId' => (string) $this->salon->id,
        ]);
    }

    /**
     * @Then in-flight customer names are:
     */
    public function inFlightCustomerNamesAre(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $actual = [];
        foreach ($this->graphql['data']['inFlightIntakes'] as $row) {
            $actual[] = $row['customerName'];
        }
        $this->assertSame($expected, $actual);
    }

    /**
     * @Then in-flight intake count is :count
     */
    public function inFlightIntakeCountIs(string $count): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame((int) $count, $this->graphql['data']['inFlightIntakeCount']);
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
     * @When I create a booking on :date at :time with the salon services
     */
    public function iCreateABookingWithSalonServices(string $date, string $time): void
    {
        $this->postOwnerCreateBooking($date, $time, null);
    }

    /**
     * @When I create a booking on :date at :time with the salon services and the intake token
     */
    public function iCreateABookingWithSalonServicesAndIntakeToken(string $date, string $time): void
    {
        $this->postOwnerCreateBooking($date, $time, $this->intakeToken);
    }

    private function postOwnerCreateBooking(string $date, string $time, ?string $intakeToken): void
    {
        $ids = [];
        foreach ($this->services as $service) {
            $ids[] = (string) $service->id;
        }
        $input = [
            'salonId' => (string) $this->salon->id,
            'serviceIds' => $ids,
            'preferredDate' => $date,
            'preferredTime' => $time,
        ];
        if ($intakeToken !== null) {
            $input['intakeToken'] = $intakeToken;
        }
        $this->graphql($this->createBookingMutation(), ['input' => $input]);
        $id = $this->graphql['data']['createBooking']['id'] ?? null;
        if (is_string($id) || is_int($id)) {
            $this->booking = Booking::query()->find($id);
        }
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
     * @Then this pending booking intake prefers :date at :time
     */
    public function thisPendingBookingIntakePrefers(string $date, string $time): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertConvertedIntake($this->pendingRowIntake(), $date, $time);
    }

    /**
     * @Then this pending booking intake is null
     */
    public function thisPendingBookingIntakeIsNull(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(null, $this->pendingRowIntake());
    }

    /**
     * @Then the owner booking intake prefers :date at :time
     */
    public function theOwnerBookingIntakePrefers(string $date, string $time): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertConvertedIntake($this->graphql['data']['ownerBooking']['intake'], $date, $time);
    }

    /**
     * @Then the owner booking intake is null
     */
    public function theOwnerBookingIntakeIsNull(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(null, $this->graphql['data']['ownerBooking']['intake']);
    }

    /**
     * @When I query the owner booking
     */
    public function iQueryTheOwnerBooking(): void
    {
        $this->graphql($this->ownerBookingQuery(), [
            'id' => (string) $this->booking->id,
        ]);
    }

    /**
     * @When I query owner booking id :id
     */
    public function iQueryOwnerBookingId(string $id): void
    {
        $this->graphql($this->ownerBookingQuery(), [
            'id' => $id,
        ]);
    }

    /**
     * @When I query the owner booking as a guest
     */
    public function iQueryTheOwnerBookingAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iQueryTheOwnerBooking();
    }

    /**
     * @Then the owner booking matches:
     */
    public function theOwnerBookingMatches(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $row = $this->graphql['data']['ownerBooking'];
        $this->assertSame($expected, [
            'status' => $row['status'],
            'customerName' => $row['customerName'],
            'preferredDate' => $row['preferredDate'],
            'durationMinutes' => $row['durationMinutes'],
            'worker' => $row['worker'] === null ? null : $row['worker']['name'],
            'services' => array_map(static fn (array $s): array => [
                'name' => $s['name'],
                'durationMinutes' => $s['durationMinutes'],
            ], $row['services']),
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
     * @When I query occupying bookings range from :from to :to
     */
    public function iQueryOccupyingBookingsRangeFromTo(string $from, string $to): void
    {
        $this->graphql($this->occupyingBookingsRangeQuery(), [
            'salonId' => (string) $this->salon->id,
            'from' => $from,
            'to' => $to,
        ]);
    }

    /**
     * @When I query occupying bookings range as a guest from :from to :to
     */
    public function iQueryOccupyingBookingsRangeAsAGuestFromTo(string $from, string $to): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->occupyingBookingsRangeQuery(), [
            'salonId' => (string) $this->salon->id,
            'from' => $from,
            'to' => $to,
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
     * @Then occupying range booking names are:
     */
    public function occupyingRangeBookingNamesAre(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $actual = [];
        foreach ($this->graphql['data']['occupyingBookingsRange'] as $row) {
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
     * @When I query salon service categories
     */
    public function iQuerySalonServiceCategories(): void
    {
        $this->graphql($this->salonServiceCategoriesQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I create a salon service category:
     */
    public function iCreateASalonServiceCategory(PyStringNode $payload): void
    {
        $this->graphql($this->createServiceCategoryMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
        $this->rememberServiceCategoryFromMutation('createSalonServiceCategory');
    }

    /**
     * @When I create a salon service category as a guest:
     */
    public function iCreateASalonServiceCategoryAsAGuest(PyStringNode $payload): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->createServiceCategoryMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I update the salon service category:
     */
    public function iUpdateTheSalonServiceCategory(PyStringNode $payload): void
    {
        $this->graphql($this->updateServiceCategoryMutation(), [
            'id' => (string) $this->serviceCategory->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I delete the salon service category
     */
    public function iDeleteTheSalonServiceCategory(): void
    {
        $this->graphql($this->deleteServiceCategoryMutation(), [
            'id' => (string) $this->serviceCategory->id,
        ]);
    }

    private function rememberServiceCategoryFromMutation(string $field): void
    {
        $id = $this->graphql['data'][$field]['id'] ?? null;
        if (is_string($id) || is_int($id)) {
            $this->serviceCategory = SalonServiceCategory::query()->find($id);
        }
    }

    /**
     * @When I create a salon service:
     */
    public function iCreateASalonService(PyStringNode $payload): void
    {
        $this->graphql($this->createServiceMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => $this->graphqlServiceInput(json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR)),
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
            'input' => $this->graphqlServiceInput(json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR)),
        ]);
    }

    /**
     * @When I update the salon service:
     */
    public function iUpdateTheSalonService(PyStringNode $payload): void
    {
        $this->graphql($this->updateServiceMutation(), [
            'id' => (string) $this->service->id,
            'input' => $this->graphqlServiceInput(json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR)),
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
     * @When I add a salon with:
     */
    public function iAddASalon(PyStringNode $payload): void
    {
        $input = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->graphql($this->addSalonMutation(), [
            'name' => $input['name'],
            'address' => $input['address'],
        ]);
    }

    /**
     * @When I add a salon as a guest with:
     */
    public function iAddASalonAsAGuest(PyStringNode $payload): void
    {
        $this->iFetchTheCsrfCookie();
        $input = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->graphql($this->addSalonMutation(), [
            'name' => $input['name'],
            'address' => $input['address'],
        ]);
    }

    /**
     * @Then addSalon name is :name and address is :address
     */
    public function addSalonNameIsAndAddressIs(string $name, string $address): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($name, $this->graphql['data']['addSalon']['name']);
        $this->assertSame($address, $this->graphql['data']['addSalon']['address']);
        $id = $this->graphql['data']['addSalon']['id'] ?? null;
        if (! is_string($id) && ! is_int($id)) {
            throw new \RuntimeException('Expected addSalon id, got '.json_encode($this->graphql));
        }
        $this->salon = Salon::query()->find($id);
    }

    /**
     * @Then the added salon has provisioned defaults except address is :address
     */
    public function theAddedSalonHasProvisionedDefaultsExceptAddressIs(string $address): void
    {
        if ($this->salon === null) {
            throw new \RuntimeException('Expected an added salon');
        }
        $salon = $this->salon->fresh() ?? $this->salon;
        $hours = $salon->hours ?? [];
        foreach (WeeklyHours::WEEKDAYS as $day) {
            $this->assertTrue(($hours[$day]['closed'] ?? false) === true);
        }
        $this->assertSame(24, $salon->cancellation_notice_hours);
        $this->assertSame(0, $salon->services()->count());
        $this->assertSame(0, $salon->workers()->count());
        $this->assertSame($address, $salon->address);
        $this->assertSame(null, $salon->lat);
        $this->assertSame(null, $salon->lng);
    }

    /**
     * @Then the owner owns :count salons
     */
    public function theOwnerOwnsSalons(string $count): void
    {
        if ($this->user === null) {
            throw new \RuntimeException('Expected a session user');
        }
        $user = $this->user->fresh() ?? $this->user;
        $this->assertSame((int) $count, $user->salons()->count());
    }

    /**
     * @When I query popularInSarajevo as a guest
     */
    public function iQueryPopularInSarajevoAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->popularInSarajevoQuery());
    }

    /**
     * @Then popularInSarajevo does not include :name
     */
    public function popularInSarajevoDoesNotInclude(string $name): void
    {
        $this->assertNoGraphqlErrors();
        $list = $this->graphql['data']['popularInSarajevo'] ?? null;
        if (! is_array($list)) {
            throw new \RuntimeException('Expected popularInSarajevo, got '.json_encode($this->graphql));
        }
        foreach ($list as $salon) {
            $this->assertNotSame($name, $salon['name'] ?? null);
        }
    }

    /**
     * @When I update the salon with:
     */
    public function iUpdateTheSalon(PyStringNode $payload): void
    {
        $this->graphql($this->updateSalonMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I update salon id :id with:
     */
    public function iUpdateSalonIdWith(string $id, PyStringNode $payload): void
    {
        $this->graphql($this->updateSalonMutation(), [
            'salonId' => $id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I update the salon as a guest with:
     */
    public function iUpdateTheSalonAsAGuest(PyStringNode $payload): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->updateSalonMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I query salon name and address
     */
    public function iQuerySalonNameAndAddress(): void
    {
        $this->graphql($this->salonNameAddressQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @Then updateSalon name is :name and address is :address
     */
    public function updateSalonNameIsAndAddressIs(string $name, string $address): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($name, $this->graphql['data']['updateSalon']['name']);
        $this->assertSame($address, $this->graphql['data']['updateSalon']['address']);
    }

    /**
     * @Then the salon name is :name and address is :address
     */
    public function theSalonNameIsAndAddressIs(string $name, string $address): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($name, $this->graphql['data']['salon']['name']);
        $this->assertSame($address, $this->graphql['data']['salon']['address']);
    }

    /**
     * @Then the salon has no address
     */
    public function theSalonHasNoAddress(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(null, $this->graphql['data']['salon']['address']);
    }

    /**
     * @Then the salon still has no coordinates
     */
    public function theSalonStillHasNoCoordinates(): void
    {
        $salon = $this->salon->fresh() ?? $this->salon;
        $this->assertSame(null, $salon->lat);
        $this->assertSame(null, $salon->lng);
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

    private function bookingRescheduledSubscription(): string
    {
        return <<<'GQL'
subscription BookingRescheduled($salonId: ID!) {
  bookingRescheduled(salonId: $salonId) {
    id
    status
  }
}
GQL;
    }

    private function bookingCancelledSubscription(): string
    {
        return <<<'GQL'
subscription BookingCancelled($salonId: ID!) {
  bookingCancelled(salonId: $salonId) {
    id
    status
  }
}
GQL;
    }

    private function acceptRescheduleMutation(): string
    {
        return <<<'GQL'
mutation AcceptReschedule($bookingId: ID!) {
  acceptReschedule(bookingId: $bookingId) {
    id
    status
    preferredDate
    preferredStartsAt
    durationMinutes
    worker { id name }
    reschedulePending
    rescheduleDate
    rescheduleStartsAt
  }
}
GQL;
    }

    private function dismissRescheduleMutation(): string
    {
        return <<<'GQL'
mutation DismissReschedule($bookingId: ID!) {
  dismissReschedule(bookingId: $bookingId) {
    id
    status
    preferredDate
    preferredStartsAt
    durationMinutes
    worker { id name }
    reschedulePending
    rescheduleDate
    rescheduleStartsAt
  }
}
GQL;
    }

    /**
     * @param  'occupyingBookings'|'pendingBookings'  $field
     */
    private function assertBookingListed(string $field, ?string $status, bool $present): void
    {
        $this->assertNoGraphqlErrors();
        $id = (string) $this->booking->id;
        foreach ($this->graphql['data'][$field] as $row) {
            if ((string) $row['id'] === $id) {
                if (! $present) {
                    throw new RuntimeException("Did not expect booking {$id} in {$field}");
                }
                $this->assertSame($status, $row['status']);

                return;
            }
        }
        if ($present) {
            throw new RuntimeException("Expected booking {$id} in {$field}");
        }
    }

    /**
     * @param  'acceptReschedule'|'dismissReschedule'  $field
     */
    private function assertRescheduleOwnerBooking(string $field, PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $row = $this->graphql['data'][$field];
        $this->assertSame((string) $this->booking->id, (string) $row['id']);
        $this->assertSame($expected['status'], $row['status']);
        $this->assertSame($expected['preferredDate'], $row['preferredDate']);
        $this->assertSame($expected['worker'], $row['worker'] === null ? null : $row['worker']['name']);
        $this->assertSame($expected['reschedulePending'], $row['reschedulePending']);
        $this->assertSame($expected['rescheduleDate'], $row['rescheduleDate']);
    }

    private function bookingCustomerRespondedSubscription(): string
    {
        return <<<'GQL'
subscription BookingCustomerResponded($salonId: ID!) {
  bookingCustomerResponded(salonId: $salonId) {
    id
    status
  }
}
GQL;
    }

    private function declineBookingMutation(): string
    {
        return <<<'GQL'
mutation Decline($bookingId: ID!, $reason: String) {
  declineBooking(bookingId: $bookingId, reason: $reason) {
    id
    status
    declineReason
  }
}
GQL;
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

    private function occupyingBookingsRangeQuery(): string
    {
        return <<<'GQL'
query OccupyingRange($salonId: ID!, $from: String!, $to: String!) {
  occupyingBookingsRange(salonId: $salonId, from: $from, to: $to) {
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

    /**
     * @param  mixed  $intake
     */
    private function assertConvertedIntake(mixed $intake, string $date, string $time): void
    {
        $this->assertIsArray($intake);
        $this->assertSame([(string) $this->services[0]->id], $intake['serviceIds']);
        $this->assertSame(null, $intake['workerId']);
        $this->assertSame($date, $intake['preferredDate']);
        $this->assertSame($time, $intake['preferredTime']);
    }

    private function pendingRowIntake(): mixed
    {
        $id = (string) $this->booking->id;
        foreach ($this->graphql['data']['pendingBookings'] as $row) {
            if ((string) $row['id'] === $id) {
                return $row['intake'];
            }
        }

        throw new RuntimeException("Expected booking {$id} in pendingBookings");
    }

    private function createBookingMutation(): string
    {
        return <<<'GQL'
mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    id
    status
  }
}
GQL;
    }

    private function ownerBookingQuery(): string
    {
        return <<<'GQL'
query OwnerBooking($id: ID!) {
  ownerBooking(id: $id) {
    id
    status
    customerName
    preferredDate
    preferredStartsAt
    durationMinutes
    worker { id name }
    services { name durationMinutes }
    intake {
      id
      serviceIds
      workerId
      preferredDate
      preferredTime
    }
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
    intake {
      id
      serviceIds
      workerId
      preferredDate
      preferredTime
    }
  }
}
GQL;
    }

    private function inFlightIntakesQuery(): string
    {
        return <<<'GQL'
query InFlight($salonId: ID!, $limit: Int = 20, $offset: Int = 0) {
  inFlightIntakes(salonId: $salonId, limit: $limit, offset: $offset) {
    id
    customerName
    serviceIds
    updatedAt
    takenOver
    pinged
  }
}
GQL;
    }

    private function inFlightIntakeCountQuery(): string
    {
        return <<<'GQL'
query InFlightCount($salonId: ID!) {
  inFlightIntakeCount(salonId: $salonId)
}
GQL;
    }

    private function salonStatsQuery(): string
    {
        return <<<'GQL'
query SalonStats($salonId: ID!) {
  salonStats(salonId: $salonId) {
    fromDate
    toDate
    bookingsCount
    cancellationRatePercent
    lateCancels
    days {
      date
      weekday
      bookingsCount
      busyPercent
    }
    hours {
      hour
      bookingsCount
    }
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

    private function salonNameAddressQuery(): string
    {
        return <<<'GQL'
query Salon($id: ID!) {
  salon(id: $id) {
    id
    name
    address
  }
}
GQL;
    }

    private function addSalonMutation(): string
    {
        return <<<'GQL'
mutation AddSalon($name: String!, $address: String!) {
  addSalon(name: $name, address: $address) {
    id
    name
    address
  }
}
GQL;
    }

    private function popularInSarajevoQuery(): string
    {
        return <<<'GQL'
query Popular {
  popularInSarajevo {
    id
    name
  }
}
GQL;
    }

    private function updateSalonMutation(): string
    {
        return <<<'GQL'
mutation UpdateSalon($salonId: ID!, $input: UpdateSalonInput!) {
  updateSalon(salonId: $salonId, input: $input) {
    id
    name
    address
    description
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
      serviceCategory {
        name
      }
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
    serviceCategory {
      name
    }
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
    serviceCategory {
      name
    }
    durationMinutes
    priceFeninga
  }
}
GQL;
    }

    private function salonServiceCategoriesQuery(): string
    {
        return <<<'GQL'
query SalonCategories($id: ID!) {
  salon(id: $id) {
    id
    serviceCategories {
      id
      name
      services {
        id
        name
      }
    }
  }
}
GQL;
    }

    private function createServiceCategoryMutation(): string
    {
        return <<<'GQL'
mutation CreateCategory($salonId: ID!, $input: CreateSalonServiceCategoryInput!) {
  createSalonServiceCategory(salonId: $salonId, input: $input) {
    id
    name
  }
}
GQL;
    }

    private function updateServiceCategoryMutation(): string
    {
        return <<<'GQL'
mutation UpdateCategory($id: ID!, $input: UpdateSalonServiceCategoryInput!) {
  updateSalonServiceCategory(id: $id, input: $input) {
    id
    name
  }
}
GQL;
    }

    private function deleteServiceCategoryMutation(): string
    {
        return <<<'GQL'
mutation DeleteCategory($id: ID!) {
  deleteSalonServiceCategory(id: $id)
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

    /**
     * @When I run the database seeder
     */
    public function iRunTheDatabaseSeeder(): void
    {
        try {
            (new DatabaseSeeder)->run();
            $this->seederException = null;
        } catch (\Throwable $e) {
            $this->seederException = $e;
        }
    }

    /**
     * @Then the database seeder is rejected as not local
     */
    public function theDatabaseSeederIsRejectedAsNotLocal(): void
    {
        if (! $this->seederException instanceof \Throwable) {
            throw new RuntimeException('Expected DatabaseSeeder to throw');
        }
        if (! str_contains($this->seederException->getMessage(), 'APP_ENV=local')) {
            throw new RuntimeException('Unexpected seeder error: '.$this->seederException->getMessage());
        }
        $this->assertSame(0, User::query()->count());
    }

    /**
     * @When I run the local demo seeder
     */
    public function iRunTheLocalDemoSeeder(): void
    {
        (new LocalDemoSeeder)->run();
    }

    /**
     * @Then the local demo catalog matches the story
     */
    public function theLocalDemoCatalogMatchesTheStory(): void
    {
        $owner = User::query()->where('email', 'owner@esyres.test')->first();
        $guest = User::query()->where('email', 'guest@esyres.test')->first();
        $owner2 = User::query()->where('email', 'owner2@esyres.test')->first();
        $this->assertNotNull($owner);
        $this->assertNotNull($guest);
        $this->assertNotNull($owner2);
        $this->assertTrue(Hash::check('password', $owner->password));
        $this->assertTrue(Hash::check('password', $guest->password));
        $this->assertTrue(Hash::check('password', $owner2->password));
        $this->assertSame(2, $owner->salons()->count());
        $this->assertSame(1, $owner2->salons()->count());
        $this->assertSame(0, $guest->salons()->count());

        $salons = Salon::query()->orderBy('id')->get();
        $this->assertSame(3, $salons->count());
        $categories = [];
        foreach ($salons as $salon) {
            if ($salon->lat === null || $salon->lng === null) {
                throw new RuntimeException('Expected Sarajevo coords on '.$salon->name);
            }
            if ($salon->lat < 43.7 || $salon->lat > 44.1 || $salon->lng < 18.2 || $salon->lng > 18.6) {
                throw new RuntimeException('Coords not in Sarajevo for '.$salon->name);
            }
            if ($salon->hours === WeeklyHours::closedWeek()) {
                throw new RuntimeException('Expected open hours on '.$salon->name);
            }
            if ($salon->workers()->count() < 1 || $salon->services()->count() < 1) {
                throw new RuntimeException('Expected worker and service on '.$salon->name);
            }
            foreach ($salon->services as $service) {
                $key = $service->serviceCategory?->legacy_key;
                if (is_string($key)) {
                    $categories[$key] = true;
                }
            }
        }
        foreach (['HAIR', 'MAKE_UP', 'MASSAGE'] as $category) {
            if (! isset($categories[$category])) {
                throw new RuntimeException('Missing service category '.$category);
            }
        }

        $primary = $owner->salons()->orderBy('id')->first();
        $second = $owner->salons()->orderBy('id')->skip(1)->first();
        $this->assertNotNull($primary);
        $this->assertNotNull($second);
        $this->assertSame(0, $second->bookings()->count());
        $bookings = $primary->bookings()->orderBy('id')->get();
        $this->assertSame(4, $bookings->count());
        foreach ($bookings as $booking) {
            $this->assertSame($guest->id, $booking->customer_id);
        }
        $this->assertSame(2, $bookings->where('status', Booking::REQUESTED)->count());
        $proposed = $bookings->firstWhere('status', Booking::TIME_PROPOSED);
        $confirmed = $bookings->firstWhere('status', Booking::CONFIRMED);
        $this->assertNotNull($proposed);
        $this->assertNotNull($confirmed);
        $this->assertNotNull($proposed->proposed_starts_at);
        $this->assertNotNull($proposed->proposed_worker_id);
        $this->assertNotNull($confirmed->worker_id);
    }

    /**
     * @When I query my salon media
     */
    public function iQueryMySalonMedia(): void
    {
        $this->graphql($this->mySalonMediaQuery());
    }

    /**
     * @When I query salon media as a guest
     */
    public function iQuerySalonMediaAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->salonMediaQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I upload a :kind main image
     */
    public function iUploadAMainImage(string $kind): void
    {
        $this->graphqlMultipart($this->uploadMainMutation(), [
            'salonId' => (string) $this->salon->id,
        ], $this->fakeImage($kind));
        $this->salon = $this->salon->fresh();
    }

    /**
     * @When I upload a main image as a guest
     */
    public function iUploadAMainImageAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphqlMultipart($this->uploadMainMutation(), [
            'salonId' => (string) $this->salon->id,
        ], $this->fakeImage('jpeg'));
    }

    /**
     * @When I upload a gallery jpeg
     */
    public function iUploadAGalleryJpeg(): void
    {
        $this->graphqlMultipart($this->uploadGalleryMutation(), [
            'salonId' => (string) $this->salon->id,
        ], $this->fakeImage('jpeg'));
        $this->salon = $this->salon->fresh();
    }

    /**
     * @When I upload a gallery jpeg 6 times
     */
    public function iUploadAGalleryJpeg6Times(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $this->iUploadAGalleryJpeg();
            $this->assertNoGraphqlErrors();
        }
    }

    /**
     * @When I remove the main image
     */
    public function iRemoveTheMainImage(): void
    {
        $this->graphql($this->removeMainMutation(), ['salonId' => (string) $this->salon->id]);
        $this->salon = $this->salon->fresh();
    }

    /**
     * @When I remove gallery index :index
     */
    public function iRemoveGalleryIndex(string $index): void
    {
        $this->graphql($this->removeGalleryMutation(), [
            'salonId' => (string) $this->salon->id,
            'index' => (int) $index,
        ]);
        $this->salon = $this->salon->fresh();
    }

    /**
     * @When I remember the main image path
     */
    public function iRememberTheMainImagePath(): void
    {
        $this->rememberedMainPath = $this->salon->fresh()?->main_image_path;
        if (! is_string($this->rememberedMainPath) || $this->rememberedMainPath === '') {
            throw new RuntimeException('Expected a stored main image path');
        }
    }

    /**
     * @Then the remembered main image is gone
     */
    public function theRememberedMainImageIsGone(): void
    {
        if (! is_string($this->rememberedMainPath) || $this->rememberedMainPath === '') {
            throw new RuntimeException('No remembered main image path');
        }
        $this->assertFalse(Storage::disk('public')->exists($this->rememberedMainPath));
    }

    /**
     * @Then the salon has no description
     */
    public function theSalonHasNoDescription(): void
    {
        $this->assertNoGraphqlErrors();
        $row = $this->mySalonMediaRow();
        $this->assertNull($row['description']);
        $this->assertNull($this->salon->fresh()?->description);
    }

    /**
     * @Then my salon description is :text
     */
    public function mySalonDescriptionIs(string $text): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($text, $this->mySalonMediaRow()['description']);
        $this->assertSame($text, $this->salon->fresh()?->description);
    }

    /**
     * @Then updateSalon has no description
     */
    public function updateSalonHasNoDescription(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertNull($this->graphql['data']['updateSalon']['description']);
    }

    /**
     * @Then updateSalon description is :text
     */
    public function updateSalonDescriptionIs(string $text): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($text, $this->graphql['data']['updateSalon']['description']);
    }

    /**
     * @When I update the salon description to 1001 characters
     */
    public function iUpdateTheSalonDescriptionTo1001Characters(): void
    {
        $this->graphql($this->updateSalonMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => [
                'name' => 'Kosa Studio',
                'address' => 'Ferhadija 12',
                'description' => str_repeat('x', 1001),
            ],
        ]);
    }

    /**
     * @Then my salon main image is empty
     */
    public function mySalonMainImageIsEmpty(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertNull($this->mySalonMediaRow()['mainImageUrl']);
        $this->assertNull($this->salon->fresh()?->main_image_path);
    }

    /**
     * @Then my salon gallery is empty
     */
    public function mySalonGalleryIsEmpty(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame([], $this->mySalonMediaRow()['galleryUrls']);
    }

    /**
     * @Then salon main image is on disk
     */
    public function salonMainImageIsOnDisk(): void
    {
        $this->assertNoGraphqlErrors();
        $path = $this->salon->fresh()?->main_image_path;
        $this->assertIsString($path);
        $this->assertTrue(Storage::disk('public')->exists($path));
        $fromUpload = $this->graphql['data']['uploadSalonMainImage']['mainImageUrl'] ?? null;
        $url = is_string($fromUpload) ? $fromUpload : $this->mySalonMediaRow()['mainImageUrl'];
        $this->assertIsString($url);
        $this->assertStringStartsWith('/storage/', $url);
    }

    /**
     * @Then salon gallery count is :count
     */
    public function salonGalleryCountIs(string $count): void
    {
        $this->assertNoGraphqlErrors();
        $this->iQueryMySalonMedia();
        $this->assertNoGraphqlErrors();
        $this->assertCount((int) $count, $this->mySalonMediaRow()['galleryUrls']);
        foreach ($this->mySalonMediaRow()['galleryUrls'] as $url) {
            $this->assertStringStartsWith('/storage/', $url);
        }
    }

    /**
     * @Then salon name is still :name
     */
    public function salonNameIsStill(string $name): void
    {
        $this->assertSame($name, $this->salon->fresh()?->name);
    }

    private function fakeImage(string $kind): UploadedFile
    {
        return match ($kind) {
            'jpeg' => UploadedFile::fake()->createWithContent(
                'main.jpg',
                (string) hex2bin('ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c232c2c28003c32383a3c3e3b3c3a3d40484c45403a3d3e3f4141414141414141414141414141ffc0000b080001000101011100ffc400140001000000000000000000000000000008ffc400141001000000000000000000000000000000ffda0008010100003f0037ffd9'),
            ),
            'png' => UploadedFile::fake()->createWithContent('main.png', (string) base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
                true,
            )),
            'webp' => UploadedFile::fake()->createWithContent('main.webp', (string) base64_decode(
                'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
                true,
            )),
            'gif' => UploadedFile::fake()->create('main.gif', 20, 'image/gif'),
            'oversize' => UploadedFile::fake()->create('big.jpg', 5121, 'image/jpeg'),
            default => throw new RuntimeException('Unknown image kind '.$kind),
        };
    }

    /**
     * @return array{description: mixed, mainImageUrl: mixed, galleryUrls: mixed}
     */
    private function mySalonMediaRow(): array
    {
        $list = $this->graphql['data']['me']['salons'] ?? null;
        if (! is_array($list)) {
            throw new RuntimeException('Expected me.salons, got '.json_encode($this->graphql));
        }
        foreach ($list as $row) {
            if ((string) ($row['id'] ?? '') === (string) $this->salon->id) {
                return $row;
            }
        }
        throw new RuntimeException('Salon missing from me.salons');
    }

    private function mySalonMediaQuery(): string
    {
        return <<<'GQL'
query MeSalonMedia {
  me {
    salons {
      id
      description
      mainImageUrl
      galleryUrls
    }
  }
}
GQL;
    }

    private function salonMediaQuery(): string
    {
        return <<<'GQL'
query SalonMedia($id: ID!) {
  salon(id: $id) {
    id
    description
    mainImageUrl
    galleryUrls
  }
}
GQL;
    }

    private function uploadMainMutation(): string
    {
        return <<<'GQL'
mutation UploadMain($salonId: ID!, $file: Upload!) {
  uploadSalonMainImage(salonId: $salonId, file: $file) {
    id
    description
    mainImageUrl
    galleryUrls
  }
}
GQL;
    }

    private function uploadGalleryMutation(): string
    {
        return <<<'GQL'
mutation UploadGallery($salonId: ID!, $file: Upload!) {
  uploadSalonGalleryImage(salonId: $salonId, file: $file) {
    id
    galleryUrls
  }
}
GQL;
    }

    private function removeMainMutation(): string
    {
        return <<<'GQL'
mutation RemoveMain($salonId: ID!) {
  removeSalonMainImage(salonId: $salonId) {
    id
    mainImageUrl
  }
}
GQL;
    }

    private function removeGalleryMutation(): string
    {
        return <<<'GQL'
mutation RemoveGallery($salonId: ID!, $index: Int!) {
  removeSalonGalleryImage(salonId: $salonId, index: $index) {
    id
    galleryUrls
  }
}
GQL;
    }
}
