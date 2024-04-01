import { beforeAll, beforeEach, jest, describe, expect, it } from '@jest/globals';

import ShortenDb from '../../src/shorten/shorten-db';
jest.mock('../../src/shorten/shorten-db');

import ShortenService from '../../src/shorten/shorten-service';

const db = new ShortenDb();
const svc = new ShortenService(db);

beforeAll(() => {
    // db = ShortenDb.mock.instances[0];
});

beforeEach(() => {
    jest.resetAllMocks();
});

const VALID_URL = 'http://www.example.com';

describe('validateUrl', () => {
    it.each([
        'http://www.google.com',
        'https://www.example.com',
        'http://example.com',
        'https://localhost.local/api/shorten',
        'http://a-funny.url-that.is.still.valid/whatever/foo-bar?query=value&other',
    ])('passes when url is "%s"', (url) => {
        svc.validateUrl(url);
    });

    it.each([
        'http:///www.three-slashes.com',
        'ftp://wrong-schema',
        'http\\\\i-dunno',
        'it is actually hard to come up with invalid urls on the spot',
    ])('fails when url is "%s"', (url) => {
        expect(() => svc.validateUrl(url)).toThrow();
    });
});

describe('validateVanitySlug', () => {
    it.each(['slug', 'another-one', 'can-use-num8er5-2'])('passes when slug is "%s"', (slug) => {
        svc.validateVanitySlug(slug);
    });

    // This test is not exhaustive
    it.each([
        '123',
        123,
        '123abc',
        'NoSpecialChars!',
        'email@address',
        'slug#1',
        'earn$',
        'five%',
        'six^',
        'me&you',
        'st*rs',
        'va(n)ity',
        'pl+us',
        'e=qual',
        'under_score',
        'with spaces',
        'query?params',
        'p|pe',
        's/ash',
        'backs\\ash',
        'less<than',
        'greater>than',
    ])('fails when slug is "%s"', (slug) => {
        expect(() => svc.validateVanitySlug(slug as string)).toThrow();
    });
});

describe('getIdSlugForUrl', () => {
    it('throws if url not in db', async () => {
        jest.spyOn(db, 'getIdForUrl').mockResolvedValue(undefined);
        await expect(async () => svc.getIdSlugForUrl(VALID_URL)).rejects.toThrow();
    });

    it('returns id slug if url is in db', async () => {
        const id = 123;
        jest.spyOn(db, 'getIdForUrl').mockResolvedValue(123);
        const value = await svc.getIdSlugForUrl(VALID_URL);
        expect(value).toBeDefined();
        expect(value).toBe(id.toString());
        expect(typeof value).toBe('string');
    });
});

describe('getUrlForSlug', () => {
    it('throws if no url is found for vanity slug', async () => {
        jest.spyOn(db, 'getUrlForVanitySlug').mockResolvedValue(undefined);
        await expect(async () => svc.getUrlForSlug('vanity-slug')).rejects.toThrow();
    });

    it('throws if no url is found for numeric slug', async () => {
        jest.spyOn(db, 'getUrlForId').mockResolvedValue(undefined);
        await expect(async () => svc.getUrlForSlug('321')).rejects.toThrow();
    });

    it('returns a url for a vanity slug', async () => {
        jest.spyOn(db, 'getUrlForVanitySlug').mockResolvedValue(VALID_URL);
        const url = await svc.getUrlForSlug('vanity-slug');
        expect(url).toBeDefined();
        expect(url).toBe(VALID_URL);
    });

    it('returns a url for a numeric slug', async () => {
        jest.spyOn(db, 'getUrlForId').mockResolvedValue(VALID_URL);
        const url = await svc.getUrlForSlug('100');
        expect(url).toBeDefined();
        expect(url).toBe(VALID_URL);
    });
});

describe('insertUrl', () => {
    it('returns numeric slug if no vanity slug is provided', async () => {
        const generatedId = 333;
        jest.spyOn(db, 'insertUrl').mockResolvedValue(generatedId);
        const slug = await svc.insertUrl(VALID_URL);
        expect(slug).toBeDefined();
        expect(slug).toBe(generatedId.toString());
    });

    it('returns vanity slug if provided', async () => {
        const slug = 'slimy';
        jest.spyOn(db, 'insertUrl').mockResolvedValue(slug);
        const returnedSlug = await svc.insertUrl(VALID_URL, slug);
        expect(returnedSlug).toBeDefined();
        expect(returnedSlug).toBe(slug);
    });
});
