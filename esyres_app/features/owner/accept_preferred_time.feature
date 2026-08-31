Feature: Owner one-tap accept preferred time
  As an owner
  I want to accept a guest's preferred time in one tap
  So that simple requests do not need a back-and-forth

  Scenario: Accept confirms and leaves the pending queue
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
    And that booking has owner_responded_at set
    When I query pending bookings for date "2026-08-29"
    Then pending bookings are empty

  Scenario: No preference cannot be accepted
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    Then the GraphQL error code is "WORKER_REQUIRED"
    And that booking has no owner_responded_at

  Scenario: Already confirmed is not requested
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    And I accept the preferred time
    Then the GraphQL error code is "NOT_REQUESTED"

  Scenario: Guest cannot accept
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I accept the preferred time as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot accept
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot accept
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I accept the preferred time
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing booking is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept preferred time for booking id "999999999"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Overlap with confirmed is slot taken
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ena"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    Then the GraphQL error code is "SLOT_TAKEN"
    And that booking has no owner_responded_at

  Scenario: Overlap with time proposed is slot taken
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is time proposed
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ena"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    Then the GraphQL error code is "SLOT_TAKEN"

  Scenario: Adjacent ranges do not overlap
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And the salon has a requested booking on "2026-08-29" at "11:30" for "Ena"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time for "Ana"
    Then the accepted booking status is "CONFIRMED"
    When I accept the preferred time for "Ena"
    Then the accepted booking status is "CONFIRMED"

  Scenario: Different workers at the same time both succeed
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
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
    And I accept the preferred time for "Ana"
    Then the accepted booking status is "CONFIRMED"
    When I accept the preferred time for "Ena"
    Then the accepted booking status is "CONFIRMED"

  Scenario: Another requested row does not occupy until accepted
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ena"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time for "Ana"
    Then the accepted booking status is "CONFIRMED"
    When I accept the preferred time for "Ena"
    Then the GraphQL error code is "SLOT_TAKEN"
    When I query pending bookings for date "2026-08-29"
    Then pending booking names are:
      """
      ["Ena"]
      """
