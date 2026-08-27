import React, { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Sparkles, Send, X, Bot, Loader2, CalendarPlus } from 'lucide-react';
import { PageProps } from '@/Types';
import {
    askNexa, confirmVisit, formatTime, MarkdownLite,
    NexaChatMessage, nexaQuickPrompts, NexaRole, VisitProposal,
} from '@/lib/nexa';

export const NexaChat: React.FC = () => {
    const { props } = usePage<PageProps>();
    const user = props?.auth?.user;
    const role = (user?.role || 'siswa') as NexaRole;

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<NexaChatMessage[]>([
        {
            id: '1',
            sender: 'ai',
            text: `Halo ${user?.name || 'Pengguna'}! Saya **NEXA**, asisten cerdas PKLConnect. Tanyakan apa saja tentang data PKL dalam akses Anda.`,
            time: formatTime(),
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, loading]);

    const updateProposalState = (msgId: string, state: NexaChatMessage['proposalState']) => {
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, proposalState: state } : m)));
    };

    const pushMessage = (msg: Omit<NexaChatMessage, 'id' | 'time'>) => {
        setMessages((prev) => [...prev, { ...msg, id: `${Date.now()}-${Math.random()}`, time: formatTime() }]);
    };

    const handleConfirmVisit = async (msgId: string, proposal: VisitProposal) => {
        updateProposalState(msgId, 'confirmed');
        try {
            const { message } = await confirmVisit(proposal);
            pushMessage({ sender: 'ai', text: `✅ ${message}` });
        } catch (e) {
            pushMessage({ sender: 'ai', text: e instanceof Error ? e.message : 'Gagal membuat jadwal kunjungan.' });
        }
    };

    const handleSend = async (textToSend?: string) => {
        const query = textToSend ?? input;
        if (!query.trim() || loading) return;
        pushMessage({ sender: 'user', text: query });
        if (!textToSend) setInput('');
        setLoading(true);
        try {
            const data = await askNexa(query, conversationId);
            setConversationId(data.conversation_id ?? conversationId);
            pushMessage({ sender: 'ai', text: data.reply || '', proposal: data.action ?? undefined });
        } catch (e) {
            pushMessage({ sender: 'ai', text: e instanceof Error ? e.message : 'NEXA sedang mengalami kendala. Silakan coba lagi.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white text-[13px] font-semibold shadow-lg hover:bg-slate-800 transition-all hover:scale-[1.03]"
                >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Tanya NEXA</span>
                </button>
            )}

            {isOpen && (
                <div className="w-[22rem] sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[520px] overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[13px] leading-none">NEXA AI</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10" aria-label="Tutup">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                        {messages.map((m) => (
                            <div key={m.id} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : ''}`}>
                                {m.sender === 'ai' && (
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                        <Bot className="w-3.5 h-3.5" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] ${m.sender === 'user' ? 'flex flex-col items-end' : ''}`}>
                                    <div className={`px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
                                        m.sender === 'user'
                                            ? 'bg-slate-900 text-white rounded-tr-none'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                    }`}>
                                        <MarkdownLite text={m.text} />
                                        {m.proposal && m.proposalState !== 'confirmed' && (
                                            <div className="mt-2 pt-2 border-t border-slate-100">
                                                <p className="flex items-center gap-1 font-semibold text-emerald-700 text-[11px] mb-1.5">
                                                    <CalendarPlus className="w-3 h-3" /> Konfirmasi Kunjungan
                                                </p>
                                                {m.proposalState !== 'cancelled' ? (
                                                    <div className="flex gap-1.5">
                                                        <button onClick={() => handleConfirmVisit(m.id, m.proposal!)} className="flex-1 px-2 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700">Buat Jadwal</button>
                                                        <button onClick={() => updateProposalState(m.id, 'cancelled')} className="flex-1 px-2 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200">Batal</button>
                                                    </div>
                                                ) : (
                                                    <p className="text-[10px] italic text-slate-400">Dibatalkan.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[9px] mt-0.5 block text-right ${m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>{m.time}</span>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2 items-center text-slate-500 text-[11px]">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                </div>
                                <span>NEXA sedang berpikir...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
                        {nexaQuickPrompts(role).map((qp) => (
                            <button key={qp} onClick={() => handleSend(qp)} disabled={loading}
                                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors disabled:opacity-50">
                                {qp}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tanya NEXA..." maxLength={1000}
                            className="flex-1 px-3 py-2 text-[12px] rounded-lg bg-slate-100 border border-transparent focus:bg-white focus:border-slate-300 focus:outline-none transition-all" />
                        <button type="submit" disabled={loading || !input.trim()} className="p-2 rounded-lg bg-slate-900 text-white disabled:opacity-40 hover:bg-slate-800 transition-colors" aria-label="Kirim">
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
