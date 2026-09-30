Feature: Guest quarter starts
  As a customer
  I want to see which quarter starts are Zauzet
  So that I ask for a time the salon can still take

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
    And the salon has a service:
      """
      {"name": "Farbanje", "category": "HAIR", "durationMinutes": 45, "priceFeninga": 4000}
      """

  Scenario: Guest reads quarter starts with no login
    When I query quarter starts on "2026-08-31" for the salon services
    Then quarter start "10:00" is free
    And quarter start "11:45" is free
    And quarter start "12:00" is absent
    And quarter start "14:00" is free
    And quarter start "18:45" is free
    And quarter start "19:00" is absent
    And quarter starts have no customer fields

  Scenario: A salon with no workers does not mark starts Zauzet
    When I query quarter starts on "2026-08-31" for the salon services
    Then quarter start "10:00" is free

  Scenario: Closed day and unknown salon and a foreign worker return no starts
    When I query quarter starts on "2026-09-06" for the salon services
    Then quarter starts are empty
    When I query quarter starts on "2026-08-31" for an unknown salon
    Then quarter starts are empty
    When I query quarter starts on "2026-13-40" for the salon services
    Then quarter starts are empty
    When I query quarter starts on "2026-08-31" for the salon services with no services
    Then quarter starts are empty
    Given another verified owner "other@example.com" with password "secret-pass" owns salon "Drugi"
    And the other salon has a worker:
      """
      {"name": "Mia"}
      """
    When I query quarter starts on "2026-08-31" for the salon services and the other salon worker
    Then quarter starts are empty

  Scenario: Rounded duration marks a start Zauzet that the raw sum would leave free
    Given the salon has a worker:
      """
      {"name": "Ana"}
      """
    And the salon has a requested booking on "2026-08-31" at "19:50" for "Lejla"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking lasts 15 minutes
    And the salon has a service:
      """
      {"name": "Kratko", "category": "HAIR", "durationMinutes": 20, "priceFeninga": 1000}
      """
    When I query quarter starts on "2026-08-31" for service "Kratko" and worker "Ana"
    Then quarter start "19:15" is free
    And quarter start "19:30" is booked

  Scenario: A requested row does not make a start Zauzet
    Given the salon has a worker:
      """
      {"name": "Ana"}
      """
    And the salon has a requested booking on "2026-08-31" at "10:00" for "Lejla"
    And that booking is for the salon worker
    When I query quarter starts on "2026-08-31" for the salon services and worker "Ana"
    Then quarter start "10:00" is free

  Scenario: Named worker is Zauzet on overlap and free when the next range starts
    Given the salon has a worker:
      """
      {"name": "Ana"}
      """
    And the salon has a requested booking on "2026-08-31" at "10:00" for "Lejla"
    And that booking is for the salon worker
    And that booking is confirmed
    When I query quarter starts on "2026-08-31" for service "Šišanje" and worker "Ana"
    Then quarter start "10:00" is booked
    And quarter start "10:15" is booked
    And quarter start "10:30" is free

  Scenario: No preference is Zauzet only when every worker is blocked
    Given the salon has a worker:
      """
      {"name": "Ana"}
      """
    And the salon has a requested booking on "2026-08-31" at "10:00" for "Lejla"
    And that booking is for the salon worker
    And that booking is confirmed
    When I query quarter starts on "2026-08-31" for service "Šišanje"
    Then quarter start "10:00" is booked
    Given the salon has a worker:
      """
      {"name": "Ena"}
      """
    When I query quarter starts on "2026-08-31" for service "Šišanje"
    Then quarter start "10:00" is free
    When I query quarter starts on "2026-08-31" for service "Šišanje" and worker "Ana"
    Then quarter start "10:00" is booked

  Scenario: A counter-proposal occupies the proposed clock
    Given the salon has a worker:
      """
      {"name": "Ana"}
      """
    And the salon has a requested booking on "2026-08-31" at "10:00" for "Lejla"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-31" at "11:00"
    When I query quarter starts on "2026-08-31" for service "Šišanje" and worker "Ana"
    Then quarter start "10:00" is free
    And quarter start "11:00" is booked
    And quarter start "11:30" is free
