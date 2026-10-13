import { type Locator, type Page } from '@playwright/test';

export class DashboardPage {
  readonly heading: Locator;
  readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /dashboard/i });
    this.logoutButton = page.getByRole('button', { name: /log out|sign out/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
