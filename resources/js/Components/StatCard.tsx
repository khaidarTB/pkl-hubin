import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    color?: 'blue' | 'green' | 'amber' | 'red' | 'cyan';
}

export const StatCard: React.FC<Props> = ({ title, value, description, icon: Icon, color = 'blue' }) => {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-rose-50 text-rose-600',
        cyan: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 group">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
                    {description && <p className="text-[11px] text-slate-400 mt-1.5">{description}</p>}
                </div>
                <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};
