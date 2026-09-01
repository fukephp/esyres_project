Feature: Customer My Bookings status list
  As a customer
  I want to see all my requests in one place
  So that I can track their status

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """

  Scenario: Empty list is empty
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then my bookings are empty

  Scenario: Lists all four statuses newest first
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "10:00"
    And the customer has a requested booking on "2026-08-30" at "11:00"
    And that booking is confirmed
    And the customer has a requested booking on "2026-08-31" at "12:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-09-01" at "14:00"
    And the customer has a requested booking on "2026-09-02" at "09:00"
    And that booking is declined with reason "Pun dan"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then my booking statuses are:
      """
      ["DECLINED", "TIME_PROPOSED", "CONFIRMED", "REQUESTED"]
      """

  Scenario: Later status change sorts above a newer id
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "09:00"
    And the customer has a requested booking on "2026-08-30" at "10:00"
    And the customer's first booking is declined
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then my booking preferred dates are:
      """
      ["2026-08-29", "2026-08-30"]
      """

  Scenario: Another customer's booking is omitted
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "10:00"
    And another verified user "berta@example.com" with password "secret-pass"
    And that other user has a requested booking on "2026-08-29" at "09:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then my booking preferred dates are:
      """
      ["2026-08-29"]
      """

  Scenario: Row exposes salon, worker, proposed time, and decline reason
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-30" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then the first my booking matches:
      """
      {
        "status": "TIME_PROPOSED",
        "salon": "Kosa Studio",
        "preferredDate": "2026-08-29",
        "durationMinutes": 30,
        "worker": "Lejla",
        "proposedWorker": "Lejla",
        "proposedStartsAt": true,
        "declineReason": null,
        "services": [{"name": "Šišanje", "durationMinutes": 30}]
      }
      """

  Scenario: Declined row keeps the reason
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is declined with reason "Pun dan"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then the first my booking matches:
      """
      {
        "status": "DECLINED",
        "salon": "Kosa Studio",
        "preferredDate": "2026-08-29",
        "durationMinutes": 30,
        "worker": null,
        "proposedWorker": null,
        "proposedStartsAt": null,
        "declineReason": "Pun dan",
        "services": [{"name": "Šišanje", "durationMinutes": 30}]
      }
      """

  Scenario: Pagination uses limit and offset
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "09:00"
    And the customer has a requested booking on "2026-08-30" at "10:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings limit 1 offset 1
    Then my booking preferred dates are:
      """
      ["2026-08-29"]
      """

  Scenario: Guest cannot list bookings
    When I query my bookings as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified email can still list
    Given an unverified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "10:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then my booking statuses are:
      """
      ["REQUESTED"]
      """

  Scenario: Unverified phone can still list
    Given a customer "ana@example.com" with password "secret-pass" whose phone is not verified
    And the customer has a requested booking on "2026-08-29" at "10:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then my booking statuses are:
      """
      ["REQUESTED"]
      """

  Scenario: Invalid page is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings limit 0 offset 0
    Then the GraphQL error code is "INVALID_PAGE"
