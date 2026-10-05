@salon
Feature: Favorite salon
  As a customer
  I want to bookmark one salon
  So that I can find it again from my profile

  Scenario: An unverified customer saves and unsaves without a QR scan
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Studio"
    And a customer "ana@example.com" with password "secret-pass" with no verifications
    When I log in as "ana@example.com" with password "secret-pass"
    And I save the salon as a favorite
    Then the customer has 1 favorite rows
    And the salon has 0 QR scan rows
    When I unsave the salon favorite
    Then the customer has 0 favorite rows
    And the salon has 0 QR scan rows

  Scenario: Favorite names are alphabetical
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Zeta"
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Alfa"
    And a customer "ana@example.com" with password "secret-pass" with no verifications
    When I log in as "ana@example.com" with password "secret-pass"
    And I save the salon as a favorite
    And I save the other salon as a favorite
    And I read my favorite salon names
    Then my favorite salon names are "Alfa,Zeta"
