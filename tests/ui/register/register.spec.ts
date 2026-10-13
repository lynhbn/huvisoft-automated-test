import { expect, test } from '../../fixtures/custom.fixture';
import { uniqueEmail } from '../../../src/utils/common.utils';

test.describe('Register screen', () => {
  test('displays the registration form', async ({ registerPage }) => {
    await registerPage.goto();
    await expect(registerPage.submitButton).toBeVisible();
  });

  test.skip('registers a new user', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.register(uniqueEmail(), 'ExamplePassword123!');
  });
});
