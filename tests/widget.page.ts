import { Page, Locator } from "@playwright/test";

// Селекторы элементов виджета
enum WidgetSelectors {
    WIDGET_WRAPPER = '.sc-dino-typography-h > [class^=widget__]',
    WIDGET_BODY = '[class^=widgetWrapper] > [class^=widget__]',
    HEADER_TEXT = 'header h5',
    BUTTON_OPEN = '[data-test=openWidget]',
    BUTTON_WRITE_TO_US = '[class^=btn]',
    ARTICLE_POPULAR_TITLE = '[class^=popularTitle__]',
    ARTICLE_POPULAR_LIST = `${WidgetSelectors.ARTICLE_POPULAR_TITLE} + ul[class^=articles__]`,
    ARTICLE_POPULAR_LIST_ITEM = `${WidgetSelectors.ARTICLE_POPULAR_LIST} > li`,
}

// Константы времени ожидания
const DEFAULT_WAIT_TIMEOUT = 10_000; // 10 секунд
const NETWORK_IDLE_TIMEOUT = 5_000;  // 5 секунд

export class WidgetPage {
    private readonly page: Page;
    private readonly wrapper: Locator;

    // Кэшированные локаторы
    private _openButton?: Locator;
    private _writeToUsButton?: Locator;
    private _headerText?: Locator;
    private _popularArticles?: Locator;

    constructor(page: Page) {
        this.page = page;
        this.wrapper = page.locator(WidgetSelectors.WIDGET_WRAPPER);
    }

    // Ленивая инициализация локаторов
    private get openButton(): Locator {
        if (!this._openButton) {
            this._openButton = this.wrapper.locator(WidgetSelectors.BUTTON_OPEN);
        }
        return this._openButton;
    }

    private get writeToUsButton(): Locator {
        if (!this._writeToUsButton) {
            this._writeToUsButton = this.wrapper.locator(WidgetSelectors.BUTTON_WRITE_TO_US);
        }
        return this._writeToUsButton;
    }

    private get headerText(): Locator {
        if (!this._headerText) {
            this._headerText = this.wrapper.locator(WidgetSelectors.HEADER_TEXT);
        }
        return this._headerText;
    }

    private get popularArticles(): Locator {
        if (!this._popularArticles) {
            this._popularArticles = this.wrapper.locator(WidgetSelectors.ARTICLE_POPULAR_LIST_ITEM);
        }
        return this._popularArticles;
    }

    /**
     * Открывает виджет и ожидает завершения сетевых запросов
     */
    async openWidget(): Promise<void> {
        await this.openButton.click();
        await this.page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT });
    }

    /**
     * Возвращает список популярных статей после проверки их видимости
     * @returns Промис с массивом локаторов статей
     */
    async getPopularArticles(): Promise<Locator[]> {
        await this.popularArticles.first().waitFor({
            state: 'visible',
            timeout: DEFAULT_WAIT_TIMEOUT
        });
        return this.popularArticles.all();
    }

    /**
     * Кликает кнопку "Написать нам" и ожидает завершения сетевых запросов
     */
    async clickWriteToUs(): Promise<void> {
        await this.writeToUsButton.waitFor({
            state: 'visible',
            timeout: DEFAULT_WAIT_TIMEOUT
        });
        await this.writeToUsButton.click();
        await this.page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT });
    }

    /**
     * Получает заголовок виджета
     * @returns Промис с текстом заголовка
     */
    async getTitle(): Promise<string> {
        await this.headerText.waitFor({
            state: 'visible',
            timeout: DEFAULT_WAIT_TIMEOUT
        });
        return this.headerText.innerText();
    }

    /**
     * Возвращает локатор тела виджета
     * @returns Локатор основного контейнера виджета
     */
    getWidgetBody(): Locator {
        return this.page.locator(WidgetSelectors.WIDGET_BODY);
    }
}