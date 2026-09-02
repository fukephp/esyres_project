Feature: Owner pending queue for a day
  As an owner
  I want to see all pending requests for a day in one queue
  So that urgent ones are not buried

  Scenario: Empty day is an empty list
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29"
    Then pending bookings are empty

  Scenario: Queue is requested rows for that day soonest first
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "16:00" for "Ena"
    And the salon has a requested booking on "2026-08-29" at "09:00" for "Ana"
    And the salon has a requested booking on "2026-08-30" at "10:00" for "Mia"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29"
    Then pending booking names are:
      """
      ["Ana", "Ena"]
      """

  Scenario: Same preferred time keeps older request first
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "14:00" for "Ana"
    And the salon has a requested booking on "2026-08-29" at "14:00" for "Ena"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29"
    Then pending booking names are:
      """
      ["Ana", "Ena"]
      """

  Scenario: Other salon bookings are omitted
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "10:00" for "Ana"
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other"
    And the other salon has a requested booking on "2026-08-29" at "09:00" for "Bob"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29"
    Then pending booking names are:
      """
      ["Ana"]
      """

  Scenario: Row exposes name, worker, time, duration, and services
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29"
    Then the first pending booking matches:
      """
      {
        "customerName": "Ana",
        "preferredDate": "2026-08-29",
        "durationMinutes": 30,
        "worker": "Lejla",
        "services": [{"name": "Šišanje", "durationMinutes": 30}]
      }
      """

  Scenario: No preference worker is null
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29"
    Then the first pending booking matches:
      """
      {
        "customerName": "Ana",
        "preferredDate": "2026-08-29",
        "durationMinutes": 30,
        "worker": null,
        "services": [{"name": "Šišanje", "durationMinutes": 30}]
      }
      """

  Scenario: Pagination uses limit and offset
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "09:00" for "Ana"
    And the salon has a requested booking on "2026-08-29" at "10:00" for "Ena"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29" limit 1 offset 1
    Then pending booking names are:
      """
      ["Ena"]
      """

  Scenario: me.salons is owned salons in id order
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Alpha"
    And that owner also owns salon "Beta"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query my salons
    Then my salons match:
      """
      [{"name": "Alpha"}, {"name": "Beta"}]
      """

  Scenario: Guest cannot read the queue
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I query pending bookings as a guest for date "2026-08-29"
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot read the queue
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29"
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Local env lets an unverified owner read the queue
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the app environment is local
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29"
    Then pending bookings are empty

  Scenario: Other user cannot read the queue
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Invalid date is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "nope"
    Then the GraphQL error code is "INVALID_DATE"

  Scenario: Invalid page is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29" limit 0 offset 0
    Then the GraphQL error code is "INVALID_PAGE"
