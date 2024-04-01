export class ApiError extends Error {
    readonly type: ErrorType;

    constructor(type: ErrorType, customMessage?: string) {
        super(customMessage ?? type.message);
        this.type = type;
    }
}

type ErrorType = {
    statusCode: number;
    message: string;
    informUser: boolean;
};

export const ErrorTypes: Record<string, ErrorType> = {
    DUPLICATE_SLUG: { statusCode: 400, message: 'Slug already in use. Please use a unique value.', informUser: true },
    DUPLICATE_KEY: { statusCode: 500, message: 'Duplicate key on insert', informUser: false },
    INSERT_ID_NOT_FOUND: { statusCode: 500, message: 'Insert id was not found', informUser: false },
    SLUG_NOT_FOUND: { statusCode: 404, message: 'A URL was not found for this vanity slug', informUser: true },
    URL_NOT_FOUND: { statusCode: 404, message: 'URL was not found', informUser: true },
    INVALID_VANITY_SLUG: { statusCode: 400, message: 'Invalid vanity slug', informUser: true },
    INVALID_URL: { statusCode: 400, message: 'Invalid URL', informUser: true },
    INVALID_SHORT_URL: { statusCode: 404, message: 'Invalid short url provided', informUser: true },
};
