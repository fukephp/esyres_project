Feature: Owner take over of in-flight assistant intakes
  As an owner
  I want optional Take over on one conversation
  So the assistant pauses until I release it, except after hours or DND

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon is open saturday from "08:00" to "20:00"
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    And the salon has an in-flight intake

  Scenario: Take over pauses the intake and keeps it in-flight
    When I log in as "owner@example.com" with password "secret-pass"
    And I take over the intake
    Then the intake takenOver is true
    When I query in-flight intakes
    Then in-flight customer names are:
      """
      ["Gost"]
      """
    And the intake takenOver is true
    When I query in-flight intake count
    Then in-flight intake count is 1

  Scenario: Release clears the pause
    When I log in as "owner@example.com" with password "secret-pass"
    And I take over the intake
    And I release the intake
    Then the intake takenOver is false

  Scenario: Take over and release are idempotent
    When I log in as "owner@example.com" with password "secret-pass"
    And I take over the intake
    And I take over the intake
    Then the intake takenOver is true
    When I release the intake
    And I release the intake
    Then the intake takenOver is false

  Scenario: DND turns take-over off
    When I log in as "owner@example.com" with password "secret-pass"
    And I set salon dnd to true
    Then salon dnd is true
    And takeoverAllowed is false
    When I take over the intake
    Then the GraphQL error code is "TAKEOVER_UNAVAILABLE"
    When I query salon takeover fields
    Then salon dnd is true
    And takeoverAllowed is false

  Scenario: After hours closed weekday rejects take over
    Given the salon has hours:
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
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon takeover fields
    Then takeoverAllowed is false
    When I take over the intake
    Then the GraphQL error code is "TAKEOVER_UNAVAILABLE"

  Scenario: After hours before open rejects take over
    Given the salon is open saturday from "10:00" to "17:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I take over the intake
    Then the GraphQL error code is "TAKEOVER_UNAVAILABLE"

  Scenario: After hours at close rejects take over
    Given the salon is open saturday from "08:00" to "09:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I take over the intake
    Then the GraphQL error code is "TAKEOVER_UNAVAILABLE"

  Scenario: After hours during break rejects take over
    Given the salon is open saturday from "08:00" to "20:00" with break "08:30" to "09:30"
    When I log in as "owner@example.com" with password "secret-pass"
    And I take over the intake
    Then the GraphQL error code is "TAKEOVER_UNAVAILABLE"

  Scenario: Flag stays but takenOver is false after hours
    When I log in as "owner@example.com" with password "secret-pass"
    And I take over the intake
    Then the intake takenOver is true
    Given the salon is open saturday from "10:00" to "17:00"
    When I query in-flight intakes
    Then the intake takenOver is false

  Scenario: Flag stays but takenOver is false when DND is on
    When I log in as "owner@example.com" with password "secret-pass"
    And I take over the intake
    And I set salon dnd to true
    When I query in-flight intakes
    Then the intake takenOver is false

  Scenario: Default DND is off
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon takeover fields
    Then salon dnd is false
    And takeoverAllowed is true

  Scenario: Guest cannot take over
    When I take over the intake as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Guest cannot release
    When I release the intake as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Guest cannot set DND
    When I set salon dnd to true as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot take over
    Given an unverified owner "open@example.com" with password "secret-pass" owns salon "Other"
    And the salon is open saturday from "08:00" to "20:00"
    And the salon has an in-flight intake
    When I log in as "open@example.com" with password "secret-pass"
    And I take over the intake
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Other user cannot take over
    Given another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I take over the intake
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Unknown intake is forbidden
    When I log in as "owner@example.com" with password "secret-pass"
    And I take over an unknown intake
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Converted intake cannot be taken over
    Given that intake is converted
    When I log in as "owner@example.com" with password "secret-pass"
    And I take over the intake
    Then the GraphQL error code is "FORBIDDEN"
