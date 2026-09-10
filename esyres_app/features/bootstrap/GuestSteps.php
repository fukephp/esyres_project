<?php

use App\Models\AssistantIntake;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use App\Models\Worker;
use App\Notifications\VerifyEmail;
use App\Sms\FakeSmsGateway;
use App\Sms\SmsGateway;
use Behat\Gherkin\Node\PyStringNode;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

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
        $this->rememberRegisteredUser();
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
        $this->rememberRegisteredUser();
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
     * @Then me has a verified email
     */
    public function meHasAVerifiedEmail(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(true, $this->graphql['data']['me']['emailVerified']);
    }

    /**
     * @Then the customer email is verified in the database
     */
    public function theCustomerEmailIsVerifiedInTheDatabase(): void
    {
        if ($this->customer()->fresh()->email_verified_at === null) {
            throw new RuntimeException('Expected email_verified_at to be set');
        }
    }

    /**
     * @Then I remember the verify-email URL
     */
    public function iRememberTheVerifyEmailUrl(): void
    {
        $user = $this->customer();
        $this->verifyUser = $user;
        $this->verifyUrl = $this->verifyEmailActionUrl($user);
    }

    /**
     * @When I visit the remembered verify-email URL
     */
    public function iVisitTheRememberedVerifyEmailUrl(): void
    {
        if ($this->verifyUrl === null) {
            throw new RuntimeException('No remembered verify-email URL');
        }
        $this->getVerifyUrl($this->verifyUrl);
    }

    /**
     * @When I visit a tampered verify-email URL
     */
    public function iVisitATamperedVerifyEmailUrl(): void
    {
        if ($this->verifyUrl === null) {
            $this->iRememberTheVerifyEmailUrl();
        }
        $this->getVerifyUrl($this->verifyUrl.'&tamper=1');
    }

    /**
     * @When I visit an expired verify-email URL
     */
    public function iVisitAnExpiredVerifyEmailUrl(): void
    {
        $user = $this->customer();
        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->subMinute(),
            ['id' => $user->getKey(), 'hash' => sha1($user->getEmailForVerification())],
        );
        $this->getVerifyUrl($url);
    }

    /**
     * @Then I am redirected to bookings verified
     */
    public function iAmRedirectedToBookingsVerified(): void
    {
        $this->assertSame('http://localhost/bookings?verified=1', $this->lastLocation);
    }

    /**
     * @Then I am redirected to bookings verify invalid
     */
    public function iAmRedirectedToBookingsVerifyInvalid(): void
    {
        $this->assertSame('http://localhost/bookings?verify=invalid', $this->lastLocation);
    }

    /**
     * @Then I am redirected to bookings verify mismatch
     */
    public function iAmRedirectedToBookingsVerifyMismatch(): void
    {
        $this->assertSame('http://localhost/bookings?verify=mismatch', $this->lastLocation);
    }

    /**
     * @Then the remembered customer email is not verified
     */
    public function theRememberedCustomerEmailIsNotVerified(): void
    {
        if ($this->verifyUser === null) {
            throw new RuntimeException('No remembered verify customer');
        }
        $this->assertSame(null, $this->verifyUser->fresh()->email_verified_at);
    }

    /**
     * @When the customer's phone is marked verified
     */
    public function theCustomersPhoneIsMarkedVerified(): void
    {
        $user = $this->customer();
        $user->phone = $user->phone ?? '+38761111000';
        $user->phone_verified_at = now();
        $user->save();
    }

    /**
     * @When I resend the verification email
     */
    public function iResendTheVerificationEmail(): void
    {
        $this->graphql($this->resendVerificationEmailMutation());
    }

    /**
     * @When I resend the verification email as a guest
     */
    public function iResendTheVerificationEmailAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->resendVerificationEmailMutation());
    }

    /**
     * @Then resend succeeds
     */
    public function resendSucceeds(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(true, $this->graphql['data']['resendVerificationEmail']);
    }

    /**
     * @Then a verify-email notification was sent twice
     */
    public function aVerifyEmailNotificationWasSentTwice(): void
    {
        Notification::assertSentToTimes($this->customer(), VerifyEmail::class, 2);
    }

    /**
     * @When I request a phone OTP for :phone
     */
    public function iRequestAPhoneOtpFor(string $phone): void
    {
        $this->graphql($this->requestPhoneOtpMutation(), ['phone' => $phone]);
    }

    /**
     * @When I request a phone OTP for :phone as a guest
     */
    public function iRequestAPhoneOtpForAsAGuest(string $phone): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->requestPhoneOtpMutation(), ['phone' => $phone]);
    }

    /**
     * @When I verify the last phone OTP
     */
    public function iVerifyTheLastPhoneOtp(): void
    {
        $this->graphql($this->verifyPhoneOtpMutation(), ['code' => $this->lastOtp()]);
    }

    /**
     * @When I verify the phone OTP with :code
     */
    public function iVerifyThePhoneOtpWith(string $code): void
    {
        $this->graphql($this->verifyPhoneOtpMutation(), ['code' => $code]);
    }

    /**
     * @When I verify the phone OTP with :code as a guest
     */
    public function iVerifyThePhoneOtpWithAsAGuest(string $code): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->verifyPhoneOtpMutation(), ['code' => $code]);
    }

    /**
     * @When I verify the phone OTP with a wrong code :n more times
     */
    public function iVerifyThePhoneOtpWithAWrongCodeMoreTimes(string $n): void
    {
        for ($i = 0; $i < (int) $n; $i++) {
            $this->graphql($this->verifyPhoneOtpMutation(), ['code' => '000000']);
        }
    }

    /**
     * @When time advances :seconds seconds
     */
    public function timeAdvances(string $seconds): void
    {
        Carbon::setTestNow(now()->addSeconds((int) $seconds));
    }

    /**
     * @Then request phone otp succeeds
     */
    public function requestPhoneOtpSucceeds(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(true, $this->graphql['data']['requestPhoneOtp']);
    }

    /**
     * @Then verify phone otp succeeds
     */
    public function verifyPhoneOtpSucceeds(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(true, $this->graphql['data']['verifyPhoneOtp']);
    }

    /**
     * @Then the last OTP is 6 digits
     */
    public function theLastOtpIs6Digits(): void
    {
        if (preg_match('/^\d{6}$/', $this->lastOtp()) !== 1) {
            throw new RuntimeException('Expected 6-digit OTP, got '.$this->lastOtp());
        }
    }

    /**
     * @Then me phone is verified
     */
    public function mePhoneIsVerified(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(true, $this->graphql['data']['me']['phoneVerified']);
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
     * @Given a customer :email with password :password with no verifications
     */
    public function aCustomerWithNoVerifications(string $email, string $password): void
    {
        $this->user = User::factory()->unverified()->create([
            'email' => $email,
            'password' => $password,
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
     * @When I create a booking on :date at :time with the salon worker
     */
    public function iCreateABookingWithTheSalonWorker(string $date, string $time): void
    {
        if ($this->worker === null) {
            throw new RuntimeException('Salon worker fixture is missing');
        }
        $this->postCreateBooking($date, $time, $this->salonServiceIds(), (string) $this->worker->id);
    }

    /**
     * @When I upsert a new assistant intake as a guest
     */
    public function iUpsertANewAssistantIntakeAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->postUpsertIntake(null);
    }

    /**
     * @When I upsert the assistant intake as a guest
     */
    public function iUpsertTheAssistantIntakeAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->postUpsertIntake($this->intakeToken);
    }

    /**
     * @When I upsert the assistant intake
     */
    public function iUpsertTheAssistantIntake(): void
    {
        $this->postUpsertIntake($this->intakeToken);
    }

    /**
     * @When I query the assistant intake as a guest
     */
    public function iQueryTheAssistantIntakeAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->assistantIntakeQuery(), ['token' => $this->intakeToken ?? '']);
    }

    /**
     * @When I query the assistant intake
     */
    public function iQueryTheAssistantIntake(): void
    {
        $this->graphql($this->assistantIntakeQuery(), ['token' => $this->intakeToken ?? '']);
    }

    /**
     * @When I query an unknown assistant intake as a guest
     */
    public function iQueryAnUnknownAssistantIntakeAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->assistantIntakeQuery(), ['token' => '00000000-0000-4000-8000-000000000000']);
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
     * @When I query in-flight intake count as a guest
     */
    public function iQueryInFlightIntakeCountAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->inFlightIntakeCountQuery(), [
            'salonId' => (string) $this->salon->id,
        ]);
    }

    /**
     * @When I create a booking on :date at :time with the salon services and the intake token
     */
    public function iCreateABookingWithSalonServicesAndIntakeToken(string $date, string $time): void
    {
        $this->postCreateBooking($date, $time, $this->salonServiceIds(), null, $this->intakeToken);
    }

    /**
     * @When I create a booking on :date at :time with the salon services and an unknown intake token
     */
    public function iCreateABookingWithUnknownIntakeToken(string $date, string $time): void
    {
        $this->postCreateBooking($date, $time, $this->salonServiceIds(), null, '00000000-0000-4000-8000-000000000000');
    }

    /**
     * @Then the intake token is a uuid
     */
    public function theIntakeTokenIsAUuid(): void
    {
        $this->assertNoGraphqlErrors();
        $row = $this->intakePayload() ?? [];
        $token = $row['token'] ?? null;
        if (! is_string($token) || preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $token) !== 1) {
            throw new RuntimeException('Expected uuid token, got '.json_encode($token));
        }
        $this->intakeToken = $token;
    }

    /**
     * @Then the intake customer name is :name
     */
    public function theIntakeCustomerNameIs(string $name): void
    {
        $this->assertNoGraphqlErrors();
        $row = $this->intakePayload();
        $this->assertNotNull($row);
        $this->assertSame($name, $row['customerName']);
    }

    /**
     * @Then the assistant intake is null
     */
    public function theAssistantIntakeIsNull(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(null, $this->graphql['data']['assistantIntake']);
    }

    /**
     * @Then the intake service count is :count
     */
    public function theIntakeServiceCountIs(string $count): void
    {
        $this->assertNoGraphqlErrors();
        $row = $this->intakePayload();
        $this->assertNotNull($row);
        $this->assertSame((int) $count, count($row['serviceIds']));
    }

    /**
     * @Given that customer is named :name
     */
    public function thatCustomerIsNamed(string $name): void
    {
        $this->user->name = $name;
        $this->user->save();
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
     * @Then booking has the salon worker
     */
    public function bookingHasTheSalonWorker(): void
    {
        $this->assertNoGraphqlErrors();
        if ($this->worker === null) {
            throw new RuntimeException('Salon worker fixture is missing');
        }
        $id = $this->graphql['data']['createBooking']['id'];
        $booking = \App\Models\Booking::query()->find($id);
        if ($booking === null || $booking->worker_id !== $this->worker->id) {
            throw new RuntimeException('Expected salon worker, got '.json_encode($booking));
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
     * @Then the public salon address is :address
     */
    public function thePublicSalonAddressIs(string $address): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame($address, $this->graphql['data']['salon']['address']);
    }

    /**
     * @Then the public salon has no address
     */
    public function thePublicSalonHasNoAddress(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame(null, $this->graphql['data']['salon']['address']);
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

    private function verifyEmailActionUrl(User $user): string
    {
        $notification = Notification::sent($user, VerifyEmail::class)->last();
        if ($notification === null) {
            throw new RuntimeException('No VerifyEmail notification for '.$user->email);
        }

        return $notification->toMail($user)->actionUrl;
    }

    private function getVerifyUrl(string $url): void
    {
        $path = parse_url($url, PHP_URL_PATH);
        $query = parse_url($url, PHP_URL_QUERY);
        if (! is_string($path)) {
            throw new RuntimeException('Invalid verify URL: '.$url);
        }
        $uri = $path.(is_string($query) && $query !== '' ? '?'.$query : '');
        $this->forgetRequestUser();
        $response = $this->get($uri);
        $this->lastLocation = $response->headers->get('Location');
        $this->rememberCookies($response);
        $this->forgetRequestUser();
    }

    private function lastOtp(): string
    {
        $sms = $this->app->make(SmsGateway::class);
        if (! $sms instanceof FakeSmsGateway || $sms->lastCode === null) {
            throw new RuntimeException('No captured OTP');
        }

        return $sms->lastCode;
    }

    private function rememberRegisteredUser(): void
    {
        $email = $this->graphql['data']['register']['email'] ?? null;
        if (is_string($email)) {
            $this->user = User::query()->where('email', $email)->first();
        }
    }

    private function requestPhoneOtpMutation(): string
    {
        return <<<'GQL'
mutation RequestPhoneOtp($phone: String!) {
  requestPhoneOtp(phone: $phone)
}
GQL;
    }

    private function verifyPhoneOtpMutation(): string
    {
        return <<<'GQL'
mutation VerifyPhoneOtp($code: String!) {
  verifyPhoneOtp(code: $code)
}
GQL;
    }

    private function resendVerificationEmailMutation(): string
    {
        return <<<'GQL'
mutation {
  resendVerificationEmail
}
GQL;
    }

    /**
     * @param  list<string>  $serviceIds
     */
    private function postCreateBooking(string $date, string $time, array $serviceIds, ?string $workerId, ?string $intakeToken = null): void
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
        if ($intakeToken !== null) {
            $input['intakeToken'] = $intakeToken;
        }
        $this->graphql($this->createBookingMutation(), ['input' => $input]);
    }

    private function postUpsertIntake(?string $token): void
    {
        $input = [
            'salonId' => (string) $this->salon->id,
            'serviceIds' => $this->salonServiceIds() === [] ? [] : [$this->salonServiceIds()[0]],
            'workerConfirmed' => false,
        ];
        if ($token !== null) {
            $input['token'] = $token;
        }
        $this->graphql($this->upsertAssistantIntakeMutation(), ['input' => $input]);
        if (isset($this->graphql['data']['upsertAssistantIntake']['token'])) {
            $this->intakeToken = $this->graphql['data']['upsertAssistantIntake']['token'];
            $this->intake = AssistantIntake::query()->where('token', $this->intakeToken)->first();
        }
    }

    /** @return array<string, mixed>|null */
    private function intakePayload(): ?array
    {
        $row = $this->graphql['data']['pingAssistantIntake']
            ?? $this->graphql['data']['upsertAssistantIntake']
            ?? $this->graphql['data']['assistantIntake']
            ?? null;
        if (! is_array($row)) {
            return null;
        }

        return $row;
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

    /**
     * @Given another verified customer :email with password :password
     */
    public function anotherVerifiedCustomer(string $email, string $password): void
    {
        $this->otherUser = User::factory()->create([
            'email' => $email,
            'password' => $password,
            'email_verified_at' => now(),
            'phone' => '+38762'.substr(sha1($email), 0, 6),
            'phone_verified_at' => now(),
        ]);
    }

    /**
     * @Given the customer has a requested booking on :date at :time
     */
    public function theCustomerHasARequestedBooking(string $date, string $time): void
    {
        $this->insertCustomerBooking($this->user, $this->salon, $date, $time);
    }

    /**
     * @Given that other user has a requested booking on :date at :time
     */
    public function thatOtherUserHasARequestedBooking(string $date, string $time): void
    {
        $this->insertCustomerBooking($this->otherUser, $this->salon, $date, $time);
    }

    /**
     * @Given that booking is declined
     */
    public function thatBookingIsDeclined(): void
    {
        $this->booking->status = Booking::DECLINED;
        $this->booking->save();
        Carbon::setTestNow(now()->addMinute());
    }

    /**
     * @Given that booking is declined with reason :reason
     */
    public function thatBookingIsDeclinedWithReason(string $reason): void
    {
        $this->booking->status = Booking::DECLINED;
        $this->booking->decline_reason = $reason;
        $this->booking->save();
        Carbon::setTestNow(now()->addMinute());
    }

    /**
     * @Given the customer's first booking is declined
     */
    public function theCustomersFirstBookingIsDeclined(): void
    {
        $this->firstCustomerBooking->status = Booking::DECLINED;
        $this->firstCustomerBooking->save();
        Carbon::setTestNow(now()->addMinute());
    }

    /**
     * @Given that booking is time proposed at :date at :time
     */
    public function thatBookingIsTimeProposedAt(string $date, string $time): void
    {
        $starts = Carbon::createFromFormat('Y-m-d H:i', $date.' '.$time, 'Europe/Sarajevo');
        $this->booking->status = Booking::TIME_PROPOSED;
        $this->booking->proposed_starts_at = $starts;
        $this->booking->proposed_worker_id = $this->worker->id;
        $this->booking->owner_responded_at = now();
        $this->booking->save();
        $this->ownerRespondedAt = $this->booking->fresh()->owner_responded_at->utc()->toIso8601String();
        Carbon::setTestNow(now()->addMinute());
    }

    /**
     * @When I confirm the proposed time
     */
    public function iConfirmTheProposedTime(): void
    {
        $this->graphql($this->confirmProposedTimeMutation(), [
            'bookingId' => (string) $this->booking->id,
        ]);
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
     * @When I confirm the proposed time as a guest
     */
    public function iConfirmTheProposedTimeAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iConfirmTheProposedTime();
    }

    /**
     * @When I confirm proposed time for booking id :id
     */
    public function iConfirmProposedTimeForBookingId(string $id): void
    {
        $this->graphql($this->confirmProposedTimeMutation(), [
            'bookingId' => $id,
        ]);
    }

    /**
     * @When I reject the proposed time
     */
    public function iRejectTheProposedTime(): void
    {
        $this->graphql($this->rejectProposedTimeMutation(), [
            'bookingId' => (string) $this->booking->id,
        ]);
    }

    /**
     * @When I ask other time :date at :time
     */
    public function iAskOtherTime(string $date, string $time): void
    {
        $this->graphql($this->askOtherTimeMutation(), [
            'bookingId' => (string) $this->booking->id,
            'preferredDate' => $date,
            'preferredTime' => $time,
        ]);
    }

    /**
     * @When I request reschedule :date at :time
     */
    public function iRequestReschedule(string $date, string $time): void
    {
        $this->graphql($this->requestRescheduleMutation(), [
            'bookingId' => (string) $this->booking->id,
            'preferredDate' => $date,
            'preferredTime' => $time,
        ]);
    }

    /**
     * @When I request reschedule :date at :time as a guest
     */
    public function iRequestRescheduleAsAGuest(string $date, string $time): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iRequestReschedule($date, $time);
    }

    /**
     * @When I request reschedule :date at :time for booking id :id
     */
    public function iRequestRescheduleForBookingId(string $date, string $time, string $id): void
    {
        $this->graphql($this->requestRescheduleMutation(), [
            'bookingId' => $id,
            'preferredDate' => $date,
            'preferredTime' => $time,
        ]);
    }

    /**
     * @Then request reschedule matches:
     */
    public function requestRescheduleMatches(PyStringNode $payload): void
    {
        $this->assertRespondBooking('requestReschedule', $payload);
    }

    /**
     * @When I cancel the booking
     */
    public function iCancelTheBooking(): void
    {
        $this->graphql($this->cancelBookingMutation(), [
            'bookingId' => (string) $this->booking->id,
        ]);
    }

    /**
     * @When I cancel the booking as a guest
     */
    public function iCancelTheBookingAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->iCancelTheBooking();
    }

    /**
     * @When I cancel booking id :id
     */
    public function iCancelBookingId(string $id): void
    {
        $this->graphql($this->cancelBookingMutation(), [
            'bookingId' => $id,
        ]);
    }

    /**
     * @Then cancel booking matches:
     */
    public function cancelBookingMatches(PyStringNode $payload): void
    {
        $this->assertRespondBooking('cancelBooking', $payload);
    }

    /**
     * @Then this my booking lateToCancel is true
     */
    public function thisMyBookingLateToCancelIsTrue(): void
    {
        $this->assertSame(true, $this->myBookingRow()['lateToCancel']);
    }

    /**
     * @Then this my booking lateToCancel is false
     */
    public function thisMyBookingLateToCancelIsFalse(): void
    {
        $this->assertSame(false, $this->myBookingRow()['lateToCancel']);
    }

    /**
     * @Then this my booking lateCancel is true
     */
    public function thisMyBookingLateCancelIsTrue(): void
    {
        $this->assertSame(true, $this->myBookingRow()['lateCancel']);
    }

    /**
     * @Then this my booking status is :status
     */
    public function thisMyBookingStatusIs(string $status): void
    {
        $this->assertSame($status, $this->myBookingRow()['status']);
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
     * @Then confirm proposed time matches:
     */
    public function confirmProposedTimeMatches(PyStringNode $payload): void
    {
        $this->assertRespondBooking('confirmProposedTime', $payload);
    }

    /**
     * @Then reject proposed time matches:
     */
    public function rejectProposedTimeMatches(PyStringNode $payload): void
    {
        $this->assertRespondBooking('rejectProposedTime', $payload);
    }

    /**
     * @Then ask other time matches:
     */
    public function askOtherTimeMatches(PyStringNode $payload): void
    {
        $this->assertRespondBooking('askOtherTime', $payload);
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

    private function assertRespondBooking(string $field, PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $row = $this->graphql['data'][$field];
        $this->assertSame((string) $this->booking->id, (string) $row['id']);
        $this->assertSame($expected['status'], $row['status']);
        $this->assertSame($expected['preferredDate'], $row['preferredDate']);
        $this->assertSame($expected['worker'], $row['worker'] === null ? null : $row['worker']['name']);
        if (array_key_exists('proposedWorker', $expected)) {
            $this->assertSame($expected['proposedWorker'], $row['proposedWorker'] === null ? null : $row['proposedWorker']['name']);
        }
        if (array_key_exists('declineReason', $expected)) {
            $this->assertSame($expected['declineReason'], $row['declineReason']);
        }
        if (array_key_exists('proposedStartsAt', $expected)) {
            if ($expected['proposedStartsAt'] === null) {
                $this->assertSame(null, $row['proposedStartsAt']);
            } else {
                $this->assertNotNull($row['proposedStartsAt']);
            }
        }
        if (array_key_exists('durationMinutes', $expected)) {
            $this->assertSame($expected['durationMinutes'], $row['durationMinutes']);
        }
        if (array_key_exists('services', $expected)) {
            $this->assertSame($expected['services'], $row['services']);
        }
        if (array_key_exists('reschedulePending', $expected)) {
            $this->assertSame($expected['reschedulePending'], $row['reschedulePending']);
        }
        if (array_key_exists('rescheduleDate', $expected)) {
            $this->assertSame($expected['rescheduleDate'], $row['rescheduleDate']);
        }
        if (array_key_exists('rescheduleStartsAt', $expected)) {
            $this->assertSame($expected['rescheduleStartsAt'], $row['rescheduleStartsAt']);
        }
        if (array_key_exists('lateCancel', $expected)) {
            $this->assertSame($expected['lateCancel'], $row['lateCancel']);
        }
        if (array_key_exists('lateToCancel', $expected)) {
            $this->assertSame($expected['lateToCancel'], $row['lateToCancel']);
        }
        if (array_key_exists('cancelledAt', $expected)) {
            if ($expected['cancelledAt'] === true) {
                $this->assertNotNull($row['cancelledAt']);
            } else {
                $this->assertSame($expected['cancelledAt'], $row['cancelledAt']);
            }
        }
    }

    /**
     * @When I query my bookings
     */
    public function iQueryMyBookings(): void
    {
        $this->graphql($this->myBookingsQuery());
    }

    /**
     * @When I query my bookings limit :limit offset :offset
     */
    public function iQueryMyBookingsPaged(string $limit, string $offset): void
    {
        $this->graphql($this->myBookingsQuery(), [
            'limit' => (int) $limit,
            'offset' => (int) $offset,
        ]);
    }

    /**
     * @When I query my bookings as a guest
     */
    public function iQueryMyBookingsAsAGuest(): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->myBookingsQuery());
    }

    /**
     * @Then this my booking intake is null
     */
    public function thisMyBookingIntakeIsNull(): void
    {
        $this->assertSame(null, $this->myBookingRow()['intake']);
    }

    /**
     * @return array<string, mixed>
     */
    private function myBookingRow(): array
    {
        $this->assertNoGraphqlErrors();
        $id = (string) $this->booking->id;
        foreach ($this->graphql['data']['myBookings'] as $row) {
            if ((string) $row['id'] === $id) {
                return $row;
            }
        }

        throw new RuntimeException("Expected booking {$id} in myBookings");
    }

    /**
     * @Then my bookings are empty
     */
    public function myBookingsAreEmpty(): void
    {
        $this->assertNoGraphqlErrors();
        $this->assertSame([], $this->graphql['data']['myBookings']);
    }

    /**
     * @Then my booking statuses are:
     */
    public function myBookingStatusesAre(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $actual = [];
        foreach ($this->graphql['data']['myBookings'] as $row) {
            $actual[] = $row['status'];
        }
        $this->assertSame($expected, $actual);
    }

    /**
     * @Then my booking preferred dates are:
     */
    public function myBookingPreferredDatesAre(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $actual = [];
        foreach ($this->graphql['data']['myBookings'] as $row) {
            $actual[] = $row['preferredDate'];
        }
        $this->assertSame($expected, $actual);
    }

    /**
     * @Then the first my booking matches:
     */
    public function theFirstMyBookingMatches(PyStringNode $payload): void
    {
        $this->assertNoGraphqlErrors();
        $expected = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $row = $this->graphql['data']['myBookings'][0];
        $this->assertSame($expected['status'], $row['status']);
        $this->assertSame($expected['salon'], $row['salon']['name']);
        $this->assertSame($this->salon->id, (int) $row['salon']['id']);
        $this->assertSame($expected['preferredDate'], $row['preferredDate']);
        $this->assertSame($expected['durationMinutes'], $row['durationMinutes']);
        $this->assertSame($expected['worker'], $row['worker'] === null ? null : $row['worker']['name']);
        $this->assertSame($expected['proposedWorker'], $row['proposedWorker'] === null ? null : $row['proposedWorker']['name']);
        $this->assertSame($expected['declineReason'], $row['declineReason']);
        $this->assertSame($expected['services'], $row['services']);
        if (array_key_exists('proposedStartsAt', $expected)) {
            if ($expected['proposedStartsAt'] === null) {
                $this->assertSame(null, $row['proposedStartsAt']);
            } else {
                $this->assertNotNull($row['proposedStartsAt']);
            }
        }
    }

    private function confirmProposedTimeMutation(): string
    {
        return <<<'GQL'
mutation ConfirmProposed($bookingId: ID!) {
  confirmProposedTime(bookingId: $bookingId) {
    id
    status
    preferredDate
    preferredStartsAt
    durationMinutes
    worker { id name }
    proposedStartsAt
    proposedWorker { id name }
    declineReason
    services { name durationMinutes }
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

    private function rejectProposedTimeMutation(): string
    {
        return <<<'GQL'
mutation RejectProposed($bookingId: ID!) {
  rejectProposedTime(bookingId: $bookingId) {
    id
    status
    preferredDate
    preferredStartsAt
    durationMinutes
    worker { id name }
    proposedStartsAt
    proposedWorker { id name }
    declineReason
    services { name durationMinutes }
  }
}
GQL;
    }

    private function askOtherTimeMutation(): string
    {
        return <<<'GQL'
mutation AskOther($bookingId: ID!, $preferredDate: String!, $preferredTime: String!) {
  askOtherTime(bookingId: $bookingId, preferredDate: $preferredDate, preferredTime: $preferredTime) {
    id
    status
    preferredDate
    preferredStartsAt
    durationMinutes
    worker { id name }
    proposedStartsAt
    proposedWorker { id name }
    declineReason
    services { name durationMinutes }
  }
}
GQL;
    }

    private function requestRescheduleMutation(): string
    {
        return <<<'GQL'
mutation RequestReschedule($bookingId: ID!, $preferredDate: String!, $preferredTime: String!) {
  requestReschedule(bookingId: $bookingId, preferredDate: $preferredDate, preferredTime: $preferredTime) {
    id
    status
    preferredDate
    preferredStartsAt
    durationMinutes
    worker { id name }
    proposedStartsAt
    proposedWorker { id name }
    declineReason
    services { name durationMinutes }
    reschedulePending
    rescheduleDate
    rescheduleStartsAt
  }
}
GQL;
    }

    private function cancelBookingMutation(): string
    {
        return <<<'GQL'
mutation CancelBooking($bookingId: ID!) {
  cancelBooking(bookingId: $bookingId) {
    id
    status
    preferredDate
    preferredStartsAt
    durationMinutes
    worker { id name }
    proposedStartsAt
    proposedWorker { id name }
    declineReason
    services { name durationMinutes }
    reschedulePending
    rescheduleDate
    rescheduleStartsAt
    lateCancel
    lateToCancel
    cancelledAt
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
  }
}
GQL;
    }

    private function pendingBookingsQuery(): string
    {
        return <<<'GQL'
query Pending($salonId: ID!, $date: String!) {
  pendingBookings(salonId: $salonId, date: $date) {
    id
    status
  }
}
GQL;
    }

    private function myBookingsQuery(): string
    {
        return <<<'GQL'
query MyBookings($limit: Int = 20, $offset: Int = 0) {
  myBookings(limit: $limit, offset: $offset) {
    id
    status
    preferredDate
    preferredStartsAt
    durationMinutes
    worker { id name }
    proposedStartsAt
    proposedWorker { id name }
    declineReason
    salon { id name }
    services { name durationMinutes }
    intake { id }
    lateToCancel
    lateCancel
    cancelledAt
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
    phone
    phoneVerified
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

    private function upsertAssistantIntakeMutation(): string
    {
        return <<<'GQL'
mutation UpsertIntake($input: UpsertAssistantIntakeInput!) {
  upsertAssistantIntake(input: $input) {
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

    private function assistantIntakeQuery(): string
    {
        return <<<'GQL'
query Intake($token: String!) {
  assistantIntake(token: $token) {
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

    private function inFlightIntakesQuery(): string
    {
        return <<<'GQL'
query InFlight($salonId: ID!) {
  inFlightIntakes(salonId: $salonId) {
    id
    customerName
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

    private function publicSalonQuery(): string
    {
        return <<<'GQL'
query PublicSalon($id: ID!) {
  salon(id: $id) {
    id
    name
    address
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
    workers {
      id
      name
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
