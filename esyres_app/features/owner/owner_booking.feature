Feature: Owner Request Detail booking
  As an owner
  I want to load one booking by id
  So that Request Detail can accept, decline, or propose without dragging

  Scenario: Requested booking returns queue fields
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I query the owner booking
    Then the owner booking matches:
      """
      {
        "status": "REQUESTED",
        "customerName": "Ana",
        "preferredDate": "2026-08-29",
        "durationMinutes": 30,
        "worker": "Lejla",
        "services": [{"name": "Šišanje", "durationMinutes": 30}]
      }
      """

  Scenario: Confirmed booking is still returned
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "owner@example.com" with password "secret-pass"
    And I query the owner booking
    Then the owner booking matches:
      """
      {
        "status": "CONFIRMED",
        "customerName": "Ana",
        "preferredDate": "2026-08-29",
        "durationMinutes": 30,
        "worker": "Lejla",
        "services": [{"name": "Šišanje", "durationMinutes": 30}]
      }
      """

  Scenario: Guest cannot read owner booking
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I query the owner booking as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot read owner booking
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query the owner booking
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot read owner booking
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I query the owner booking
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing booking is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query owner booking id "999999999"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Other salon booking is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other"
    And the other salon has a requested booking on "2026-08-29" at "09:00" for "Bob"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query the owner booking
    Then the GraphQL error code is "FORBIDDEN"
