import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Settings, FileText, X, Menu, Copy, RotateCcw, Check, BetweenVerticalStart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { completeChat, getRAGContext, getModels } from '@/utils/hf';
import { useSearchParams } from 'react-router-dom'
import { Slider, Dropdown, ThinkingAnimation } from './Components';
import { Modal } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { CONSTANTS } from '@/config/network';
import { useAuth } from '@/hooks';
import { useTokenName } from '@/contexts/TokenNameContext';
import { END_POINTS } from '@/api/requests';
import { useGlobalLoaders } from '@/hooks/useGlobalLoaders';
import { fetchInferenceBalance as fetchBalance } from '@/utils/balanceUtils';


interface UpdateInferenceBalanceEvent extends CustomEvent {
    detail: number;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    thinking?: string;
}

interface Project {
    name: string;
    value: string;
    messages?: Message[];
    systemPrompt?: string;
}

interface Model {
    name: string;
    model: string;
    selected: boolean;
    provider: Record<string, any>;
    price: number;
}

interface NFTData {
    nft: string;
    nft_value: string;
    metadata?: {
        name?: string;
        provider?: Record<string, any>;
    };
}

interface PlaygroundState {
    temperature: number;
    maxTokens: number;
    topP: number;
    selectedModel: string;
    messages: Message[];
    userMessage: string;
    models: Model[];
    systemPrompt: string;
    projects: Project[];
    selectedProject: string;
    isProcessing: boolean;
    isRequestProcessing: boolean;
    inputError: boolean;
    copiedMessageId: number | null;
    uploading: boolean;
    inferenceBalance: number | null;
    balanceLoading: boolean;
    activeDrawer: 'none' | 'system' | 'settings';
    showSaveConfirmation: boolean;
    isEditing: boolean;
    originalSystemPrompt: string;
    showClearModal: boolean;
    saveNotificationMessage: string;
    activeTab: 'system' | 'rag';
    ragText: string;
    ragFile: File | null;
    chunkSize: number;
    kNearest: number;
}

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
}

interface MessageItemProps {
    message: Message;
    index: number;
    onCopy: (id: number) => void;
    copiedMessageId: number | null;
}

interface SettingsPanelProps {
    temperature: number;
    maxTokens: number;
    topP: number;
    onTemperatureChange: (value: number) => void;
    onMaxTokensChange: (value: number) => void;
    onTopPChange: (value: number) => void;
}

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

interface SystemPromptEditorProps {
    systemPrompt: string;
    isEditing: boolean;
    onSystemPromptChange: (prompt: string) => void;
    onEdit: () => void;
    onCancel: () => void;
    onClear: () => void;
    onSave: () => void;
}

interface ClearConfirmationModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
}


const MAX_SYSTEM_CHARS = 2000;
const RAG_FILE_TYPES = [".txt", ".md", ".json", ".csv", ".pdf", ".docx", ".html", ".htm", ".rtf"];
const RAG_FILE_TYPES_STRING = RAG_FILE_TYPES.join(",");

const DEFAULT_STATE: Partial<PlaygroundState> = {
    temperature: 0.5,
    maxTokens: 2048,
    topP: 0.5,
    selectedModel: "",
    messages: [
        {
            role: "user",
            content: "hey how are you doing"
        },
        {
            role: "assistant",
            thinking: "<think>\nThinking about response...\n</think>",
            content: "im just a large language model and how can I help you today"
        },
    ],
    userMessage: "",
    models: [],
    systemPrompt: "",
    projects: [{ name: "Default", value: "Default" }],
    selectedProject: "Default",
    isProcessing: false,
    isRequestProcessing: false,
    inputError: false,
    copiedMessageId: null,
    uploading: false,
    inferenceBalance: null,
    balanceLoading: false,
    activeDrawer: 'none',
    showSaveConfirmation: false,
    isEditing: false,
    originalSystemPrompt: "",
    showClearModal: false,
    saveNotificationMessage: "System prompt saved successfully",
    activeTab: 'system',
    ragText: "",
    ragFile: null,
    chunkSize: 100,
    kNearest: 3
};

const STORAGE_KEYS = {
    LS_PREFIX: 'face_playground_',
    LS_PROJECTS_KEY: 'face_playground_projects'
} as const;

const ANIMATION_CONFIG = {
    drawer: {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
        transition: { type: 'spring', damping: 25, stiffness: 200 }
    },
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
    }
} as const;

const LAYOUT_CLASSES = {
    container: 'min-h-screen bg-slate-50 flex flex-col',
    header: 'bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between',
    main: 'flex-1 flex overflow-hidden',
    sidebar: 'w-80 bg-white border-r border-slate-200 flex flex-col',
    content: 'flex-1 flex flex-col',
    messages: 'flex-1 overflow-y-auto p-4 space-y-4',
    input: 'border-t border-slate-200 p-4 bg-white',
    drawer: 'fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50',
    drawerHeader: 'border-b border-slate-200 px-6 py-4 flex items-center justify-between',
    drawerContent: 'flex-1 overflow-y-auto p-6',
    modal: 'space-y-4',
    button: {
        primary: 'px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors',
        secondary: 'px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors',
        danger: 'px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors'
    }
} as const;


const createModelFromNFT = (nft: NFTData): Model => ({
    name: nft.metadata?.name || nft.nft,
    model: nft.nft,
    selected: false,
    provider: nft.metadata?.provider || {},
    price: parseFloat(nft.nft_value) || 0,
});

const calculateCharCountPercentage = (text: string): number => {
    return (text.length / MAX_SYSTEM_CHARS) * 100;
};

const isNearLimit = (percentage: number): boolean => percentage > 80;
const isAtLimit = (text: string): boolean => text.length === MAX_SYSTEM_CHARS;

const formatModelName = (modelName: string): string => {
    return modelName.replace(/:/g, ' - ').replace(/_/g, ' ');
};

const getStorageKey = (key: string): string => {
    return `${STORAGE_KEYS.LS_PREFIX}${key}`;
};

const saveToStorage = (key: string, data: any): void => {
    try {
        localStorage.setItem(getStorageKey(key), JSON.stringify(data));
    } catch (error) {
        
    }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(getStorageKey(key));
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        
        return defaultValue;
    }
};

const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {

        return false;
    }
};

const showToast = (message: string, type: 'success' | 'error' = 'success'): void => {
    if (type === 'success') {
        toast.success(message);
    } else {
        toast.error(message);
    }
};


const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children, title }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                className={LAYOUT_CLASSES.drawer}
                initial={ANIMATION_CONFIG.drawer.initial}
                animate={ANIMATION_CONFIG.drawer.animate}
                exit={ANIMATION_CONFIG.drawer.exit}
                transition={ANIMATION_CONFIG.drawer.transition}
            >
                <div className={LAYOUT_CLASSES.drawerHeader}>
                    <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className={LAYOUT_CLASSES.drawerContent}>
                    {children}
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

const MessageItem: React.FC<MessageItemProps> = ({ message, index, onCopy, copiedMessageId }) => (
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

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    temperature,
    maxTokens,
    topP,
    onTemperatureChange,
    onMaxTokensChange,
    onTopPChange
}) => (
    <div className="space-y-6">
        <div>
            <h3 className="font-medium mb-3 text-slate-800">Temperature</h3>
            <Slider
                value={temperature}
                onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                min={0}
                max={1}
                step={0.01}
                displayValue={temperature.toFixed(1)}
            />
            <p className="text-xs text-primary-hover mt-2">
                Higher values produce more creative outputs
            </p>
        </div>

        <div>
            <h3 className="font-medium mb-3 text-slate-800">Max Tokens</h3>
            <div className="flex items-center">
                <Slider
                    displayValue={maxTokens}
                    value={maxTokens}
                    onChange={(e) => onMaxTokensChange(parseInt(e.target.value))}
                    min={1}
                    max={10000}
                    step={1}
                    className="flex-1"
                />
            </div>
            <p className="text-xs text-primary-hover mt-2">
                Maximum length of generated text
            </p>
        </div>

        <div>
            <h3 className="font-medium mb-3 text-slate-800">Top-P</h3>
            <Slider
                value={topP}
                onChange={(e) => onTopPChange(parseFloat(e.target.value))}
                min={0}
                max={1}
                step={0.01}
                displayValue={topP.toFixed(1)}
            />
            <p className="text-xs text-primary-hover mt-2">
                Controls diversity via nucleus sampling
            </p>
        </div>
    </div>
);

const RAGPanel: React.FC<RAGPanelProps> = ({
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

const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({
    systemPrompt,
    isEditing,
    onSystemPromptChange,
    onEdit,
    onCancel,
    onClear,
    onSave
}) => {
    const charCountPercentage = calculateCharCountPercentage(systemPrompt);
    const nearLimit = isNearLimit(charCountPercentage);
    const atLimit = isAtLimit(systemPrompt);

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

const ClearConfirmationModal: React.FC<ClearConfirmationModalProps> = ({
    show,
    onClose,
    onConfirm
}) => (
    <Modal show={show} onClose={onClose} title="Clear System Prompt">
        <div className={LAYOUT_CLASSES.modal}>
            <div className="bg-amber-50 border border-amber-100 rounded-md p-4 flex items-start">
                <div className="mr-3 mt-0.5">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-amber-800 text-sm">
                    Are you sure you want to clear the system prompt? This action cannot be undone.
                </p>
            </div>
            <div className="flex justify-end pt-2">
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className={LAYOUT_CLASSES.button.secondary}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={LAYOUT_CLASSES.button.danger}
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    </Modal>
);


const FacePlayground = () => {
    const [temperature, setTemperature] = useState(0.5);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [topP, setTopP] = useState(0.5);
    const [selectedModel, setSelectedModel] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "user",
            content: "hey how are you doing"
        },
        {
            role: "assistant",
            thinking: "<think>\nThinking about response...\n</think>",
            content: "im just a large language model and how can I help you today"
        },
    ]);
    const [userMessage, setUserMessage] = useState("");
    const [models, setModels] = useState([] as any);
    const [systemPrompt, setSystemPrompt] = useState("");
    const [projects, setProjects] = useState([
        { name: "Default", value: "Default" },
    ]);
    const [selectedProject, setSelectedProject] = useState("Default");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRequestProcessing, setIsRequestProcessing] = useState(false);
    const [inputError, setInputError] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
    const [uploading, setUploading] = useState(false);
    const [inferenceBalance, setInferenceBalance] = useState<number | null>(null);
    const [balanceLoading, setBalanceLoading] = useState(false);

    const { connectedWallet, infraProviders, socketRef, refreshBalance, allNftData } = useAuth()
    const tokenName = useTokenName();
    const { setBuyingTokensLoading, isBuyingTokens } = useGlobalLoaders();


    const [activeDrawer, setActiveDrawer] = useState<'none' | 'system' | 'settings'>('none');


    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);


    const [isEditing, setIsEditing] = useState(false);
    const [originalSystemPrompt, setOriginalSystemPrompt] = useState("");


    const [showClearModal, setShowClearModal] = useState(false);


    const [saveNotificationMessage, setSaveNotificationMessage] = useState("System prompt saved successfully");


    const [activeTab, setActiveTab] = useState<'system' | 'rag'>('system');
    const [ragText, setRagText] = useState("");
    const [ragFile, setRagFile] = useState<File | null>(null);
    const [chunkSize, setChunkSize] = useState(100);
    const [kNearest, setKNearest] = useState(3);


    const toggleDrawer = (drawer: 'system' | 'settings') => {
        setActiveDrawer(prev => prev === drawer ? 'none' : drawer);
    };


    const closeDrawer = () => {
        setActiveDrawer('none');
    };


    const LS_PREFIX = 'face_playground_';
    const LS_PROJECTS_KEY = `${LS_PREFIX}projects`;


    useEffect(() => {

        const ml = allNftData?.map(nft => {
            return {
                name: nft.metadata?.name || nft.nft,
                model: nft.nft,
                selected: false,
                provider: nft.metadata?.provider || {},
                price: parseFloat(nft.nft_value) || 0,
            };
        }) || [];
        

        let paramModel = searchParams.get('model');
        if (paramModel) {
            
            const paramModelName = String(paramModel).trim();
            const matchedNft = allNftData?.find(m => m.nft === paramModelName);
            
            if (matchedNft) {
                
                
                setModels(ml);
                setSelectedModel(paramModelName);
            } else {
                
                getModels().then(fetchedModels => {
                    let modelToCheck = paramModelName;
                    if (!modelToCheck.includes(":")) {
                        modelToCheck = `${modelToCheck}:latest`;
                    }
                    if (fetchedModels.includes(modelToCheck)) {
                        let fs = allNftData?.filter(m => m.nft === paramModelName)?.[0];
                        let ns = fs?.metadata?.name;
                        
                        setModels([{
                            name: ns,
                            model: ns,
                            price: parseFloat(fs?.nft_value) || 0,
                            selected: true,
                            provider: {}
                        }]);
                        
                        setSelectedModel(modelToCheck);
                    } else {
                        
                        setModels(ml);
                        setSelectedModel(ml[0]?.model || "");
                    }
                });
            }
        } else {
            
            setModels(ml);
            setSelectedModel(ml[0]?.model || "");
        }


    }, [searchParams, allNftData]);


    const handleTemplateChange = (e) => {
        const selected = e.target.value;
        if (selected === "Default") {
            setMessages([]);
            setSelectedProject("Default");
            setSystemPrompt("");
            setOriginalSystemPrompt("");
            return;
        }
        setSelectedProject(selected);
        
        const savedProjects = localStorage.getItem(LS_PROJECTS_KEY);
        if (savedProjects) {
            const projectsData = JSON.parse(savedProjects);
            const selectedProjectData = projectsData.find(p => p.name === selected);

            if (selectedProjectData) {
                setMessages(selectedProjectData.messages || []);
                setSystemPrompt(selectedProjectData.systemPrompt || "");
                setOriginalSystemPrompt(selectedProjectData.systemPrompt || "");
            }
        }
    };

    const handleSystemPromptChange = (e) => {
        const input = e.target.value;
        if (input.length <= MAX_SYSTEM_CHARS) {
            setSystemPrompt(input);
        }
    };

    
    const charCountPercentage = (systemPrompt.length / MAX_SYSTEM_CHARS) * 100;
    const isNearLimit = charCountPercentage > 80;
    const isAtLimit = systemPrompt.length === MAX_SYSTEM_CHARS;

    const handleEditPrompt = () => {
        setIsEditing(true);
        setOriginalSystemPrompt(systemPrompt);
    };

    const handleCancelEdit = () => {
        setSystemPrompt(originalSystemPrompt);
        setIsEditing(false);
    };

    const handleClearSystemPrompt = () => {
        
        setShowClearModal(true);
    };

    
    const confirmClearSystemPrompt = () => {
        setSystemPrompt("");
        if (selectedProject !== "Default") {
            setIsEditing(true);
        }
        setShowClearModal(false);
    };

    const autoCompleteMessage = async (signature?: string, currentTimestamp?: number) => {
        const newMessages = [
            ...messages,
            {
                role: "user",
                content: userMessage
            }
        ];

        setMessages(newMessages);
        setUserMessage("");
        setIsProcessing(true);

        
        let payloadMessage = newMessages.map((message) => ({
            role: String(message.role).toLowerCase(),
            content: message.content
        }));

        
        if (systemPrompt && systemPrompt.length > 0) {
            payloadMessage = [
                {
                    role: "system",
                    content: systemPrompt.trim()
                },
                ...payloadMessage
            ];
        }


        if (ragText.trim() !== '' || ragFile !== null) {
            try {
                
                const formData = new FormData();

                formData.append('prompt', userMessage);

                if (ragText.trim() !== '') {
                    formData.append('rag_txt', ragText.trim());
                } else if (ragFile) {
                    formData.append('file', ragFile);
                }

                formData.append('chunk_size', chunkSize.toString());
                formData.append('k', kNearest.toString());

                const ragContext = await getRAGContext(formData);

                if (ragContext) {
                    payloadMessage = [
                        
                        ...payloadMessage
                    ];
                    payloadMessage[payloadMessage.length - 1].content = `RAG Context:\n${ragContext}\n\nPlease use the above context to answer the following questions.\n\n` + payloadMessage[payloadMessage.length - 1].content;
                }
            } catch (error) {
               
                
            }
        }

        try {
            

            
            const timestamp = currentTimestamp || Math.floor(Date.now() / 1000);
            const sig = signature || "";
           
            
            
            const selectedModelData = models.find(m => m.model === selectedModel);
            const modelName = selectedModelData?.name || selectedModel;
            const assetValue = selectedModelData?.price?.toString() || "1";
         
            
            const payload = {
                ollama_inference_input: {
                    messages: [
                        {
                            role: "user",
                            content: userMessage
                        }
                    ],
                    model: selectedModel,  
                    temperature: temperature,
                    max_tokens: maxTokens,
                    top_p: topP
                },
                did: connectedWallet?.did,
                timestamp: timestamp.toString(),
                signature: sig,
                asset_id: selectedModel,
                asset_value: assetValue
            }
           
            const result = await completeChat(payload, infraProviders?.[0]?.providers?.[0]?.endpoints?.inference || null)

            
            if (result.length > 0) {
                setMessages([
                    ...newMessages,
                    ...result
                ])
                
                
                try {
                    
                    const deductResult = await END_POINTS.deduct_credits({ did: connectedWallet?.did || '' });
                           
                            
                    
                    if (connectedWallet?.did) {
                        const newBalance = await fetchBalance(connectedWallet.did);
                        if (newBalance !== null) {
                            setInferenceBalance(newBalance);
                        }
                    }
                } catch (error) {
                    
                }
            }
        } catch (error) {
           
            alert("Error fetching response. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    }

    const handleRunMessage = async () => {
        if (!connectedWallet?.did) {
            toast.error("Please connect your wallet.")
            return
        }
        
        
        if (inferenceBalance === null || inferenceBalance <= 0) {
            toast.error("Insufficient balance. Please buy more tokens to continue.")
            return
        }
        
        if (window.xell) {
            try {
                setIsRequestProcessing(true); 
                
                
                
                const currentTimestamp = Math.floor(Date.now() / 1000);
                const requestPayload = {
                    user_input: userMessage,
                    timestamp: currentTimestamp,
                    user_did: connectedWallet?.did,
                    
                };

               
                
                const requestResult = await window.xell.request(requestPayload);
              
                
                if (requestResult?.status) {
                   
                    toast.success('Request sent successfully');
                    
                    
                    const signature = requestResult?.data?.signature;
                  
                    if(signature){
                        await autoCompleteMessage(signature, currentTimestamp);
                    }
                    
                    
                    
                } else {
                  
                    toast.error('Request failed');
                }
            } catch (error) {
              
                toast.error('Request failed due to error');
            } finally {
                setIsRequestProcessing(false); 
               
            }
        }
        


    };
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    
    useEffect(() => {
        scrollToBottom();
    }, [messages, isProcessing]);

    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setActiveDrawer('none');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    
    const copyToClipboard = (text: string, messageIndex: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedMessageId(messageIndex);
            
            setTimeout(() => {
                setCopiedMessageId(null);
            }, 2000);
        });
    };

    
    const rerunMessage = async (userMessageIndex: number) => {
        if (isProcessing) return;

        
        const userMessage = messages[userMessageIndex];

        if (userMessage && userMessage.role === "user") {
            
            const newMessages = messages.slice(0, userMessageIndex + 1);

            setMessages(newMessages);
            setIsProcessing(true);

            let payloadMessage = newMessages.map((message) => ({
                role: String(message.role).toLowerCase(),
                content: message.content
            }));

            if (systemPrompt && systemPrompt.length > 0) {
                payloadMessage = [
                    {
                        role: "system",
                        content: systemPrompt.trim()
                    },
                    ...payloadMessage
                ]
            }

           
            if (ragText.trim() !== '' || ragFile !== null) {
                    try {
                      
                    const formData = new FormData();

                   
                    formData.append('prompt', userMessage.content);

                   
                    if (ragText.trim() !== '') {
                        formData.append('rag_txt', ragText.trim());
                    } else if (ragFile) {
                        formData.append('file', ragFile);
                    }

                    
                    formData.append('chunk_size', chunkSize.toString());
                    formData.append('k', kNearest.toString());

                    
                    const ragContext = await getRAGContext(formData);

                    
                    if (ragContext) {
                        
                        payloadMessage = [
                            {
                                role: "system",
                                content: `RAG Context:\n${ragContext}\n\nPlease use the above context to answer the following questions.`
                            },
                            ...payloadMessage
                        ];
                    }
                } catch (error) {
                    
                }
            }

            
        }
    };

    useEffect(() => {
        
        document.body.style.overflow = 'hidden';

        return () => {
            
            document.body.style.overflow = '';
        };
    }, []);

    
    const handleClearInput = () => {
        setUserMessage("");
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [trieInput, setTrieInput] = useState('');
    const trieToTokenRate = 40;
    const calculatedTokens = Number(trieInput) > 0 ? Number(trieInput) * trieToTokenRate : 0;


    const handleBuyMoreTokens = async () => {
       
        if (!connectedWallet?.did) {
            toast.error("Please connect your wallet.");
            return;
        }

        
        setBuyingTokensLoading(true);
       

        const trieAmount = 5;
        const tokenAmount = 500;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        let data = {
            purchase_credit: {
                "purchase_token_name": "TRIE",
                "purchase_token_creator": CONSTANTS.FT_DENOM_CREATOR,
                "user_did": connectedWallet?.did,
                "depin_provider": infraProviders?.[0]?.providers?.[0]?.providerDid,
                "current_timestamp": currentTimestamp
            }
        };
       
        const executeData = {
            "comment": "Buy tokens",
            "executorAddr": connectedWallet.did,
            "quorumType": 2,
            "smartContractData": JSON.stringify(data),
            "smartContractToken": CONSTANTS.TOPUP_TOKEN
        };

        if (window.xell) {
            try {
                const result = await window.xell.executeContract(executeData);
               
                
                if (result?.status) {
                    toast.success("Purchase initiated. Please approve in your wallet/extension.");
                    
                    let pollCount = 0;
                    const maxPolls = 20; 
                    const initialBalance = inferenceBalance; 
                    
                    const pollInterval = setInterval(async () => {
                        pollCount++;
                       
                        
                        
                        const newBalance = await fetchBalance(connectedWallet.did);
                       
                       
                        if (newBalance !== initialBalance || pollCount >= maxPolls) {
                            
                            if (newBalance !== initialBalance) {
                                setInferenceBalance(newBalance);
                                toast.success(`Balance updated! New balance: ${newBalance} tokens`);
                            }
                            
                            setBuyingTokensLoading(false);
                            clearInterval(pollInterval);
                        }
                    }, 3000);
                } else {
                    toast.error(result?.data?.message || 'Purchase failed');
                    setBuyingTokensLoading(false); 
                }
            } catch (error) {
                
                toast.error("Please refresh the page to use the extension features");
                setBuyingTokensLoading(false); 
            }
        } else {
            toast.error("Extension not detected. Please install the extension and refresh the page.");
          
            setBuyingTokensLoading(false); 
        }
    };

    
    const fetchInferenceBalance = async () => {
        if (!connectedWallet?.did) {
            setInferenceBalance(null);
            return;
        }
        setBalanceLoading(true);
        try {
            const balance = await fetchBalance(connectedWallet.did);
           
            setInferenceBalance(balance);
        } catch (error) {
           
            setInferenceBalance(0);
        } finally {
            setBalanceLoading(false);
        }
    };

    useEffect(() => {
        fetchInferenceBalance();
    }, [connectedWallet?.did]);

    
    useEffect(() => {
        const handleUpdateBalance = (event: UpdateInferenceBalanceEvent) => {
            
            setInferenceBalance(event.detail);
          
        };

        window.addEventListener('updateInferenceBalance', handleUpdateBalance as EventListener);

        return () => {
            window.removeEventListener('updateInferenceBalance', handleUpdateBalance as EventListener);
        };
    }, []); 



    return (
        <div className="fixed inset-0 flex flex-col bg-slate-50" style={{ top: "110px", bottom: 0, left: 0, right: 0 }}>
            
            <div className="lg:hidden bg-white border-b border-slate-100 p-4 flex justify-between items-center sticky top-0 z-20">
                <div className="text-primary font-medium">AI Playground</div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toggleDrawer('system')}
                        className={`p-2 rounded-full ${activeDrawer === 'system' ? 'bg-primary-light text-primary' : 'text-slate-500 hover:text-primary hover:bg-slate-50'}`}
                    >
                        <BetweenVerticalStart size={20} />
                    </button>
                    <button
                        onClick={() => toggleDrawer('settings')}
                        className={`p-2 rounded-full ${activeDrawer === 'settings' ? 'bg-primary-light text-primary' : 'text-slate-500 hover:text-primary hover:bg-slate-50'}`}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            
            <div className="flex flex-1 overflow-hidden rounded-lg mx-4 mb-4 bg-white border border-slate-100 relative">
                
                <AnimatePresence>
                    {activeDrawer !== 'none' && (
                        <motion.div
                            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeDrawer}
                        />
                    )}
                </AnimatePresence>

                
                <AnimatePresence>
                    {(activeDrawer === 'system' || window.innerWidth >= 1024) && (
                        <motion.div
                            className={`${activeDrawer === 'system' ? 'fixed left-0 top-0 bottom-0 z-40 w-[85%] max-w-[320px]' : 'hidden lg:block w-64'} border-r border-slate-100 overflow-y-auto bg-slate-50 h-full`}
                            initial={activeDrawer === 'system' ? { x: -320 } : false}
                            animate={activeDrawer === 'system' ? { x: 0 } : {}}
                            exit={activeDrawer === 'system' ? { x: -320 } : {}}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <div className="sticky top-0 bg-slate-50 px-5 py-4 border-b border-slate-100 z-10">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold mb-3 text-primary uppercase tracking-wide flex items-center">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                                        System
                                    </div>
                                    {activeDrawer === 'system' && (
                                        <button onClick={closeDrawer} className="p-1 text-slate-400 hover:text-slate-700">
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>

                                
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
                                                onChange={handleTemplateChange}
                                                options={projects}
                                                placeholder="Select a project"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50">

                                
                                {activeTab === 'system' && (
                                    <div className="mb-4 text-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-slate-700">System Prompt</label>
                                            <span className={`text-xs font-medium ${isAtLimit ? 'text-error' :
                                                isNearLimit ? 'text-warning' :
                                                    'text-slate-500'
                                                }`}>
                                                {systemPrompt.length}/{MAX_SYSTEM_CHARS}
                                            </span>
                                        </div>
                                        <div className="relative mb-1">
                                            <textarea
                                                value={systemPrompt}
                                                onChange={handleSystemPromptChange}
                                                className={`w-full h-80 border ${isAtLimit ? 'border-error focus:ring-error' :
                                                    isNearLimit ? 'border-warning focus:ring-warning' :
                                                        'border-slate-200 focus:ring-primary'
                                                    } rounded-md p-3 text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent font-mono text-sm resize-none shadow-inner bg-white`}
                                                placeholder="Enter system prompt here..."
                                                maxLength={MAX_SYSTEM_CHARS}
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden rounded-b">
                                                <div
                                                    className={`h-full ${isAtLimit ? 'bg-error' :
                                                        isNearLimit ? 'bg-warning' :
                                                            'bg-primary'
                                                        } transition-all duration-300`}
                                                    style={{ width: `${charCountPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        {isNearLimit && !isAtLimit && (
                                            <p className="text-xs text-warning mt-1">
                                                Approaching character limit
                                            </p>
                                        )}
                                        {isAtLimit && (
                                            <p className="text-xs text-error mt-1">
                                                Character limit reached
                                            </p>
                                        )}
                                        <div className="mt-3 relative">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={handleClearSystemPrompt}
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
                                                        onClick={handleCancelEdit}
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
                                                        onClick={handleEditPrompt}
                                                        className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-primary hover:border-primary rounded-lg transition-colors bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-30 flex items-center justify-center"
                                                    >
                                                        <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        toast.success('System prompt saved successfully!', {
                                                            position: 'top-center',
                                                        });
                                                    }}
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
                                )}



                                {showSaveConfirmation && (
                                    <div className="fixed bottom-5 inset-x-0 flex justify-center items-center z-50">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="inline-flex items-center bg-primary-light border border-primary/20 text-primary px-5 py-2 rounded-full text-sm font-medium shadow-sm"
                                        >
                                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="whitespace-nowrap">{saveNotificationMessage}</span>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

               
                <div className="flex-1 flex flex-col overflow-hidden bg-white border-x border-slate-100">
                   
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
                                        {message.role === "assistant" && message.thinking && (
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
                                                    onClick={() => copyToClipboard(message.content, index)}
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


                   
                    <div className="border-t border-slate-100 p-5 bg-white">
                        <div className="flex">
                            <textarea
                                ref={textareaRef}
                                value={userMessage}
                                onChange={(e) => {
                                    setUserMessage(e.target.value);
                                    if (e.target.value.trim() !== '') {
                                        setInputError(false);
                                    }
                                }}
                                className={`flex-1 border ${inputError ? 'border-error ring-1 ring-error' : 'border-slate-200'} rounded-lg p-3 mr-2 text-slate-800 focus:outline-none focus:ring-2 ${inputError ? 'focus:ring-error' : 'focus:ring-primary'} focus:border-transparent resize-none shadow-inner transition-all duration-200`}
                                placeholder={inputError ? "Please enter a message" : "Enter your message here..."}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleRunMessage();
                                    }
                                }}
                                rows={3}
                                disabled={isProcessing || isRequestProcessing}
                            />
                        </div>
                        {inputError && (
                            <div className="mt-1 text-error text-xs font-medium animate-bounce">
                                Please enter a message before running
                            </div>
                        )}
                        <div className="flex justify-end mt-3 items-center">
                            <span className="text-xs text-slate-500 mr-auto italic hidden sm:inline-block">Press Shift+Enter for new line</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleClearInput}
                                    className="px-4 py-2 sm:px-5 sm:py-2.5 min-w-[80px] sm:min-w-[90px] border border-slate-200 text-slate-600 hover:text-primary hover:border-primary rounded-lg transition-colors bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 focus:ring-opacity-30 flex items-center justify-center"
                                    disabled={isProcessing || isRequestProcessing || userMessage.trim() === ""}
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleRunMessage}
                                    className={`px-4 py-2 sm:px-5 sm:py-2.5 min-w-[80px] sm:min-w-[90px] ${userMessage.trim() === "" ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white hover:shadow-md'} rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 flex items-center justify-center relative group`}
                                    disabled={userMessage.trim() === "" || isProcessing || isRequestProcessing}
                                >
                                    {(isProcessing || isRequestProcessing) ? (
                                        <>
                                            <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                            <span className="sm:inline">
                                                {isRequestProcessing ? 'Sending Request...' : 'Processing...'}
                                            </span>
                                        </>
                                    ) : `Try it out`}

                                    {userMessage.trim() === "" && !isProcessing && (
                                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                            Enter a message first
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

               
                <AnimatePresence>
                    {(activeDrawer === 'settings' || window.innerWidth >= 1024) && (
                        <motion.div
                            className={`${activeDrawer === 'settings' ? 'fixed right-0 top-0 bottom-0 z-40 w-[85%] max-w-[320px]' : 'hidden lg:block w-80'} border-l border-slate-100 overflow-y-auto bg-slate-50 h-full`}
                            initial={activeDrawer === 'settings' ? { x: 320 } : false}
                            animate={activeDrawer === 'settings' ? { x: 0 } : {}}
                            exit={activeDrawer === 'settings' ? { x: 320 } : {}}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <div className="sticky top-0 bg-slate-50 px-5 py-4 border-b border-slate-100 z-10">
                               
                                <div className="mt-4 mb-6 p-4 rounded-xl border" style={{ borderColor: '#19A7C7', background: '#fff' }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg className="w-5 h-5" style={{ color: '#19A7C7' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                            <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#19A7C7">T</text>
                                        </svg>
                                        <span className="font-semibold" style={{ color: '#19A7C7', fontSize: '0.85rem' }}>Inference Balance:</span>
                                        <span className="font-bold ml-1" style={{ color: '#1e293b', fontSize: '0.85rem' }}>
                                            {balanceLoading ? (
                                                <span className="animate-pulse">Loading...</span>
                                            ) : (
                                                `${inferenceBalance ?? 0} tokens`
                                            )}
                                        </span>
                                       
                                    </div>
                                    <div className="text-xs text-slate-500 mb-4 ml-7">5 TRIE = 500 tokens</div>
                                    <button
                                        className="w-full font-semibold py-2 rounded-lg transition-colors"
                                        style={{ background: '#0196B7', color: '#fff' }}
                                        onClick={handleBuyMoreTokens}
                                        onMouseOver={e => (e.currentTarget.style.background = '#017a99')}
                                        onMouseOut={e => (e.currentTarget.style.background = '#0196B7')}
                                        disabled={uploading || isBuyingTokens}
                                    >
                                        {(uploading || isBuyingTokens) ? (
                                            <span className="flex items-center justify-center">
                                                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                                Processing...
                                            </span>
                                        ) : (
                                            "Buy More"
                                        )}
                                    </button>
                                    </div>
                                   
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                                        Settings
                                    </div>
                                    {activeDrawer === 'settings' && (
                                        <button onClick={closeDrawer} className="p-1 text-slate-400 hover:text-slate-700">
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-8 bg-slate-50">
                               
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-medium text-slate-800">Model</h3>
                                       
                                    </div>
                                    <div className="space-y-3">
                                        <Dropdown
                                            disabled={false}
                                            value={selectedModel || ""}
                                            onChange={(e) => {
                                               
                                                setSelectedModel(e.target.value);
                                            }}
                                            options={models.map(model1 => ({
                                                name: model1.name,
                                                value: model1.model
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
                                                    onChange={(e) => setRagText(e.target.value)}
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
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                setRagFile(e.target.files[0]);
                                                                setRagText(""); 
                                                            }
                                                        }}
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
                                                            onClick={() => setRagFile(null)}
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
                                                        onChange={(e) => setChunkSize(parseInt(e.target.value) || 500)}
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
                                                        onChange={(e) => setKNearest(parseInt(e.target.value) || 3)}
                                                        className="w-full border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white"
                                                        placeholder="3"
                                                        min="1"
                                                    />
                                                    <p className="text-xs text-primary-hover mt-2">
                                                        Number of nearest chunks to retrieve
                                                    </p>
                                                </div>
                                            </div>

                                           
                                            <div className="mt-3" style={{
                                                display: 'none'
                                            }}>
                                                <button
                                                    onClick={() => {
                                                        toast.success('RAG settings saved successfully!', {
                                                            position: 'top-center',
                                                        });
                                                    }}
                                                    className="w-full px-4 py-2 border border-slate-200 text-slate-600 hover:text-primary hover:border-primary rounded-lg transition-colors bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-30 flex items-center justify-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                    </svg>
                                                    Save RAG Settings
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div style={{
                                    display: 'none'
                                }}>
                                   
                                    <div>
                                        <h3 className="font-medium mb-3 text-slate-800">Temperature</h3>
                                        <Slider
                                            value={temperature}
                                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            displayValue={temperature.toFixed(1)}
                                        />
                                        <p className="text-xs text-primary-hover mt-2">Higher values produce more creative outputs</p>
                                    </div>

                                   
                                    <div>
                                        <h3 className="font-medium mb-3 text-slate-800">Max Tokens</h3>
                                        <div className="flex items-center">
                                            <Slider
                                                displayValue={maxTokens}
                                                value={maxTokens}
                                                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                                min={1}
                                                max={10000}
                                                step={1}
                                                className="flex-1"
                                            />
                                        </div>
                                        <p className="text-xs text-primary-hover mt-2">Maximum length of generated text</p>
                                    </div>

                                   
                                    <div>
                                        <h3 className="font-medium mb-3 text-slate-800">Top-P</h3>
                                        <Slider
                                            value={topP}
                                            onChange={(e) => setTopP(parseFloat(e.target.value))}
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            displayValue={topP.toFixed(1)}
                                        />
                                        <p className="text-xs text-primary-hover mt-2">Controls diversity via nucleus sampling</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

           
            <Modal
                show={showClearModal}
                onClose={() => setShowClearModal(false)}
                title="Clear System Prompt"
            >
                <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-md p-4 flex items-start">
                        <div className="mr-3 mt-0.5">
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-amber-800 text-sm">Are you sure you want to clear the system prompt? This action cannot be undone.</p>
                    </div>
                    <div className="flex justify-end pt-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowClearModal(false)}
                                className="px-5 py-2.5 min-w-[90px] border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent shadow-sm hover:shadow"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmClearSystemPrompt}
                                className="px-5 py-2.5 min-w-[90px] bg-error hover:bg-error/90 text-white rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-error focus:ring-opacity-50 hover:shadow-md"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FacePlayground;