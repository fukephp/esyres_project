Feature: Zapisi
  As an owner
  I want one day's bookings for this salon, filtered by origin
  So I can open any of them from a list

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has hours:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00"},
        {"weekday": "TUESDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00"},
        {"weekday": "WEDNESDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00"},
        {"weekday": "THURSDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00"},
        {"weekday": "FRIDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00"},
        {"weekday": "SATURDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00"},
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

  Scenario: Guest cannot read Zapisi
    When I query zapisi as a guest for date "2026-08-29"
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot read Zapisi
    Given that owner is email unverified
    When I log in as "owner@example.com" with password "secret-pass"
    And I query zapisi for date "2026-08-29"
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Another salon and a bad date are rejected
    Given another verified owner "other@example.com" with password "secret-pass" owns salon "Drugi"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query zapisi for the other salon on date "2026-08-29"
    Then the GraphQL error code is "FORBIDDEN"
    When I query zapisi for date "nope"
    Then the GraphQL error code is "INVALID_DATE"

  Scenario: One row on the appointment day, every status, no in-flight chat
    Given the salon has an in-flight intake
    When I log in as "owner@example.com" with password "secret-pass"
    And I query zapisi for date "2026-08-29"
    Then zapisi is empty
    Given the salon has a requested booking on "2026-08-29" at "10:00" for "Ana"
    When I query zapisi for date "2026-08-29"
    Then zapisi includes this booking as "REQUESTED" origin "PICKER" named "Ana"
    When I query zapisi for date "2026-08-31"
    Then zapisi does not include this booking
    When I decline the booking
    And I query zapisi for date "2026-08-29"
    Then zapisi includes this booking as "DECLINED" origin "PICKER" named "Ana"
    Given the salon has a requested booking on "2026-08-29" at "11:00" for "Ena"
    And that booking is for the salon worker
    And that booking is confirmed
    When I query zapisi for date "2026-08-29"
    Then zapisi includes this booking as "CONFIRMED" origin "PICKER" named "Ena"
    Given a verified customer "ena@example.com" with password "secret-pass"
    And that customer is named "Ena"
    And the customer has a requested booking on "2026-08-29" at "12:00"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "ena@example.com" with password "secret-pass"
    And I cancel the booking
    When I log in as "owner@example.com" with password "secret-pass"
    And I query zapisi for date "2026-08-29"
    Then zapisi includes this booking as "CANCELLED" origin "PICKER" named "Ena"

  Scenario: Counter-proposal uses the proposed day and a reschedule stays on the original day
    Given the salon has a requested booking on "2026-08-29" at "10:00" for "Ana"
    And that booking is for the salon worker
    And that booking is time proposed on "2026-08-31" at "15:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query zapisi for date "2026-08-29"
    Then zapisi does not include this booking
    When I query zapisi for date "2026-08-31"
    Then zapisi includes this booking as "TIME_PROPOSED" origin "PICKER" named "Ana"
    Given a verified customer "ana@example.com" with password "secret-pass"
    And that customer is named "Ana"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-08-31" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query zapisi for date "2026-08-29"
    Then zapisi includes this booking as "CONFIRMED" origin "PICKER" named "Ana"
    When I query zapisi for date "2026-08-31"
    Then zapisi does not include this booking

  Scenario: Origin filter, phone caller name, assistant, and time order
    Given a verified customer "ana@example.com" with password "secret-pass"
    And that customer is named "Ana"
    And the salon has an in-flight intake
    And that intake prefers "2026-08-31" at "10:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services and the intake token
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-31" at "11:00" for "Maja"
    And I query zapisi for date "2026-08-31" origin "PHONE"
    Then zapisi includes this booking as "CONFIRMED" origin "PHONE" named "Maja"
    When I query zapisi for date "2026-08-31" origin "ASSISTANT"
    Then zapisi names are "Ana"
    When I query zapisi for date "2026-08-31"
    Then zapisi names are "Ana, Maja"
    Given the salon has a requested booking on "2026-08-29" at "10:00" for "Ana"
    And the salon has a requested booking on "2026-08-29" at "10:00" for "Ena"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Lejla"
    When I query zapisi for date "2026-08-29"
    Then zapisi names are "Ana, Ena, Lejla"
    When I query zapisi for date "2026-09-01"
    Then zapisi is empty
