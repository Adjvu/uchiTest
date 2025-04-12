import { test, expect } from '@playwright/test';
import { WidgetPage } from "./widget.page";

// Конфигурационные константы
const TEST_CONFIG = {
    BASE_URL: 'https://uchi.ru/',
    COOKIE_BUTTON_SELECTOR: '._UCHI_COOKIE__button',
    EXPECTED_TITLE: /Связь с поддержкой/i,
    TIMEOUTS: {
        NETWORK: 15000,
        ELEMENT_VISIBLE: 10000,
        ELEMENT_HIDDEN: 5000,
        ASSERTION: 10000
    }
};

test.describe('Uchi.ru Widget Tests', () => {
    let widgetPage: WidgetPage;

    test.beforeEach(async ({ page }) => {
        widgetPage = new WidgetPage(page);

        // Навигация с обработкой возможных ошибок
        await page.goto(TEST_CONFIG.BASE_URL, {
            waitUntil: 'domcontentloaded',
            timeout: TEST_CONFIG.TIMEOUTS.NETWORK
        });

        // Универсальная обработка cookie-попапа
        await handleCookiePopup(page);
    });

    test('Widget should open successfully', async () => {
        await widgetPage.openWidget();

        await expect(widgetPage.getWidgetBody(), 'Widget body should be visible')
            .toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.ASSERTION });
    });

    test('Support contact form should display correct title', async ({ page }) => {
        await widgetPage.openWidget();

        // Проверка и взаимодействие со статьями
        const articles = await widgetPage.getPopularArticles();
        await expect(articles, 'Should have at least one article')
            .toHaveCountGreaterThan(0);

        // Работа со статьей через Page Object
        await widgetPage.openFirstArticle();
        await widgetPage.openContactForm();

        // Проверка заголовка с нормализацией текста
        const titleText = await widgetPage.getTitle();
        await expect(titleText.trim().toLowerCase())
            .toMatch(TEST_CONFIG.EXPECTED_TITLE);
    });

    // Вспомогательная функция для обработки cookie-попапа
    async function handleCookiePopup(page: Page) {
        const cookiePopup = page.locator(TEST_CONFIG.COOKIE_BUTTON_SELECTOR);

        try {
            // Мягкая проверка с сокращенным таймаутом
            await cookiePopup.waitFor({
                state: 'visible',
                timeout: TEST_CONFIG.TIMEOUTS.ELEMENT_VISIBLE / 2
            });

            await cookiePopup.click();
            await cookiePopup.waitFor({
                state: 'hidden',
                timeout: TEST_CONFIG.TIMEOUTS.ELEMENT_HIDDEN
            });
        } catch (e) {
            console.log('Cookie popup not found, continuing test');
        }
    }
});