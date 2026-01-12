export type ModelVersion = 'gemini-2.5' | 'gemini-3.0';

export type ResolutionTier = 'low' | 'medium' | 'high';

export interface TokenCounts {
    total: number;
    breakdown: {
        text?: number;
        images?: number;
        video?: number;
        audio?: number;
        overhead?: number;
    };
}

export interface FileInput {
    id: string;
    name: string;
    type: 'text' | 'code' | 'image' | 'video' | 'audio' | 'pdf';
    size: number;
    content?: string; // For text/code
    metadata?: {
        width?: number;
        height?: number;
        duration?: number; // In seconds
        pageCount?: number; // For PDF
        fps?: number; // For video
        resolutionTier?: ResolutionTier; // For Gemini 3.0 images
    };
}
