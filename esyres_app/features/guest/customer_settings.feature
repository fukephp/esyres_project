@auth
Feature: Customer settings
  As a customer
  I want to save my name and a Sarajevo municipality
  So that Nearby can use that place

  Scenario: An unverified customer saves a place and can clear it
    Given a customer "ana@example.com" with password "secret-pass" with no verifications
    When I log in as "ana@example.com" with password "secret-pass"
    And I save customer settings name "Ana Kovač" and place "Centar"
    Then customer settings are name "Ana Kovač" and place "Centar"
    When I save customer settings name "Ana Kovač" and place "none"
    Then customer settings are name "Ana Kovač" and place "none"

  Scenario: A blank name writes nothing
    Given a customer "ana@example.com" with password "secret-pass" with no verifications
    When I log in as "ana@example.com" with password "secret-pass"
    And I save customer settings name " " and place "Centar"
    Then the GraphQL error code is "INVALID_NAME"
    And the saved place was not written
