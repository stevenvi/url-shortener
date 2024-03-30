import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { LinkIcon } from '@heroicons/react/24/outline';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
                    <div className=" flex flex-col left items-left gap-8 w-full p-8 ">
                        <div className=" font-semibold text-lg ">
                            URL Shortener
                            <LinkIcon className="inline h-6 w-6 rotate-[-45deg]" />
                        </div>
                        {children}
                    </div>
                </div>
            </body>
        </html>
    );
}
