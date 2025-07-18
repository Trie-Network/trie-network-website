import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Settings, FileText, X, Menu, Copy, RotateCcw, Check, BetweenVerticalStart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { modelsList, completeChat, getRAGContext, getModels } from '@/utils/hf';
import { useSearchParams } from 'react-router-dom'
import { Slider, Dropdown, ThinkingAnimation } from './Components';
import { Modal } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { CONSTANTS, componentStyles } from '@/utils';
import { useAuth, useColors } from '@/hooks';
import { END_POINTS } from '@/api/requests';

const MAX_SYSTEM_CHARS = 2000;

const rag_file_types = [".txt", ".md", ".json", ".csv", ".pdf", ".docx", ".html", ".htm", ".rtf"]
const rag_file_types_string = rag_file_types.join(",");

const FacePlayground = () => {
    const { colors } = useColors();
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
    const [inputError, setInputError] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
    const [uploading, setUploading] = useState(false);
    const [inferenceBalance, setInferenceBalance] = useState<number | null>(null);
    const [balanceLoading, setBalanceLoading] = useState(false);

    const { connectedWallet, infraProviders, socketRef, refreshBalance, allNftData } = useAuth()

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

    const messageHandlerRef = useRef<any>(null);

    const toggleDrawer = (drawer: 'system' | 'settings') => {
        setActiveDrawer(prev => prev === drawer ? 'none' : drawer);
    };

    const closeDrawer = () => {
        setActiveDrawer('none');
    };

    const LS_PREFIX = 'face_playground_';
    const LS_PROJECTS_KEY = `${LS_PREFIX}projects`;

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

    const autoCompleteMessage = async () => {
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
                console.error('Error getting RAG context:', error);

            }
        }

        try {
            let result = await completeChat(
                selectedModel,
                payloadMessage,
                infraProviders?.[0]?.providers?.[0]?.endpoints?.inference || null

            )
            if (result.length > 0) {
                setMessages([
                    ...newMessages,
                    ...result
                ])
            }
        } catch (error) {
            console.error("Error fetching response:", error);
            alert("Error fetching response. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    }

    const handleRunMessage = async () => {
        if (userMessage.trim().length === 0) {
            setInputError(true);

            textareaRef.current?.focus();

            setTimeout(() => setInputError(false), 2000);
            return;
        }
        if (messageHandlerRef.current) {
            window.removeEventListener('message', messageHandlerRef.current);
            messageHandlerRef.current = null;
        }

        const messageHandler = (event: any) => {

            const result = event.data.data;
            if (!result?.status) {
                if (result?.message) {
                    toast.error(result?.message);
                }

                return
            }
            console.log("Received message from extension:", result, event.data, event);
            toast.success(result?.message);
            if (event?.data?.type == "CONTRACT_RESULT" && result?.step == "EXECUTE" && result?.status) {
                setUploading(true)
                return
            }
            else if (event?.data?.type == "NFT_RESULT" && result?.step == "SIGNATURE") {
                let message = {
                    resut: null,
                    message: event.data.data?.message,
                    status: true,
                }
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
                    console.log('Message sent:', message);
                    setUploading(false)
                    refreshBalance()
                    autoCompleteMessage()
                    return true;
                } else {
                    console.error('WebSocket is not connected. Message not sent.');
                    return false;
                }
            }
            else if (event?.data?.type == "FT_RESULT" && result?.step == "SIGNATURE") {
                let message = {
                    resut: null,
                    message: event.data.data?.message,
                    status: true,
                }
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
                    console.log('Message sent:', message);
                    return true;
                } else {
                    console.error('WebSocket is not connected. Message not sent.');
                    return false;
                }
            }

        };

        setIsProcessing(true);

        messageHandlerRef.current = messageHandler;

        window.addEventListener('message', messageHandler);
        const infTime = parseInt((Date.now() / 1000).toString()).toString();

        const removeSuffix = (s, suffix) => s.endsWith(suffix) ? s.slice(0, -suffix.length) : s;

        let infPayload = {
            "pay_for_inference_result": {
                "user_did": connectedWallet?.did,
                "depin_provider_did": infraProviders?.[0]?.providers?.[0]?.providerDid,
                "amount": 1,

                "ft_denom_creator": CONSTANTS.FT_DENOM_CREATOR,
                "ft_denom_name": CONSTANTS.FT_DENOM,

                "inference_input": String(userMessage).trim(),
                "inference_time": infTime,

                "model_id": String(removeSuffix(selectedModel, ":latest")).trim(),
                "model_price_in_rbt": models?.[0]?.price || 0,
                "model_usage_description": `model used for inference by ${connectedWallet?.did} | inference_input: ${String(userMessage).trim()} | inference_time: ${infTime}`,
            }
        }
        console.log("infPayload", infPayload);

        const executeData = {
            "comment": "string",
            "executorAddr": connectedWallet?.did,
            "quorumType": 2,
            "smartContractData": JSON.stringify(infPayload),
            "smartContractToken": CONSTANTS.INFERENCE_CONTRACT
        }

        if (window.myExtension) {
            try {
                window.myExtension.trigger({
                    type: "INITIATE_CONTRACT",
                    data: executeData
                });
            } catch (error) {
                console.error("Extension error:", error);
                alert("Please refresh the page to use the extension features");
            }
        } else {
            alert("Extension not detected.Please install the extension and refresh the page.");
            console.warn("Extension not detected. Please install the extension and refresh the page.");
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
                    console.error('Error getting RAG context:', error);

                }
            }

            completeChat(
                selectedModel,
                payloadMessage
            )
                .then(result => {
                    if (result.length > 0) {
                        setMessages([
                            ...newMessages,
                            ...result
                        ]);
                    }
                })
                .catch(error => {
                    console.error("Error fetching response:", error);
                    alert("Error fetching response. Please try again.");
                })
                .finally(() => {
                    setIsProcessing(false);
                });
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

        if (messageHandlerRef.current) {
            window.removeEventListener('message', messageHandlerRef.current);
            messageHandlerRef.current = null;
        }

        const messageHandler = (event: any) => {
            const result = event.data.data;
            console.log(result, "result")
            if (!result?.status) {
                if (result?.message) {
                    toast.error(result?.message);
                }
                setUploading(false);
                return;
            }
            toast.success(result.message);
            if (event?.data?.type === "CONTRACT_RESULT" && result?.step === "EXECUTE") {
                setUploading(true);
                return;
            }
            if (event?.data?.type === "FT_RESULT" && result?.step === "SIGNATURE") {
                triggerAddCreditContract();
                let message = {
                    resut: null,
                    message: event.data.data?.message,
                    status: true,
                };

                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));

                    setUploading(false);
                    toast.success(result?.message);
                    setTimeout(() => {
                        fetchInferenceBalance();
                    }, 5000);

                    window.removeEventListener('message', messageHandler);
                    messageHandlerRef.current = null;
                    return true;
                } else {
                    console.error('WebSocket is not connected. Message not sent.');
                    return false;
                }
            }
        };

        messageHandlerRef.current = messageHandler;
        window.addEventListener('message', messageHandler);

        const trieAmount = 5;
        const tokenAmount = 500;
        let data = {
            purchase_credit: {
                "purchase_token_name": "TRIE",
                "purchase_token_creator": CONSTANTS.FT_DENOM_CREATOR,
                "user_did": connectedWallet?.did,
                "depin_provider": infraProviders?.[0]?.providers?.[0]?.providerDid
            }
        };
        const executeData = {
            "comment": "Buy tokens",
            "executorAddr": connectedWallet.did,
            "quorumType": 2,
            "smartContractData": JSON.stringify(data),
            "smartContractToken": CONSTANTS.TOPUP_TOKEN
        };
        console.log(executeData, "executeData")
        if (window.myExtension) {
            try {
                window.myExtension.trigger({
                    type: "INITIATE_CONTRACT",
                    data: executeData
                });
                toast.success("Purchase initiated. Please approve in your wallet/extension.");
            } catch (error) {
                console.error("Extension error:", error);
                alert("Please refresh the page to use the extension features");
            }
        } else {
            alert("Extension not detected. Please install the extension and refresh the page.");
            console.warn("Extension not detected. Please install the extension and refresh the page.");
        }
    };

    useEffect(() => {
        return () => {
            if (messageHandlerRef.current) {
                window.removeEventListener('message', messageHandlerRef.current);
                messageHandlerRef.current = null;
            }
        };
    }, []);

    const fetchInferenceBalance = () => {
        if (!connectedWallet?.did) {
            setInferenceBalance(null);
            return;
        }
        setBalanceLoading(true);
        END_POINTS.get_credit_balance_by_did(connectedWallet.did)
            .then((res: any) => {
                console.log('Credit balance API response:', res);
                setInferenceBalance(res?.credit ?? 0);
            })
            .catch(() => setInferenceBalance(0))
            .finally(() => setBalanceLoading(false));
    };

    useEffect(() => {
        fetchInferenceBalance();
    }, [connectedWallet?.did]);

    const triggerAddCreditContract = () => {
        const addCreditPayload = {
            add_credit: {
                user_did: connectedWallet?.did,

            }
        };
        const addCreditExecuteData = {
            comment: "Add credit after purchase",
            executorAddr: connectedWallet?.did,
            quorumType: 2,
            smartContractData: JSON.stringify(addCreditPayload),
            smartContractToken: CONSTANTS.TOPUP_TOKEN
        };
        if (window.myExtension) {
            try {
                window.myExtension.trigger({
                    type: "INITIATE_CONTRACT",
                    data: addCreditExecuteData
                });

            } catch (error) {
                toast.error("Failed to initiate credit addition.");
                console.error("Add credit extension error:", error);
            }
        } else {
            toast.error("Extension not detected for add credit.");
        }
    };

    return (
        <div className={componentStyles.container.main} style={{ top: "110px", bottom: 0, left: 0, right: 0 }}>
            <div className={`lg:hidden ${componentStyles.header.main}`}>
                <div className={componentStyles.header.title}>AI Playground</div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toggleDrawer('system')}
                        className={activeDrawer === 'system' ? `${componentStyles.button.ghost} bg-primary-light text-primary` : componentStyles.button.ghost}
                    >
                        <BetweenVerticalStart size={20} />
                    </button>
                    <button
                        onClick={() => toggleDrawer('settings')}
                        className={activeDrawer === 'settings' ? `${componentStyles.button.ghost} bg-primary-light text-primary` : componentStyles.button.ghost}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div className={`flex flex-1 overflow-hidden rounded-lg mx-4 mb-4 ${componentStyles.container.card} relative`}>
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
                            className={`${activeDrawer === 'system' ? 'fixed left-0 top-0 bottom-0 z-40 w-[85%] max-w-[320px]' : 'hidden lg:block w-64'} ${componentStyles.sidebar.container}`}
                            initial={activeDrawer === 'system' ? { x: -320 } : false}
                            animate={activeDrawer === 'system' ? { x: 0 } : {}}
                            exit={activeDrawer === 'system' ? { x: -320 } : {}}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <div className={componentStyles.sidebar.header}>
                                <div className="flex items-center justify-between">
                                    <div className={`${componentStyles.header.subtitle} mb-3`}>
                                        <span className={`w-1.5 h-1.5 ${componentStyles.status.dotPrimary} rounded-full mr-2`}></span>
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
                                            <div className={`flex items-center ${componentStyles.badge.primary}`}>
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

                            <div className={componentStyles.sidebar.content}>

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
                                            <div className={componentStyles.progress.bar}>
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
                                                    className={`${componentStyles.button.secondary} flex items-center justify-center`}
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
                                                        className={`${componentStyles.button.secondary} hover:text-error hover:border-error flex items-center justify-center`}
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
                                                        className={`${componentStyles.button.secondary} flex items-center justify-center`}
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
                                                    className={`flex-grow ${componentStyles.button.secondary} flex items-center justify-center`}
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
                            <div key={index} className={componentStyles.message.container}>
                                <div className={componentStyles.message.roleLabel}>
                                    <span className={`${componentStyles.status.dot} ${message.role === "assistant" ? componentStyles.status.dotPrimary : componentStyles.status.dotSlate}`}></span>
                                    {message.role}
                                </div>
                                <div className="relative flex">
                                    {message.role === "user" ? (
                                        <div className={`${componentStyles.message.avatar} ${componentStyles.message.userAvatar}`}>
                                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className={`${componentStyles.message.avatar} ${componentStyles.message.assistantAvatar}`}>
                                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 12h16.5M12 3.75v16.5M4.501 5.25l15 13.5M19.499 5.25l-15 13.5" />
                                            </svg>
                                        </div>
                                    )}

                                    <div className={message.role === "user"
                                        ? componentStyles.message.userBubble
                                        : componentStyles.message.assistantBubble}>
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
                                                    className={`${componentStyles.button.icon} text-xs font-medium flex items-center py-1 px-2`}
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

                                                {

}
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
                                className={`flex-1 mr-2 ${inputError ? componentStyles.input.error : componentStyles.input.default} transition-all duration-200`}
                                placeholder={inputError ? "Please enter a message" : "Enter your message here..."}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleRunMessage();
                                    }
                                }}
                                rows={3}
                                disabled={isProcessing}
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
                                    className={`sm:px-5 sm:py-2.5 min-w-[80px] sm:min-w-[90px] ${componentStyles.button.secondary} flex items-center justify-center`}
                                    disabled={isProcessing || userMessage.trim() === ""}
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleRunMessage}
                                    className={`sm:px-5 sm:py-2.5 min-w-[80px] sm:min-w-[90px] ${userMessage.trim() === "" ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : componentStyles.button.primary} flex items-center justify-center relative group`}
                                    disabled={userMessage.trim() === "" || isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                            <span className="sm:inline">Processing...</span>
                                        </>
                                    ) : "Try it out (1 TRIE)"}

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
                            className={`${activeDrawer === 'settings' ? 'fixed right-0 top-0 bottom-0 z-40 w-[85%] max-w-[320px]' : 'hidden lg:block w-80'} ${componentStyles.sidebar.container} border-l`}
                            initial={activeDrawer === 'settings' ? { x: 320 } : false}
                            animate={activeDrawer === 'settings' ? { x: 0 } : {}}
                            exit={activeDrawer === 'settings' ? { x: 320 } : {}}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <div className={componentStyles.sidebar.header}>
                                <div className="mt-4 mb-6 p-4 rounded-xl border" style={{ borderColor: colors.brand.teal, background: colors.ui.white }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg className="w-5 h-5" style={{ color: colors.brand.teal }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                            <text x="12" y="16" textAnchor="middle" fontSize="10" fill={colors.brand.teal}>T</text>
                                        </svg>
                                        <span className="font-semibold" style={{ color: colors.brand.teal, fontSize: '0.85rem' }}>Inference Balance:</span>
                                        <span className="font-bold ml-1" style={{ color: colors.ui.slate[800], fontSize: '0.85rem' }}>
                                            {balanceLoading ? (
                                                <span className="animate-pulse">Loading...</span>
                                            ) : (
                                                `${inferenceBalance ?? 0} tokens`
                                            )}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 mb-4 ml-7">5 TRIE = 200 tokens</div>
                                    <button
                                        className="w-full font-semibold py-2 rounded-lg transition-colors"
                                        style={{ background: colors.brand.tealDark, color: colors.ui.white }}
                                        onClick={handleBuyMoreTokens}
                                        onMouseOver={e => (e.currentTarget.style.background = colors.brand.tealDarker)}
                                        onMouseOut={e => (e.currentTarget.style.background = colors.brand.tealDark)}
                                        disabled={uploading}
                                    >
                                        {uploading ? (
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
                                    <div className={componentStyles.header.subtitle}>
                                        <span className={`w-1.5 h-1.5 ${componentStyles.status.dotPrimary} rounded-full mr-2`}></span>
                                        Settings
                                    </div>
                                    {activeDrawer === 'settings' && (
                                        <button onClick={closeDrawer} className="p-1 text-slate-400 hover:text-slate-700">
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className={`${componentStyles.sidebar.content} space-y-8`}>
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-medium text-slate-800">Model</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <Dropdown
                                            disabled={true}
                                            value={models?.[0]?.name || "model"}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            options={models.map(model1 => ({
                                                name: model1.name,
                                                value: model1.value
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
                                                        accept={rag_file_types_string}
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
                    <div className={componentStyles.alert.warning}>
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
                                className={`px-5 py-2.5 min-w-[90px] ${componentStyles.button.secondary} shadow-sm hover:shadow`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmClearSystemPrompt}
                                className={`px-5 py-2.5 min-w-[90px] ${componentStyles.button.danger} hover:shadow-md`}
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