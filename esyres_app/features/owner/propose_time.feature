Feature: Owner drag-to-counter-propose
  As an owner
  I want to propose a different time on a worker
  So that I can adjust when the preferred time does not fit

  Scenario: Propose holds the slot and leaves the pending queue
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    Then the proposed booking matches:
      """
      {"status": "TIME_PROPOSED", "preferredDate": "2026-08-29", "worker": "Lejla", "proposedWorker": "Lejla"}
      """
    And that booking has owner_responded_at set
    When I query pending bookings for date "2026-08-29"
    Then pending bookings are empty
    When I query occupying bookings for date "2026-08-29"
    Then occupying booking names are:
      """
      ["Ana"]
      """

  Scenario: No preference keeps worker null and sets proposed worker
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    Then the proposed booking matches:
      """
      {"status": "TIME_PROPOSED", "preferredDate": "2026-08-29", "worker": null, "proposedWorker": "Lejla"}
      """

  Scenario: Named worker drop onto another worker keeps original worker
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And the salon has a worker:
      """
      {"name": "Amina"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on worker "Amina"
    Then the proposed booking matches:
      """
      {"status": "TIME_PROPOSED", "preferredDate": "2026-08-29", "worker": "Lejla", "proposedWorker": "Amina"}
      """

  Scenario: Guest cannot propose
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I propose time "14:00" on the salon worker as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot propose
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other salon owner cannot propose
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other Salon"
    When I log in as "other@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing booking is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" for booking id "999"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Already proposed is not requested
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    And I propose time "14:15" on the salon worker
    Then the GraphQL error code is "NOT_REQUESTED"

  Scenario: Bad time is invalid
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "nope" on the salon worker
    Then the GraphQL error code is "INVALID_TIME"
    And that booking has no owner_responded_at

  Scenario: Non 15-minute time is invalid time step
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:07" on the salon worker
    Then the GraphQL error code is "INVALID_TIME_STEP"
    And that booking has no owner_responded_at

  Scenario: Past time is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "09:00" on the salon worker
    Then the GraphQL error code is "PAST_TIME"
    And that booking has no owner_responded_at

  Scenario: Worker from another salon is invalid
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other Salon"
    And the other salon has a worker:
      """
      {"name": "Ena"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the other salon worker
    Then the GraphQL error code is "INVALID_WORKER"

  Scenario: Overlap with confirmed is slot taken
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "14:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ena"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    Then the GraphQL error code is "SLOT_TAKEN"
    And that booking has no owner_responded_at

  Scenario: Overlap with time proposed is slot taken
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "14:00" for "Ana"
    And that booking is for the salon worker
    And that booking is time proposed
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ena"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    Then the GraphQL error code is "SLOT_TAKEN"

  Scenario: Adjacent ranges do not overlap
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "14:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ena"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:30" on the salon worker
    Then the proposed booking matches:
      """
      {"status": "TIME_PROPOSED", "preferredDate": "2026-08-29", "worker": "Lejla", "proposedWorker": "Lejla"}
      """

  Scenario: Different workers at the same time both succeed
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And the salon has a worker:
      """
      {"name": "Amina"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ena"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on worker "Lejla" for "Ana"
    Then the proposed booking matches:
      """
      {"status": "TIME_PROPOSED", "preferredDate": "2026-08-29", "worker": "Lejla", "proposedWorker": "Lejla"}
      """
    When I propose time "14:00" on worker "Amina" for "Ena"
    Then the proposed booking matches:
      """
      {"status": "TIME_PROPOSED", "preferredDate": "2026-08-29", "worker": "Amina", "proposedWorker": "Amina"}
      """

  Scenario: Another requested row does not occupy
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "14:00" for "Ana"
    And that booking is for the salon worker
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ena"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker for "Ena"
    Then the proposed booking matches:
      """
      {"status": "TIME_PROPOSED", "preferredDate": "2026-08-29", "worker": "Lejla", "proposedWorker": "Lejla"}
      """

  Scenario: Closed day is outside hours
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    Then the GraphQL error code is "OUTSIDE_HOURS"
    And that booking has no owner_responded_at

  Scenario: Duration past close is outside hours
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "16:45" on the salon worker
    Then the GraphQL error code is "OUTSIDE_HOURS"

  Scenario: Range into break is outside hours
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00" with break "13:00" to "14:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "12:45" on the salon worker
    Then the GraphQL error code is "OUTSIDE_HOURS"

  Scenario: Accept preferred time still ignores hours
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    Then the accepted booking status is "CONFIRMED"

  Scenario: Occupying omits requested and other dates
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And the salon has a requested booking on "2026-08-30" at "11:00" for "Ena"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings for date "2026-08-29"
    Then occupying bookings are empty
    When I query occupying bookings for date "2026-08-30"
    Then occupying booking names are:
      """
      ["Ena"]
      """

  Scenario: Occupying guest is unauthenticated
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I query occupying bookings as a guest for date "2026-08-29"
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Occupying unverified is email unverified
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings for date "2026-08-29"
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Occupying other owner is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other Salon"
    When I log in as "other@example.com" with password "secret-pass"
    And I query occupying bookings for date "2026-08-29"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Occupying bad date is invalid
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query occupying bookings for date "nope"
    Then the GraphQL error code is "INVALID_DATE"

  Scenario: Public salon has no occupying field
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    Then public salon has no occupying field
