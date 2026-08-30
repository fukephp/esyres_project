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

  Scenario: Category keeps salons with a matching service
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Hair Shop"
    And the salon is at lat "43.8563" lng "18.4131"
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    And that owner also owns salon "Makeup Shop" at lat "43.8600" lng "18.4200"
    And the salon has a service:
      """
      {"name": "Šminka", "category": "MAKE_UP", "durationMinutes": 45, "priceFeninga": 4000}
      """
    And that owner also owns salon "Empty" at lat "43.8500" lng "18.4000"
    When I query popularInSarajevo with:
      """
      {"category": "HAIR"}
      """
    Then the listed salon names are:
      """
      ["Hair Shop"]
      """
    When I query salonsNearby lat "43.8563" lng "18.4131" with:
      """
      {"category": "HAIR"}
      """
    Then the listed salon names are:
      """
      ["Hair Shop"]
      """

  Scenario: Nearby category still omits salons without coordinates and stays nearest first
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Near Hair"
    And the salon is at lat "43.8563" lng "18.4131"
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    And that owner also owns salon "Far Hair" at lat "44.7722" lng "17.1910"
    And the salon has a service:
      """
      {"name": "Boja", "category": "HAIR", "durationMinutes": 60, "priceFeninga": 5000}
      """
    And that owner also owns salon "Hidden Hair"
    And the salon has a service:
      """
      {"name": "Fen", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2000}
      """
    When I query salonsNearby lat "43.8563" lng "18.4131" with:
      """
      {"category": "HAIR"}
      """
    Then the listed salon names are:
      """
      ["Near Hair", "Far Hair"]
      """

  Scenario: Name matches salon name not service name
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Ana Hair"
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    And that owner also owns salon "Studio"
    And the salon has a service:
      """
      {"name": "Ana Cut", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    When I query popularInSarajevo with:
      """
      {"name": "ana"}
      """
    Then the listed salon names are:
      """
      ["Ana Hair"]
      """

  Scenario: Category and name apply together
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Ana Hair"
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    And that owner also owns salon "Ana Makeup"
    And the salon has a service:
      """
      {"name": "Šminka", "category": "MAKE_UP", "durationMinutes": 45, "priceFeninga": 4000}
      """
    And that owner also owns salon "Bob Hair"
    And the salon has a service:
      """
      {"name": "Fen", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2000}
      """
    When I query popularInSarajevo with:
      """
      {"category": "HAIR", "name": "Ana"}
      """
    Then the listed salon names are:
      """
      ["Ana Hair"]
      """

  Scenario: Empty name is ignored
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Near"
    And that owner also owns salon "Far"
    When I query popularInSarajevo with:
      """
      {"name": "   "}
      """
    Then the listed salon names are:
      """
      ["Near", "Far"]
      """

  Scenario: Category filter is paged after matching
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Hair One"
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    And that owner also owns salon "Makeup Shop"
    And the salon has a service:
      """
      {"name": "Šminka", "category": "MAKE_UP", "durationMinutes": 45, "priceFeninga": 4000}
      """
    And that owner also owns salon "Hair Two"
    And the salon has a service:
      """
      {"name": "Boja", "category": "HAIR", "durationMinutes": 60, "priceFeninga": 5000}
      """
    When I query popularInSarajevo with:
      """
      {"category": "HAIR", "limit": 1, "offset": 0}
      """
    Then the listed salon names are:
      """
      ["Hair One"]
      """
    When I query popularInSarajevo with:
      """
      {"category": "HAIR", "limit": 1, "offset": 1}
      """
    Then the listed salon names are:
      """
      ["Hair Two"]
      """
