Feature: QR sticker hits
  As the platform
  I want each successful sticker GET to record a QR scan
  So that owners can see conversion later

  Scenario: Existing salon QR GET records a hit
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I visit the QR for the salon
    Then the salon has 1 QR hit rows
    And the salon has 0 QR scan rows

  Scenario: Missing salon QR GET records no hit
    When I visit the QR for salon "999999"
    Then I am redirected to the spa home
    And there are 0 QR hit rows

  Scenario: Organic salon profile does not record a hit
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I visit the salon profile URL
    Then the salon has 0 QR hit rows
    When I query the public salon as a guest
    Then the public salon name is "Kosa Studio"
    And the salon has 0 QR hit rows

  Scenario: Reconcile on login does not add a second hit
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I visit the QR for the salon
    Then the salon has 1 QR hit rows
    And I log in as "ana@example.com" with password "secret-pass"
    Then the salon has 1 QR scan rows
    And the salon has 1 QR hit rows

  Scenario: Already verified QR GET records a hit and a visit
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I visit the QR for the salon
    Then the salon has 1 QR hit rows
    And the salon has 1 QR scan rows
