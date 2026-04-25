export class SettingsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /banner settings/i });
    this.messageInput = page.getByLabel(/welcome message/i);
    this.saveButton = page.getByRole("button", { name: /save/i });
  }

  async waitFor() {
    await this.heading.waitFor({ state: "visible" });
  }

  async getMessage() {
    return this.messageInput.inputValue();
  }

  async setMessage(value) {
    await this.messageInput.fill(value);
  }

  async clearMessage() {
    await this.messageInput.fill("");
  }

  accentRadio(name) {
    return this.page.getByRole("radio", { name: new RegExp(`^${name}$`, "i") });
  }

  async selectAccent(name) {
    await this.accentRadio(name).check();
  }

  async getSelectedAccent() {
    for (const name of ["sky", "amber", "emerald", "rose"]) {
      if (await this.accentRadio(name).isChecked()) return name;
    }
    return null;
  }

  async isSaveEnabled() {
    return this.saveButton.isEnabled();
  }

  async save() {
    await this.saveButton.click();
  }
}
