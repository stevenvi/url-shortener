import { ShortenDb } from './shorten-db';
import { HOST, PORT } from '../config';
import { ApiError, ErrorTypes } from '../errors/Errors';

/** Copied from https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number */
const isNumeric = (num: any) => (typeof num === 'number' || (typeof num === 'string' && num.trim() !== '')) && !isNaN(num as number);

export class ShortenService {
    readonly db: ShortenDb;

    constructor(db: ShortenDb) {
        this.db = db;
    }

    /**
     * Throws an error if the url provided is invalid
     * Based on regex at https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
     */
    validateUrl(url: string): void {
        const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&\/=]*)$/;
        const valid = regex.test(url);
        if (!valid) {
            throw new ApiError(ErrorTypes.INVALID_URL);
        }
    }

    /** Throws an error if the vanity slug provided is invalid */
    validateVanitySlug(slug: string): void {
        if (!this.isVanitySlug(slug)) {
            throw new ApiError(ErrorTypes.INVALID_VANITY_SLUG);
        }
    }

    /** Checks if the input slug is a valid vanity slug */
    isVanitySlug(slug: string): boolean {
        return !isNumeric(slug);
    }

    /** Converts the id of a db row into a unique slug */
    idToSlug(id: number): string {
        return id.toString();
    }

    /** Converts the id-based slug back into the numeric id */
    slugToId(slug: string): number {
        return Number(slug);
    }

    async getIdSlugForUrl(url: string): Promise<string> {
        console.log(`Finding id for URL: ${url}`);
        this.validateUrl(url);

        const id = await this.db.getIdForUrl(url);
        if (!id) {
            // id was not found in database, throw error
            throw new ApiError(ErrorTypes.URL_NOT_FOUND);
        }

        // URL was found, return the slug value for the id
        return this.idToSlug(id);
    }

    async getUrlForSlug(slug: string): Promise<string> {
        console.log(`Finding url for id slug ${slug}`);

        // Check if this is a numeric slug or a vanity slug
        let url: string | undefined;
        if (this.isVanitySlug(slug)) {
            url = await this.db.getUrlForVanitySlug(slug);
        } else {
            url = await this.db.getUrlForId(this.slugToId(slug));
        }

        if (!url) {
            // The url for this id was not found, throw error
            throw new ApiError(ErrorTypes.INVALID_SHORT_URL);
        }

        // URL was found, return it
        return url;
    }

    async insertUrl(url: string, slug?: string): Promise<string> {
        this.validateUrl(url);
        if (slug) this.validateVanitySlug(slug);

        const id = await this.db.insertUrl(url, slug);
        if (slug) {
            // A custom slug was inserted, so return that slug
            return slug;
        } else {
            // A generated slug should be returned
            return this.idToSlug(id as number);
        }
    }

    getShortenedUrlForSlug(slug: string): string {
        // TODO: Schema should support https
        return `http://${HOST}:${PORT}/${slug}`;
    }
}
