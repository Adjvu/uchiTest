import { test, expect } from '@playwright/test';
import { WidgetPage } from "./widget.page";

const TEST_CONFIG = {
    BASE_URL: 'https://uchi.ru/',
    MIN_ARTICLES: 3, // Минимальное ожидаемое количество статей
    CONTENT_LOAD_TIMEOUT: 8000
};

test.describe('Uchi.ru Widget Articles Tests', () => {
    let widgetPage: WidgetPage;

    test.beforeEach(async ({ page }) => {
        widgetPage = new WidgetPage(page);
        await page.goto(TEST_CONFIG.BASE_URL, { waitUntil: 'domcontentloaded' });
        await widgetPage.openWidget();
    });

    test('Popular articles should have valid content', async () => {
        // Получаем список статей
        const articles = await widgetPage.getPopularArticles();

        // Проверка количества статей
        await expect(articles, `Должно быть не менее ${TEST_CONFIG.MIN_ARTICLES} статей`)
            .toHaveCountGreaterThanOrEqual(TEST_CONFIG.MIN_ARTICLES);

        // Проверка содержимого для каждой статьи
        for (const [index, article] of (await articles.all()).entries()) {
            // Проверка видимости и кликабельности
            await expect(article, `Статья #${index + 1} должна быть видимой`).toBeVisible();
            await expect(article, `Статья #${index + 1} должна быть кликабельной`).toBeEnabled();

            // Проверка текстового содержимого
            const title = await article.innerText();
            await expect(title, `Заголовок статьи #${index + 1} не должен быть пустым`)
                .not.toBeEmpty();
            await expect(title, `Заголовок статьи #${index + 1} содержит недопустимые символы`)
                .toMatch(/^[\wа-яё\s\-?!,.]+$/gi);
        }

        // Проверка навигации по первой статье
        const firstArticle = articles.first();
        const expectedTitle = await firstArticle.innerText();

        await test.step('Проверка открытия статьи', async () => {
            await firstArticle.click();
            await widgetPage.page.waitForLoadState('networkidle');

            // Проверка контента статьи
            const articleContent = widgetPage.getArticleContent();
            await expect(articleContent, 'Контент статьи должен отображаться')
                .toBeVisible({ timeout: TEST_CONFIG.CONTENT_LOAD_TIMEOUT });

            // Проверка соответствия заголовка
            const actualTitle = await widgetPage.getActiveArticleTitle();
            await expect(actualTitle.trim(), 'Заголовок статьи должен совпадать')
                .toEqual(expectedTitle.trim());
        });

        // Возврат к списку статей
        await test.step('Проверка возврата к списку статей', async () => {
            await widgetPage.goBackToArticlesList();
            await expect(articles.first(), 'Список статей должен быть снова виден')
                .toBeVisible();
        });
    });
});