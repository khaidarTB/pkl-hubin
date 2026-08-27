import React from 'react';
import { Navbar } from '@/Components/Navbar';
import { Footer } from '@/Components/Footer';
import { NexaChat } from '@/Components/NexaChat';

interface Props {
    children: React.ReactNode;
}

export const GuestLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <Navbar />
            <main className="flex-1 pt-20">
                {children}
            </main>
            <Footer />
            <NexaChat />
        </div>
    );
};
