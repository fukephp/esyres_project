@auth
Feature: Change password
  As a logged-in person
  I want to change my password
  So that I can rotate the shared credential and stay signed in

  Scenario: Guest cannot change a password
    When I query me as a guest
    And I change my password from "secret-pass" to "new-secret"
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Wrong current password is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I change my password from "wrong-pass" to "new-secret"
    Then the GraphQL error code is "INVALID_CURRENT_PASSWORD"
    When I log out
    And I log in as "ana@example.com" with password "secret-pass"
    Then login succeeds

  Scenario: Weak new password is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I change my password from "secret-pass" to "short"
    Then the GraphQL error code is "WEAK_PASSWORD"
    When I log out
    And I log in as "ana@example.com" with password "secret-pass"
    Then login succeeds

  Scenario: New password may equal the current password
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I change my password from "secret-pass" to "secret-pass"
    Then change password succeeds
    When I log out
    And I log in as "ana@example.com" with password "secret-pass"
    Then login succeeds

  Scenario: Unverified session may change password
    When I register as "ana@example.com" with password "secret-pass"
    Then register succeeds for "ana@example.com"
    When I change my password from "secret-pass" to "new-secret"
    Then change password succeeds
    When I query me
    Then me email is "ana@example.com"
    And me email is not verified

  Scenario: Success stays signed in and the previous session cookie still works
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I remember this session
    And I change my password from "secret-pass" to "new-secret"
    Then change password succeeds
    And the session cookie changed
    When I query me
    Then me email is "ana@example.com"
    When I restore the remembered session
    And I query me
    Then me email is "ana@example.com"
    When I log out
    And I log in as "ana@example.com" with password "secret-pass"
    Then the GraphQL error code is "INVALID_CREDENTIALS"
    When I log in as "ana@example.com" with password "new-secret"
    Then login succeeds
