Feature: Owner salon media on Informacije
  As an owner
  I want a description, main image, and gallery on salon edit
  So that catalog copy and photos live on Esyres before guests see them

  Scenario: New salon has empty description and media
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query my salon media
    Then the salon has no description
    And my salon main image is empty
    And my salon gallery is empty

  Scenario: Owner saves trimmed description
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon with:
      """
      {"name": "Kosa Studio", "address": "Ferhadija 12", "description": "  Hello shop  "}
      """
    Then updateSalon description is "Hello shop"
    When I query my salon media
    Then my salon description is "Hello shop"

  Scenario: Whitespace description stores empty
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon with:
      """
      {"name": "Kosa Studio", "address": "Ferhadija 12", "description": "   "}
      """
    Then updateSalon has no description
    When I query my salon media
    Then the salon has no description

  Scenario: Description over 1000 is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon description to 1001 characters
    Then the GraphQL error code is "DESCRIPTION_TOO_LONG"
    And salon name is still "Test Salon"

  Scenario: Omitting description leaves it unchanged
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update the salon with:
      """
      {"name": "Kosa Studio", "address": "Ferhadija 12", "description": "Keep me"}
      """
    And I update the salon with:
      """
      {"name": "Kosa Studio", "address": "Ferhadija 12"}
      """
    When I query my salon media
    Then my salon description is "Keep me"

  Scenario: Guest cannot read salon media
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I query salon media as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Guest cannot upload a main image
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I upload a main image as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot upload a main image
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I upload a jpeg main image
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot upload a main image
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I upload a jpeg main image
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Owner uploads jpeg main image
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I upload a jpeg main image
    Then salon main image is on disk
    When I query my salon media
    Then salon main image is on disk

  Scenario: Owner uploads png and webp main image
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I upload a png main image
    Then salon main image is on disk
    And I upload a webp main image
    Then salon main image is on disk

  Scenario: GIF main image is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I upload a gif main image
    Then the GraphQL error code is "INVALID_IMAGE_TYPE"
    When I query my salon media
    Then my salon main image is empty

  Scenario: Oversize main image is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I upload a oversize main image
    Then the GraphQL error code is "IMAGE_TOO_LARGE"
    When I query my salon media
    Then my salon main image is empty

  Scenario: Replacing main deletes the old file
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I upload a jpeg main image
    And I remember the main image path
    And I upload a png main image
    Then the remembered main image is gone
    And salon main image is on disk

  Scenario: Remove main is idempotent
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I remove the main image
    And I query my salon media
    Then my salon main image is empty

  Scenario: Gallery accepts six and rejects a seventh
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I upload a gallery jpeg 6 times
    Then salon gallery count is 6
    When I upload a gallery jpeg
    Then the GraphQL error code is "GALLERY_FULL"
    When I query my salon media
    Then salon gallery count is 6

  Scenario: Remove gallery item by index
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I upload a gallery jpeg
    And I upload a gallery jpeg
    And I remove gallery index 0
    Then salon gallery count is 1

  Scenario: Bad gallery index is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I remove gallery index 0
    Then the GraphQL error code is "INVALID_GALLERY_INDEX"
