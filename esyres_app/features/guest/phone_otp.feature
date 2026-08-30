Feature: Customer phone OTP before send
  As a customer
  I want to verify my phone with OTP before my request is sent
  So that the salon can SMS me if push fails

  Scenario: Guest OTP mutations are unauthenticated
    When I request a phone OTP for "+38761111111" as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"
    When I verify the phone OTP with "123456" as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Request stores canonical E.164 and sends a 6-digit code
    When I register as "ana@example.com" with password "secret-pass"
    And I request a phone OTP for "00 387 61 111 111"
    Then request phone otp succeeds
    And the customer phone is "+38761111111"
    And the customer phone is not verified
    And the last OTP is 6 digits

  Scenario: Junk phone is rejected
    When I register as "ana@example.com" with password "secret-pass"
    And I request a phone OTP for "not-a-phone"
    Then the GraphQL error code is "INVALID_PHONE"

  Scenario: Taken phone is rejected
    When I register as "ana@example.com" with password "secret-pass" and phone "+38761111111"
    And I log out
    And I register as "berta@example.com" with password "secret-pass"
    And I request a phone OTP for "+38761111111"
    Then the GraphQL error code is "PHONE_TAKEN"

  Scenario: Own unverified number can be overwritten after the send window
    When I register as "ana@example.com" with password "secret-pass"
    And I request a phone OTP for "+38761111111"
    Then request phone otp succeeds
    When time advances 61 seconds
    And I request a phone OTP for "+38762222222"
    Then request phone otp succeeds
    And the customer phone is "+38762222222"

  Scenario: Second send within a minute is throttled
    When I register as "ana@example.com" with password "secret-pass"
    And I request a phone OTP for "+38761111111"
    Then request phone otp succeeds
    When I request a phone OTP for "+38761111111"
    Then the GraphQL error code is "TOO_MANY_ATTEMPTS"

  Scenario: Verify last code unlocks createBooking
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
    And a customer "ana@example.com" with password "secret-pass" whose phone is not verified
    When I log in as "ana@example.com" with password "secret-pass"
    And I request a phone OTP for "+38761111111"
    And I verify the last phone OTP
    Then verify phone otp succeeds
    When I query me
    Then me phone is verified
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the booking status is "REQUESTED"

  Scenario: Wrong code is invalid; five failures cooldown
    When I register as "ana@example.com" with password "secret-pass"
    And I request a phone OTP for "+38761111111"
    Then request phone otp succeeds
    When I verify the phone OTP with "000000"
    Then the GraphQL error code is "INVALID_OTP"
    And the customer phone is not verified
    When I verify the phone OTP with a wrong code 4 more times
    Then the GraphQL error code is "INVALID_OTP"
    When I verify the phone OTP with "000000"
    Then the GraphQL error code is "TOO_MANY_ATTEMPTS"

  Scenario: Expired code is invalid
    When I register as "ana@example.com" with password "secret-pass"
    And I request a phone OTP for "+38761111111"
    Then request phone otp succeeds
    When time advances 301 seconds
    And I verify the last phone OTP
    Then the GraphQL error code is "INVALID_OTP"

  Scenario: Already verified phone rejects OTP
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I request a phone OTP for "+38761111111"
    Then the GraphQL error code is "PHONE_ALREADY_VERIFIED"
    When I verify the phone OTP with "123456"
    Then the GraphQL error code is "PHONE_ALREADY_VERIFIED"

  Scenario: OTP works before email verify; send still gates email then phone
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
    And I request a phone OTP for "+38761111111"
    Then request phone otp succeeds
    When I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the GraphQL error code is "EMAIL_UNVERIFIED"
    And I remember the verify-email URL
    When I visit the remembered verify-email URL
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the GraphQL error code is "PHONE_UNVERIFIED"
    When I verify the last phone OTP
    Then verify phone otp succeeds
    When I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the booking status is "REQUESTED"
