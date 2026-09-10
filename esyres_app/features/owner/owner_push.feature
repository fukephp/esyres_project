Feature: Owner mutations do not web-push
  As an owner
  I want push only for guest events
  So that my own taps do not notify me

  Scenario: Accept does not push
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to push
    And I accept the preferred time
    Then no owner push was sent

  Scenario: Propose does not push
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to push
    And I propose time "14:00" on the salon worker
    Then no owner push was sent

  Scenario: Decline does not push
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to push
    And I decline the booking
    Then no owner push was sent
