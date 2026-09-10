Feature: Owner subscribe to cancelled bookings
  As an owner
  I want a live handshake when a customer cancels
  So that occupying and the pending queue can refetch

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"

  Scenario: Verified owner can subscribe to cancelled
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking cancelled
    Then the subscription channel is present

  Scenario: Guest cannot subscribe to cancelled
    When I subscribe to booking cancelled as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot subscribe to cancelled
    Given that owner is email unverified
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking cancelled
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Customer who does not own the salon cannot subscribe to cancelled
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I subscribe to booking cancelled
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Other salon is forbidden for cancelled subscribe
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other"
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking cancelled for the other salon
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Missing salon is forbidden for cancelled subscribe
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to booking cancelled for salon id "999999"
    Then the GraphQL error code is "FORBIDDEN"
