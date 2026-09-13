Feature: Owner adds another salon
  As an owner
  I want to add another shop with name and address
  So that I do not reuse public create salon as a second factory

  Scenario: Owner adds a salon with trimmed name and address
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "One"
    When I log in as "owner@example.com" with password "secret-pass"
    And I add a salon with:
      """
      {"name": "  Two  ", "address": "  Ferhadija 12  "}
      """
    Then addSalon name is "Two" and address is "Ferhadija 12"
    And the added salon has provisioned defaults except address is "Ferhadija 12"
    And the salon still has no coordinates
    And the owner owns 2 salons
    When I query popularInSarajevo as a guest
    Then popularInSarajevo does not include "Two"

  Scenario: Guest cannot add a salon
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "One"
    When I add a salon as a guest with:
      """
      {"name": "Two", "address": "Ferhadija 12"}
      """
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot add a salon
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "One"
    When I log in as "owner@example.com" with password "secret-pass"
    And I add a salon with:
      """
      {"name": "Two", "address": "Ferhadija 12"}
      """
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Verified customer with zero salons cannot add a salon
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I add a salon with:
      """
      {"name": "Two", "address": "Ferhadija 12"}
      """
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Empty name is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "One"
    When I log in as "owner@example.com" with password "secret-pass"
    And I add a salon with:
      """
      {"name": "   ", "address": "Ferhadija 12"}
      """
    Then the GraphQL error code is "INVALID_NAME"

  Scenario: Empty address is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "One"
    When I log in as "owner@example.com" with password "secret-pass"
    And I add a salon with:
      """
      {"name": "Two", "address": "   "}
      """
    Then the GraphQL error code is "INVALID_ADDRESS"
