'use client';

import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react'

const SHORTEN_HOST = process.env.SHORTEN_HOST || 'http://localhost:8080';
const SHORTEN_PATH = process.env.SHORTEN_PATH || '/api/shorten';
const SHORTEN_URL = `${SHORTEN_HOST}/${SHORTEN_PATH}`;

export default function Page() {
    const [longUrl, setLongUrl] = useState<string|undefined>(undefined);
    const [shortUrl, setShortUrl] = useState<string|undefined>(undefined);
    const [customSlug, setCustomSlug] = useState<string|undefined>(undefined);
    const [error, setError] = useState<string|undefined>(undefined);
    const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);

    const copyToClipboard = async () => {
        if (shortUrl) {
            await navigator.clipboard.writeText(shortUrl);
            setCopiedToClipboard(true);
        }
    };

    const StatusBar = () => {
        const className = " text-left items-left justify-left ";
        if (error) {
            // An error is present, that takes precedence in the status bar
            return <div className={className}>
                <div className="failure">Oops! An error has occurred:</div>
                <div>{error}</div>
            </div>
        } else if (shortUrl) {
            // Short URL is present
            const Icon = copiedToClipboard ? ClipboardDocumentCheckIcon : ClipboardIcon;
            return <div className={className}>
                <div className="success">Success! Here is your short URL:</div>
                <div className=" flex flex-row " >
                    <a href={shortUrl} target="_blank">{shortUrl}</a>
                    <Icon className="w-6" style={{cursor: 'pointer'}} onClick={copyToClipboard}/>
                </div>
            </div>
        } else {
            // No short url or error, so no status bar to display
            return <></>;
        }
    };

    const onSubmit = async (e: any) => {
        e.preventDefault();

        setShortUrl('');
        setError('');
        setCopiedToClipboard(false);

        try {
            const res = await fetch(SHORTEN_URL, {
                method: 'POST',
                body: JSON.stringify({ url: longUrl, slug: customSlug }),
                headers: { 'Content-Type': 'application/json' },
            });

            const json = await res.json();
            console.log(json);
            if (res.ok) {
                // shortening was successful
                setShortUrl(json.url);
            } else {
                // show that it responded with an error
                setError(json.error);
            }
        } catch (e: any) {
            // Connection error
            setError(`Unable to connect to shorten API: ${e.message}`);
        }
    }

    return (
        <>
            <form className=" flex w-full flex-col justify-left items-left " onSubmit={onSubmit}>
                <div className=" flex flex-col w-full justify-left items-left gap-1 ">
                    <label>Enter the URL to shorten</label>
                    <input
                        type="text" name="url" placeholder="http://example.com/foo/bar"
                        className=" border p-2 px-4 rounded outline-none "
                        onChange={e => setLongUrl(e.target.value)}
                    />

                    <label>Enter custom URL slug</label>
                    <input
                        type="text" name="slug" placeholder="(Optional)"
                        className=" border p-2 px-4 rounded outline-none "
                        onChange={e => setCustomSlug(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={!!error || !!shortUrl}
                        className=" shorten-button w-32 text-white p-2 px-4 rounded-md "
                    >
                        Shorten
                    </button>
                </div>
            </form>
            <StatusBar />
        </>
    )
}
