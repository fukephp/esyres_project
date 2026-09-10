Feature: Owner QR conversion stats
  As an owner
  I want scan and visit counts for my salon
  So that I know if the sticker is working

  Scenario: Guest cannot read salon QR stats
    When I query salon QR stats as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot read salon QR stats
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon QR stats
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot read salon QR stats
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I query salon QR stats
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing salon is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon QR stats for salon "999999"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Empty salon is zero percent
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon QR stats
    Then salon QR stats are 0 scans 0 visits 0 percent

  Scenario: Two guest scans then verify is 50 percent
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I visit the QR for the salon
    And I visit the QR for the salon
    And I log in as "ana@example.com" with password "secret-pass"
    And I log in as "owner@example.com" with password "secret-pass"
    And I query salon QR stats
    Then salon QR stats are 2 scans 1 visits 50 percent

  Scenario: Three guest scans then verify is 33 percent
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I visit the QR for the salon
    And I visit the QR for the salon
    And I visit the QR for the salon
    And I log in as "ana@example.com" with password "secret-pass"
    And I log in as "owner@example.com" with password "secret-pass"
    And I query salon QR stats
    Then salon QR stats are 3 scans 1 visits 33 percent

  Scenario: Repeat verified GET increments both counts
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I visit the QR for the salon
    And I visit the QR for the salon
    And I log in as "owner@example.com" with password "secret-pass"
    And I query salon QR stats
    Then salon QR stats are 2 scans 2 visits 100 percent

  Scenario: Last salon wins visits but both salons keep hits
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And I remember this salon
    And that owner also owns salon "Druga"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I visit the QR for the remembered salon
    And I visit the QR for the salon
    And I log in as "ana@example.com" with password "secret-pass"
    And I log in as "owner@example.com" with password "secret-pass"
    And I query salon QR stats
    Then salon QR stats are 1 scans 1 visits 100 percent
    When I query salon QR stats for the remembered salon
    Then salon QR stats are 1 scans 0 visits 0 percent

  Scenario: Backfill copies each visit into a hit
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    And the customer has 2 QR visits at the salon without hits
    When I backfill QR hits
    And I log in as "owner@example.com" with password "secret-pass"
    And I query salon QR stats
    Then salon QR stats are 2 scans 2 visits 100 percent
