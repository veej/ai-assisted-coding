Feature: Configurable home banner
  As an admin
  I want to set the welcome message and accent
  So that signed-in users see a customized homepage

  @adminLogin @R.1
  Scenario: Admin updates the banner message
    Given I am on the home page
    When I navigate to settings
    And I update the welcome message
    And I save my changes
    Then I am back on the home page
    And the home page displays the updated message

  @adminLogin @R.1
  Scenario: An empty message cannot be saved
    Given I am on the home page
    When I navigate to settings
    And I clear the welcome message
    Then I cannot save my changes

  @adminLogin @R.2
  Scenario: Admin changes the accent colour
    Given I am on the home page
    When I navigate to settings
    And I select a different accent colour
    And I save my changes
    Then I am back on the home page
    And the home page reflects the new accent

  @userLogin @R.3
  Scenario: A regular user does not see the settings link
    Given I am on the home page
    Then the navigation does not contain a link to the settings
