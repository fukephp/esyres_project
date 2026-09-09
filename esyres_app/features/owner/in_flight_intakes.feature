Feature: Owner in-flight assistant intakes
  As an owner
  I want in-flight chats listed with a count
  So I can see conversations that are not requests yet

  Scenario: Empty salon has an empty list and zero count
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query in-flight intakes
    Then in-flight customer names are:
      """
      []
      """
    When I query in-flight intake count
    Then in-flight intake count is 0

  Scenario: List is newest first and count is the total
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has an in-flight intake
    And the salon has an in-flight intake
    When I log in as "owner@example.com" with password "secret-pass"
    And I query in-flight intakes
    Then in-flight customer names are:
      """
      ["Gost", "Gost"]
      """
    When I query in-flight intake count
    Then in-flight intake count is 2

  Scenario: Pagination uses limit and offset while count stays total
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has an in-flight intake
    And the salon has an in-flight intake
    When I log in as "owner@example.com" with password "secret-pass"
    And I query in-flight intakes limit 1 offset 1
    Then in-flight customer names are:
      """
      ["Gost"]
      """
    When I query in-flight intake count
    Then in-flight intake count is 2

  Scenario: Other salon intakes are omitted
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has an in-flight intake
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other"
    And the other salon has an in-flight intake
    When I log in as "owner@example.com" with password "secret-pass"
    And I query in-flight intakes
    Then in-flight customer names are:
      """
      ["Gost"]
      """
    When I query in-flight intake count
    Then in-flight intake count is 1

  Scenario: Converted intake is omitted
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has an in-flight intake
    And that intake is converted
    When I log in as "owner@example.com" with password "secret-pass"
    And I query in-flight intakes
    Then in-flight customer names are:
      """
      []
      """
    When I query in-flight intake count
    Then in-flight intake count is 0

  Scenario: Stale intake is omitted
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has an in-flight intake
    And that intake is stale
    When I log in as "owner@example.com" with password "secret-pass"
    And I query in-flight intakes
    Then in-flight customer names are:
      """
      []
      """
    When I query in-flight intake count
    Then in-flight intake count is 0

  Scenario: Guest cannot read the list
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I query in-flight intakes as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot read the list
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query in-flight intakes
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot read the list
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I query in-flight intakes
    Then the GraphQL error code is "FORBIDDEN"
