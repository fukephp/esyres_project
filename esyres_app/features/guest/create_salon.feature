@salon
Feature: Self-serve create salon
  As a customer who has a salon
  I want to name it on the same account
  So that an admin can approve the first shop

  Scenario: Verified session creates a pending salon by name with provisioned defaults
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "  Kosa Studio  "
    Then createSalon name is "Kosa Studio"
    And the created salon is pending for "ana@example.com"
    And the created salon has provisioned defaults
    And the customer owns 0 salons
    And the customer has 1 pending salons

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

  Scenario: A second submit stays pending
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "Kosa Studio"
    Then createSalon name is "Kosa Studio"
    When I create a salon named "Drugi"
    Then the GraphQL error code is "PENDING_SALON"
    And the customer owns 0 salons
    And the customer has 1 pending salons

  Scenario: An existing owner cannot open a first salon
    Given a verified owner "ana@example.com" with password "secret-pass" owns salon "One"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "Two"
    Then the GraphQL error code is "ALREADY_OWNER"
    And the customer owns 1 salons

  Scenario: A booking this account sent blocks a first salon
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the signed-in customer has sent a booking
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "Kosa Studio"
    Then the GraphQL error code is "HAS_BOOKINGS"
    And the customer owns 0 salons
    And the customer has 0 pending salons

  Scenario: A favorite and a rating do not block a first salon
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a favorite and a rating
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "Kosa Studio"
    Then createSalon name is "Kosa Studio"
    And the created salon is pending for "ana@example.com"
    And the customer owns 0 salons

  Scenario: An admin cannot create a salon
    Given a verified admin "admin@esyres.test" with password "secret-pass"
    When I log in as "admin@esyres.test" with password "secret-pass"
    And I create a salon named "Kosa Studio"
    Then the GraphQL error code is "FORBIDDEN"
