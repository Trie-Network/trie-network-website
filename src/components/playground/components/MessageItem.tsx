import { Copy, Check } from 'lucide-react';
import { Message } from '../types';

interface MessageItemProps {
    message: Message;
    index: number;
    onCopy: (id: number) => void;
    copiedMessageId: number | null;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, index, onCopy, copiedMessageId }) => (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[80%] rounded-lg p-4 ${
            message.role === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-white border border-slate-200'
        }`}>
            <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium capitalize">
                    {message.role}
                </span>
                <button
                    onClick={() => onCopy(index)}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                    {copiedMessageId === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : (
                        <Copy className="w-4 h-4 text-slate-500" />
                    )}
                </button>
            </div>
            {message.thinking && (
                <div className="mb-2 p-2 bg-slate-100 rounded text-sm font-mono">
                    {message.thinking}
                </div>
            )}
            <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
    </div>
);

