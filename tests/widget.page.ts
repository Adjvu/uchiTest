import { Page, Locator } from "@playwright/test";

enum WidgetPageSelectors {
    WIDGET_WRAPPER = '.sc-dino-typography-h > [class^=widget__]',
    WIDGET_BODY = '[class^=widgetWrapper] > [class^=widget__]',
    HEADER_TEXT = 'header h5',
    BUTTON_OPEN = '[data-test=openWidget]',
    BUTTON_WRITE_TO_US = '[class^=btn]',
    ARTICLE_POPULAR_TITLE = '[class^=popularTitle__]',
    ARTICLE_POPULAR_LIST = `${WidgetPageSelectors.ARTICLE_POPULAR_TITLE} + ul[class^=articles__]`,
    ARTICLE_POPULAR_LIST_ITEM = `${WidgetPageSelectors.ARTICLE_POPULAR_LIST} > li`,
}

export class WidgetPage {
    private readonly page: Page;
    private readonly wrapper: Locator;

    constructor(page: Page) {
        this.page = page;
        this.wrapper = page.locator(WidgetPageSelectors.WIDGET_WRAPPER);
    }

    async openWidget(): Promise<void> {
        await this.wrapper.locator(WidgetPageSelectors.BUTTON_OPEN).click();
        await this.page.waitForLoadState('networkidle');
    }

    async getPopularArticles(): Promise<Locator[]> {
        const articles = this.wrapper.locator(WidgetPageSelectors.ARTICLE_POPULAR_LIST_ITEM);
        await articles.first().waitFor({ state: 'visible', timeout: 10000 });
        return articles.all();
    }

    async clickWriteToUs(): Promise<void> {
        const button = this.wrapper.locator(WidgetPageSelectors.BUTTON_WRITE_TO_US);
        await button.waitFor({ state: 'visible', timeout: 8000 });
        await button.click();
        await this.page.waitForLoadState('networkidle');
    }

    async getTitle(): Promise<string> {
        const title = this.wrapper.locator(WidgetPageSelectors.HEADER_TEXT);
        await title.waitFor({ state: 'visible', timeout: 8000 });
        return title.innerText();
    }

    getWidgetBody(): Locator {
        return this.page.locator(WidgetPageSelectors.WIDGET_BODY);
    }
}