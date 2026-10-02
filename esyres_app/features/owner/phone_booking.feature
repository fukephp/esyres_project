Feature: Phone booking
  As an owner
  I want to write a confirmed booking for a caller
  So that a phone call occupies a worker without a customer account

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has hours:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "TUESDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "WEDNESDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "THURSDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "FRIDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "SATURDAY", "closed": false, "opensAt": "08:00", "closesAt": "17:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
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

  Scenario: Guest cannot write a phone booking
    When I create a phone booking as a guest on "2026-08-29" at "10:00" for "Ana"
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified owner cannot write a phone booking
    Given that owner is email unverified
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-29" at "10:00" for "Ana"
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Owner writes a confirmed phone booking
    Given a verified customer "ana@example.com" with password "secret-pass"
    And customer "ana@example.com" has phone "061 123 456"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-29" at "10:00" for "  Ana Kovač  " with phone "  061 123 456  "
    Then the phone booking has no customer and no owner response
    And the phone booking caller name is "Ana Kovač" and phone is "061 123 456" and note is "kod ulaza"
    And no owner push was sent
    And no customer push was sent
    When I query occupying bookings for date "2026-08-29"
    Then occupying bookings include this booking as "CONFIRMED"
    When I query pending bookings for date "2026-08-29"
    Then pending bookings do not include this booking
    When I query salon stats
    Then salon stats bookings count is 1
    When I log in as "ana@example.com" with password "secret-pass"
    And I query my bookings
    Then my bookings are empty

  Scenario: A start before now is refused and a taken range is half-open
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-29" at "08:30" for "Ana"
    Then the GraphQL error code is "PAST_TIME"
    When I create a phone booking on "2026-08-28" at "10:00" for "Ana"
    Then the GraphQL error code is "PAST_TIME"
    When I create a phone booking on "2026-08-29" at "09:00" for "Ana"
    Then the phone booking has no customer and no owner response
    When I create a phone booking on "2026-08-29" at "09:30" for "Lejla"
    Then the phone booking has no customer and no owner response

  Scenario: Save rejects closed, hours, break, overlap, blank name, and a foreign worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-30" at "10:00" for "Ana"
    Then the GraphQL error code is "SALON_CLOSED"
    When I create a phone booking on "2026-08-29" at "18:00" for "Ana"
    Then the GraphQL error code is "OUTSIDE_HOURS"
    When I create a phone booking on "2026-08-29" at "13:30" for "Ana"
    Then the GraphQL error code is "DURING_BREAK"
    When I create a phone booking on "2026-08-29" at "10:00" for "Ana"
    And I create a phone booking on "2026-08-29" at "10:15" for "Maja"
    Then the GraphQL error code is "SLOT_TAKEN"
    When I create a phone booking on "2026-08-29" at "11:00" for "   "
    Then the GraphQL error code is "INVALID_CALLER_NAME"
    When I create a phone booking on "2026-08-29" at "11:00" for "Ana" with no services
    Then the GraphQL error code is "INVALID_SERVICES"
    When I create a phone booking on "2026-08-29" at "11:00" for "Ana" with worker "999999"
    Then the GraphQL error code is "INVALID_WORKER"

  Scenario: Busy level includes the phone booking
    Given the salon has a service:
      """
      {"name": "Dugi tretman", "category": "HAIR", "durationMinutes": 300, "priceFeninga": 9000}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And the current time is "2026-08-29 08:00" in Sarajevo
    And I create a phone booking on "2026-08-29" at "08:00" for "Ana"
    And I query salon busy level "2026-08-29" as a guest
    Then busy level is "MEDIUM"

  Scenario: Owner cancels a phone booking before the start
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-29" at "15:00" for "Ana"
    And I cancel the phone booking
    Then the phone booking is cancelled without a late snapshot
    When I query salon trust counters
    Then salon trust counters are cancel "0" late "0" no_show "0"
    When I create a phone booking on "2026-08-29" at "15:00" for "Maja"
    Then the phone booking has no customer and no owner response

  Scenario: Cancel after the start is refused
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-29" at "09:00" for "Ana"
    And the current time is "2026-08-29 10:00" in Sarajevo
    And I cancel the phone booking
    Then the GraphQL error code is "PAST_START"

  Scenario: Another owner cannot cancel it
    Given another verified owner "other@example.com" with password "secret-pass" owns salon "Other Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-29" at "15:00" for "Ana"
    And I log in as "other@example.com" with password "secret-pass"
    And I cancel the phone booking
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: Customer cannot cancel or reschedule a phone booking
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-29" at "15:00" for "Ana"
    And I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then the GraphQL error code is "FORBIDDEN"
    When I request reschedule "2026-08-31" at "10:00"
    Then the GraphQL error code is "FORBIDDEN"

  Scenario: No-show increments the salon only
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-29" at "09:00" for "Ana"
    And the current time is "2026-08-29 10:00" in Sarajevo
    And I mark the booking as no-show
    Then mark no-show status is "CONFIRMED"
    When I query salon trust counters
    Then salon trust counters are cancel "0" late "0" no_show "1"
    And every user no_show_count is "0"
    When I mark the booking as no-show
    And I query salon trust counters
    Then salon trust counters are cancel "0" late "0" no_show "1"

  Scenario: Reminders skip a phone booking
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-31" at "10:00" for "Ana"
    And the current time is "2026-08-30 09:00" in Sarajevo
    And I send booking reminders
    Then no booking reminder exists

  Scenario: Picker and assistant origins stay distinct from phone
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the stored booking origin is "picker"
    When I upsert a new assistant intake as a guest
    And I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-09-01" at "11:00" with the salon services and the intake token
    Then the stored booking origin is "assistant"

  Scenario: Backfill marks an intake-linked row as assistant
    Given the salon has a requested booking on "2026-08-31" at "10:00" for "Ana"
    And an intake points at this booking
    When I backfill booking origins
    Then the stored booking origin is "assistant"

  Scenario: A Sarajevo phone clock is stored as UTC and read back as that clock
    When I log in as "owner@example.com" with password "secret-pass"
    And I create a phone booking on "2026-08-29" at "15:00" for "Ana"
    Then the created booking preferred start is "2026-08-29T13:00:00+00:00" stored as "2026-08-29 13:00:00"
