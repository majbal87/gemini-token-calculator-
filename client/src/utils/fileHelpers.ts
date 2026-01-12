import type { FileInput } from '../types';

export const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};

export const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
        };
        video.onerror = reject;
        video.src = URL.createObjectURL(file);
    });
};

export const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.onloadedmetadata = () => {
             window.URL.revokeObjectURL(audio.src);
             resolve(audio.duration);
        };
        audio.onerror = reject;
        audio.src = URL.createObjectURL(file);
    });
};

export const identifyFileType = (file: File): FileInput['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type === 'application/pdf') return 'pdf';
    
    // Code extensions check
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json', '.java', '.cpp', '.c', '.rs', '.go'];
    if (codeExtensions.some(ext => file.name.endsWith(ext))) return 'code';

    return 'text';
};