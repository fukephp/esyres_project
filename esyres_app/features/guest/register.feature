Feature: Customer email and password account
  As a customer
  I want to create an account with email and password without a homepage login wall
  So that I can browse first and sign in when I request or open My Bookings

  Scenario: Guest me is null
    When I query me as a guest
    Then me is null

  Scenario: Register creates an unverified session
    When I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    When I query me
    Then me email is "ana@example.com"
    And me email is not verified
    And the customer has no phone
    And the customer name is "ana"
    And a verify-email notification was sent
    And the customer email is not verified in the database

  Scenario: Register stores optional phone unverified
    When I register as "ana@example.com" with password "secret-pass" and phone "+38761111111"
    Then register succeeds for "ana@example.com"
    And the customer phone is "+38761111111"
    And the customer phone is not verified

  Scenario: Invalid phone on register is rejected
    When I register as "ana@example.com" with password "secret-pass" and phone "not-a-phone"
    Then the GraphQL error code is "INVALID_PHONE"

  Scenario: Duplicate email is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I register as "ana@example.com" with password "secret-pass"
    Then the GraphQL error code is "EMAIL_TAKEN"

  Scenario: Duplicate phone is rejected
    When I register as "ana@example.com" with password "secret-pass" and phone "+38761111111"
    And I log out
    And I register as "berta@example.com" with password "secret-pass" and phone "+38761111111"
    Then the GraphQL error code is "PHONE_TAKEN"

  Scenario: Weak password is rejected
    When I register as "ana@example.com" with password "short"
    Then the GraphQL error code is "WEAK_PASSWORD"

  Scenario: Invalid email is rejected
    When I register as "not-an-email" with password "secret-pass"
    Then the GraphQL error code is "INVALID_EMAIL"

  Scenario: Logout clears the session
    When I register as "ana@example.com" with password "secret-pass"
    And I log out
    And I query me
    Then me is null

  Scenario: Login still works after register
    When I register as "ana@example.com" with password "secret-pass"
    And I log out
    And I log in as "ana@example.com" with password "secret-pass"
    And I query me
    Then me email is "ana@example.com"
    And me email is not verified

  Scenario: Register then createBooking is email unverified
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
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the GraphQL error code is "EMAIL_UNVERIFIED"
