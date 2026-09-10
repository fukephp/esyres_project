Feature: Reminder email after reschedule
  As a customer
  I want reminders to follow the occupied clock
  So that a pending overlay does not move the mail

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """

  Scenario: Overlay still reminds the original clock
    Given the salon has a requested booking on "2026-08-30" at "14:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking has a reschedule overlay on "2026-09-05" at "14:00"
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    Then 1 day reminder was sent to the booking customer
    And the last day reminder line is "Imate termin u Kosa Studio 30. 8. 2026. u 14:00."

  Scenario: Accept reschedule clears stamps for the new clock
    Given the salon has a requested booking on "2026-08-30" at "14:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking has a reschedule overlay on "2026-09-05" at "14:00"
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    And I log in as "owner@example.com" with password "secret-pass"
    And I accept the reschedule
    Then the booking reminder stamps are empty
    When the current time is "2026-09-04 09:00" in Sarajevo
    And I send booking reminders
    Then 2 day reminders were sent to the booking customer
    And the last day reminder line is "Imate termin u Kosa Studio 5. 9. 2026. u 14:00."

  Scenario: Dismiss reschedule keeps stamps
    Given the salon has a requested booking on "2026-08-30" at "14:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking has a reschedule overlay on "2026-09-05" at "14:00"
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    Then 1 day reminder was sent to the booking customer
    When I remember the booking reminder stamps
    And I log in as "owner@example.com" with password "secret-pass"
    And I dismiss the reschedule
    And I send booking reminders
    Then 1 day reminder was sent to the booking customer
    And the booking reminder stamps are unchanged
