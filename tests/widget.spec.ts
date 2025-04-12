import { test, expect } from '@playwright/test';
import { WidgetPage } from "./widget.page";

test.describe('Uchi.ru Widget Tests', () => {
  let widgetPage: WidgetPage;
  const COOKIE_BUTTON_SELECTOR = '._UCHI_COOKIE__button';

  test.beforeEach(async ({ page }) => {
    widgetPage = new WidgetPage(page);

    // Открываем главную страницу с ожиданием полной загрузки
    await page.goto('https://uchi.ru/', { waitUntil: 'networkidle' });

    // Надежное закрытие попапа cookies
    const cookieButton = page.locator(COOKIE_BUTTON_SELECTOR);
    await cookieButton.waitFor({ state: 'visible', timeout: 10000 });
    await cookieButton.click();
    await cookieButton.waitFor({ state: 'hidden', timeout: 5000 });
  });

  test('Widget should open successfully', async () => {
    await widgetPage.openWidget();
    await expect(widgetPage.getWidgetBody()).toBeVisible({ timeout: 15000 });
  });

  test('Support contact form should display correct title', async () => {
    await widgetPage.openWidget();

    // Проверяем наличие статей
    const articles = await widgetPage.getPopularArticles();
    await expect(articles).not.toHaveCount(0, {
      message: 'Expected at least one article to be present'
    });

    // Кликаем на первую статью с ожиданием
    await articles.first().click();
    await widgetPage.page.waitForLoadState('networkidle');

    // Открываем форму обратной связи
    await widgetPage.clickWriteToUs();

    // Проверяем заголовок с учетом регистра и возможных пробелов
    await expect(widgetPage.getTitle()).toHaveText(
      /Связь с поддержкой/i,
      { timeout: 10000 }
    );
  });
});