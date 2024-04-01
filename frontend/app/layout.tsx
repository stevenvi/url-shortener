import '@/app/ui/global.css';
import { roboto } from '@/app/ui/fonts';
import { LinkIcon } from '@heroicons/react/24/outline';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={`${roboto.className} antialiased`}>
                <div className=" flex-grow p-6 md:overflow-y-auto md:p-12 ">
                    <div className=" left items-left flex w-full flex-col gap-8 p-8 ">
                        <div className=" text-lg font-semibold ">
                            URL Shortener
                            <LinkIcon className=" inline h-6 w-6 rotate-[-45deg] " />
                        </div>
                        {children}
                    </div>
                </div>
            </body>
        </html>
    );
}
