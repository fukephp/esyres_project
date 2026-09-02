Feature: Owner sees customer respond
  As an owner
  I want to subscribe to customer responses for my salon
  So that home can update without polling

  Scenario: Verified owner can subscribe
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking customer responded
    Then the subscription channel is present

  Scenario: Guest cannot subscribe
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I subscribe to booking customer responded as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot subscribe
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking customer responded
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Customer who does not own the salon cannot subscribe
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I subscribe to booking customer responded
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Other salon is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other"
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking customer responded for the other salon
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing salon is forbidden
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking customer responded for salon id "999999"
    Then the GraphQL error code is "FORBIDDEN"
