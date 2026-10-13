# Huvisoft Automation

Automation test project sử dụng Playwright + TypeScript, tổ chức theo **Page Object Model (POM)**. 

## Yêu cầu

- Node.js phiên bản LTS (khuyến nghị Node.js 20 trở lên).
- npm (được cài cùng Node.js).
- Quyền truy cập vào môi trường cần test (dev hoặc production).

## Cài đặt lần đầu

Tại thư mục gốc của dự án, cài package, tải browser Playwright và tạo file cấu hình môi trường:

```bash
npm install
npx playwright install
cp .env.dev.example .env.dev
cp .env.prod.example .env.prod
```

Không commit lên Git các file `.env.*` chứa URL nội bộ hoặc thông tin nhạy cảm. Khi chạy test, `TEST_ENV` quyết định file cấu hình được nạp; nếu không khai báo, dự án dùng `dev`.

## Fixtures dùng chung

Các test UI import `test` từ `tests/fixtures/custom.fixture.ts`. Fixture `loginPage`, `registerPage` và `dashboardPage` cung cấp sẵn page object tương ứng, không cần khởi tạo lại trong từng test.

```ts
import { expect, test } from '../../fixtures/custom.fixture';

test('displays the dashboard', async ({ dashboardPage }) => {
  await dashboardPage.goto();
  await expect(dashboardPage.heading).toBeVisible();
});
```

## Chạy test

### Chọn môi trường

Các lệnh dưới đây dùng cú pháp terminal. `TEST_ENV` chỉ có hiệu lực cho lệnh được đặt cùng dòng.

```bash
# Dev (mặc định)
npm test

# Dev, khai báo tường minh
TEST_ENV=dev npm test

# Production
TEST_ENV=prod npm test
```

### Scripts có sẵn

| Lệnh | Chế độ chạy | Khi nên dùng |
| --- | --- | --- |
| `npm test` | Chạy toàn bộ test ở chế độ headless trên Chromium. | Chạy regression hoặc kiểm tra nhanh trước khi commit. |
| `npm run test:headed` | Chạy toàn bộ test với cửa sổ trình duyệt hiển thị. | Quan sát thao tác UI hoặc điều tra lỗi. |
| `npm run test:ui` | Mở Playwright UI Mode để chọn test, chạy lại và xem kết quả tương tác. | Viết/debug test cục bộ. |
| `npm run report` | Mở HTML report của lần chạy gần nhất. | Xem pass/fail, screenshot, video hoặc trace đã được lưu. |
| `npm run codegen -- <url>` | Mở Playwright Codegen với URL chỉ định để ghi lại thao tác và gợi ý locator. | Khám phá màn hình mới; cần tinh gọn mã sinh ra trước khi dùng. |

Ví dụ chạy Codegen theo môi trường dev:

```bash
npm run codegen -- https://dev.example.com/login
```

### Chạy một phần test và các chế độ hỗ trợ khác

Các lệnh sau truyền tham số trực tiếp cho Playwright. Thêm `TEST_ENV=prod` ở đầu lệnh khi cần chạy production, ví dụ `TEST_ENV=prod npx playwright test tests/ui/login`.

```bash
# Chạy một file test
npx playwright test tests/ui/login/login.spec.ts

# Chạy toàn bộ test của một màn hình/thư mục
npx playwright test tests/ui/login

# Chạy test có tên khớp chuỗi hoặc biểu thức chính quy
npx playwright test --grep "displays the login form"

# Chạy test bị fail ở lần chạy trước
npx playwright test --last-failed

# Chạy ở chế độ debug: dừng trước mỗi thao tác để kiểm tra locator
npx playwright test --debug

# Chạy headful một test cụ thể
npx playwright test tests/ui/login/login.spec.ts --headed

# Mở trace đã lưu (trace chỉ được tạo ở lần retry đầu tiên theo config hiện tại)
npx playwright show-trace test-results/<duong-dan-den-trace>.zip
```

Hiện cấu hình chỉ khai báo project `chromium`, do đó các lệnh chạy trên đều chạy bằng Chromium. Các artifact khi test thất bại được Playwright lưu theo cấu hình: screenshot và video cho test fail; trace ở lần retry đầu tiên. Sau khi chạy test, dùng `npm run report` để xem report HTML.

## Cấu trúc dự án

```text
src/
  pages/                  # Page object: locator, thao tác, assertion dùng lại
    login.page.ts
    register.page.ts
    dashboard.page.ts
  fixtures/               # Playwright fixtures tái sử dụng page object
    custom.fixture.ts
  utils/                  # Hàm dùng chung, ví dụ tạo dữ liệu duy nhất hoặc đọc CSV
tests/
  ui/
    login/                # Test được nhóm theo màn hình/chức năng
      login.spec.ts
    register/
      register.spec.ts
playwright.config.ts       # Cấu hình Playwright, môi trường, browser, artifact
.env.dev                   # URL môi trường dev (tạo cục bộ)
.env.prod                  # URL môi trường production (tạo cục bộ)
```

Các page object mẫu hiện có selector và đường dẫn mang tính ví dụ. Hãy kiểm tra giao diện thật và cập nhật selector trước khi bật các test nghiệp vụ đang được `test.skip`.

## Thêm test cho một màn hình mới

Ví dụ cần thêm test cho màn hình **Profile** có đường dẫn `/profile`. Quy trình đề xuất gồm các bước:

### 1. Khảo sát locator

Ưu tiên locator ổn định theo thứ tự sau:

1. `getByRole(...)` kèm tên truy cập được (accessible name).
2. `getByLabel(...)` cho input có label.
3. `getByTestId(...)` nếu ứng dụng cung cấp `data-testid`.
4. `getByText(...)` khi nội dung hiển thị là ổn định.

Nếu vẫn không ổn định, sử dụng xpath để chọc thẳng vào element cần tương tác

### 2. Tạo page object

Tạo file `src/pages/profile.page.ts`. Page object chỉ nên chứa locator, thao tác và assertion liên quan trực tiếp đến màn hình; không đặt kịch bản nghiệp vụ dài trong file này.

```ts
import { type Locator, type Page } from '@playwright/test';

export class ProfilePage {
  readonly heading: Locator;
  readonly displayNameInput: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /profile/i });
    this.displayNameInput = page.getByLabel(/display name/i);
    this.saveButton = page.getByRole('button', { name: /save/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/profile');
  }

  async updateDisplayName(name: string): Promise<void> {
    await this.displayNameInput.fill(name);
    await this.saveButton.click();
  }
}
```

Nếu một thao tác chuyển sang màn hình khác, phương thức có thể trả về page object của màn hình đích. Nếu cần đăng nhập trước khi vào Profile, hãy tái sử dụng `LoginPage` hoặc bổ sung fixture/helper dùng chung thay vì lặp lại locator đăng nhập trong từng spec.

### 3. Tạo custom fixture cho màn hình

Thêm `ProfilePage` vào `tests/fixtures/custom.fixture.ts` để mỗi test nhận được page object đã khởi tạo sẵn. Bổ sung import, type fixture và implementation như sau:

```ts
import { ProfilePage } from '../../src/pages/profile.page';

type PageFixtures = {
  // Các fixture hiện có...
  profilePage: ProfilePage;
};

export const test = base.extend<PageFixtures>({
  // Các fixture hiện có...
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
});
```

Fixture chỉ chịu trách nhiệm khởi tạo dependency dùng lại. Nếu Profile yêu cầu trạng thái đã đăng nhập, hãy chuẩn bị trạng thái này trong `beforeEach` hoặc bằng fixture chuyên biệt của luồng xác thực.

### 4. Tạo file spec theo màn hình

Tạo thư mục `tests/ui/profile` và file `tests/ui/profile/profile.spec.ts`. Mỗi `test` cần độc lập: tự chuẩn bị trạng thái cần thiết và không phụ thuộc thứ tự chạy, vì cấu hình hiện tại cho phép chạy song song.

```ts
import { expect, test } from '../../fixtures/custom.fixture';

test.describe('Profile screen', () => {
  test('displays the profile form', async ({ profilePage }) => {
    await profilePage.goto();
    await expect(profilePage.heading).toBeVisible();
  });

  test('updates the display name', async ({ profilePage, page }) => {
    await profilePage.goto();

    await profilePage.updateDisplayName('Automation User');
    await expect(page.getByText(/profile updated successfully/i)).toBeVisible();
  });
});
```

Thay đường dẫn, locator và thông báo thành công trong ví dụ bằng giá trị của ứng dụng thực tế. Nếu luồng chưa có tài khoản/dữ liệu test phù hợp, dùng `test.skip('Lý do cần chuẩn bị dữ liệu', ...)` tạm thời; không để test đang chạy với thông tin đăng nhập giả.

### 5. Chạy, kiểm tra và hoàn thiện

```bash
# Chạy riêng màn hình mới trên dev
npx playwright test tests/ui/profile

# Quan sát trình duyệt khi debug
npx playwright test tests/ui/profile --headed

# Mở giao diện debug tương tác
npm run test:ui

# Xem bằng chứng nếu có lỗi
npm run report
```

Khi test fail, xem thứ tự ưu tiên: URL/`BASE_URL`, dữ liệu và quyền của tài khoản, locator, rồi mới đến timeout. Dùng screenshot, video và trace trong report để xác định nguyên nhân; không thêm `waitForTimeout` cố định trừ khi không còn lựa chọn đồng bộ đáng tin cậy.

## Quy ước viết test

- Đặt tên file là `<ten-man-hinh>.spec.ts`, page object là `<ten-man-hinh>.page.ts`.
- Đặt tên test theo hành vi mong đợi, ví dụ `updates the display name`, thay vì tên kỹ thuật như `test profile 1`.
- Dùng assertion Playwright (`await expect(...)`) để chờ trạng thái giao diện; không dùng `sleep`/`waitForTimeout` để chờ tùy ý.
- Giữ secret, mật khẩu và URL nội bộ trong `.env` hoặc secret của CI, không hard-code trong spec.
- Chạy riêng file mới trước, sau đó chạy `npm test` để phát hiện ảnh hưởng đến toàn bộ suite.
