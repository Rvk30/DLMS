import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'DLMS — Digital Library Management System',
    description: 'A modern library management system for students and librarians.',
    keywords: ['library', 'books', 'management', 'DLMS'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
