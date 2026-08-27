import React, { useEffect, useRef, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import {
    Sparkles,
    Send,
    Bot,
    User as UserIcon,
    CalendarPlus,
    RotateCcw,
    ShieldCheck,
} from 'lucide-react';
import { PageProps } from '@/Types';
import {
    askNexa,
    confirmVisit,
    formatTime,
    MarkdownLite,
    NexaChatMessage,
    nexaQuickPrompts,
    NexaRole,
} from '@/lib/nexa';

const TypingIndicator: React.FC = () => (
    <div className="flex items-center gap-2 text-xs text-slate-500 italic">
        <span className="font-semibold text-emerald-700">NEXA sedang berpikir</span>
        <span className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
        </span>
    </div>
);

export default function AIAssistant() {
    const { props } = usePage<PageProps>();
    const user = props?.auth?.user;
    const role = (user?.role || 'siswa') as NexaRole;

    const [messages, setMessages] = useState<NexaChatMessage[]>([
        {
            id: 'welcome',
            sender: 'ai',
            text: `Halo ${user?.name || 'Pengguna'}! Saya **NEXA**, PKL Intelligent Assistant.\n\nSaya dapat membantu Anda memahami data PKL — monitoring, kehadiran, jurnal, dan rekomendasi tindakan — sesuai peran dan izin akses Anda.`,
            time: formatTime(),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const pushMessage = (msg: Omit<NexaChatMessage, 'id' | 'time'>) => {
        setMessages((prev) => [
            ...prev,
            { ...msg, id: `${Date.now()}-${Math.random()}`, time: formatTime() },
        ]);
    };

    const handleSend = async (text?: string) => {
        const query = (text ?? input).trim();
        if (!query || loading) return;

        if (!text) setInput('');
        pushMessage({ sender: 'user', text: query });
        setLoading(true);

        try {
            const data = await askNexa(query, conversationId);
            setConversationId(data.conversation_id ?? conversationId);
            pushMessage({
                sender: 'ai',
                text: data.reply || '',
                proposal: data.action ?? undefined,
            });
        } catch (e) {
            pushMessage({
                sender: 'ai',
                text: e instanceof Error ? e.message : 'NEXA sedang mengalami kendala. Silakan coba lagi.',
            });
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleConfirmVisit = async (msgId: string, proposal: NonNullable<NexaChatMessage['proposal']>) => {
        updateProposalState(msgId, 'confirmed');
        try {
            const { message } = await confirmVisit(proposal);
            pushMessage({ sender: 'ai', text: `✅ ${message}\n\nSurat Tugas resmi telah dibuat otomatis dari template sekolah. Anda dapat mengunduhnya di menu **Surat & Dokumen**.` });
        } catch (e) {
            pushMessage({
                sender: 'ai',
                text: e instanceof Error ? e.message : 'Gagal membuat jadwal kunjungan.',
            });
        }
    };

    const updateProposalState = (msgId: string, state: NexaChatMessage['proposalState']) => {
        setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, proposalState: state } : m)),
        );
    };

    const resetChat = () => {
        setConversationId(null);
        setMessages([
            {
                id: `welcome-${Date.now()}`,
                sender: 'ai',
                text: `Percakapan baru dimulai. Ada yang ingin Anda ketahui tentang data PKL?`,
                time: formatTime(),
            },
        ]);
    };

    return (
        <DashboardLayout>
            <Head title="NEXA AI — PKL Intelligent Assistant" />

            {/* Page Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold mb-2 border border-emerald-200/60">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        <span>PKL INTELLIGENT ASSISTANT</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        NEXA AI
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            AI Online
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 max-w-xl">
                        Asisten cerdas berbasis data PKLConnect. Jawaban selalu dihitung dari data
                        nyata dalam lingkup akses{' '}
                        <span className="font-semibold text-slate-700">
                            {role === 'admin'
                                ? 'Admin Hubin'
                                : role === 'guru'
                                  ? 'Guru Pembimbing'
                                  : role === 'industri'
                                    ? 'Pembimbing Industri'
                                    : 'Siswa'}
                        </span>
                        .
                    </p>
                </div>
                <button
                    onClick={resetChat}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Percakapan Baru
                </button>
            </div>

            {/* Chat Panel */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[62vh] min-h-[480px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-slate-50/40">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : ''}`}>
                            {m.sender === 'ai' && (
                                <div className="w-9 h-9 shrink-0 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                    <Bot className="w-4.5 h-4.5" />
                                </div>
                            )}

                            <div className={`max-w-[78%] space-y-2 ${m.sender === 'user' ? 'items-end flex flex-col' : ''}`}>
                                <div
                                    className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                                        m.sender === 'user'
                                            ? 'bg-slate-900 text-white rounded-tr-md'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-md'
                                    }`}
                                >
                                    <MarkdownLite text={m.text} />
                                </div>

                                {/* Visit proposal confirmation (spec #17) */}
                                {m.proposal && m.proposalState !== 'confirmed' && (
                                    <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                                            <CalendarPlus className="w-3.5 h-3.5" />
                                            Konfirmasi Jadwal Kunjungan
                                        </div>
                                        <dl className="text-xs text-slate-700 space-y-1">
                                            <div><dt className="inline font-semibold">Siswa: </dt><dd className="inline">{m.proposal.student_name}{m.proposal.class ? ` (${m.proposal.class})` : ''}</dd></div>
                                            <div><dt className="inline font-semibold">Perusahaan: </dt><dd className="inline">{m.proposal.company_name}</dd></div>
                                            <div><dt className="inline font-semibold">Guru: </dt><dd className="inline">{m.proposal.teacher_name}</dd></div>
                                            <div><dt className="inline font-semibold">Tanggal: </dt><dd className="inline">{m.proposal.suggested_date}</dd></div>
                                        </dl>
                                        {m.proposalState === 'pending' || !m.proposalState ? (
                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={() => handleConfirmVisit(m.id, m.proposal!)}
                                                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 text-white text-[12px] font-bold hover:bg-slate-800 transition-colors"
                                                >
                                                    Buat Jadwal
                                                </button>
                                                <button
                                                    onClick={() => updateProposalState(m.id, 'cancelled')}
                                                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] font-semibold text-slate-500 italic">Dibatalkan.</p>
                                        )}
                                    </div>
                                )}

                                <span className={`text-[10px] ${m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                                    {m.time}
                                </span>
                            </div>

                            {m.sender === 'user' && (
                                <div className="w-9 h-9 shrink-0 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                                    <UserIcon className="w-4.5 h-4.5" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3 items-center">
                            <div className="w-9 h-9 shrink-0 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                <Bot className="w-4.5 h-4.5" />
                            </div>
                            <TypingIndicator />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto">
                    {nexaQuickPrompts(role).map((qp) => (
                        <button
                            key={qp}
                            onClick={() => handleSend(qp)}
                            disabled={loading}
                            className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors disabled:opacity-50"
                        >
                            {qp}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="p-4 bg-white border-t border-slate-100 flex items-center gap-3"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask NEXA anything..."
                        maxLength={1000}
                        className="flex-1 px-4 py-3 rounded-2xl text-[13px] bg-slate-100 border border-transparent focus:bg-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-800 transition-colors disabled:opacity-40"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                </form>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                NEXA hanya menjawab berdasarkan data yang berada dalam wewenang Anda. NEXA tidak dapat mengubah data tanpa konfirmasi eksplisit.
            </div>
        </DashboardLayout>
    );
}
