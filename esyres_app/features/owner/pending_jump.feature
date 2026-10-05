Feature: Owner pending jump
  As an owner
  I want the count and days of every pending row
  So Zahtjevi can jump to the earliest pending day

  Scenario: Empty salon has count zero
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending jump
    Then pending jump matches:
      """
      {"count": 0, "dates": []}
      """

  Scenario: Count is rows and dates are distinct days earliest first
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "10:00" for "Ena"
    And the salon has a requested booking on "2026-08-29" at "09:00" for "Ana"
    And the salon has a requested booking on "2026-08-30" at "11:00" for "Mia"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending jump
    Then pending jump matches:
      """
      {"count": 3, "dates": ["2026-08-29", "2026-08-30"]}
      """

  Scenario: Reschedule overlay counts on the overlay day
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is confirmed
    And that booking has a reschedule overlay on "2026-08-31" at "14:00"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending jump
    Then pending jump matches:
      """
      {"count": 1, "dates": ["2026-08-31"]}
      """

  Scenario: Only pending pile rows count
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "09:00" for "Ana"
    And the salon has a requested booking on "2026-08-30" at "10:00" for "Ena"
    And that booking is declined
    And the salon has a requested booking on "2026-08-30" at "11:00" for "Mia"
    And that booking is cancelled
    And the salon has a requested booking on "2026-08-30" at "12:00" for "Lea"
    And that booking is confirmed
    And the salon has a requested booking on "2026-08-30" at "13:00" for "Iva"
    And that booking is for the salon worker
    And that booking is time proposed
    And the salon has a phone booking on "2026-08-30" at "15:00" for service "Šišanje"
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Other"
    And the other salon has a requested booking on "2026-08-29" at "09:00" for "Bob"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending jump
    Then pending jump matches:
      """
      {"count": 1, "dates": ["2026-08-29"]}
      """

  Scenario: Guest cannot read pending jump
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    When I query pending jump as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Other user cannot read pending jump
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Test Salon"
    And another verified user "other@example.com" with password "secret-pass"
    When I log in as "other@example.com" with password "secret-pass"
    And I query pending jump
    Then the GraphQL error code is "FORBIDDEN"
