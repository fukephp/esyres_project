Feature: Owner QR scans query
  As an owner
  I want to read verified QR visits for my salon
  So that I can see who physically scanned

  Scenario: Guest cannot read QR scans
    When I query QR scans as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot read QR scans
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query QR scans
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot read QR scans
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I query QR scans
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing salon is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query QR scans for salon "999999"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Invalid page is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query QR scans limit 0 offset 0
    Then the GraphQL error code is "INVALID_PAGE"

  Scenario: Newest scan is first and pagination works
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I visit the QR for the salon
    And I visit the QR for the salon
    And I log in as "owner@example.com" with password "secret-pass"
    And I query QR scans
    Then QR scans have 2 rows
    And the first QR scan is for the customer and salon
    When I query QR scans limit 1 offset 0
    Then QR scans have 1 rows
    And the first QR scan is for the customer and salon
    When I query QR scans limit 1 offset 1
    Then QR scans have 1 rows
