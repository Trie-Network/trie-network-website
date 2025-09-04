import { MAX_SYSTEM_CHARS, LAYOUT_CLASSES } from '../types';
import { calculateCharCountPercentage, isNearLimit, isAtLimit } from '../utils';

interface SystemPromptEditorProps {
    systemPrompt: string;
    isEditing: boolean;
    onSystemPromptChange: (prompt: string) => void;
    onEdit: () => void;
    onCancel: () => void;
    onClear: () => void;
    onSave: () => void;
}

export const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({
    systemPrompt,
    isEditing,
    onSystemPromptChange,
    onEdit,
    onCancel,
    onClear,
    onSave
}) => {
    const charCountPercentage = calculateCharCountPercentage(systemPrompt, MAX_SYSTEM_CHARS);
    const nearLimit = isNearLimit(charCountPercentage);
    const atLimit = isAtLimit(systemPrompt, MAX_SYSTEM_CHARS);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-800">System Prompt</h3>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={onCancel}
                                className={LAYOUT_CLASSES.button.secondary}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSave}
                                className={LAYOUT_CLASSES.button.primary}
                            >
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onEdit}
                                className={LAYOUT_CLASSES.button.secondary}
                            >
                                Edit
                            </button>
                            <button
                                onClick={onClear}
                                className={LAYOUT_CLASSES.button.danger}
                            >
                                Clear
                            </button>
                        </>
                    )}
                </div>
            </div>

            <textarea
                value={systemPrompt}
                onChange={(e) => onSystemPromptChange(e.target.value)}
                placeholder="Enter system prompt..."
                maxLength={MAX_SYSTEM_CHARS}
                className={`w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    nearLimit ? 'border-amber-300' : 'border-slate-200'
                }`}
            />

            <div className="flex justify-between items-center text-sm">
                <span className={`${nearLimit ? 'text-amber-600' : 'text-slate-500'}`}>
                    {systemPrompt.length} / {MAX_SYSTEM_CHARS} characters
                </span>
                {atLimit && (
                    <span className="text-amber-600 font-medium">
                        Character limit reached
                    </span>
                )}
            </div>
        </div>
    );
};

