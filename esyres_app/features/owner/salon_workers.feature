@salon
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

  Scenario: New worker has an empty profile
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I query my salon worker profiles
    Then the salon worker profile matches:
      """
      {"photoUrl": null, "about": null, "experienceYears": null, "portfolioUrl": null, "maintenance": null, "talents": [], "specializations": [], "certificates": [], "education": [], "brands": [], "strongestServiceIds": []}
      """

  Scenario: Owner saves a trimmed profile and it round-trips
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon worker:
      """
      {"name": "Ana M.", "profile": {"about": "  Frizerka  ", "experienceYears": 7, "portfolioUrl": "https://instagram.com/ana", "maintenance": " svakih 6 sedmica ", "talents": ["šminka", "  ", "manikir"], "specializations": [" kovrdžava kosa "], "certificates": [], "education": ["Akademija"], "brands": ["Wella", ""]}}
      """
    And I query my salon worker profiles
    Then salon workers match:
      """
      [{"name": "Ana M."}]
      """
    And the salon worker profile matches:
      """
      {"about": "Frizerka", "experienceYears": 7, "portfolioUrl": "https://instagram.com/ana", "maintenance": "svakih 6 sedmica", "talents": ["šminka", "manikir"], "specializations": ["kovrdžava kosa"], "certificates": [], "education": ["Akademija"], "brands": ["Wella"]}
      """

  Scenario: Whitespace about stores empty
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon worker:
      """
      {"name": "Ana", "profile": {"about": "   "}}
      """
    And I query my salon worker profiles
    Then the salon worker profile matches:
      """
      {"about": null}
      """

  Scenario Outline: Invalid profile input is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon worker:
      """
      {"name": "Ana M.", "profile": <profile>}
      """
    Then the GraphQL error code is "<code>"
    When I query salon workers
    Then salon workers match:
      """
      [{"name": "Ana"}]
      """

    Examples:
      | profile                                                                                                    | code                  |
      | {"experienceYears": 61}                                                                                    | INVALID_EXPERIENCE    |
      | {"experienceYears": -1}                                                                                    | INVALID_EXPERIENCE    |
      | {"portfolioUrl": "instagram.com/ana"}                                                                      | INVALID_PORTFOLIO_URL |
      | {"talents": ["xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"]}         | LIST_ROW_TOO_LONG     |
      | {"brands": ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21"]} | LIST_TOO_LONG         |

  Scenario: Strongest services accept five of this salon
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a service:
      """
      {"name": "S1", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 1000}
      """
    And the salon has a service:
      """
      {"name": "S2", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 1000}
      """
    And the salon has a service:
      """
      {"name": "S3", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 1000}
      """
    And the salon has a service:
      """
      {"name": "S4", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 1000}
      """
    And the salon has a service:
      """
      {"name": "S5", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 1000}
      """
    And the salon has a service:
      """
      {"name": "S6", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 1000}
      """
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon worker strongest services to the first 5 salon services
    Then the salon worker has 5 strongest services
    When I update the salon worker strongest services to the first 6 salon services
    Then the GraphQL error code is "TOO_MANY_STRONGEST"
    And the salon worker has 5 strongest services

  Scenario: Strongest service of another salon is refused
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon worker strongest services to a service of another salon
    Then the GraphQL error code is "INVALID_SERVICE"
    And the salon worker has 0 strongest services

  Scenario: Guest cannot read worker profiles
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I query public salon worker profiles as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Owner uploads, replaces, and removes a worker photo
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I upload a jpeg worker photo
    Then the worker photo is on disk
    When I remember the worker photo path
    And I upload a webp worker photo
    Then the worker photo is on disk
    And the remembered main image is gone
    When I remove the worker photo
    Then the remembered main image is gone
    And the worker has no photo

  Scenario Outline: Bad worker photo keeps no file
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I upload a <kind> worker photo
    Then the GraphQL error code is "<code>"
    And the worker has no photo

    Examples:
      | kind     | code               |
      | gif      | INVALID_IMAGE_TYPE |
      | oversize | IMAGE_TOO_LARGE    |

  Scenario: Other user cannot upload a worker photo
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I upload a jpeg worker photo
    Then the GraphQL error code is "FORBIDDEN"

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
