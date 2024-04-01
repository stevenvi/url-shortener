-- Maps a long URL to a unique id number
CREATE TABLE urls (
        id serial,
        url varchar not null unique
);

-- Maps a vanity slug to a url
CREATE TABLE slugs (
        id serial,
        urlId integer not null,
        slug varchar not null unique
);

