'use client';

import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react'

const SHORTEN_HOST = process.env.SHORTEN_HOST || 'http://localhost:8080';
const SHORTEN_PATH = process.env.SHORTEN_PATH || '/api/shorten';
const SHORTEN_URL = `${SHORTEN_HOST}/${SHORTEN_PATH}`;

export default function Page() {
    const [longUrl, setLongUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [error, setError] = useState('');
    const [copiedToClipboard, setCopiedToClipboard] = useState(false);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(shortUrl);
        setCopiedToClipboard(true);
    };

    const StatusBar = () => {
        const className = " text-left items-left justify-left ";
        if (error?.trim()?.length) {
            // An error is present, that takes precedence in the status bar
            return <div className={className}>
                <div className="failure">Oops! An error has occurred:</div>
                <div>{error}</div>
            </div>
        } else if (shortUrl?.trim()?.length) {
            // Short URL is present
            const Icon = copiedToClipboard ? ClipboardDocumentCheckIcon : ClipboardIcon;
            return <div className={className}>
                <div className="success">Success! Here is your short URL:</div>
                <div className=" flex flex-row " >
                    <Link href={shortUrl} target="_blank">{shortUrl}</Link>
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
                body: JSON.stringify({ url: longUrl }),
                headers: { 'Content-Type': 'application/json' },
            });

            const json = await res.json();
            console.log(json);
            if (res.ok) {
                // shortening was successful
                setShortUrl(json.url);
                console.log(`Success: ${JSON.stringify(json)}`);
            } else {
                // show that it responded with an error
                setError(json.error);
                console.log(`Error: ${JSON.stringify(json)}`);
            }
        } catch (e: any) {
            setError(`Unable to connect to shorten API: ${e.message}`);
        }
    }

    return (
        <div className=" flex flex-col left items-left gap-8 w-full p-8 ">
            <h1 className=" w-full font-semibold text-lg ">Standard Shortened URL</h1>
            <form className=" flex w-full flex-col justify-left items-left " onSubmit={onSubmit}>
                <div className=" flex flex-col w-full justify-left items-left gap-1 ">
                    <label>Enter the URL to shorten</label>
                    <input
                        type="text"
                        name="url"
                        placeholder="http://example.com/foo/bar"
                        onChange={e => setLongUrl(e.target.value)}
                        className=" border p-2 px-4 rounded outline-none "
                    />
                    <button
                        type="submit"
                        className=" border-blue-500 bg-blue-500 text-white p-2 px-4 rounded-md w-1/4 "
                    >Shorten</button>
                </div>
            </form>
            <StatusBar />
        </div>
    )
}
