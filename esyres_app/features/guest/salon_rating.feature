@rating
Feature: Salon rating
  As a customer
  I want to leave one score for a salon
  So that other people can see the mean

  Scenario: A second rating replaces the first
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    And that customer is named "Ana"
    When I log in as "ana@example.com" with password "secret-pass"
    And I rate the salon 4 with comment "Dobro"
    Then the salon rating average is "4.0" and the count is 1
    When I rate the salon 5 with comment "Bolje"
    Then the salon rating average is "5.0" and the count is 1
    And the salon has 1 rating rows

  Scenario: A bad score or a long comment is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I rate the salon 0 with no comment
    Then the GraphQL error code is "INVALID_SCORE"
    When I rate the salon 6 with no comment
    Then the GraphQL error code is "INVALID_SCORE"
    When I rate the salon with a comment of 501 characters
    Then the GraphQL error code is "COMMENT_TOO_LONG"
    And the salon has 0 rating rows

  Scenario: Unverified email and phone are rejected, and local skips the gate
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Studio"
    And an unverified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I rate the salon 5 with no comment
    Then the GraphQL error code is "EMAIL_UNVERIFIED"
    Given a customer "phone@example.com" with password "secret-pass" whose phone is not verified
    When I log in as "phone@example.com" with password "secret-pass"
    And I rate the salon 5 with no comment
    Then the GraphQL error code is "PHONE_UNVERIFIED"
    Given a customer "local@example.com" with password "secret-pass" with no verifications
    And the app environment is local
    When I log in as "local@example.com" with password "secret-pass"
    And I rate the salon 5 with no comment
    Then the salon rating average is "5.0" and the count is 1

  Scenario: The owner cannot rate their salon
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Studio"
    And my phone is verified
    When I log in as "owner@example.com" with password "secret-pass"
    And I rate the salon 5 with no comment
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: A guest sees the mean and logged-in rows are newest first
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Studio"
    And a verified customer "ana@example.com" with password "secret-pass"
    And that customer is named "Ana"
    When I log in as "ana@example.com" with password "secret-pass"
    And I rate the salon 4 with comment "Dobro"
    When I log out
    Given a verified customer "lejla@example.com" with password "secret-pass"
    And that customer is named "Lejla"
    When I log in as "lejla@example.com" with password "secret-pass"
    And I rate the salon 5 with comment "Odlicno"
    When I log out
    And I read the salon rating summary
    Then the salon rating average is "4.5" and the count is 2
    When I log in as "lejla@example.com" with password "secret-pass"
    And I read the salon rating rows
    Then the rating author names are "Lejla,Ana"
