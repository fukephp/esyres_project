Feature: Customer status push and SMS fallback
  As a customer
  I want a web push for time-critical status, and SMS if push misses
  So that I do not miss a proposed, confirmed, or declined booking

  Scenario: Propose pushes a subscribed customer
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And the booking customer subscribes to push
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    Then the last customer push type is "time_proposed"
    And no status SMS was sent
    And no owner push was sent

  Scenario: Accept and decline push a subscribed customer
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And the booking customer subscribes to push
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    Then the last customer push type is "confirmed"
    And no status SMS was sent

  Scenario: Decline pushes a subscribed customer
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And the booking customer subscribes to push
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking
    Then the last customer push type is "declined"
    And no status SMS was sent

  Scenario: No subscription sends SMS
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    Then no customer push was sent
    And the last status SMS is "Predloženo vrijeme. Kosa Studio."

  Scenario: Accept miss sends SMS
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    When I log in as "owner@example.com" with password "secret-pass"
    And I accept the preferred time
    Then no customer push was sent
    And the last status SMS is "Potvrđeno. Kosa Studio."

  Scenario: Decline miss sends SMS without the reason
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    When I log in as "owner@example.com" with password "secret-pass"
    And I decline the booking with reason "Zauzeto"
    Then no customer push was sent
    And the last status SMS is "Odbijeno. Kosa Studio."

  Scenario: Failed push send falls back to SMS
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And the booking customer subscribes to push
    And the next push send fails
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    Then no customer push was sent
    And the last status SMS is "Predloženo vrijeme. Kosa Studio."

  Scenario: Unverified phone does not get SMS
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon is open saturday from "09:00" to "17:00"
    And the salon has a worker:
      """
      {"name": "Lejla"}
      """
    And the salon has a requested booking on "2026-08-29" at "11:00" for "Ana"
    And that booking is for the salon worker
    And the booking customer's phone is not verified
    When I log in as "owner@example.com" with password "secret-pass"
    And I propose time "14:00" on the salon worker
    Then no customer push was sent
    And no status SMS was sent
