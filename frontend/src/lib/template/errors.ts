/**
 * Custom error types for template operations
 * As defined in CONTEXT.md error handling protocol
 */

/**
 * TemplateMismatchError
 * Thrown when required data-iw-* selectors are missing from template
 */
export class TemplateMismatchError extends Error {
    public readonly selector: string;
    public readonly templateId: string;

    constructor(selector: string, templateId: string = 'landwind-v1') {
        super(`Required template selector "${selector}" not found in template "${templateId}"`);
        this.name = 'TemplateMismatchError';
        this.selector = selector;
        this.templateId = templateId;
    }
}

/**
 * TemplateLoadError
 * Thrown when template HTML cannot be loaded
 */
export class TemplateLoadError extends Error {
    public readonly templatePath: string;

    constructor(templatePath: string, cause?: Error) {
        super(`Failed to load template from "${templatePath}"`);
        this.name = 'TemplateLoadError';
        this.templatePath = templatePath;
        this.cause = cause;
    }
}
