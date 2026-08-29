Feature: Owner salon workers
  As an owner
  I want to add workers to my salon
  So that customers can request them specifically or leave it open

  Scenario: New salon has no workers
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon workers
    Then salon workers are empty

  Scenario: Owner creates a worker
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon worker:
      """
      {"name": "Ana"}
      """
    And I query salon workers
    Then salon workers match:
      """
      [{"name": "Ana"}]
      """

  Scenario: Owner updates a worker
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon worker:
      """
      {"name": "Ana M."}
      """
    And I query salon workers
    Then salon workers match:
      """
      [{"name": "Ana M."}]
      """

  Scenario: Guest cannot create a worker
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I create a salon worker as a guest:
      """
      {"name": "Ana"}
      """
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot create a worker
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon worker:
      """
      {"name": "Ana"}
      """
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot create a worker
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I create a salon worker:
      """
      {"name": "Ana"}
      """
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Other user cannot update a worker
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I update the salon worker:
      """
      {"name": "Ana M."}
      """
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Empty name is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon worker:
      """
      {"name": "  "}
      """
    Then the GraphQL error code is "INVALID_NAME"

  Scenario: Duplicate name on the same salon is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon worker:
      """
      {"name": "Ana"}
      """
    Then the GraphQL error code is "DUPLICATE_WORKER_NAME"

  Scenario: Update duplicate name on the same salon is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    And the salon has a worker:
      """
      {"name": "Mia"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon worker:
      """
      {"name": "Ana"}
      """
    Then the GraphQL error code is "DUPLICATE_WORKER_NAME"
