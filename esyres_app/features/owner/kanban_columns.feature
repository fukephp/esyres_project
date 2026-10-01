Feature: Kanban column flags
  As an owner
  I want U toku and Završeno i otkazano to follow my account
  So that both boards hide the same columns on every device

  Scenario: Guest cannot set the columns
    When I fetch the CSRF cookie
    And I set kanban columns in progress "false" and finished "false"
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Both columns start visible
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query my kanban columns
    Then my kanban columns are in progress "true" and finished "true"

  Scenario: Hidden columns stay on the account
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I set kanban columns in progress "false" and finished "false"
    Then my kanban columns are in progress "false" and finished "false"
    And the stored kanban columns of "owner@example.com" are in progress "false" and finished "false"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query my kanban columns
    Then my kanban columns are in progress "false" and finished "false"

  Scenario: A signed-in customer may set the columns
    Given another verified user "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I set kanban columns in progress "false" and finished "true"
    Then my kanban columns are in progress "false" and finished "true"
    And the stored kanban columns of "ana@example.com" are in progress "false" and finished "true"
