import { X } from 'lucide-react';
import { Dropdown } from '../UIComponents';
import { Project, MAX_SYSTEM_CHARS } from '../types';

interface SystemPanelProps {
    projects: Project[];
    selectedProject: string;
    systemPrompt: string;
    isEditing: boolean;
    originalSystemPrompt: string;
    activeDrawer: 'none' | 'system' | 'settings';
    onProjectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onSystemPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onClearSystemPrompt: () => void;
    onCancelEdit: () => void;
    onEditPrompt: () => void;
    onSavePrompt: () => void;
    onCloseDrawer: () => void;
}

export const SystemPanel: React.FC<SystemPanelProps> = ({
    projects,
    selectedProject,
    systemPrompt,
    isEditing,
    originalSystemPrompt,
    activeDrawer,
    onProjectChange,
    onSystemPromptChange,
    onClearSystemPrompt,
    onCancelEdit,
    onEditPrompt,
    onSavePrompt,
    onCloseDrawer
}) => {
    const charCountPercentage = (systemPrompt?.length || 0) / MAX_SYSTEM_CHARS * 100;
    const nearLimit = charCountPercentage > 80;
    const atLimit = (systemPrompt?.length || 0) >= MAX_SYSTEM_CHARS;

    return (
        <div className="p-5 bg-slate-50">
            <div className="flex items-center mb-4">
                <div className="flex-grow">
                    {projects.filter(p => p.name !== "Default").length === 0 ? (
                        <div className="flex items-center bg-primary-light text-primary px-4 py-3 rounded-lg text-sm font-medium">
                            <span className="mr-2">Project:</span>
                            <span className="font-semibold">Default</span>
                        </div>
                    ) : (
                        <Dropdown
                            value={selectedProject}
                            onChange={onProjectChange}
                            options={projects}
                            placeholder="Select a project"
                        />
                    )}
                </div>
            </div>

            <div className="mb-4 text-sm">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">System Prompt</label>
                    <span className={`text-xs font-medium ${atLimit ? 'text-error' :
                        nearLimit ? 'text-warning' :
                            'text-slate-500'
                        }`}>
                        {systemPrompt.length}/{MAX_SYSTEM_CHARS}
                    </span>
                </div>
                <div className="relative mb-1">
                    <textarea
                        value={systemPrompt}
                        onChange={onSystemPromptChange}
                        className={`w-full h-80 border ${atLimit ? 'border-error focus:ring-error' :
                            nearLimit ? 'border-warning focus:ring-warning' :
                                'border-slate-200 focus:ring-primary'
                            } rounded-md p-3 text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent font-mono text-sm resize-none shadow-inner bg-white`}
                        placeholder="Enter system prompt here..."
                        maxLength={MAX_SYSTEM_CHARS}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden rounded-b">
                        <div
                            className={`h-full ${atLimit ? 'bg-error' :
                                nearLimit ? 'bg-warning' :
                                    'bg-primary'
                                } transition-all duration-300`}
                            style={{ width: `${charCountPercentage}%` }}
                        />
                    </div>
                </div>
                {nearLimit && !atLimit && (
                    <p className="text-xs text-warning mt-1">
                        Approaching character limit
                    </p>
                )}
                {atLimit && (
                    <p className="text-xs text-error mt-1">
                        Character limit reached
                    </p>
                )}
                <div className="mt-3 relative">
                    <div className="flex space-x-2">
                        <button
                            onClick={onClearSystemPrompt}
                            className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-primary hover:border-primary rounded-lg transition-colors bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-30 flex items-center justify-center"
                            disabled={systemPrompt.length === 0}
                        >
                            <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear
                        </button>

                        {selectedProject !== "Default" && isEditing && (
                            <button
                                onClick={onCancelEdit}
                                className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-error hover:border-error rounded-lg transition-colors bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-30 flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </button>
                        )}

                        {selectedProject !== "Default" && !isEditing && systemPrompt !== originalSystemPrompt && (
                            <button
                                onClick={onEditPrompt}
                                className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-primary hover:border-primary rounded-lg transition-colors bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-30 flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit
                            </button>
                        )}

                        <button
                            onClick={onSavePrompt}
                            className="flex-grow px-4 py-2 border border-slate-200 text-slate-600 hover:text-primary hover:border-primary rounded-lg transition-colors bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-30 flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

