Feature: QR reconnect hold cookie
  As an owner
  I want a returning customer who scanned my QR and verified to be marked visited
  So that a physical scan is not just a remote favorite

  Scenario: Guest QR GET sets the hold cookie and redirects to the salon profile
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I visit the QR for the salon
    Then the QR cookie is the salon id
    And I am redirected to the salon profile
    When I query me as a guest
    Then me is null

  Scenario: Last scanned salon wins
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I visit the QR for the salon
    And that owner also owns salon "Druga"
    And I visit the QR for the salon
    Then the QR cookie is the salon id
    And I am redirected to the salon profile

  Scenario: Missing salon redirects home without a cookie
    When I visit the QR for salon "999999"
    Then I am redirected to the spa home
    And there is no QR cookie

  Scenario: Organic salon profile URL and public salon query do not set the cookie
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I visit the salon profile URL
    Then there is no QR cookie
    When I query the public salon as a guest
    Then the public salon name is "Kosa Studio"
    And there is no QR cookie

  Scenario: Phone OTP with cookie and verified email reconciles
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a customer "ana@example.com" with password "secret-pass" whose phone is not verified
    When I visit the QR for the salon
    And I log in as "ana@example.com" with password "secret-pass"
    And I request a phone OTP for "+38761111111"
    And I verify the last phone OTP
    Then verify phone otp succeeds
    When I query me
    Then me favorite salon ids are the salon
    And the customer has 1 favorite rows
    And the salon has 1 QR scan rows
    And there is no QR cookie
    When I log in as "owner@example.com" with password "secret-pass"
    And I query QR scans
    Then QR scans have 1 rows
    And the first QR scan is for the customer and salon

  Scenario: Sessioned email verify with cookie and verified phone reconciles
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And an unverified customer "ana@example.com" with password "secret-pass"
    When I visit the QR for the salon
    And I log in as "ana@example.com" with password "secret-pass"
    And I send a verification email
    And I remember the verify-email URL
    And I visit the remembered verify-email URL
    Then I am redirected to bookings verified
    And the customer has 1 favorite rows
    And the salon has 1 QR scan rows
    And there is no QR cookie

  Scenario: No-session email verify with cookie does not reconcile
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And an unverified customer "ana@example.com" with password "secret-pass"
    When I visit the QR for the salon
    And I log in as "ana@example.com" with password "secret-pass"
    And I send a verification email
    And I remember the verify-email URL
    And I log out
    And I visit the remembered verify-email URL
    Then I am redirected to bookings verified
    And the customer has 0 favorite rows
    And the salon has 0 QR scan rows
    And the QR cookie is the salon id

  Scenario: Guest scan then login as already verified reconciles
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I visit the QR for the salon
    And I log in as "ana@example.com" with password "secret-pass"
    Then the customer has 1 favorite rows
    And the salon has 1 QR scan rows
    And there is no QR cookie

  Scenario: Unverified login and QR GET do not reconcile
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a customer "ana@example.com" with password "secret-pass" with no verifications
    When I visit the QR for the salon
    And I log in as "ana@example.com" with password "secret-pass"
    Then the customer has 0 favorite rows
    And the salon has 0 QR scan rows
    When I visit the QR for the salon
    Then the QR cookie is the salon id
    And the customer has 0 favorite rows
    And the salon has 0 QR scan rows

  Scenario: Register with cookie does not reconcile
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I visit the QR for the salon
    And I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    And the customer has 0 favorite rows
    And the salon has 0 QR scan rows
    And the QR cookie is the salon id

  Scenario: Already verified session QR GET reconciles immediately
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I visit the QR for the salon
    Then I am redirected to the salon profile
    And the customer has 1 favorite rows
    And the salon has 1 QR scan rows
    And there is no QR cookie

  Scenario: Second reconnect appends a scan and keeps one favorite
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I visit the QR for the salon
    And time advances 1 seconds
    And I visit the QR for the salon
    Then the customer has 1 favorite rows
    And the customer has 2 QR scan rows for the salon
    And there is no QR cookie

  Scenario: Deleted salon cookie clears on login and writes nothing
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I visit the QR for the salon
    And the salon is deleted
    And I log in as "ana@example.com" with password "secret-pass"
    Then the customer has 0 favorite rows
    And there is no QR cookie

  Scenario: Invalid QR cookie clears on login and writes nothing
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When the QR cookie is "nope"
    And I log in as "ana@example.com" with password "secret-pass"
    Then the customer has 0 favorite rows
    And the salon has 0 QR scan rows
    And there is no QR cookie
