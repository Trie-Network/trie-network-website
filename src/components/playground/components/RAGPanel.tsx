import { Slider } from '../UIComponents';
import { RAG_FILE_TYPES_STRING, LAYOUT_CLASSES } from '../types';

interface RAGPanelProps {
    ragText: string;
    ragFile: File | null;
    chunkSize: number;
    kNearest: number;
    onRagTextChange: (text: string) => void;
    onRagFileChange: (file: File | null) => void;
    onChunkSizeChange: (size: number) => void;
    onKNearestChange: (k: number) => void;
    onSaveRAG: () => void;
}

export const RAGPanel: React.FC<RAGPanelProps> = ({
    ragText,
    ragFile,
    chunkSize,
    kNearest,
    onRagTextChange,
    onRagFileChange,
    onChunkSizeChange,
    onKNearestChange,
    onSaveRAG
}) => (
    <div className="space-y-6">
        <div>
            <h3 className="font-medium mb-3 text-slate-800">RAG Text</h3>
            <textarea
                value={ragText}
                onChange={(e) => onRagTextChange(e.target.value)}
                placeholder="Enter RAG text here..."
                className="w-full h-32 p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
        </div>

        <div>
            <h3 className="font-medium mb-3 text-slate-800">RAG File</h3>
            <input
                type="file"
                accept={RAG_FILE_TYPES_STRING}
                onChange={(e) => onRagFileChange(e.target.files?.[0] || null)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
        </div>

        <div>
            <h3 className="font-medium mb-3 text-slate-800">Chunk Size</h3>
            <Slider
                value={chunkSize}
                onChange={(e) => onChunkSizeChange(parseInt(e.target.value))}
                min={50}
                max={500}
                step={10}
                displayValue={chunkSize}
            />
        </div>

        <div>
            <h3 className="font-medium mb-3 text-slate-800">K-Nearest Neighbors</h3>
            <Slider
                value={kNearest}
                onChange={(e) => onKNearestChange(parseInt(e.target.value))}
                min={1}
                max={10}
                step={1}
                displayValue={kNearest}
            />
        </div>

        <button
            onClick={onSaveRAG}
            className={LAYOUT_CLASSES.button.primary}
        >
            Save RAG Settings
        </button>
    </div>
);

