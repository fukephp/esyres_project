Feature: Owner salon stats
  As an owner
  I want bookings per week, busy percent, and cancellation rate
  So I can see how this salon is running

  Scenario: Empty salon has a seven-day window of zeros
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon stats
    Then salon stats window is "2026-08-23" to "2026-08-29"
    And salon stats day weekdays are:
      """
      ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]
      """
    And salon stats bookings count is 0
    And salon stats cancellation rate is 0 and late cancels is 0
    And salon stats hours are:
      """
      []
      """
    And salon stats day "2026-08-29" bookings count is 0 and busy percent is 0

  Scenario: Count is confirmed and cancelled in the window only
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is confirmed
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Berta"
    And that booking is confirmed
    And the salon has a requested booking on "2026-08-29" at "14:00" for "Cira"
    And that booking is cancelled
    And that booking late cancel is true
    And the salon has a requested booking on "2026-08-29" at "10:00" for "Dina"
    And the salon has a requested booking on "2026-08-28" at "10:00" for "Ena"
    And that booking is time proposed
    And the salon has a requested booking on "2026-08-27" at "10:00" for "Fata"
    And that booking is declined
    And the salon has a requested booking on "2026-08-22" at "11:00" for "Gita"
    And that booking is confirmed
    And the salon has a requested booking on "2026-08-30" at "11:00" for "Hana"
    And that booking is confirmed
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other"
    And the other salon has a requested booking on "2026-08-29" at "11:00" for "Iva"
    And that booking is confirmed
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon stats
    Then salon stats bookings count is 3
    And salon stats cancellation rate is 33 and late cancels is 1
    And salon stats day "2026-08-29" bookings count is 3 and busy percent is 0
    And salon stats hours are:
      """
      [{"hour":11,"bookingsCount":2},{"hour":14,"bookingsCount":1}]
      """

  Scenario: Requested minutes raise busy percent without counting as a booking
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open Saturday from "09:00" to "17:00"
    And the salon has a requested booking on "2026-08-29" at "10:00" for "Ana"
    And that booking lasts 120 minutes
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon stats
    Then salon stats bookings count is 0
    And salon stats day "2026-08-29" bookings count is 0 and busy percent is 25

  Scenario: Guest cannot read stats
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I query salon stats as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot read stats
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon stats
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot read stats
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I query salon stats
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Owner cannot read another salon
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon stats for the other salon
    Then the GraphQL error code is "FORBIDDEN"
