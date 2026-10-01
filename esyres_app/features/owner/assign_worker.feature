Feature: Owner assigns a free worker
  As an owner
  I want to confirm a no-preference request by tapping a free worker
  So that the guest is not asked again

  Scenario: Assign confirms at the preferred time
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I assign the salon worker
    Then the assigned booking status is "CONFIRMED"
    And the assigned worker is "Lejla"
    And that booking has owner_responded_at set
    When I remember owner_responded_at
    And I assign the salon worker
    Then the GraphQL error code is "NOT_REQUESTED"
    And that booking's owner_responded_at is unchanged
    When I query pending bookings for date "2026-08-29"
    Then pending bookings are empty

  Scenario: A named worker is not assigned
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I assign the salon worker
    Then the GraphQL error code is "WORKER_NAMED"
    And that booking has no owner_responded_at

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
    When I log in as "owner@example.com" with password "secret-pass"
    And I assign the salon worker
    Then the GraphQL error code is "SLOT_TAKEN"
    And that booking has no owner_responded_at

  Scenario: A different free worker can be assigned
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And the salon has a worker:
      """
      {"name": "Amina"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ena"
    When I log in as "owner@example.com" with password "secret-pass"
    And I assign worker "Amina" for "Ena"
    Then the assigned booking status is "CONFIRMED"
    And the assigned worker is "Amina"

  Scenario: Guest cannot assign
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I fetch the CSRF cookie
    And I assign the salon worker
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot assign
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I assign the salon worker
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Another owner cannot assign
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I assign the salon worker
    Then the GraphQL error code is "FORBIDDEN"
