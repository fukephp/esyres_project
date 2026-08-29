Feature: Owner salon services
  As an owner
  I want to add and edit services with durations and prices
  So that customers see accurate options

  Scenario: New salon has no services
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon services
    Then salon services are empty

  Scenario: Owner creates a service with default duration
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service:
      """
      {"name": "Haircut", "category": "HAIR", "priceFeninga": 2500}
      """
    And I query salon services
    Then salon services match:
      """
      [{"name": "Haircut", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}]
      """

  Scenario: Owner creates a service with explicit duration
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service:
      """
      {"name": "Makeup", "category": "MAKE_UP", "durationMinutes": 45, "priceFeninga": 4000}
      """
    And I query salon services
    Then salon services match:
      """
      [{"name": "Makeup", "category": "MAKE_UP", "durationMinutes": 45, "priceFeninga": 4000}]
      """

  Scenario: Owner updates a service
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a service:
      """
      {"name": "Haircut", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon service:
      """
      {"name": "Color", "category": "MAKE_UP", "durationMinutes": 90, "priceFeninga": 5000}
      """
    And I query salon services
    Then salon services match:
      """
      [{"name": "Color", "category": "MAKE_UP", "durationMinutes": 90, "priceFeninga": 5000}]
      """

  Scenario: Guest cannot create a service
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I create a salon service as a guest:
      """
      {"name": "Haircut", "category": "HAIR", "priceFeninga": 2500}
      """
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot create a service
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service:
      """
      {"name": "Haircut", "category": "HAIR", "priceFeninga": 2500}
      """
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot create a service
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I create a salon service:
      """
      {"name": "Haircut", "category": "HAIR", "priceFeninga": 2500}
      """
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Other user cannot update a service
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a service:
      """
      {"name": "Haircut", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I update the salon service:
      """
      {"name": "Color", "category": "MAKE_UP", "durationMinutes": 90, "priceFeninga": 5000}
      """
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Duration below 15 is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service:
      """
      {"name": "Haircut", "category": "HAIR", "durationMinutes": 10, "priceFeninga": 2500}
      """
    Then the GraphQL error code is "INVALID_DURATION"

  Scenario: Duration not on 15 minute steps is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service:
      """
      {"name": "Haircut", "category": "HAIR", "durationMinutes": 20, "priceFeninga": 2500}
      """
    Then the GraphQL error code is "INVALID_DURATION"

  Scenario: Update duration not on 15 minute steps is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a service:
      """
      {"name": "Haircut", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon service:
      """
      {"name": "Haircut", "category": "HAIR", "durationMinutes": 20, "priceFeninga": 2500}
      """
    Then the GraphQL error code is "INVALID_DURATION"

  Scenario: Negative price is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service:
      """
      {"name": "Haircut", "category": "HAIR", "priceFeninga": -1}
      """
    Then the GraphQL error code is "INVALID_PRICE"

  Scenario: Empty name is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service:
      """
      {"name": "  ", "category": "HAIR", "priceFeninga": 2500}
      """
    Then the GraphQL error code is "INVALID_NAME"

  Scenario: Duplicate name on the same salon is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a service:
      """
      {"name": "Haircut", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service:
      """
      {"name": "Haircut", "category": "MAKE_UP", "priceFeninga": 4000}
      """
    Then the GraphQL error code is "DUPLICATE_SERVICE_NAME"

  Scenario: Update duplicate name on the same salon is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a service:
      """
      {"name": "Haircut", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    And the salon has a service:
      """
      {"name": "Color", "category": "MAKE_UP", "durationMinutes": 90, "priceFeninga": 5000}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon service:
      """
      {"name": "Haircut", "category": "MAKE_UP", "durationMinutes": 90, "priceFeninga": 5000}
      """
    Then the GraphQL error code is "DUPLICATE_SERVICE_NAME"
