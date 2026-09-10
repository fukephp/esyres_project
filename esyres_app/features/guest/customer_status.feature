Feature: Customer status notify is not for guest events
  As a customer
  I want SMS and status push only when the owner proposes, accepts, or declines
  So that my own taps do not text me

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

  Scenario: New request does not customer-notify
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I subscribe to push
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the booking status is "REQUESTED"
    And no customer push was sent
    And no status SMS was sent

  Scenario: Confirm does not customer-notify
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-31" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I subscribe to push
    And I confirm the proposed time
    Then no customer push was sent
    And no status SMS was sent

  Scenario: Reject does not customer-notify
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-31" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I subscribe to push
    And I reject the proposed time
    Then no customer push was sent
    And no status SMS was sent

  Scenario: Ask other time does not customer-notify
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-31" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I subscribe to push
    And I ask other time "2026-08-31" at "16:00"
    Then no customer push was sent
    And no status SMS was sent

  Scenario: Reschedule does not customer-notify
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking recorded an owner response
    When I log in as "ana@example.com" with password "secret-pass"
    And I subscribe to push
    And I request reschedule "2026-08-31" at "14:00"
    Then no customer push was sent
    And no status SMS was sent

  Scenario: Cancel does not customer-notify
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "14:00"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "ana@example.com" with password "secret-pass"
    And I subscribe to push
    And I cancel the booking
    Then no customer push was sent
    And no status SMS was sent
