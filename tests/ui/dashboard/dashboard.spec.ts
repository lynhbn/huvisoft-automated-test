import { expect, test } from '../../fixtures/custom.fixture';

test.describe('Dashboard screen', () => {
  test('displays the dashboard for an authenticated user', async ({
    dashboardPage,
    loginPage,
  }) => {
    const { USERNAME, PASSWORD } = process.env;

    if (!USERNAME || !PASSWORD) {
      throw new Error(
        'USERNAME and PASSWORD must be configured in the active .env.<environment> file.',
      );
    }

    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);

    await expect(dashboardPage.heading).toBeVisible();
  });
});
