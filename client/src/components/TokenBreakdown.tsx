import React from 'react';
import { PieChart, Image, Film, Mic, FileText, Server } from 'lucide-react';
import type { TokenCounts } from '../types';

interface TokenBreakdownProps {
    counts: TokenCounts;
}

const TokenBreakdown: React.FC<TokenBreakdownProps> = ({ counts }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
                <PieChart className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">Token Estimation</h2>
            </div>

            <div className="flex flex-col gap-6">
                {/* Total Count */}
                <div className="text-center p-6 bg-indigo-50 rounded-xl border border-indigo-100">
                    <span className="block text-sm font-medium text-indigo-600 uppercase tracking-wider mb-1">Total Input Tokens</span>
                    <span className="block text-5xl font-extrabold text-indigo-900 tracking-tight">
                        {counts.total.toLocaleString()}
                    </span>
                    <span className="block text-xs text-indigo-400 mt-2">
                         ≈ {((counts.total / 128000) * 100).toFixed(2)}% of 128k context
                    </span>
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <BreakdownItem 
                        icon={<FileText className="w-4 h-4 text-gray-500" />}
                        label="Text & Code"
                        value={counts.breakdown.text}
                        color="bg-gray-100"
                    />
                    <BreakdownItem 
                        icon={<Image className="w-4 h-4 text-blue-500" />}
                        label="Images & PDF"
                        value={counts.breakdown.images}
                        color="bg-blue-50"
                    />
                    <BreakdownItem 
                        icon={<Film className="w-4 h-4 text-red-500" />}
                        label="Video"
                        value={counts.breakdown.video}
                        color="bg-red-50"
                    />
                    <BreakdownItem 
                        icon={<Mic className="w-4 h-4 text-purple-500" />}
                        label="Audio"
                        value={counts.breakdown.audio}
                        color="bg-purple-50"
                    />
                     <BreakdownItem 
                        icon={<Server className="w-4 h-4 text-amber-500" />}
                        label="Overhead"
                        value={counts.breakdown.overhead}
                        color="bg-amber-50"
                    />
                </div>
            </div>
        </div>
    );
};

const BreakdownItem: React.FC<{ icon: React.ReactNode, label: string, value?: number, color: string }> = ({ icon, label, value, color }) => {
    if (!value) return null;
    return (
        <div className={`flex items-center justify-between p-3 rounded-lg ${color}`}>
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{value.toLocaleString()}</span>
        </div>
    );
};

export default TokenBreakdown;