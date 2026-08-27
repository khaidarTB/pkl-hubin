import React from 'react';

export type NexaRole = 'admin' | 'guru' | 'industri' | 'siswa';

export interface VisitProposal {
    type: 'create_visit';
    student_id: number;
    student_name: string;
    class?: string;
    company_name?: string;
    teacher_name?: string;
    suggested_date?: string;
    suggested_date_iso?: string;
    purpose?: string;
}

export interface NexaChatMessage {
    id: string;
    sender: 'ai' | 'user';
    text: string;
    time: string;
    proposal?: VisitProposal;
    proposalState?: 'pending' | 'confirmed' | 'cancelled';
}

interface NexaApiResponse {
    status: 'success' | 'error';
    reply?: string;
    timestamp?: string;
    conversation_id?: number;
    action?: VisitProposal | null;
}

const csrfToken = (): string =>
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

/** POST /api/ai/chat — returns reply text + optional structured visit proposal. */
export const askNexa = async (
    message: string,
    conversationId: number | null,
): Promise<NexaApiResponse> => {
    const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
            Accept: 'application/json',
        },
        body: JSON.stringify({
            message,
            ...(conversationId ? { conversation_id: conversationId } : {}),
        }),
    });

    if (res.status === 429) {
        throw new Error('Anda mengirim pesan terlalu cepat. Tunggu sebentar lalu coba lagi.');
    }

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
        throw new Error(
            data?.reply ||
                'NEXA sedang mengalami kendala saat menghubungi AI. Silakan coba lagi.',
        );
    }

    return data;
};

/** POST /api/visits — called ONLY after explicit user confirmation (spec #17). */
export const confirmVisit = async (
    proposal: VisitProposal,
): Promise<{ message: string }> => {
    const res = await fetch('/api/visits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
            Accept: 'application/json',
        },
        body: JSON.stringify({
            student_id: proposal.student_id,
            visit_date: proposal.suggested_date_iso,
            purpose: proposal.purpose || 'Monitoring PKL',
        }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error(data?.message || 'Gagal membuat jadwal kunjungan.');
    }

    return { message: data.message };
};

export const nexaQuickPrompts = (role: NexaRole): string[] => {
    switch (role) {
        case 'admin':
            return [
                'Ringkas kondisi PKL hari ini',
                'Siapa siswa yang perlu perhatian?',
                'Tampilkan siswa yang belum ditempatkan',
                'Analisis monitoring bulan ini',
            ];
        case 'guru':
            return [
                'Siapa yang harus saya kunjungi?',
                'Siswa mana yang attendance-nya rendah?',
                'Siapa yang belum mengisi jurnal?',
                'Buat ringkasan siswa bimbingan saya',
            ];
        case 'industri':
            return [
                'Jurnal apa yang belum saya approve?',
                'Bagaimana perkembangan siswa saya?',
                'Siapa yang perlu saya evaluasi?',
            ];
        default:
            return [
                'Bagaimana status PKL saya?',
                'Berapa kehadiran saya?',
                'Apa jurnal saya yang belum disetujui?',
                'Kapan periode PKL saya berakhir?',
            ];
    }
};

/**
 * Lightweight markdown renderer for AI replies:
 * supports ### headings, **bold**, - bullets and line breaks.
 * No raw HTML is ever injected.
 */
const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={`${keyPrefix}-${i}`} className="font-bold">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
    });
};

export const MarkdownLite: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    const nodes: React.ReactNode[] = [];
    let bullets: string[] = [];

    const flushBullets = (key: string) => {
        if (bullets.length === 0) return;
        nodes.push(
            <ul key={key} className="my-1 ml-4 list-disc space-y-0.5">
                {bullets.map((b, i) => (
                    <li key={i}>{renderInline(b, `${key}-${i}`)}</li>
                ))}
            </ul>,
        );
        bullets = [];
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('- ')) {
            bullets.push(trimmed.slice(2));
            return;
        }

        flushBullets(`ul-${idx}`);

        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
            nodes.push(
                <p key={idx} className="mt-2 mb-1 font-bold first:mt-0">
                    {renderInline(trimmed.replace(/^#{2,3}\s*/, ''), `h-${idx}`)}
                </p>,
            );
            return;
        }

        if (trimmed === '') {
            return;
        }

        nodes.push(<p key={idx}>{renderInline(trimmed, `p-${idx}`)}</p>);
    });

    flushBullets('ul-end');

    return <div className="space-y-0.5">{nodes}</div>;
};

export const formatTime = (): string =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
