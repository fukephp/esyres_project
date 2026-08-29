Feature: Owner salon working hours
  As an owner
  I want to set working hours, breaks, and a cancellation notice window
  So that the salon runs on real time rules

  Scenario: Login with email and password
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    Then login succeeds

  Scenario: Wrong password is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "wrong"
    Then the GraphQL error code is "INVALID_CREDENTIALS"

  Scenario: New salon is closed all week with 24 hour notice
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon hours
    Then the salon is closed every weekday
    And cancellation notice hours is 24

  Scenario: Owner replaces the weekly template and notice window
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update salon hours with notice 48:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "TUESDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "WEDNESDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "THURSDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "FRIDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "SATURDAY", "closed": false, "opensAt": "09:00", "closesAt": "17:00"},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    And I query salon hours
    Then cancellation notice hours is 48
    And salon hours match:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "TUESDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "WEDNESDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "THURSDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "FRIDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "SATURDAY", "closed": false, "opensAt": "09:00", "closesAt": "17:00", "breakStartsAt": null, "breakEndsAt": null},
        {"weekday": "SUNDAY", "closed": true, "opensAt": null, "closesAt": null, "breakStartsAt": null, "breakEndsAt": null}
      ]
      """

  Scenario: Guest cannot update hours
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I update salon hours as a guest with notice 24:
      """
      [
        {"weekday": "MONDAY", "closed": true},
        {"weekday": "TUESDAY", "closed": true},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": true},
        {"weekday": "SATURDAY", "closed": true},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot update hours
    Given an unverified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update salon hours with notice 24:
      """
      [
        {"weekday": "MONDAY", "closed": true},
        {"weekday": "TUESDAY", "closed": true},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": true},
        {"weekday": "SATURDAY", "closed": true},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot update hours
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I update salon hours with notice 24:
      """
      [
        {"weekday": "MONDAY", "closed": true},
        {"weekday": "TUESDAY", "closed": true},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": true},
        {"weekday": "SATURDAY", "closed": true},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Break outside the open interval is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update salon hours with notice 24:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:00", "closesAt": "12:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "TUESDAY", "closed": true},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": true},
        {"weekday": "SATURDAY", "closed": true},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    Then the GraphQL error code is "INVALID_BREAK"

  Scenario: Break on a closed day is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update salon hours with notice 24:
      """
      [
        {"weekday": "MONDAY", "closed": true, "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "TUESDAY", "closed": true},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": true},
        {"weekday": "SATURDAY", "closed": true},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    Then the GraphQL error code is "INVALID_HOURS"

  Scenario: Times not on 15 minute steps are rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update salon hours with notice 24:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:10", "closesAt": "20:00"},
        {"weekday": "TUESDAY", "closed": true},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": true},
        {"weekday": "SATURDAY", "closed": true},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    Then the GraphQL error code is "INVALID_TIME_STEP"

  Scenario: Overnight hours are rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I update salon hours with notice 24:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "22:00", "closesAt": "02:00"},
        {"weekday": "TUESDAY", "closed": true},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": true},
        {"weekday": "SATURDAY", "closed": true},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    Then the GraphQL error code is "OVERNIGHT_HOURS"
