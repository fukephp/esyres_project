Feature: Owner Prikaz
  As an owner
  I want to choose Kalendar or Kanban for Zahtjevi and Zapisi
  So that the panel follows me on every device

  Scenario: Guest cannot set a Prikaz
    When I fetch the CSRF cookie
    And I set my owner view to "KANBAN"
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Default Prikaz is Kalendar
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query my owner view
    Then my owner view is "CALENDAR"

  Scenario: Kanban is stored on the account and survives a new login
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I set my owner view to "KANBAN"
    Then my owner view is "KANBAN"
    And the stored owner view of "owner@example.com" is "kanban"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query my owner view
    Then my owner view is "KANBAN"

  Scenario: Kalendar can be chosen again
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I set my owner view to "KANBAN"
    And I set my owner view to "CALENDAR"
    Then my owner view is "CALENDAR"
    And the stored owner view of "owner@example.com" is "calendar"

  Scenario: Unknown Prikaz is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I set my owner view to "LIST"
    Then the GraphQL errors mention "OwnerView"
    And the stored owner view of "owner@example.com" is "calendar"
