Feature: Local demo seed
  As a founder running the PWA locally
  I want provisioned owners, salons, and bookings
  So that I can log in as owner and customer and see data

  Scenario: Database seeder refuses non-local environments
    When I run the database seeder
    Then the database seeder is rejected as not local

  Scenario: Local demo seeder fills click-through data
    When I run the local demo seeder
    Then the local demo catalog matches the story
