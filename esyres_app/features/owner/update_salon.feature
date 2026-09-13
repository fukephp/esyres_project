Feature: Owner updates salon name and address
  As an owner
  I want to save a salon’s name and address
  So that the catalog shop has a written location

  Scenario: Owner updates name and address
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon name and address
    Then the salon has no address
    When I update the salon with:
      """
      {"name": "  Kosa Studio  ", "address": "  Ferhadija 12  "}
      """
    Then updateSalon name is "Kosa Studio" and address is "Ferhadija 12"
    When I query salon name and address
    Then the salon name is "Kosa Studio" and address is "Ferhadija 12"
    And the salon still has no coordinates

  Scenario: Guest cannot update a salon
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I update the salon as a guest with:
      """
      {"name": "Kosa Studio", "address": "Ferhadija 12"}
      """
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot update a salon
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon with:
      """
      {"name": "Kosa Studio", "address": "Ferhadija 12"}
      """
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot update a salon
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I update the salon with:
      """
      {"name": "Kosa Studio", "address": "Ferhadija 12"}
      """
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing salon id is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update salon id "999999" with:
      """
      {"name": "Kosa Studio", "address": "Ferhadija 12"}
      """
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Empty name is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon with:
      """
      {"name": "   ", "address": "Ferhadija 12"}
      """
    Then the GraphQL error code is "INVALID_NAME"

  Scenario: Empty address is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon with:
      """
      {"name": "Kosa Studio", "address": "   "}
      """
    Then the GraphQL error code is "INVALID_ADDRESS"
