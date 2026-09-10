Feature: Customer cancel of a confirmed booking
  As a customer
  I want to cancel a confirmed booking with a late warning, not a block
  So that I understand the impact without being locked out

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

  Scenario: Late cancel frees the slot and stays on My Bookings
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I remember occupancy percent for "2026-08-29"
    And I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then this my booking lateToCancel is true
    When I cancel the booking
    Then cancel booking matches:
      """
      {
        "status": "CANCELLED",
        "preferredDate": "2026-08-29",
        "worker": "Lejla",
        "proposedWorker": null,
        "proposedStartsAt": null,
        "declineReason": null,
        "durationMinutes": 30,
        "reschedulePending": false,
        "rescheduleDate": null,
        "lateCancel": true,
        "lateToCancel": false,
        "cancelledAt": true
      }
      """
    And that booking still has the same owner_responded_at
    And that booking has no reschedule overlay
    When I query my bookings
    Then this my booking status is "CANCELLED"
    And this my booking lateToCancel is false
    And this my booking lateCancel is true
    Then occupancy percent for "2026-08-29" is lower
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings for date "2026-08-29"
    Then occupying bookings do not include this booking
    When I query pending bookings for date "2026-08-29"
    Then pending bookings do not include this booking

  Scenario: On-time cancel is not late
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "14:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then this my booking lateToCancel is false
    When I cancel the booking
    Then cancel booking matches:
      """
      {
        "status": "CANCELLED",
        "preferredDate": "2026-08-31",
        "worker": "Lejla",
        "lateCancel": false,
        "lateToCancel": false,
        "cancelledAt": true
      }
      """

  Scenario: Late snapshot survives notice-hours edit
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    And the salon cancellation notice hours is "1"
    And I query my bookings
    Then this my booking lateCancel is true
    And this my booking lateToCancel is false

  Scenario: Overlay cancel uses original clock and leaves the queue
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And that booking has a reschedule overlay on "2026-08-31" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then this my booking lateToCancel is true
    When I cancel the booking
    Then cancel booking matches:
      """
      {
        "status": "CANCELLED",
        "preferredDate": "2026-08-29",
        "worker": "Lejla",
        "reschedulePending": false,
        "rescheduleDate": null,
        "lateCancel": true
      }
      """
    And that booking has no reschedule overlay
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings for date "2026-08-29"
    Then occupying bookings do not include this booking
    When I query pending bookings for date "2026-08-31"
    Then pending bookings do not include this booking

  Scenario: Past start is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "08:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And that booking has a reschedule overlay on "2026-08-31" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then the GraphQL error code is "PAST_START"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings for date "2026-08-29"
    Then occupying bookings include this booking as "CONFIRMED"
    When I query pending bookings for date "2026-08-31"
    Then pending bookings include this booking as "CONFIRMED"

  Scenario: Guest cannot cancel
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    When I cancel the booking as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified email cannot cancel
    Given an unverified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Unverified phone cannot cancel
    Given a customer "ana@example.com" with password "secret-pass" whose phone is not verified
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then the GraphQL error code is "PHONE_UNVERIFIED"

  Scenario: Another customer cannot cancel
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And another verified customer "berta@example.com" with password "secret-pass"
    When I log in as "berta@example.com" with password "secret-pass"
    And I cancel the booking
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing booking is forbidden
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel booking id "999999"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Requested booking cannot cancel
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then the GraphQL error code is "NOT_CONFIRMED"

  Scenario: Time-proposed booking cannot cancel
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is time proposed at "2026-08-29" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then the GraphQL error code is "NOT_CONFIRMED"

  Scenario: Declined booking cannot cancel
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is declined
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then the GraphQL error code is "NOT_CONFIRMED"

  Scenario: Already cancelled cannot cancel again
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking is cancelled
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then the GraphQL error code is "NOT_CONFIRMED"

  Scenario: Guest still cannot read cancellation notice hours
    When I query salon owner fields as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"
