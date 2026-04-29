export class HomePage {
  constructor(page) {
    this.page = page;
    this.banner = page.locator(".banner");
    this.bannerMessage = page.locator(".banner__message");
    this.settingsLink = page.getByRole("link", { name: /settings/i });
  }

  async waitFor() {
    await this.banner.waitFor({ state: "visible" });
  }

  async hasSettingsLink() {
    return (await this.settingsLink.count()) > 0;
  }

  async openSettings() {
    await this.settingsLink.click();
  }

  async getMessage() {
    return this.bannerMessage.innerText();
  }

  async getAccent() {
    const cls = (await this.banner.getAttribute("class")) ?? "";
    const match = cls.match(/banner--accent-([a-z]+)/);
    return match ? match[1] : null;
  }
}
