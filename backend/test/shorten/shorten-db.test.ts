import { afterEach, beforeEach, jest, describe, expect, it } from '@jest/globals';

import { Client } from 'pg';
jest.mock('pg');
const client = new Client();

import ShortenDb, { PG_COLLISION_ERROR } from '../../src/shorten/shorten-db';
const db = new ShortenDb(client);

function mockQueryResult(value: any) {
    jest.spyOn(client, 'query').mockImplementation((a, b) => {
        return { rows: value };
    });
}
describe('getIdForUrl', () => {
    it('returns id value when found', async () => {
        const id = 123;
        mockQueryResult([{ id }]);
        const result = await db.getIdForUrl('anything');
        expect(result).toBe(id);
    });

    it('returns undefined when not found', async () => {
        mockQueryResult([]);
        const result = await db.getIdForUrl('anything');
        expect(result).not.toBeDefined();
    });
});

describe('getUrlForId', () => {
    it('returns url value when found', async () => {
        const url = 'foobar';
        mockQueryResult([{ url }]);
        const result = await db.getUrlForId(123);
        expect(result).toBe(url);
    });

    it('returns undefined when not found', async () => {
        mockQueryResult([]);
        const result = await db.getUrlForId(321);
        expect(result).not.toBeDefined();
    });
});

describe('getUrlForVanitySlug', () => {
    it('returns url value when found', async () => {
        const url = 'baz';
        mockQueryResult([{ url }]);
        const result = await db.getUrlForVanitySlug('vanity');
        expect(result).toBe(url);
    });

    it('returns undefined when not found', async () => {
        mockQueryResult([]);
        const result = await db.getUrlIdForVanitySlug('vanity');
        expect(result).not.toBeDefined();
    });
});

describe('getUrlIdForVanitySlug', () => {
    it('returns url id when found', async () => {
        const urlId = 222;
        mockQueryResult([{ urlId }]);
        const result = await db.getUrlIdForVanitySlug('slug');
        expect(result).toBe(urlId);
    });

    it('returns undefined when not found', async () => {
        mockQueryResult([]);
        const result = await db.getUrlIdForVanitySlug('slug');
        expect(result).not.toBeDefined();
    });
});

describe('insertUrlQuery', () => {
    it('returns insert id when successful', async () => {
        const id = 243;
        mockQueryResult([{ id }]);
        const result = await db.insertUrlQuery('');
        expect(result).toBe(id);
    });

    it('returns undefined when insert somehow fails', async () => {
        mockQueryResult([]);
        const result = await db.insertUrlQuery('');
        expect(result).not.toBeDefined();
    });
});

describe('insertUrl', () => {
    const url = 'https://example.com';
    const id = 5555;
    const vanitySlug = 'i-am-vain';

    beforeEach(() => {
        jest.resetAllMocks();
    });

    const getIdForUrl = jest.spyOn(db, 'getIdForUrl');
    const insertUrlQuery = jest.spyOn(db, 'insertUrlQuery');
    const insertSlugQuery = jest.spyOn(db, 'insertSlugQuery');
    const getUrlIdForVanitySlug = jest.spyOn(db, 'getUrlIdForVanitySlug');

    describe('without vanity slug', () => {
        afterEach(() => {
            expect(insertSlugQuery).not.toHaveBeenCalled();
        });

        it('does nothing when id already is in db', async () => {
            getIdForUrl.mockResolvedValue(id);
            const result = await db.insertUrl(url);
            expect(result).toBe(id);
            expect(getIdForUrl).toHaveBeenCalledTimes(1);
            expect(insertUrlQuery).not.toHaveBeenCalled();
        });

        it('inserts id when it is not present and succeeds', async () => {
            getIdForUrl.mockResolvedValue(undefined);
            insertUrlQuery.mockResolvedValue(id);
            const result = await db.insertUrl(url);
            expect(result).toBe(id);
            expect(getIdForUrl).toHaveBeenCalledTimes(1);
            expect(insertUrlQuery).toHaveBeenCalledTimes(1);
        });

        it('throws when id insert succeeds but does not return insert id', async () => {
            getIdForUrl.mockResolvedValue(undefined);
            insertUrlQuery.mockResolvedValue(undefined);
            await expect(async () => db.insertUrl(url)).rejects.toThrow();
            expect(insertUrlQuery).toHaveBeenCalledTimes(1);
        });

        it('resolves insert race', async () => {
            getIdForUrl.mockImplementation(async () => (getIdForUrl.mock.calls.length > 1 ? id : undefined));
            insertUrlQuery.mockRejectedValue({ code: PG_COLLISION_ERROR });
            getIdForUrl.mockResolvedValue(id);
            const result = await db.insertUrl(url);
            expect(result).toBe(id);
        });

        it('throws when insert race is not resolved', async () => {
            getIdForUrl.mockImplementation(async () => (getIdForUrl.mock.calls.length > 1 ? id : undefined));
            insertUrlQuery.mockRejectedValue({ code: PG_COLLISION_ERROR });
            getIdForUrl.mockResolvedValue(undefined);
            await expect(async () => db.insertUrl(url)).rejects.toThrow();
        });

        it('throws if id is not generated', async () => {
            getIdForUrl.mockResolvedValue(undefined);
            insertUrlQuery.mockResolvedValue(undefined);
            await expect(async () => db.insertUrl(url)).rejects.toThrow();
            expect(insertUrlQuery).toHaveBeenCalledTimes(1);
        });
    });

    describe('with vanity slug', () => {
        beforeEach(() => {
            getIdForUrl.mockResolvedValue(id);
        });

        it('throws if vanity slug already in use', async () => {
            getUrlIdForVanitySlug.mockResolvedValue(10);
            await expect(async () => db.insertUrl(url, vanitySlug)).rejects.toThrow();
            expect(insertSlugQuery).not.toHaveBeenCalled();
        });

        it('inserts and returns slug successfully', async () => {
            getUrlIdForVanitySlug.mockResolvedValue(undefined);
            insertSlugQuery.mockResolvedValue();
            const result = await db.insertUrl(url, vanitySlug);
            expect(result).toBe(vanitySlug);
            expect(insertSlugQuery).toHaveBeenCalledTimes(1);
        });

        it('resolves insert race', async () => {
            getUrlIdForVanitySlug.mockImplementation(async () => (getUrlIdForVanitySlug.mock.calls.length > 1 ? id : undefined));
            insertSlugQuery.mockRejectedValue({ code: PG_COLLISION_ERROR });
            const result = await db.insertUrl(url, vanitySlug);
            expect(result).toBe(vanitySlug);
            expect(insertSlugQuery).toHaveBeenCalledTimes(1);
            expect(getUrlIdForVanitySlug).toHaveBeenCalledTimes(2);
        });

        it('throws when insert race cannot be resolved', async () => {
            getUrlIdForVanitySlug.mockResolvedValue(undefined);
            insertSlugQuery.mockRejectedValue({ code: PG_COLLISION_ERROR });
            await expect(async () => db.insertUrl(url, vanitySlug)).rejects.toThrow();
            expect(insertSlugQuery).toHaveBeenCalledTimes(1);
            expect(getUrlIdForVanitySlug).toHaveBeenCalledTimes(2);
        });
    });
});
