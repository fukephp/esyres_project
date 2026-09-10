Feature: Owner accept and dismiss reschedule
  As an owner
  I want to accept or dismiss a reschedule overlay
  So that the original confirmed slot is either moved or kept

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

  Scenario: Accept moves the confirmed clock
    Given the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And that booking has a reschedule overlay on "2026-08-31" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the reschedule
    Then accept reschedule matches:
      """
      {
        "status": "CONFIRMED",
        "preferredDate": "2026-08-31",
        "worker": "Lejla",
        "reschedulePending": false,
        "rescheduleDate": null
      }
      """
    And that booking still has the same owner_responded_at
    And that booking has no reschedule overlay
    When I query occupying bookings for date "2026-08-31"
    Then occupying bookings include this booking as "CONFIRMED"
    When I query occupying bookings for date "2026-08-29"
    Then occupying bookings do not include this booking
    When I query pending bookings for date "2026-08-31"
    Then pending bookings do not include this booking

  Scenario: Accept overlapping another occupying booking is slot taken
    Given the salon has a requested booking on "2026-08-31" at "14:00" for "Ena"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And that booking has a reschedule overlay on "2026-08-31" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the reschedule
    Then the GraphQL error code is "SLOT_TAKEN"
    When I query occupying bookings for date "2026-08-29"
    Then occupying bookings include this booking as "CONFIRMED"
    When I query pending bookings for date "2026-08-31"
    Then pending bookings include this booking as "CONFIRMED"

  Scenario: Accept overlapping own original range succeeds
    Given the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And that booking has a reschedule overlay on "2026-08-29" at "11:15"
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the reschedule
    Then accept reschedule matches:
      """
      {
        "status": "CONFIRMED",
        "preferredDate": "2026-08-29",
        "worker": "Lejla",
        "reschedulePending": false,
        "rescheduleDate": null
      }
      """
    When I query occupying bookings for date "2026-08-29"
    Then occupying bookings include this booking as "CONFIRMED"

  Scenario: Dismiss clears overlay and keeps original
    Given the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And that booking has a reschedule overlay on "2026-08-31" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I dismiss the reschedule
    Then dismiss reschedule matches:
      """
      {
        "status": "CONFIRMED",
        "preferredDate": "2026-08-29",
        "worker": "Lejla",
        "reschedulePending": false,
        "rescheduleDate": null
      }
      """
    And that booking has no reschedule overlay
    When I query occupying bookings for date "2026-08-29"
    Then occupying bookings include this booking as "CONFIRMED"
    When I query pending bookings for date "2026-08-31"
    Then pending bookings do not include this booking

  Scenario: Accept without overlay is not reschedule
    Given the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the reschedule
    Then the GraphQL error code is "NOT_RESCHEDULE"

  Scenario: Dismiss on requested is not reschedule
    Given the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I dismiss the reschedule
    Then the GraphQL error code is "NOT_RESCHEDULE"

  Scenario: Guest cannot accept reschedule
    Given the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And that booking has a reschedule overlay on "2026-08-31" at "14:00"
    When I accept the reschedule as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot dismiss
    Given that owner is email unverified
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And that booking has a reschedule overlay on "2026-08-31" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I dismiss the reschedule
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other salon cannot accept
    Given the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And that booking has a reschedule overlay on "2026-08-31" at "14:00"
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other"
    When I log in as "other@example.com" with password "secret-pass"
    And I accept the reschedule
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing booking is forbidden
    Given the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept reschedule for booking id "999999"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Owner request actions on overlay stay not-requested
    Given the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And that booking has a reschedule overlay on "2026-08-31" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    Then the GraphQL error code is "NOT_REQUESTED"
    When I propose time "14:00" on worker "Lejla"
    Then the GraphQL error code is "NOT_REQUESTED"
    When I decline the booking
    Then the GraphQL error code is "NOT_REQUESTED"
    When I query pending bookings for date "2026-08-31"
    Then pending bookings include this booking as "CONFIRMED"

  Scenario: Verified owner can subscribe to reschedule
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking rescheduled
    Then the subscription channel is present

  Scenario: Guest cannot subscribe to reschedule
    When I subscribe to booking rescheduled as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot subscribe to reschedule
    Given that owner is email unverified
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking rescheduled
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Customer who does not own the salon cannot subscribe to reschedule
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I subscribe to booking rescheduled
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Other salon is forbidden for reschedule subscribe
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other"
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking rescheduled for the other salon
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing salon is forbidden for reschedule subscribe
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking rescheduled for salon id "999999"
    Then the GraphQL error code is "FORBIDDEN"
