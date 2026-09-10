Feature: Guest assistant intake persistence
  As a guest
  I want my salon chat snapshot saved
  So the owner can see it before I send a request

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has hours:
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
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """

  Scenario: Guest upsert creates a uuid token as Gost
    When I upsert a new assistant intake as a guest
    Then the intake token is a uuid
    And the intake customer name is "Gost"
    And the intake service count is 1

  Scenario: Same token updates the same row
    When I upsert a new assistant intake as a guest
    Then the intake token is a uuid
    When I upsert the assistant intake as a guest
    Then the intake token is a uuid
    And the intake service count is 1

  Scenario: Guest can read an in-flight intake by token
    When I upsert a new assistant intake as a guest
    Then the intake token is a uuid
    When I query the assistant intake as a guest
    Then the intake customer name is "Gost"

  Scenario: Unknown token is null
    When I query an unknown assistant intake as a guest
    Then the assistant intake is null

  Scenario: Stale token is null and upsert mints a new row
    When I upsert a new assistant intake as a guest
    Then the intake token is a uuid
    Given that intake is stale
    When I query the assistant intake as a guest
    Then the assistant intake is null
    When I upsert the assistant intake as a guest
    Then the intake token is a uuid

  Scenario: Logged-in upsert uses the customer name
    Given a verified customer "ana@example.com" with password "secret-pass"
    And that customer is named "Ana"
    When I log in as "ana@example.com" with password "secret-pass"
    And I upsert a new assistant intake as a guest
    Then the intake customer name is "Ana"

  Scenario: Guest cannot read the owner list
    When I query in-flight intakes as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Guest cannot read the owner count
    When I query in-flight intake count as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Guest createBooking with intake token stays unauthenticated
    When I upsert a new assistant intake as a guest
    Then the intake token is a uuid
    When I create a booking on "2026-08-31" at "10:00" with the salon services and the intake token
    Then the GraphQL error code is "UNAUTHENTICATED"
    When I query the assistant intake as a guest
    Then the intake customer name is "Gost"

  Scenario: Unverified email createBooking with intake token stays email unverified
    Given an unverified customer "ana@example.com" with password "secret-pass"
    When I upsert a new assistant intake as a guest
    Then the intake token is a uuid
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services and the intake token
    Then the GraphQL error code is "EMAIL_UNVERIFIED"
    When I query the assistant intake
    Then the intake customer name is "Gost"

  Scenario: Unverified phone createBooking with intake token stays phone unverified
    Given a customer "ana@example.com" with password "secret-pass" whose phone is not verified
    When I upsert a new assistant intake as a guest
    Then the intake token is a uuid
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services and the intake token
    Then the GraphQL error code is "PHONE_UNVERIFIED"
    When I query the assistant intake
    Then the intake customer name is "Gost"

  Scenario: Valid intake token on createBooking drops the row
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I upsert a new assistant intake as a guest
    Then the intake token is a uuid
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services and the intake token
    Then the booking status is "REQUESTED"
    When I query the assistant intake
    Then the assistant intake is null

  Scenario: Unknown intake token still creates the booking
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services and an unknown intake token
    Then the booking status is "REQUESTED"

  Scenario: Taken over intake rejects upsert and chat send
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the salon has an in-flight intake
    And that intake is taken over
    When I upsert the assistant intake as a guest
    Then the GraphQL error code is "INTAKE_TAKEN_OVER"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services and the intake token
    Then the GraphQL error code is "INTAKE_TAKEN_OVER"
    When I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the booking status is "REQUESTED"

  Scenario: Guest intake takenOver is true while paused
    Given the salon has an in-flight intake
    And that intake is taken over
    When I query the assistant intake as a guest
    Then the intake takenOver is true

  Scenario: After hours guest can finish even if the flag is set
    Given the salon has an in-flight intake
    And that intake is taken over
    And the salon is open saturday from "10:00" to "17:00"
    When I query the assistant intake as a guest
    Then the intake takenOver is false
    When I upsert the assistant intake as a guest
    Then the intake token is a uuid

  Scenario: DND guest can finish even if the flag is set
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the salon has an in-flight intake
    And that intake is taken over
    And the salon dnd is on
    When I query the assistant intake as a guest
    Then the intake takenOver is false
    When I upsert the assistant intake as a guest
    Then the intake token is a uuid
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services and the intake token
    Then the booking status is "REQUESTED"

  Scenario: Guest cannot read salon dnd
    When I query salon takeover fields as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"
