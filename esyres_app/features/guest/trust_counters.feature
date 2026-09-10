Feature: Trust cancel counters and capture gates
  As the platform
  I want cancel events to increment salon and customer counters
  So that later stats are not a backfill

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has hours:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00"},
        {"weekday": "TUESDAY", "closed": true},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00"},
        {"weekday": "SATURDAY", "closed": false, "opensAt": "09:00", "closesAt": "17:00"},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """

  Scenario: On-time cancel increments cancel_count only
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "14:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I remember this booking customer verification timestamps
    And I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then this booking customer has cancel_count "1" late_cancel_count "0" no_show_count "0"
    And this booking customer verification timestamps are unchanged
    And that booking still has the same owner_responded_at
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon trust counters
    Then salon trust counters are cancel "1" late "0" no_show "0"

  Scenario: Late cancel increments late_cancel_count too
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then this booking customer has cancel_count "1" late_cancel_count "1" no_show_count "0"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon trust counters
    Then salon trust counters are cancel "1" late "1" no_show "0"

  Scenario: Other salon counters stay zero
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "14:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And the same owner also owns salon "Drugi"
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then this booking customer has cancel_count "1" late_cancel_count "0" no_show_count "0"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon trust counters for salon "Kosa Studio"
    Then salon trust counters are cancel "1" late "0" no_show "0"
    When I query salon trust counters for salon "Drugi"
    Then salon trust counters are cancel "0" late "0" no_show "0"

  Scenario: Past start cancel does not increment
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "08:00"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then the GraphQL error code is "PAST_START"
    And this booking customer has cancel_count "0" late_cancel_count "0" no_show_count "0"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon trust counters
    Then salon trust counters are cancel "0" late "0" no_show "0"

  Scenario: Not confirmed cancel does not increment
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then the GraphQL error code is "NOT_CONFIRMED"
    And this booking customer has cancel_count "0" late_cancel_count "0" no_show_count "0"

  Scenario: Guest cannot read salon trust counters
    When I query salon trust counters as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Non-owner cannot read salon trust counters
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query salon trust counters
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: me has no trust counter fields
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I query me with trust counters
    Then the GraphQL errors mention "noShowCount"
