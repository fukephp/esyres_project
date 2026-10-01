Feature: Chat switch
  As an owner
  I want Chat off until I turn it on
  So that the menu hides a tab I am not using

  Scenario: Guest cannot set Chat
    When I fetch the CSRF cookie
    And I set chat enabled to "true"
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Chat starts off
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query my chat enabled
    Then my chat enabled is "false"

  Scenario: Chat stays on the account
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I set chat enabled to "true"
    Then my chat enabled is "true"
    And the stored chat enabled of "owner@example.com" is "true"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query my chat enabled
    Then my chat enabled is "true"

  Scenario: A signed-in customer may set Chat
    Given another verified user "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I set chat enabled to "true"
    Then my chat enabled is "true"
    And the stored chat enabled of "ana@example.com" is "true"
