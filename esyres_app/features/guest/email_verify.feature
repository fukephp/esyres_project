Feature: Customer email verification
  As a customer
  I want to verify my email before my request is sent
  So that the salon can reach me with reminders

  Scenario: Signed verify GET without a session sets email_verified_at and does not log in
    When I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    And I remember the verify-email URL
    And I log out
    When I visit the remembered verify-email URL
    Then I am redirected to bookings verified
    And the customer email is verified in the database
    When I query me as a guest
    Then me is null

  Scenario: Signed verify GET with the same session verifies and keeps the session
    When I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    And I remember the verify-email URL
    When I visit the remembered verify-email URL
    Then I am redirected to bookings verified
    When I query me
    Then me email is "ana@example.com"
    And me has a verified email

  Scenario: Already-verified signed GET is the same success path
    When I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    And I remember the verify-email URL
    When I visit the remembered verify-email URL
    And I visit the remembered verify-email URL
    Then I am redirected to bookings verified
    And the customer email is verified in the database

  Scenario: After verify, createBooking is phone-gated until phone is verified
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has hours:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00"},
        {"weekday": "TUESDAY", "closed": true},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": true},
        {"weekday": "SATURDAY", "closed": true},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    When I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    And I remember the verify-email URL
    When I visit the remembered verify-email URL
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the GraphQL error code is "PHONE_UNVERIFIED"
    When the customer's phone is marked verified
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the booking status is "REQUESTED"

  Scenario: Tampered signature redirects to invalid
    When I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    And I remember the verify-email URL
    When I visit a tampered verify-email URL
    Then I am redirected to bookings verify invalid
    And the customer email is not verified in the database

  Scenario: Expired signature redirects to invalid
    When I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    When I visit an expired verify-email URL
    Then I am redirected to bookings verify invalid
    And the customer email is not verified in the database

  Scenario: Signed URL for another user while logged in redirects to mismatch
    When I register as "berta@example.com" with password "secret-pass"
    Then register succeeds for "berta@example.com"
    And I remember the verify-email URL
    And I log out
    And I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    When I visit the remembered verify-email URL
    Then I am redirected to bookings verify mismatch
    And the remembered customer email is not verified

  Scenario: Resend dispatches verify-email again
    When I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    When I resend the verification email
    Then resend succeeds
    And a verify-email notification was sent twice

  Scenario: Guest resend is unauthenticated
    When I resend the verification email as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Resend when already verified is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I resend the verification email
    Then the GraphQL error code is "EMAIL_ALREADY_VERIFIED"

  Scenario: Resend is throttled
    When I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    When I resend the verification email
    Then resend succeeds
    When I resend the verification email
    Then the GraphQL error code is "TOO_MANY_ATTEMPTS"
