Feature: Guest salon discovery
  As a customer
  I want to see salons near me without logging in
  And a Popular in Sarajevo list when location is unavailable
  So that I never hit a blank home screen

  Scenario: Nearby returns geocoded salons nearest first
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Near"
    And the salon is at lat "43.8563" lng "18.4131"
    And that owner also owns salon "Far" at lat "44.7722" lng "17.1910"
    And that owner also owns salon "Hidden"
    When I query salonsNearby lat "43.8563" lng "18.4131" as a guest
    Then the listed salon names are:
      """
      ["Near", "Far"]
      """

  Scenario: Invalid coordinates are rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Near"
    And the salon is at lat "43.8563" lng "18.4131"
    When I query salonsNearby lat "91" lng "0" as a guest
    Then the GraphQL error code is "INVALID_COORDINATES"

  Scenario: Nearby limit above the cap is rejected
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Near"
    And the salon is at lat "43.8563" lng "18.4131"
    When I query salonsNearby lat "43.8563" lng "18.4131" limit "51" offset "0" as a guest
    Then the GraphQL error code is "INVALID_PAGE"

  Scenario: Nearby respects limit and offset
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Near"
    And the salon is at lat "43.8563" lng "18.4131"
    And that owner also owns salon "Far" at lat "44.7722" lng "17.1910"
    When I query salonsNearby lat "43.8563" lng "18.4131" limit "1" offset "0" as a guest
    Then the listed salon names are:
      """
      ["Near"]
      """
    When I query salonsNearby lat "43.8563" lng "18.4131" limit "1" offset "1" as a guest
    Then the listed salon names are:
      """
      ["Far"]
      """

  Scenario: Popular includes salons without coordinates in id order
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Near"
    And the salon is at lat "43.8563" lng "18.4131"
    And that owner also owns salon "Far" at lat "44.7722" lng "17.1910"
    And that owner also owns salon "Hidden"
    When I query popularInSarajevo as a guest
    Then the listed salon names are:
      """
      ["Near", "Far", "Hidden"]
      """

  Scenario: Popular page cap is rejected
    When I query popularInSarajevo limit "51" offset "0" as a guest
    Then the GraphQL error code is "INVALID_PAGE"
