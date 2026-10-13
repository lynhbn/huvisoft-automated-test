import { expect, test } from '../../fixtures/custom.fixture';

test.describe('Login screen', () => {
  test('displays the login form', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.submitButton).toBeVisible();
  });
});
