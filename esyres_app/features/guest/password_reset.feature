@auth
Feature: Password reset
  As a person who lost a password
  I want a reset link by email
  So that I can set a new password myself and every old session ends

  Scenario: Reset request is always true and mails a real account once a minute
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I request a password reset for "nobody@example.com"
    Then request password reset succeeds
    And 0 reset-password notifications were sent
    When I request a password reset for " ANA@example.com"
    Then request password reset succeeds
    And 1 reset-password notification was sent
    And the reset-password link opens the PWA for "ana@example.com"
    When I request a password reset for "ana@example.com"
    Then request password reset succeeds
    And 1 reset-password notification was sent
    When time advances 61 seconds
    And I request a password reset for "ana@example.com"
    Then request password reset succeeds
    And 2 reset-password notifications were sent

  Scenario: A valid token sets the new password once
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I request a password reset for "ana@example.com"
    And I reset the password for "ana@example.com" to "new-secret" with the mailed token
    Then reset password succeeds
    When I log in as "ana@example.com" with password "secret-pass"
    Then the GraphQL error code is "INVALID_CREDENTIALS"
    When I log in as "ana@example.com" with password "new-secret"
    Then login succeeds
    When I log out
    And I reset the password for "ana@example.com" to "other-secret" with the mailed token
    Then the GraphQL error code is "INVALID_RESET_TOKEN"

  Scenario: Bad token, unknown email, and expired token are rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I request a password reset for "ana@example.com"
    And I reset the password for "ana@example.com" to "new-secret" with token "wrong-token"
    Then the GraphQL error code is "INVALID_RESET_TOKEN"
    When I reset the password for "bob@example.com" to "new-secret" with the mailed token
    Then the GraphQL error code is "INVALID_RESET_TOKEN"
    When time advances 3601 seconds
    And I reset the password for "ana@example.com" to "new-secret" with the mailed token
    Then the GraphQL error code is "INVALID_RESET_TOKEN"
    When I log in as "ana@example.com" with password "secret-pass"
    Then login succeeds

  Scenario: A weak password keeps the token usable
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I request a password reset for "ana@example.com"
    And I reset the password for "ana@example.com" to "short" with the mailed token
    Then the GraphQL error code is "WEAK_PASSWORD"
    When I reset the password for "ana@example.com" to "new-secret" with the mailed token
    Then reset password succeeds

  Scenario: Success ends every session of that user, the current one too
    Given a verified customer "ana@example.com" with password "secret-pass"
    And a stored session for "ana@example.com"
    When I log in as "ana@example.com" with password "secret-pass"
    Then login succeeds
    When I request a password reset for "ana@example.com"
    And I reset the password for "ana@example.com" to "new-secret" with the mailed token
    Then reset password succeeds
    And no stored session remains for "ana@example.com"
    When I query me
    Then me is null

  Scenario: A different logged-in person stays logged in
    Given a verified customer "bob@example.com" with password "bob-secret"
    And a stored session for "bob@example.com"
    When I log in as "bob@example.com" with password "bob-secret"
    Then login succeeds
    Given a verified customer "ana@example.com" with password "secret-pass"
    And a stored session for "ana@example.com"
    When I request a password reset for "ana@example.com"
    And I reset the password for "ana@example.com" to "new-secret" with the mailed token
    Then reset password succeeds
    And no stored session remains for "ana@example.com"
    And a stored session remains for "bob@example.com"
    When I query me
    Then me email is "bob@example.com"
