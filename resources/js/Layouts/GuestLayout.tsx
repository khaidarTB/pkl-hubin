import React from 'react';
import { Navbar } from '@/Components/Navbar';
import { Footer } from '@/Components/Footer';
import { NexaChat } from '@/Components/NexaChat';

interface Props {
    children: React.ReactNode;
    showNexa?: boolean;
}

export const GuestLayout: React.FC<Props> = ({ children, showNexa = true }) => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <Navbar showNexa={showNexa} />
            <main className="flex-1 pt-20">
                {children}
            </main>
            <Footer />
            {showNexa && <NexaChat />}
        </div>
    );
};
