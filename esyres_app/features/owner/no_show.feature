Feature: Owner marks a no-show after start
  As the platform
  I want the owner to stamp a missed confirmed booking
  So that no-show counters exist without a backfill gap

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """

  Scenario: Mark no-show stamps once and still occupies
    And the salon has a requested booking on "2026-08-28" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon trust counters
    Then salon trust counters are cancel "0" late "0" no_show "0"
    When I remember this booking customer verification timestamps
    And I mark the booking as no-show
    Then mark no-show status is "CONFIRMED"
    And mark no-show noShowAt is set
    And that booking has no reschedule overlay
    And this booking customer has cancel_count "0" late_cancel_count "0" no_show_count "1"
    And this booking customer verification timestamps are unchanged
    And that booking still has the same owner_responded_at
    When I query salon trust counters
    Then salon trust counters are cancel "0" late "0" no_show "1"
    When I query occupying bookings for date "2026-08-28"
    Then occupying bookings include this booking as "CONFIRMED"
    When I mark the booking as no-show
    Then mark no-show noShowAt is unchanged
    And this booking customer has cancel_count "0" late_cancel_count "0" no_show_count "1"
    When I query salon trust counters
    Then salon trust counters are cancel "0" late "0" no_show "1"

  Scenario: Overlay is cleared and leaves the overlay-day queue
    And the salon has a requested booking on "2026-08-28" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    And that booking has a reschedule overlay on "2026-08-31" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I mark the booking as no-show
    Then mark no-show status is "CONFIRMED"
    And that booking has no reschedule overlay
    When I query occupying bookings for date "2026-08-28"
    Then occupying bookings include this booking as "CONFIRMED"
    When I query pending bookings for date "2026-08-31"
    Then pending bookings do not include this booking

  Scenario: Before start is rejected
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "owner@example.com" with password "secret-pass"
    And I mark the booking as no-show
    Then the GraphQL error code is "NOT_STARTED"
    And this booking customer has cancel_count "0" late_cancel_count "0" no_show_count "0"
    When I query salon trust counters
    Then salon trust counters are cancel "0" late "0" no_show "0"

  Scenario: Requested is not confirmed
    And the salon has a requested booking on "2026-08-28" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I mark the booking as no-show
    Then the GraphQL error code is "NOT_CONFIRMED"
    And this booking customer has cancel_count "0" late_cancel_count "0" no_show_count "0"

  Scenario: Time-proposed is not confirmed
    And the salon has a requested booking on "2026-08-28" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is time proposed
    When I log in as "owner@example.com" with password "secret-pass"
    And I mark the booking as no-show
    Then the GraphQL error code is "NOT_CONFIRMED"
    And this booking customer has cancel_count "0" late_cancel_count "0" no_show_count "0"

  Scenario: Declined is not confirmed
    And the salon has a requested booking on "2026-08-28" at "11:00" for "Ana"
    And that booking is declined
    When I log in as "owner@example.com" with password "secret-pass"
    And I mark the booking as no-show
    Then the GraphQL error code is "NOT_CONFIRMED"
    And this booking customer has cancel_count "0" late_cancel_count "0" no_show_count "0"

  Scenario: Cancelled is not confirmed
    And the salon has a requested booking on "2026-08-28" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking is cancelled
    When I log in as "owner@example.com" with password "secret-pass"
    And I mark the booking as no-show
    Then the GraphQL error code is "NOT_CONFIRMED"
    And this booking customer has cancel_count "0" late_cancel_count "0" no_show_count "0"

  Scenario: Guest cannot mark no-show
    And the salon has a requested booking on "2026-08-28" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    When I mark the booking as no-show as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot mark no-show
    And the salon has a requested booking on "2026-08-28" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that owner is email unverified
    When I log in as "owner@example.com" with password "secret-pass"
    And I mark the booking as no-show
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Customer cannot mark no-show
    And the salon has a requested booking on "2026-08-28" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I mark the booking as no-show
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Other salon is forbidden
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other"
    And the other salon has a requested booking on "2026-08-28" at "11:00" for "Berta"
    And that booking is confirmed
    When I log in as "owner@example.com" with password "secret-pass"
    And I mark the booking as no-show
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing booking is forbidden
    When I log in as "owner@example.com" with password "secret-pass"
    And I mark no-show for booking id "999999"
    Then the GraphQL error code is "FORBIDDEN"
