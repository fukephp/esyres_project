Feature: Customer reschedule of a confirmed booking
  As a customer
  I want to ask for a new day and time on a confirmed booking
  So that I keep my original slot until the salon accepts

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

  Scenario: Ask keeps confirmed occupancy and lands on the new queue day
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I query salon busy level "2026-08-29" as a guest
    Then busy level is "LOW"
    When I query salon busy level "2026-08-31" as a guest
    Then busy level is "LOW"
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "14:00"
    Then request reschedule matches:
      """
      {
        "status": "CONFIRMED",
        "preferredDate": "2026-08-29",
        "worker": "Lejla",
        "proposedWorker": null,
        "proposedStartsAt": null,
        "declineReason": null,
        "durationMinutes": 30,
        "reschedulePending": true,
        "rescheduleDate": "2026-08-31"
      }
      """
    And that booking still has the same owner_responded_at
    When I query salon busy level "2026-08-29" as a guest
    Then busy level is "LOW"
    When I query salon busy level "2026-08-31" as a guest
    Then busy level is "LOW"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings for date "2026-08-29"
    Then occupying bookings include this booking as "CONFIRMED"
    When I query occupying bookings for date "2026-08-31"
    Then occupying bookings do not include this booking
    When I query pending bookings for date "2026-08-31"
    Then pending bookings include this booking as "CONFIRMED"
    When I query pending bookings for date "2026-08-29"
    Then pending bookings do not include this booking

  Scenario: Second ask replaces the overlay
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "14:00"
    And I request reschedule "2026-08-31" at "16:00"
    Then request reschedule matches:
      """
      {
        "status": "CONFIRMED",
        "preferredDate": "2026-08-29",
        "worker": "Lejla",
        "proposedWorker": null,
        "reschedulePending": true,
        "rescheduleDate": "2026-08-31",
        "rescheduleStartsAt": "2026-08-31T14:00:00+00:00"
      }
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings for date "2026-08-29"
    Then occupying bookings include this booking as "CONFIRMED"
    When I query pending bookings for date "2026-08-31"
    Then pending bookings include this booking as "CONFIRMED"

  Scenario: Cap zero disables reschedule
    Given the salon reschedule cap is "0"
    And a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "14:00"
    Then the GraphQL error code is "RESCHEDULE_DISABLED"
    And that booking has no reschedule overlay

  Scenario: Same original clock is allowed
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-29" at "11:00"
    Then request reschedule matches:
      """
      {
        "status": "CONFIRMED",
        "preferredDate": "2026-08-29",
        "worker": "Lejla",
        "reschedulePending": true,
        "rescheduleDate": "2026-08-29"
      }
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-29"
    Then pending bookings include this booking as "CONFIRMED"
    When I query occupying bookings for date "2026-08-29"
    Then occupying bookings include this booking as "CONFIRMED"

  Scenario: Guest cannot request reschedule
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I request reschedule "2026-08-31" at "14:00" as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified email cannot request reschedule
    Given an unverified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "14:00"
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Unverified phone cannot request reschedule
    Given a customer "ana@example.com" with password "secret-pass" whose phone is not verified
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "14:00"
    Then the GraphQL error code is "PHONE_UNVERIFIED"

  Scenario: Another customer cannot request reschedule
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And another verified customer "berta@example.com" with password "secret-pass"
    When I log in as "berta@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "14:00"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing booking is forbidden
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "14:00" for booking id "999999"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Requested booking cannot reschedule
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "14:00"
    Then the GraphQL error code is "NOT_CONFIRMED"
    And that booking has no reschedule overlay

  Scenario: Time-proposed booking cannot reschedule
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "10:00"
    Then the GraphQL error code is "NOT_CONFIRMED"
    And that booking has no reschedule overlay

  Scenario: Declined booking cannot reschedule
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is declined
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "14:00"
    Then the GraphQL error code is "NOT_CONFIRMED"

  Scenario: Closed weekday leaves overlay unchanged
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-30" at "10:00"
    Then the GraphQL error code is "SALON_CLOSED"
    And that booking has no reschedule overlay

  Scenario: Past time is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-28" at "10:00"
    Then the GraphQL error code is "PAST_TIME"
    And that booking has no reschedule overlay

  Scenario: Bad date is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "nope" at "14:00"
    Then the GraphQL error code is "INVALID_DATE"
    And that booking has no reschedule overlay

  Scenario: Bad time is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "nope"
    Then the GraphQL error code is "INVALID_TIME"
    And that booking has no reschedule overlay
