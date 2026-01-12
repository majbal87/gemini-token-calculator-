import { useState, useCallback, useEffect } from 'react';
import type { ModelVersion, ResolutionTier, FileInput, TokenCounts } from '../types';
import { 
    calculateTextTokens, 
    calculateImageTokens, 
    calculateVideoTokens, 
    calculateAudioTokens,
    calculatePDFTokens
} from '../utils/geminiRules';
import { 
    readFileContent, 
    getImageDimensions, 
    getVideoDuration, 
    getAudioDuration, 
    identifyFileType 
} from '../utils/fileHelpers';

export const useTokenCalculator = () => {
    const [modelVersion, setModelVersion] = useState<ModelVersion>('gemini-3.0');
    const [defaultResolutionTier, setDefaultResolutionTier] = useState<ResolutionTier>('medium');
    const [videoFPS, setVideoFPS] = useState<number>(1);
    const [files, setFiles] = useState<FileInput[]>([]);
    const [tokenCounts, setTokenCounts] = useState<TokenCounts>({ total: 0, breakdown: {} });
    const [isProcessing, setIsProcessing] = useState(false);

    const addFiles = useCallback(async (newFiles: File[]) => {
        setIsProcessing(true);
        const processedFiles: FileInput[] = [];

        for (const file of newFiles) {
            const type = identifyFileType(file);
            const id = crypto.randomUUID();
            let content = '';
            let metadata: FileInput['metadata'] = {};

            try {
                if (type === 'text' || type === 'code') {
                    content = await readFileContent(file);
                } else if (type === 'image') {
                    const dims = await getImageDimensions(file);
                    metadata = { width: dims.width, height: dims.height, resolutionTier: defaultResolutionTier };
                } else if (type === 'video') {
                    const duration = await getVideoDuration(file);
                    metadata = { duration, fps: videoFPS };
                } else if (type === 'audio') {
                    const duration = await getAudioDuration(file);
                    metadata = { duration };
                } else if (type === 'pdf') {
                    // Placeholder for PDF page counting
                    metadata = { pageCount: 1, resolutionTier: defaultResolutionTier };
                }
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
            }

            processedFiles.push({
                id,
                name: file.name,
                type,
                size: file.size,
                content,
                metadata
            });
        }

        setFiles(prev => [...prev, ...processedFiles]);
        setIsProcessing(false);
    }, [defaultResolutionTier, videoFPS]);

    const removeFile = useCallback((id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    }, []);

    const updateFileMetadata = useCallback((id: string, metadata: Partial<FileInput['metadata']>) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, metadata: { ...f.metadata, ...metadata } } : f));
    }, []);

    // Recalculate tokens whenever files or settings change
    useEffect(() => {
        let total = 0;
        const breakdown = {
            text: 0,
            images: 0,
            video: 0,
            audio: 0,
            overhead: 0
        };

        files.forEach(file => {
            let fileTokens = 0;
            if (file.type === 'text' || file.type === 'code') {
                const tokens = calculateTextTokens(file.content || '', file.type === 'code');
                breakdown.text += tokens;
                fileTokens = tokens;
            } else if (file.type === 'image' && file.metadata?.width && file.metadata?.height) {
                // For Gemini 3, use the file specific tier if set, else default
                const tier = modelVersion === 'gemini-3.0' ? (file.metadata.resolutionTier || defaultResolutionTier) : undefined;
                const tokens = calculateImageTokens(modelVersion, file.metadata.width, file.metadata.height, tier);
                breakdown.images += tokens;
                fileTokens = tokens;
            } else if (file.type === 'video' && file.metadata?.duration) {
                const fps = modelVersion === 'gemini-3.0' ? videoFPS : undefined;
                const tokens = calculateVideoTokens(modelVersion, file.metadata.duration, fps);
                breakdown.video += tokens;
                fileTokens = tokens;
            } else if (file.type === 'audio' && file.metadata?.duration) {
                const tokens = calculateAudioTokens(file.metadata.duration);
                breakdown.audio += tokens;
                fileTokens = tokens;
            } else if (file.type === 'pdf' && file.metadata?.pageCount) {
                 const tier = modelVersion === 'gemini-3.0' ? (file.metadata.resolutionTier || defaultResolutionTier) : undefined;
                 const tokens = calculatePDFTokens(modelVersion, file.metadata.pageCount, tier);
                 breakdown.images += tokens;
                 fileTokens = tokens;
            }
            total += fileTokens;
        });

        // Add minimal protocol overhead (e.g., 10 tokens)
        breakdown.overhead = 10;
        total += 10;

        setTokenCounts({ total, breakdown });

    }, [files, modelVersion, defaultResolutionTier, videoFPS]);

    return {
        modelVersion,
        setModelVersion,
        defaultResolutionTier,
        setDefaultResolutionTier,
        videoFPS,
        setVideoFPS,
        files,
        addFiles,
        removeFile,
        updateFileMetadata,
        tokenCounts,
        isProcessing
    };
};