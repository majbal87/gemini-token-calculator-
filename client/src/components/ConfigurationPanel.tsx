import React from 'react';
import { Settings, Info } from 'lucide-react';
import type { ModelVersion, ResolutionTier } from '../types';

interface ConfigurationPanelProps {
    modelVersion: ModelVersion;
    setModelVersion: (version: ModelVersion) => void;
    defaultResolutionTier: ResolutionTier;
    setDefaultResolutionTier: (tier: ResolutionTier) => void;
    videoFPS: number;
    setVideoFPS: (fps: number) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
    modelVersion,
    setModelVersion,
    defaultResolutionTier,
    setDefaultResolutionTier,
    videoFPS,
    setVideoFPS,
}) => {
    return (
        <div className="bg-gray-50 border-r border-gray-200 w-80 min-h-screen p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">Configuration</h2>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Model Family</label>
                <div className="flex flex-col gap-2">
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${modelVersion === 'gemini-2.5' ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                        <input
                            type="radio"
                            name="model"
                            value="gemini-2.5"
                            checked={modelVersion === 'gemini-2.5'}
                            onChange={() => setModelVersion('gemini-2.5')}
                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">Gemini 2.5</span>
                            <span className="block text-xs text-gray-500">Flash / Pro (Fixed Tiling)</span>
                        </div>
                    </label>

                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${modelVersion === 'gemini-3.0' ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                        <input
                            type="radio"
                            name="model"
                            value="gemini-3.0"
                            checked={modelVersion === 'gemini-3.0'}
                            onChange={() => setModelVersion('gemini-3.0')}
                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">Gemini 3.0</span>
                            <span className="block text-xs text-gray-500">Flash / Pro (Dynamic Tiers)</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Gemini 3.0 Specific Settings */}
            {modelVersion === 'gemini-3.0' && (
                <div className="space-y-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">Default Image Resolution</label>
                            <div className="group relative">
                                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                <div className="absolute right-0 w-64 p-2 mt-2 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    Low: 280 tokens<br/>Medium: 560 tokens<br/>High: 1120 tokens
                                </div>
                            </div>
                        </div>
                        <select
                            value={defaultResolutionTier}
                            onChange={(e) => setDefaultResolutionTier(e.target.value as ResolutionTier)}
                            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="low">Low (Thumbnails)</option>
                            <option value="medium">Medium (Documents)</option>
                            <option value="high">High (OCR/Detail)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Video Sampling (FPS)</label>
                        <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={videoFPS}
                            onChange={(e) => setVideoFPS(parseFloat(e.target.value))}
                            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <p className="text-xs text-gray-500">Standard is 1 FPS. Higher FPS = Linear cost increase.</p>
                    </div>
                </div>
            )}
            
            <div className="mt-auto">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                     <h3 className="text-xs font-semibold text-indigo-900 uppercase tracking-wide mb-2">Technical Note</h3>
                     <p className="text-xs text-indigo-700 leading-relaxed">
                        Gemini 2.5 uses a fixed 258-token tile strategy. Gemini 3.0 allows explicitly trading cost for resolution via tiers.
                     </p>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationPanel;