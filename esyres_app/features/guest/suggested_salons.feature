Feature: Suggested salons
  As a customer
  I want a few salons that match services I already booked
  So that my profile can point me at them

  Scenario: No bookings means no suggestions
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I read suggested salons
    Then suggested salon names are ""

  Scenario: Suggestions match the chip, skip a live booking and a favorite, ignore an unkeyed category, and stop at three
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Booked"
    And the salon is listed
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-10-10" at "10:00" with the salon services
    Then the booking status is "REQUESTED"
    Given a listed hair salon named "Echo"
    And a listed hair salon named "Delta"
    And a listed hair salon named "Charlie"
    And a listed hair salon named "Bravo"
    And a listed hair salon named "Kept"
    And a listed unkeyed salon named "Plain"
    When I save the listed salon "Kept" as a favorite
    And I read suggested salons
    Then suggested salon names are "Bravo,Charlie,Delta"
