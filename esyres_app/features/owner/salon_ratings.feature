Feature: Owner salon ratings
  As a salon owner
  I want to read ratings on salon edit
  So that I can see what guests wrote

  Scenario: The owner sees newest ratings and another owner cannot
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Studio"
    And the salon has a rating 4 from "Ana" saying "Dobro"
    And the salon has a rating 5 from "Lejla" saying "Odlicno"
    And that rating has a reply "Slažem se" from "Mia"
    And another verified owner "other@example.com" with password "secret-pass" owns salon "Drugi"
    When I log in as "owner@example.com" with password "secret-pass"
    And I read owner ratings
    Then the owner rating names are "Lejla,Ana"
    When I log in as "other@example.com" with password "secret-pass"
    And I read owner ratings
    Then the GraphQL error code is "FORBIDDEN"
