Feature: Customer reminder email
  As a customer
  I want a reminder email before my appointment
  So that I do not forget it

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """

  Scenario: Day-before mail at 09:00 on D-1
    Given the salon has a requested booking on "2026-08-30" at "14:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    Then 1 day reminder was sent to the booking customer
    And 0 hour reminders were sent to the booking customer
    And the last day reminder subject is "Podsjetnik: Kosa Studio sutra"
    And the last day reminder line is "Imate termin u Kosa Studio 30. 8. 2026. u 14:00."
    And the booking day reminder stamp is set
    When I remember the booking reminder stamps
    And I send booking reminders
    Then 1 day reminder was sent to the booking customer
    And 0 hour reminders were sent to the booking customer
    And the booking reminder stamps are unchanged

  Scenario: Hour-before mail at T-60
    Given the salon has a requested booking on "2026-08-30" at "14:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    And the current time is "2026-08-30 13:00" in Sarajevo
    And I send booking reminders
    Then 1 day reminder was sent to the booking customer
    And 1 hour reminder was sent to the booking customer
    And the last hour reminder subject is "Podsjetnik: Kosa Studio za sat vremena"
    And the last hour reminder line is "Imate termin u Kosa Studio 30. 8. 2026. u 14:00."
    And the booking hour reminder stamp is set
    When I remember the booking reminder stamps
    And I send booking reminders
    Then 1 hour reminder was sent to the booking customer
    And the booking reminder stamps are unchanged

  Scenario: Same-day confirm skips day-before and still sends hour-before
    Given the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    Then no booking reminder was sent
    When the current time is "2026-08-29 10:00" in Sarajevo
    And I send booking reminders
    Then 0 day reminders were sent to the booking customer
    And 1 hour reminder was sent to the booking customer

  Scenario: Confirm 30 minutes before start still gets hour-before
    Given the salon has a requested booking on "2026-08-29" at "09:30" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    Then 0 day reminders were sent to the booking customer
    And 1 hour reminder was sent to the booking customer

  Scenario: Past start sends nothing
    Given the salon has a requested booking on "2026-08-29" at "08:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    Then no booking reminder was sent

  Scenario: Non-confirmed rows in the day-before window get no mail
    Given the salon has a requested booking on "2026-08-30" at "14:00" for "Ana"
    And that booking is for the salon worker
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    Then no booking reminder was sent
    Given that booking is time proposed
    When I send booking reminders
    Then no booking reminder was sent
    Given that booking is declined
    When I send booking reminders
    Then no booking reminder was sent
    Given the salon has a requested booking on "2026-08-30" at "15:00" for "Berta"
    And that booking is for the salon worker
    And that booking is cancelled
    When I send booking reminders
    Then no booking reminder was sent to customer "Berta"
    Given the salon has a requested booking on "2026-08-30" at "16:00" for "Cira"
    And that booking is for the salon worker
    And that booking is confirmed
    When I send booking reminders
    Then a day reminder was sent to customer "Cira"
    And no booking reminder was sent to customer "Berta"

  Scenario: Unverified email gets no reminder
    Given the salon has a requested booking on "2026-08-30" at "14:00" for "Ana"
    And that booking is for the salon worker
    And that booking is confirmed
    And the booking customer email is unverified
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    Then no booking reminder was sent
    And the booking reminder stamps are empty

  Scenario: Accept preferred time does not send until the command runs
    Given the salon has a requested booking on "2026-08-30" at "14:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    Then no booking reminder was sent
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    Then 1 day reminder was sent to the booking customer

  Scenario: Confirm proposed time does not send until the command runs
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-29" at "11:00"
    And that booking is for the salon worker
    And that booking is time proposed at "2026-08-30" at "14:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I confirm the proposed time
    Then no booking reminder was sent
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    Then 1 day reminder was sent to the booking customer

  Scenario: Cancel does not send a reminder
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-30" at "14:00"
    And that booking is for the salon worker
    And that booking is confirmed
    When I log in as "ana@example.com" with password "secret-pass"
    And I cancel the booking
    Then no booking reminder was sent
    When the current time is "2026-08-29 09:00" in Sarajevo
    And I send booking reminders
    Then no booking reminder was sent
