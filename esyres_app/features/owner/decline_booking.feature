Feature: Owner decline a request
  As an owner
  I want to decline a request with an optional reason
  So that the customer understands why without a counter-proposal

  Scenario: Decline confirms declined and leaves the pending queue
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking
    Then the declined booking status is "DECLINED"
    And the declined booking has no reason
    And that booking has owner_responded_at set
    When I query pending bookings for date "2026-08-29"
    Then pending bookings are empty
    When I query occupying bookings for date "2026-08-29"
    Then occupying bookings are empty

  Scenario: No preference can be declined
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking with reason "Nema termina"
    Then the declined booking status is "DECLINED"
    And the declined booking reason is "Nema termina"
    And that booking has owner_responded_at set
    When I query pending bookings for date "2026-08-29"
    Then pending bookings are empty

  Scenario: Blank and whitespace reason become null
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking with reason "   "
    Then the declined booking status is "DECLINED"
    And the declined booking has no reason

  Scenario: Reason is trimmed
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking with reason "  Zatvoreno  "
    Then the declined booking reason is "Zatvoreno"

  Scenario: 255 character reason is accepted
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking with a reason of 255 characters
    Then the declined booking status is "DECLINED"

  Scenario: 256 character reason is too long
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking with a reason of 256 characters
    Then the GraphQL error code is "REASON_TOO_LONG"
    And that booking has no owner_responded_at

  Scenario: Already declined is not requested
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking
    And I decline the booking
    Then the GraphQL error code is "NOT_REQUESTED"

  Scenario: Confirmed cannot be declined
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking
    Then the GraphQL error code is "NOT_REQUESTED"
    And that booking has no owner_responded_at

  Scenario: Time proposed cannot be declined
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is time proposed
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking
    Then the GraphQL error code is "NOT_REQUESTED"

  Scenario: Guest cannot decline
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I decline the booking as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot decline
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot decline
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I decline the booking
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing booking is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline booking id "999999999"
    Then the GraphQL error code is "FORBIDDEN"
