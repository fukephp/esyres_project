Feature: Owner web push
  As an owner
  I want a web push for new requests and customer responses
  So that I do not have to keep the app open

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has hours:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00"},
        {"weekday": "TUESDAY", "closed": true},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": true},
        {"weekday": "SATURDAY", "closed": false, "opensAt": "09:00", "closesAt": "17:00"},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """

  Scenario: Guest cannot subscribe
    When I subscribe to push as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Vapid public key is public
    When I query vapid public key as a guest
    Then vapid public key is "test-public"

  Scenario: Session upserts the same endpoint
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to push
    Then subscribe push succeeds
    And push subscription count is 1
    When I subscribe to push
    Then subscribe push succeeds
    And push subscription count is 1

  Scenario: New request pushes the owner
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to push
    And I log out
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the booking status is "REQUESTED"
    And the last owner push type is "requested"
    And the last owner push user is the salon owner

  Scenario: No subscription means no send
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the booking status is "REQUESTED"
    And no owner push was sent

  Scenario: Customer subscription does not receive owner push
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I subscribe to push
    Then subscribe push succeeds
    When I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the booking status is "REQUESTED"
    And no owner push was sent

  Scenario: Confirm pushes the owner
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-31" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to push
    And I log out
    When I log in as "ana@example.com" with password "secret-pass"
    And I confirm the proposed time
    Then the last owner push type is "confirmed"

  Scenario: Reject pushes the owner
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-31" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to push
    And I log out
    When I log in as "ana@example.com" with password "secret-pass"
    And I reject the proposed time
    Then the last owner push type is "rejected"

  Scenario: Ask other time pushes the owner
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-31" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to push
    And I log out
    When I log in as "ana@example.com" with password "secret-pass"
    And I ask other time "2026-08-31" at "16:00"
    Then the last owner push type is "ask_other_time"

  Scenario: Reschedule pushes the owner
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to push
    And I log out
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "14:00"
    Then the last owner push type is "reschedule"

  Scenario: Cancel does not push
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "14:00"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to push
    And I log out
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then no owner push was sent

  Scenario: Ping does not push
    When I log in as "owner@example.com" with password "secret-pass"
    And I subscribe to push
    And I log out
    When I ping an unknown assistant intake as a guest
    Then no owner push was sent
