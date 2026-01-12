import type { ModelVersion, ResolutionTier } from '../types';

export const GEMINI_2_5_IMAGE_COST = 258;
export const GEMINI_3_0_IMAGE_TIERS = {
    low: 280,
    medium: 560,
    high: 1120,
};

export const AUDIO_TOKENS_PER_SECOND = 32;
export const GEMINI_2_5_VIDEO_TOKENS_PER_SECOND = 263;
export const GEMINI_3_0_VIDEO_TOKENS_PER_FRAME = 70;

// Text Heuristics
export const CHARS_PER_TOKEN_TEXT = 4;
export const CHARS_PER_TOKEN_CODE = 3.25;
export const TOKENS_PER_CHAR_CJK = 0.7;

export const calculateTextTokens = (text: string, isCode: boolean = false, isCJK: boolean = false): number => {
    const length = text.length;
    if (isCJK) {
        return Math.ceil(length * TOKENS_PER_CHAR_CJK);
    }
    if (isCode) {
        return Math.ceil(length / CHARS_PER_TOKEN_CODE);
    }
    return Math.ceil(length / CHARS_PER_TOKEN_TEXT);
};

export const calculateImageTokens = (
    version: ModelVersion,
    width: number,
    height: number,
    tier: ResolutionTier = 'medium'
): number => {
    if (version === 'gemini-2.5') {
        // Simple bounding box estimation for Gemini 2.5
        // If > 384px in either dimension, it's tiled.
        if (width <= 384 && height <= 384) {
            return GEMINI_2_5_IMAGE_COST;
        }
        const tilesX = Math.ceil(width / 768);
        const tilesY = Math.ceil(height / 768);
        return tilesX * tilesY * GEMINI_2_5_IMAGE_COST;
    } else {
        // Gemini 3.0 uses Resolution Tiers
        return GEMINI_3_0_IMAGE_TIERS[tier];
    }
};

export const calculateVideoTokens = (
    version: ModelVersion,
    durationSeconds: number,
    fps: number = 1,
    includeAudio: boolean = true
): number => {
    let videoTokens = 0;
    
    if (version === 'gemini-2.5') {
        videoTokens = Math.ceil(durationSeconds * GEMINI_2_5_VIDEO_TOKENS_PER_SECOND);
    } else {
        // Gemini 3.0 is frame-based
        const totalFrames = Math.ceil(durationSeconds * fps);
        videoTokens = totalFrames * GEMINI_3_0_VIDEO_TOKENS_PER_FRAME;
    }

    const audioTokens = includeAudio ? Math.ceil(durationSeconds * AUDIO_TOKENS_PER_SECOND) : 0;
    
    return videoTokens + audioTokens;
};

export const calculateAudioTokens = (durationSeconds: number): number => {
    return Math.ceil(durationSeconds * AUDIO_TOKENS_PER_SECOND);
};

export const calculatePDFTokens = (
    version: ModelVersion,
    pageCount: number,
    tier: ResolutionTier = 'medium'
): number => {
    if (version === 'gemini-2.5') {
        return pageCount * GEMINI_2_5_IMAGE_COST;
    } else {
        return pageCount * GEMINI_3_0_IMAGE_TIERS[tier];
    }
};