Feature: Owner salon service categories
  As an owner
  I want named service groups on my salon
  So guests see my cjenovnik instead of locked hair / make-up / massage

  Scenario: New salon has no service categories
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon service categories
    Then salon service categories are empty

  Scenario: Owner creates a service category
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service category:
      """
      {"name": "Tretmani"}
      """
    And I query salon service categories
    Then salon service categories match:
      """
      [{"name": "Tretmani", "services": []}]
      """

  Scenario: Owner renames a service category
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service category:
      """
      {"name": "Tretmani"}
      """
    And I update the salon service category:
      """
      {"name": "Nega"}
      """
    And I query salon service categories
    Then salon service categories match:
      """
      [{"name": "Nega", "services": []}]
      """

  Scenario: Owner deletes an empty service category
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service category:
      """
      {"name": "Tretmani"}
      """
    And I delete the salon service category
    Then deleteSalonServiceCategory is true
    And I query salon service categories
    Then salon service categories are empty

  Scenario: Delete is rejected when the category still has services
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a service:
      """
      {"name": "Haircut", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I delete the salon service category
    Then the GraphQL error code is "CATEGORY_NOT_EMPTY"

  Scenario: Empty name is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service category:
      """
      {"name": "  "}
      """
    Then the GraphQL error code is "INVALID_NAME"

  Scenario: Duplicate name on the same salon is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service category:
      """
      {"name": "Tretmani"}
      """
    And I create a salon service category:
      """
      {"name": "Tretmani"}
      """
    Then the GraphQL error code is "DUPLICATE_CATEGORY_NAME"

  Scenario: Guest cannot create a service category
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I create a salon service category as a guest:
      """
      {"name": "Tretmani"}
      """
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot create a service category
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a salon service category:
      """
      {"name": "Tretmani"}
      """
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot create a service category
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I create a salon service category:
      """
      {"name": "Tretmani"}
      """
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Massage-only salon is not given unused hair groups
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Spa"
    And the salon has a service:
      """
      {"name": "Masaža leđa", "category": "MASSAGE", "durationMinutes": 60, "priceFeninga": 5000}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon service categories
    Then salon service categories match:
      """
      [{"name": "Masaža", "services": ["Masaža leđa"]}]
      """
