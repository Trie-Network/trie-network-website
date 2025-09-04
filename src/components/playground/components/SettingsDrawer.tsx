import { X } from 'lucide-react';
import { Dropdown } from '../UIComponents';
import { Model, RAG_FILE_TYPES_STRING } from '../types';

interface SettingsDrawerProps {
    activeDrawer: 'none' | 'system' | 'settings';
    selectedModel: string;
    models: Model[];
    ragText: string;
    ragFile: File | null;
    chunkSize: number;
    kNearest: number;
    onCloseDrawer: () => void;
    onModelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onRagTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onRagFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChunkSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKNearestChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveRagFile: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
    activeDrawer,
    selectedModel,
    models,
    ragText,
    ragFile,
    chunkSize,
    kNearest,
    onCloseDrawer,
    onModelChange,
    onRagTextChange,
    onRagFileChange,
    onChunkSizeChange,
    onKNearestChange,
    onRemoveRagFile
}) => {
    return (
        <div className="p-6 space-y-8 bg-slate-50">
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-slate-800">Model</h3>
                </div>
                <div className="space-y-3">
                    <Dropdown
                        disabled={false}
                        value={selectedModel || ""}
                        onChange={onModelChange}
                        options={models.map(model => ({
                            name: model.name,
                            value: model.model
                        }))}
                        placeholder="Select a model"
                    />
                </div>
            </div>

            <div>
                <div className="mb-4 text-sm">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">RAG Context Text</label>
                            <textarea
                                value={ragText}
                                onChange={onRagTextChange}
                                className="w-full h-48 border border-slate-200 rounded-md p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm resize-none shadow-inner bg-white"
                                placeholder="Enter your RAG context text here..."
                                disabled={ragFile !== null}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Add text that will be used as context for RAG
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">OR Upload a File</label>
                            <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center bg-white">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept={RAG_FILE_TYPES_STRING}
                                    onChange={onRagFileChange}
                                    disabled={ragText !== ""}
                                />

                                <label htmlFor="file-upload"
                                    className={`flex flex-col items-center cursor-pointer ${ragText !== "" ? 'opacity-50' : ''}`}
                                >
                                    <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3V4" />
                                    </svg>

                                    {ragFile ? (
                                        <div className="text-primary font-medium">{ragFile.name}</div>
                                    ) : (
                                        <div className="text-slate-500">Click to upload or drag and drop</div>
                                    )}
                                </label>

                                {ragFile && (
                                    <button
                                        className="text-xs text-error hover:underline mt-2"
                                        onClick={onRemoveRagFile}
                                    >
                                        Remove file
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Chunk Size</label>
                                <input
                                    type="number"
                                    value={chunkSize}
                                    onChange={onChunkSizeChange}
                                    className="w-full border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white"
                                    placeholder="500"
                                    min="1"
                                />
                                <p className="text-xs text-primary-hover mt-2">
                                    Size of text chunks for processing
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">K-Nearest</label>
                                <input
                                    type="number"
                                    value={kNearest}
                                    onChange={onKNearestChange}
                                    className="w-full border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white"
                                    placeholder="3"
                                    min="1"
                                />
                                <p className="text-xs text-primary-hover mt-2">
                                    Number of nearest chunks to retrieve
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

