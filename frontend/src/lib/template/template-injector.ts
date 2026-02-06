import * as cheerio from 'cheerio';
import type { BusinessData, SiteConfig } from '@/lib/schemas';
import { TemplateMismatchError } from './errors';

/**
 * TEMPLATE PATH ASSUMPTIONS:
 * 
 * 1. Landwind template is stored at: public/templates/landwind-v1/index.html
 * 2. Template uses data-iw-* attributes for injection points:
 *    - data-iw-business-name: Main business name
 *    - data-iw-tagline: Business tagline
 *    - data-iw-phone: Phone number (href="tel:")
 *    - data-iw-whatsapp: WhatsApp link (href="https://wa.me/")
 *    - data-iw-hero-image: Hero background image (data-bg or style)
 *    - data-iw-logo: Logo image (src)
 *    - data-iw-services: Container for service items
 *    - data-iw-service-item: Template for each service
 * 3. If template file is missing, TemplateLoadError is thrown
 * 4. If required selector is missing, TemplateMismatchError is thrown
 */

/**
 * Selector mapping for data-iw-* attributes
 * Maps business data keys to template selectors
 */
const SELECTOR_MAP = {
    businessName: '[data-iw-business-name]',
    tagline: '[data-iw-tagline]',
    phone: '[data-iw-phone]',
    whatsapp: '[data-iw-whatsapp]',
    email: '[data-iw-email]',
    address: '[data-iw-address]',
    heroImage: '[data-iw-hero-image]',
    logo: '[data-iw-logo]',
    servicesContainer: '[data-iw-services]',
    serviceItem: '[data-iw-service-item]',
    facebook: '[data-iw-facebook]',
    instagram: '[data-iw-instagram]',
} as const;

/**
 * Required selectors that MUST exist in template
 * Missing these will throw TemplateMismatchError
 */
const REQUIRED_SELECTORS = [
    SELECTOR_MAP.businessName,
] as const;

interface InjectorOptions {
    templateId?: string;
    strictMode?: boolean; // Throw on missing optional selectors
}

/**
 * Template Injector
 * Uses Cheerio to inject business data into HTML template
 */
export class TemplateInjector {
    private $: cheerio.CheerioAPI;
    private templateId: string;
    private strictMode: boolean;

    constructor(html: string, options: InjectorOptions = {}) {
        this.$ = cheerio.load(html);
        this.templateId = options.templateId || 'landwind-v1';
        this.strictMode = options.strictMode || false;

        // Validate required selectors exist
        this.validateRequiredSelectors();
    }

    /**
     * Validate that all required selectors exist in template
     */
    private validateRequiredSelectors(): void {
        for (const selector of REQUIRED_SELECTORS) {
            if (this.$(selector).length === 0) {
                throw new TemplateMismatchError(selector, this.templateId);
            }
        }
    }

    /**
     * Safely set text content for a selector
     */
    private setText(selector: string, value: string | undefined): void {
        if (!value) return;

        const element = this.$(selector);
        if (element.length === 0) {
            if (this.strictMode) {
                throw new TemplateMismatchError(selector, this.templateId);
            }
            return; // Fail silently in non-strict mode
        }

        element.text(value);
    }

    /**
     * Safely set attribute for a selector
     */
    private setAttr(selector: string, attr: string, value: string | undefined): void {
        if (!value) return;

        const element = this.$(selector);
        if (element.length === 0) {
            if (this.strictMode) {
                throw new TemplateMismatchError(selector, this.templateId);
            }
            return;
        }

        element.attr(attr, value);
    }

    /**
     * Inject business data into template
     */
    injectBusinessData(data: BusinessData): this {
        // Core identity
        this.setText(SELECTOR_MAP.businessName, data.businessName);
        this.setText(SELECTOR_MAP.tagline, data.tagline);

        // Contact - set both text and href
        if (data.phone) {
            const phoneElement = this.$(SELECTOR_MAP.phone);
            if (phoneElement.length > 0) {
                phoneElement.text(data.phone);
                phoneElement.attr('href', `tel:+2${data.phone}`);
            }
        }

        // WhatsApp link
        if (data.whatsapp || data.phone) {
            const waNumber = data.whatsapp || data.phone;
            const waElement = this.$(SELECTOR_MAP.whatsapp);
            if (waElement.length > 0) {
                waElement.attr('href', `https://wa.me/2${waNumber}`);
            }
        }

        // Email
        if (data.email) {
            const emailElement = this.$(SELECTOR_MAP.email);
            if (emailElement.length > 0) {
                emailElement.text(data.email);
                emailElement.attr('href', `mailto:${data.email}`);
            }
        }

        // Address
        this.setText(SELECTOR_MAP.address, data.address);

        // Media - images
        this.setAttr(SELECTOR_MAP.logo, 'src', data.logo);

        // Hero image - handle both src and background-image
        if (data.heroImage) {
            const heroElement = this.$(SELECTOR_MAP.heroImage);
            if (heroElement.length > 0) {
                if (heroElement.is('img')) {
                    heroElement.attr('src', data.heroImage);
                } else {
                    heroElement.css('background-image', `url(${data.heroImage})`);
                }
            }
        }

        // Social links
        this.setAttr(SELECTOR_MAP.facebook, 'href', data.facebook);
        this.setAttr(SELECTOR_MAP.instagram, 'href', data.instagram);

        // Services - clone template item for each service
        this.injectServices(data.services);

        return this;
    }

    /**
     * Inject services by cloning template item
     */
    private injectServices(services: BusinessData['services']): void {
        const container = this.$(SELECTOR_MAP.servicesContainer);
        const template = this.$(SELECTOR_MAP.serviceItem).first();

        if (container.length === 0 || template.length === 0) {
            if (this.strictMode && services.length > 0) {
                throw new TemplateMismatchError(SELECTOR_MAP.servicesContainer, this.templateId);
            }
            return;
        }

        // Clone template for each service
        container.empty();

        for (const service of services) {
            const item = template.clone();
            item.find('[data-iw-service-title]').text(service.title);
            item.find('[data-iw-service-description]').text(service.description);
            if (service.icon) {
                item.find('[data-iw-service-icon]').text(service.icon);
            }
            container.append(item);
        }
    }

    /**
     * Apply site configuration (colors, fonts, RTL)
     */
    applyConfig(config: SiteConfig): this {
        // Apply RTL direction
        if (config.rtl) {
            this.$('html').attr('dir', 'rtl');
            this.$('html').attr('lang', 'ar');
        }

        // Apply custom primary color via CSS variable
        const style = `
      :root {
        --color-primary: ${config.primaryColor};
        --color-secondary: ${config.secondaryColor};
      }
    `;
        this.$('head').append(`<style>${style}</style>`);

        // Apply font family
        if (config.fontFamily) {
            this.$('body').css('font-family', `'${config.fontFamily}', sans-serif`);
        }

        return this;
    }

    /**
     * Get the final HTML string
     */
    getHtml(): string {
        return this.$.html();
    }
}

/**
 * Convenience function to inject data and return HTML
 */
export function injectIntoTemplate(
    templateHtml: string,
    data: BusinessData,
    config?: Partial<SiteConfig>
): string {
    const injector = new TemplateInjector(templateHtml);

    injector.injectBusinessData(data);

    if (config) {
        injector.applyConfig({
            templateId: config.templateId || 'landwind-v1',
            primaryColor: config.primaryColor || '#14b8a6',
            secondaryColor: config.secondaryColor || '#7e3af2',
            fontFamily: config.fontFamily || 'Cairo',
            rtl: config.rtl ?? true,
        });
    }

    return injector.getHtml();
}
