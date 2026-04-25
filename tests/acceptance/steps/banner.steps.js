import { createBdd } from "playwright-bdd";
import { test, expect } from "../fixtures.js";
import { HomePage } from "../pages/HomePage.js";
import { SettingsPage } from "../pages/SettingsPage.js";

const { Given, When, Then } = createBdd(test);

const NEW_MESSAGE = "All hands on Friday at 10";

function pickDifferentAccent(current) {
  const palette = ["sky", "amber", "emerald", "rose"];
  return palette.find((name) => name !== current) ?? "amber";
}

Given("I am on the home page", async ({ page }) => {
  const home = new HomePage(page);
  await home.waitFor();
});

When("I navigate to settings", async ({ page }) => {
  const home = new HomePage(page);
  await home.openSettings();
  const settings = new SettingsPage(page);
  await settings.waitFor();
});

When("I update the welcome message", async ({ page, state }) => {
  const settings = new SettingsPage(page);
  state.expectedMessage = NEW_MESSAGE;
  await settings.setMessage(NEW_MESSAGE);
});

When("I clear the welcome message", async ({ page }) => {
  const settings = new SettingsPage(page);
  await settings.clearMessage();
});

When("I select a different accent colour", async ({ page, state }) => {
  const settings = new SettingsPage(page);
  const current = await settings.getSelectedAccent();
  const target = pickDifferentAccent(current);
  state.expectedAccent = target;
  await settings.selectAccent(target);
});

When("I save my changes", async ({ page }) => {
  const settings = new SettingsPage(page);
  await settings.save();
});

Then("I am back on the home page", async ({ page }) => {
  const home = new HomePage(page);
  await home.waitFor();
});

Then("the home page displays the updated message", async ({ page, state }) => {
  const home = new HomePage(page);
  expect(await home.getMessage()).toBe(state.expectedMessage);
});

Then("the home page reflects the new accent", async ({ page, state }) => {
  const home = new HomePage(page);
  expect(await home.getAccent()).toBe(state.expectedAccent);
});

Then("I cannot save my changes", async ({ page }) => {
  const settings = new SettingsPage(page);
  expect(await settings.isSaveEnabled()).toBe(false);
});

Then(
  "the navigation does not contain a link to the settings",
  async ({ page }) => {
    const home = new HomePage(page);
    expect(await home.hasSettingsLink()).toBe(false);
  },
);
