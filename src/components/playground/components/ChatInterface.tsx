import { useRef, useEffect } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { Message } from '../types';
import { ThinkingAnimation } from '../UIComponents';

interface ChatInterfaceProps {
    messages: Message[];
    isProcessing: boolean;
    copiedMessageId: number | null;
    onCopy: (text: string, messageIndex: number) => void;
    onRerun: (userMessageIndex: number) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    isProcessing,
    copiedMessageId,
    onCopy,
    onRerun
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isProcessing]);

    return (
        <div className="flex-1 overflow-y-auto p-6 pb-2 space-y-6">
            {messages.map((message, index) => (
                <div key={index} className={`mb-6`}>
                    <div className="text-xs font-semibold mb-2 uppercase tracking-wide text-slate-500 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${message.role === "assistant" ? "bg-primary" : "bg-slate-400"}`}></span>
                        {message.role}
                    </div>
                    <div className="relative flex">
                        {message.role === "user" ? (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mr-3 flex-shrink-0">
                                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mr-3 flex-shrink-0">
                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 12h16.5M12 3.75v16.5M4.501 5.25l15 13.5M19.499 5.25l-15 13.5" />
                                </svg>
                            </div>
                        )}

                        <div className={`max-w-[80%] rounded-2xl p-4 ${message.role === "user"
                            ? "bg-blue-50 text-slate-700 border border-blue-100 group relative"
                            : "bg-slate-50 text-slate-700 border border-slate-200 group relative"
                            }`}>
                            {message.thinking && (
                                <div className="p-3 mb-3 font-mono text-sm bg-white border border-slate-200 rounded-xl text-slate-600 overflow-x-auto shadow-inner">
                                    {message.thinking}
                                </div>
                            )}
                            <div className={`whitespace-pre-wrap ${message.role === "user" ? "" : ""}`} style={{ wordBreak: 'break-word' }}>
                                {message.content}
                            </div>

                            {message.role === "assistant" && (
                                <div className="flex gap-1.5 mt-3 justify-end">
                                    <button
                                        onClick={() => onCopy(message.content, index)}
                                        className="py-1 px-2 bg-white rounded-md text-slate-600 hover:text-primary border border-slate-200 shadow-sm text-xs font-medium flex items-center"
                                        title="Copy to clipboard"
                                    >
                                        {copiedMessageId === index ? (
                                            <>
                                                <Check size={14} className="text-green-500 mr-1" />
                                                <span className="text-green-500">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} className="mr-1" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => onRerun(index)}
                                        className="py-1 px-2 bg-white rounded-md text-slate-600 hover:text-primary border border-slate-200 shadow-sm text-xs font-medium flex items-center"
                                        title="Rerun message"
                                    >
                                        <RotateCcw size={14} className="mr-1" />
                                        <span>Rerun</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            
            {isProcessing && (
                <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 12h16.5M12 3.75v16.5M4.501 5.25l15 13.5M19.499 5.25l-15 13.5" />
                        </svg>
                    </div>
                    <div className="max-w-[80%] rounded-2xl p-4 bg-slate-50 border border-slate-200">
                        <ThinkingAnimation />
                    </div>
                </div>
            )}
            
            {messages.length === 0 && !isProcessing && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-slate-400 text-center bg-slate-50 p-8 rounded-lg shadow-inner">
                        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <p className="mb-2 text-xl font-semibold text-primary">No messages yet</p>
                        <p className="text-sm">Start a conversation below</p>
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
        </div>
    );
};
