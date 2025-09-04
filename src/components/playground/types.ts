export interface Message {
    role: "user" | "assistant";
    content: string;
    thinking?: string;
}

// Type guard to ensure role is valid
export const isValidRole = (role: string): role is "user" | "assistant" => {
    return role === "user" || role === "assistant";
};

export interface Project {
    name: string;
    value: string;
    messages?: Message[];
    systemPrompt?: string;
}

export interface Model {
    name: string;
    model: string;
    selected: boolean;
    provider: Record<string, any>;
    price: number;
}

export interface NFTData {
    nft: string;
    nft_value?: string;
    metadata?: {
        name?: string;
        provider?: Record<string, any>;
    };
}

export interface PlaygroundState {
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

export interface UpdateInferenceBalanceEvent extends CustomEvent {
    detail: number;
}

export const MAX_SYSTEM_CHARS = 2000;
export const RAG_FILE_TYPES = [".txt", ".md", ".json", ".csv", ".pdf", ".docx", ".html", ".htm", ".rtf"];
export const RAG_FILE_TYPES_STRING = RAG_FILE_TYPES.join(",");

export const DEFAULT_STATE: Partial<PlaygroundState> = {
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

export const STORAGE_KEYS = {
    LS_PREFIX: 'face_playground_',
    LS_PROJECTS_KEY: 'face_playground_projects'
} as const;

export const ANIMATION_CONFIG = {
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

export const LAYOUT_CLASSES = {
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

