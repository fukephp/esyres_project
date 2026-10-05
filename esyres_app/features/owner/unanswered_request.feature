Feature: Unanswered request ends with the preferred day
  As an owner
  I want a request I never answered to leave the live boards at midnight
  So that I cannot approve it and I can see that I missed it

  Scenario: A past requested booking expires without an owner response
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-01" at "10:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query unanswered bookings for date "2026-08-01"
    Then unanswered booking names are:
      """
      ["Ana"]
      """
    When I expire unanswered bookings
    Then the stored booking status is "declined"
    And that booking decline reason is "expired"
    And that booking has no owner_responded_at
    And no customer push was sent
    And no status SMS was sent
    When I query unanswered bookings for date "2026-08-01"
    Then unanswered booking names are:
      """
      ["Ana"]
      """

  Scenario: Same-day, proposed, confirmed, and phone rows do not expire
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "08:00" for "Ena"
    And the salon has a requested booking on "2026-08-01" at "11:00" for "Mia"
    And that booking is for the salon worker
    And that booking is time proposed
    And the salon has a requested booking on "2026-08-01" at "12:00" for "Lea"
    And that booking is for the salon worker
    And that booking is confirmed
    And the salon has a phone booking on "2026-08-01" at "15:00" for service "Šišanje"
    When I log in as "owner@example.com" with password "secret-pass"
    And I expire unanswered bookings
    Then the booking for "Ena" is still "requested"
    And the booking for "Mia" is still "time_proposed"
    And the booking for "Lea" is still "confirmed"
    And the phone booking is still confirmed

  Scenario: Accept still works after the guest quarter on that day
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "08:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    Then the accepted booking status is "CONFIRMED"

  Scenario: Accept, assign, decline, and counter-propose fail after the day ends
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-01" at "10:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    Then the GraphQL error code is "EXPIRED"
    When I assign the salon worker
    Then the GraphQL error code is "EXPIRED"
    When I decline the booking
    Then the GraphQL error code is "EXPIRED"
    When I propose time "11:00" on the salon worker
    Then the GraphQL error code is "EXPIRED"
    And the stored booking status is "requested"
    And that booking has no owner_responded_at

  Scenario: Pending jump skips an aged request and still counts a past reschedule
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-01" at "10:00" for "Ana"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ena"
    And that booking is for the salon worker
    And that booking is confirmed
    And that booking has a reschedule overlay on "2026-08-01" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending jump
    Then pending jump matches:
      """
      {"count": 1, "dates": ["2026-08-01"]}
      """

  Scenario: Unanswered rows are timed soonest, then day-only oldest first
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-01" at "11:00" for "Lea"
    And the salon has a day-only requested booking on "2026-08-01" for "Mia"
    And the salon has a requested booking on "2026-08-01" at "09:00" for "Ana"
    And the salon has a day-only requested booking on "2026-08-01" for "Ena"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query unanswered bookings for date "2026-08-01"
    Then unanswered booking names are:
      """
      ["Ana", "Lea", "Mia", "Ena"]
      """
