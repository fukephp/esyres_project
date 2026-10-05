Feature: Admin gate for the first salon
  As the seeded admin
  I want a first salon to stay pending until I approve it
  So that naming a shop does not open the owner panel

  Scenario: A pending salon is not public until it is approved
    Given a verified admin "admin@esyres.test" with password "secret-pass"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "Kosa Studio"
    Then createSalon name is "Kosa Studio"
    And the created salon is pending for "ana@example.com"
    When I query the public salon as a guest
    Then the public salon is absent
    When I visit the QR for the salon
    Then I am redirected to the spa home
    When I query popularInSarajevo as a guest
    Then popularInSarajevo does not include "Kosa Studio"
    When I log in as "ana@example.com" with password "secret-pass"
    And I approve the created salon
    Then the GraphQL error code is "FORBIDDEN"
    And the created salon is pending for "ana@example.com"
    When I log in as "admin@esyres.test" with password "secret-pass"
    And I approve the created salon
    Then the created salon owner is "ana@example.com"
    And the customer owns 1 salons
    And push subscription count is 0
    When I query the public salon as a guest
    Then the public salon name is "Kosa Studio"
    When I visit the QR for the salon
    Then I am redirected to the salon profile
    When I query popularInSarajevo as a guest
    Then popularInSarajevo does not include "Kosa Studio"

  Scenario: Reject deletes the pending salon and the next name can be submitted
    Given a verified admin "admin@esyres.test" with password "secret-pass"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "Kosa Studio"
    Then createSalon name is "Kosa Studio"
    When I log in as "admin@esyres.test" with password "secret-pass"
    And I reject the created salon
    Then the pending salon was deleted
    And the user "ana@example.com" has the salon rejected flag
    And push subscription count is 0
    When I log in as "ana@example.com" with password "secret-pass"
    And I reject the created salon
    Then the GraphQL error code is "FORBIDDEN"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "Drugi"
    Then createSalon name is "Drugi"
    And the created salon is pending for "ana@example.com"
    And the user "ana@example.com" does not have the salon rejected flag

  Scenario: Overview counts and the pending list are oldest first
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Owned"
    And a verified admin "admin@esyres.test" with password "secret-pass"
    And a verified customer "ana@example.com" with password "secret-pass"
    And the customer "ana@example.com" is named "Ana Kovač"
    And another verified customer "lea@example.com" with password "secret-pass"
    And the customer "lea@example.com" is named "Lea"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "Kosa"
    Then createSalon name is "Kosa"
    When I log in as "lea@example.com" with password "secret-pass"
    And I create a salon named "Nokti"
    Then createSalon name is "Nokti"
    When I log in as "admin@esyres.test" with password "secret-pass"
    And I query admin overview
    Then admin overview is pending 2 owned 1 bookings 0
    When I query pending salons
    Then pending salon rows are:
      """
      [{"personName":"Ana Kovač","name":"Kosa"},{"personName":"Lea","name":"Nokti"}]
      """

  Scenario: A later salon is owned immediately
    Given a verified admin "admin@esyres.test" with password "secret-pass"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a salon named "Prvi"
    Then createSalon name is "Prvi"
    When I log in as "admin@esyres.test" with password "secret-pass"
    And I approve the created salon
    Then the created salon owner is "ana@example.com"
    When I log in as "ana@example.com" with password "secret-pass"
    And I add a salon with:
      """
      {"name": "Drugi", "address": "Ferhadija 12"}
      """
    Then addSalon name is "Drugi" and address is "Ferhadija 12"
    And the customer owns 2 salons

  Scenario: Admin cannot book, save, or rate
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And a verified admin "admin@esyres.test" with password "secret-pass"
    When I log in as "admin@esyres.test" with password "secret-pass"
    And I create a booking on "2026-08-29" at "10:00" with no services
    Then the GraphQL error code is "FORBIDDEN"
    When I attempt to save the salon as a favorite
    Then the GraphQL error code is "FORBIDDEN"
    When I attempt to rate the salon
    Then the GraphQL error code is "FORBIDDEN"
