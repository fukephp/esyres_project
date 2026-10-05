@rating
Feature: Rating replies
  As another customer
  I want to answer a rating comment
  So that the note is not a dead end

  Scenario: A second reply replaces the first and clearing the comment leaves it
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    And that customer is named "Ana"
    When I log in as "ana@example.com" with password "secret-pass"
    And I rate the salon 4 with comment "Dobro"
    And I read the salon rating rows
    And I remember the first rating
    When I log out
    Given a verified customer "lejla@example.com" with password "secret-pass"
    And that customer is named "Lejla"
    When I log in as "lejla@example.com" with password "secret-pass"
    And I reply "Slažem se"
    And I reply "I dalje"
    Then the rating has 1 replies
    And the reply body is "I dalje"
    When I log out
    And I log in as "ana@example.com" with password "secret-pass"
    And I rate the salon 4 with no comment
    Then the rating has 1 replies

  Scenario: Author, owner, empty comment, and a long reply are rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Studio"
    And my phone is verified
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I rate the salon 4 with comment "Dobro"
    And I read the salon rating rows
    And I remember the first rating
    And I reply "Svoje"
    Then the GraphQL error code is "FORBIDDEN"
    When I log out
    And I log in as "owner@example.com" with password "secret-pass"
    And I reply "Vlasnik"
    Then the GraphQL error code is "FORBIDDEN"
    When I log out
    And I log in as "ana@example.com" with password "secret-pass"
    And I rate the salon 4 with no comment
    When I log out
    Given a verified customer "lejla@example.com" with password "secret-pass"
    When I log in as "lejla@example.com" with password "secret-pass"
    And I reply "Prazno"
    Then the GraphQL error code is "EMPTY_COMMENT"
    When I log out
    And I log in as "ana@example.com" with password "secret-pass"
    And I rate the salon 4 with comment "Dobro"
    When I log out
    And I log in as "lejla@example.com" with password "secret-pass"
    And I reply with 501 characters
    Then the GraphQL error code is "COMMENT_TOO_LONG"

  Scenario: Unverified email is rejected and local skips the gate
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I rate the salon 5 with comment "Dobro"
    And I read the salon rating rows
    And I remember the first rating
    When I log out
    Given an unverified customer "lejla@example.com" with password "secret-pass"
    When I log in as "lejla@example.com" with password "secret-pass"
    And I reply "Ne"
    Then the GraphQL error code is "EMAIL_UNVERIFIED"
    Given a customer "local@example.com" with password "secret-pass" with no verifications
    And the app environment is local
    When I log in as "local@example.com" with password "secret-pass"
    And I reply "Lokalno"
    Then the rating has 1 replies
