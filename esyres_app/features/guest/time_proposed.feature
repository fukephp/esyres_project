Feature: Customer respond to a counter-proposal
  As a customer
  I want to approve, reject, or ask for a different day or time
  So that I stay in control of the final appointment

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has hours:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00"},
        {"weekday": "TUESDAY", "closed": true},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": true},
        {"weekday": "SATURDAY", "closed": false, "opensAt": "09:00", "closesAt": "17:00"},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """

  Scenario: Confirm materializes the proposed clock
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-31" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I confirm the proposed time
    Then confirm proposed time matches:
      """
      {
        "status": "CONFIRMED",
        "preferredDate": "2026-08-31",
        "worker": "Lejla",
        "proposedWorker": null,
        "proposedStartsAt": null,
        "declineReason": null
      }
      """
    And that booking still has the same owner_responded_at
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings for date "2026-08-31"
    Then occupying bookings include this booking as "CONFIRMED"
    When I query occupying bookings for date "2026-08-29"
    Then occupying bookings do not include this booking
    When I query pending bookings for date "2026-08-29"
    Then pending bookings do not include this booking

  Scenario: Reject declines with no reason and releases the slot
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I reject the proposed time
    Then reject proposed time matches:
      """
      {
        "status": "DECLINED",
        "preferredDate": "2026-08-29",
        "worker": "Lejla",
        "proposedWorker": null,
        "proposedStartsAt": null,
        "declineReason": null
      }
      """
    And that booking still has the same owner_responded_at
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings for date "2026-08-29"
    Then occupying bookings do not include this booking
    When I query pending bookings for date "2026-08-29"
    Then pending bookings do not include this booking

  Scenario: Ask other time reopens the same row
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I ask other time "2026-08-31" at "10:00"
    Then ask other time matches:
      """
      {
        "status": "REQUESTED",
        "preferredDate": "2026-08-31",
        "worker": null,
        "proposedWorker": null,
        "proposedStartsAt": null,
        "declineReason": null,
        "durationMinutes": 30,
        "services": [{"name": "Šišanje", "durationMinutes": 30}]
      }
      """
    And that booking still has the same owner_responded_at
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings for date "2026-08-29"
    Then occupying bookings do not include this booking
    When I query pending bookings for date "2026-08-31"
    Then pending bookings include this booking as "REQUESTED"
    When I query pending bookings for date "2026-08-29"
    Then pending bookings do not include this booking

  Scenario: Ask other time may repeat the old preferred clock
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I ask other time "2026-08-29" at "11:00"
    Then ask other time matches:
      """
      {
        "status": "REQUESTED",
        "preferredDate": "2026-08-29",
        "worker": "Lejla",
        "proposedWorker": null,
        "proposedStartsAt": null,
        "declineReason": null
      }
      """

  Scenario: Guest cannot confirm
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I confirm the proposed time as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified email cannot confirm
    Given an unverified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I confirm the proposed time
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Unverified phone cannot reject
    Given a customer "ana@example.com" with password "secret-pass" whose phone is not verified
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I reject the proposed time
    Then the GraphQL error code is "PHONE_UNVERIFIED"

  Scenario: Another customer cannot confirm
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is time proposed at "2026-08-29" at "14:00"
    And another verified customer "berta@example.com" with password "secret-pass"
    When I log in as "berta@example.com" with password "secret-pass"
    And I confirm the proposed time
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing booking is forbidden
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I confirm proposed time for booking id "999999"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Requested booking cannot be confirmed
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I confirm the proposed time
    Then the GraphQL error code is "NOT_TIME_PROPOSED"

  Scenario: Confirmed booking cannot be rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is confirmed
    When I log in as "ana@example.com" with password "secret-pass"
    And I reject the proposed time
    Then the GraphQL error code is "NOT_TIME_PROPOSED"

  Scenario: Declined booking cannot ask other time
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is declined
    When I log in as "ana@example.com" with password "secret-pass"
    And I ask other time "2026-08-31" at "10:00"
    Then the GraphQL error code is "NOT_TIME_PROPOSED"

  Scenario: Ask other time rejects a closed weekday and stays time proposed
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I ask other time "2026-08-30" at "10:00"
    Then the GraphQL error code is "SALON_CLOSED"
    When I query my bookings
    Then my booking statuses are:
      """
      ["TIME_PROPOSED"]
      """

  Scenario: Ask other time rejects a past time
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I ask other time "2026-08-28" at "10:00"
    Then the GraphQL error code is "PAST_TIME"

  Scenario: Ask other time rejects a bad date
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I ask other time "nope" at "10:00"
    Then the GraphQL error code is "INVALID_DATE"

  Scenario: Ask other time rejects a bad time
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I ask other time "2026-08-31" at "25:00"
    Then the GraphQL error code is "INVALID_TIME"
