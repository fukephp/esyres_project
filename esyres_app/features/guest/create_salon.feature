Feature: Self-serve create salon
  As a customer who has a salon
  I want to create it on the same account
  So that I do not wait for a founder invite

  Scenario: Verified session creates a salon by name with provisioned defaults
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "  Kosa Studio  "
    Then createSalon name is "Kosa Studio"
    And the created salon is owned by "ana@example.com"
    And the created salon has provisioned defaults
    And the customer owns 1 salons

  Scenario: Guest cannot create a salon
    When I create a salon named "Kosa Studio" as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified session cannot create a salon
    Given an unverified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "Kosa Studio"
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Empty name is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "   "
    Then the GraphQL error code is "INVALID_NAME"

  Scenario: Mutation still creates a second salon
    Given a verified owner "ana@example.com" with password "secret-pass" owns salon "One"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "Two"
    Then createSalon name is "Two"
    And the customer owns 2 salons
