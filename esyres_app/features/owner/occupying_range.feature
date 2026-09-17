Feature: Occupying bookings range
  As an owner
  I want occupying bookings for a month span
  So that Zahtjevi month dots can load without one query per day

  Scenario: Range includes occupying days and omits requested
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And the salon has a requested booking on "2026-08-30" at "11:00" for "Ena"
    And that booking is for the salon worker
    And that booking is confirmed
    And the salon has a requested booking on "2026-08-31" at "11:00" for "Mia"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings range from "2026-08-01" to "2026-08-31"
    Then occupying range booking names are:
      """
      ["Ana", "Ena"]
      """
    When I query occupying bookings for date "2026-08-29"
    Then occupying booking names are:
      """
      ["Ana"]
      """

  Scenario: Range from after to is invalid
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings range from "2026-08-31" to "2026-08-01"
    Then the GraphQL error code is "INVALID_DATE"

  Scenario: Range bad from is invalid
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings range from "nope" to "2026-08-31"
    Then the GraphQL error code is "INVALID_DATE"

  Scenario: Range guest is unauthenticated
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I query occupying bookings range as a guest from "2026-08-01" to "2026-08-31"
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Range unverified is email unverified
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings range from "2026-08-01" to "2026-08-31"
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Range other owner is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other Salon"
    When I log in as "other@example.com" with password "secret-pass"
    And I query occupying bookings range from "2026-08-01" to "2026-08-31"
    Then the GraphQL error code is "FORBIDDEN"
