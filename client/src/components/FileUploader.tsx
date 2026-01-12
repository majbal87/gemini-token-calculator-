import React, { useCallback } from 'react';
import { Upload, FileText, Image, Video, Music, FileCode, X } from 'lucide-react';
import type { FileInput } from '../types';

interface FileUploaderProps {
    onFilesSelected: (files: File[]) => void;
    uploadedFiles: FileInput[];
    onRemoveFile: (id: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, uploadedFiles, onRemoveFile }) => {
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(e.dataTransfer.files));
        }
    }, [onFilesSelected]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files));
        }
    };

    const getIconForType = (type: FileInput['type']) => {
        switch (type) {
            case 'image': return <Image className="w-5 h-5 text-blue-500" />;
            case 'video': return <Video className="w-5 h-5 text-red-500" />;
            case 'audio': return <Music className="w-5 h-5 text-purple-500" />;
            case 'code': return <FileCode className="w-5 h-5 text-green-500" />;
            case 'pdf': return <FileText className="w-5 h-5 text-orange-500" />;
            default: return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <input 
                    type="file" 
                    id="file-input" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileInput}
                />
                <div className="p-4 bg-indigo-50 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Click to upload or drag and drop</h3>
                <p className="text-gray-500 mt-2">
                    Supports Text, Images, Video, Audio, PDFs, and Code files.
                </p>
            </div>

            {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({uploadedFiles.length})</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {uploadedFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    {getIconForType(file.type)}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-md">{file.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                                            {file.metadata?.width && (
                                                <>
                                                    <span>•</span>
                                                    <span>{file.metadata.width}x{file.metadata.height}px</span>
                                                </>
                                            )}
                                            {file.metadata?.duration && (
                                                <>
                                                    <span>•</span>
                                                    <span>{file.metadata.duration.toFixed(1)}s</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onRemoveFile(file.id)}
                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploader;