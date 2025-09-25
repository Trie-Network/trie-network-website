import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { completeChat, getRAGContext, getModels } from '@/utils/hf';
import { useAuth } from '@/hooks';
import { useTokenName } from '@/contexts/TokenNameContext';
import { END_POINTS } from '@/api/requests';
import { useGlobalLoaders } from '@/hooks/useGlobalLoaders';
import { fetchInferenceBalance as fetchBalance } from '@/utils/balanceUtils';
import { CONSTANTS } from '@/config/network';
import { 
    PlaygroundState, 
    Message, 
    Model, 
    Project, 
    UpdateInferenceBalanceEvent,
    DEFAULT_STATE,
    STORAGE_KEYS,
    isValidRole
} from '../types';
import { createModelFromNFT } from '../utils';

export const usePlayground = () => {
    const [state, setState] = useState<PlaygroundState>(DEFAULT_STATE as PlaygroundState);
    const [searchParams] = useSearchParams();
    const { connectedWallet, infraProviders, allNftData } = useAuth();
    const tokenName = useTokenName();
    const { setBuyingTokensLoading, isBuyingTokens } = useGlobalLoaders();

    useEffect(() => {
        const ml = allNftData?.map(nft => createModelFromNFT(nft)) || [];
        
        let paramModel = searchParams.get('model');
        if (paramModel) {
            const paramModelName = String(paramModel).trim();
            const matchedNft = allNftData?.find(m => m.nft === paramModelName);
            
            if (matchedNft) {
                setState(prev => ({ ...prev, models: ml, selectedModel: paramModelName }));
            } else {
                getModels().then(fetchedModels => {
                    let modelToCheck = paramModelName;
                    if (!modelToCheck.includes(":")) {
                        modelToCheck = `${modelToCheck}:latest`;
                    }
                    if (fetchedModels.includes(modelToCheck)) {
                        let fs = allNftData?.filter(m => m.nft === paramModelName)?.[0];
                        let ns = fs?.metadata?.name;
                        
                        setState(prev => ({
                            ...prev,
                            models: [{
                                name: ns,
                                model: ns,
                                price: parseFloat(fs?.nft_value || '0') || 0,
                                selected: true,
                                provider: {}
                            }],
                            selectedModel: modelToCheck
                        }));
                    } else {
                        setState(prev => ({
                            ...prev,
                            models: ml,
                            selectedModel: ml[0]?.model || ""
                        }));
                    }
                });
            }
        } else {
            setState(prev => ({
                ...prev,
                models: ml,
                selectedModel: ml[0]?.model || ""
            }));
        }
    }, [searchParams, allNftData]);

    const fetchInferenceBalance = useCallback(async () => {
        if (!connectedWallet?.did) {
            setState(prev => ({ ...prev, inferenceBalance: null }));
            return;
        }
        setState(prev => ({ ...prev, balanceLoading: true }));
        try {
            const balance = await fetchBalance(connectedWallet.did);
            setState(prev => ({ ...prev, inferenceBalance: balance }));
        } catch (error) {
            setState(prev => ({ ...prev, inferenceBalance: 0 }));
        } finally {
            setState(prev => ({ ...prev, balanceLoading: false }));
        }
    }, [connectedWallet?.did]);

    useEffect(() => {
        fetchInferenceBalance();
    }, [connectedWallet?.did, fetchInferenceBalance]);

    useEffect(() => {
        const handleUpdateBalance = (event: UpdateInferenceBalanceEvent) => {
            setState(prev => ({ ...prev, inferenceBalance: event.detail }));
        };

        window.addEventListener('updateInferenceBalance', handleUpdateBalance as EventListener);
        return () => {
            window.removeEventListener('updateInferenceBalance', handleUpdateBalance as EventListener);
        };
    }, []);

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        if (selected === "Default") {
            setState(prev => ({
                ...prev,
                messages: [],
                selectedProject: "Default",
                systemPrompt: "",
                originalSystemPrompt: ""
            }));
            return;
        }
        
        setState(prev => ({ ...prev, selectedProject: selected }));
        
        const savedProjects = localStorage.getItem(STORAGE_KEYS.LS_PROJECTS_KEY);
        if (savedProjects) {
            const projectsData = JSON.parse(savedProjects);
            const selectedProjectData = projectsData.find((p: Project) => p.name === selected);

            if (selectedProjectData) {
                const systemPrompt = selectedProjectData.systemPrompt || "";
                if (typeof systemPrompt === 'string' && systemPrompt.length <= 2000) {
                    setState(prev => ({
                        ...prev,
                        messages: selectedProjectData.messages || [],
                        systemPrompt: systemPrompt,
                        originalSystemPrompt: systemPrompt
                    }));
                } else {
                    setState(prev => ({
                        ...prev,
                        messages: selectedProjectData.messages || [],
                        systemPrompt: "",
                        originalSystemPrompt: ""
                    }));
                }
            }
        }
    };

    const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        const truncatedInput = input.length > 2000 ? input.substring(0, 2000) : input;
        setState(prev => ({ ...prev, systemPrompt: truncatedInput }));
    };

    const handleEditPrompt = () => {
        setState(prev => ({ 
            ...prev, 
            isEditing: true, 
            originalSystemPrompt: prev.systemPrompt 
        }));
    };

    const handleCancelEdit = () => {
        setState(prev => ({ 
            ...prev, 
            systemPrompt: prev.originalSystemPrompt, 
            isEditing: false 
        }));
    };

    const handleClearSystemPrompt = () => {
        setState(prev => ({ ...prev, showClearModal: true }));
    };

    const confirmClearSystemPrompt = () => {
        setState(prev => ({
            ...prev,
            systemPrompt: "",
            showClearModal: false,
            isEditing: prev.selectedProject !== "Default" ? true : prev.isEditing
        }));
    };

    const handleUserMessageChange = (message: string) => {
        setState(prev => ({ 
            ...prev, 
            userMessage: message,
            inputError: false
        }));
    };

    const handleClearInput = () => {
        setState(prev => ({ ...prev, userMessage: "" }));
    };

    const toggleDrawer = (drawer: 'system' | 'settings') => {
        setState(prev => ({ 
            ...prev, 
            activeDrawer: prev.activeDrawer === drawer ? 'none' : drawer 
        }));
    };

    const closeDrawer = () => {
        setState(prev => ({ ...prev, activeDrawer: 'none' }));
    };

    const handleCopyMessage = async (text: string, messageIndex: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setState(prev => ({ ...prev, copiedMessageId: messageIndex }));
            setTimeout(() => {
                setState(prev => ({ ...prev, copiedMessageId: null }));
            }, 2000);
        } catch (error) {
            toast.error('Failed to copy message');
        }
    };

    const handleRerunMessage = async (userMessageIndex: number) => {
        if (state.isProcessing) return;

        const userMessage = state.messages[userMessageIndex];
        if (userMessage && userMessage.role === "user") {
            const newMessages = state.messages.slice(0, userMessageIndex + 1);
            setState(prev => ({ ...prev, messages: newMessages, isProcessing: true }));

            await processMessage(userMessage.content, newMessages);
        }
    };

    const processMessage = async (messageContent: string, currentMessages: Message[]) => {
        let payloadMessage = currentMessages.map((message) => ({
            role: String(message.role).toLowerCase(),
            content: message.content
        }));

        if (state.systemPrompt && state.systemPrompt.length > 0) {
            payloadMessage = [
                {
                    role: "system",
                    content: state.systemPrompt.trim()
                },
                ...payloadMessage
            ];
        }

        if (state.ragText.trim() !== '' || state.ragFile !== null) {
            try {
                const formData = new FormData();
                formData.append('prompt', messageContent);

                if (state.ragText.trim() !== '') {
                    formData.append('rag_txt', state.ragText.trim());
                } else if (state.ragFile) {
                    formData.append('file', state.ragFile);
                }

                formData.append('chunk_size', state.chunkSize.toString());
                formData.append('k', state.kNearest.toString());

                const ragContext = await getRAGContext(formData);
                if (ragContext) {
                    payloadMessage[payloadMessage.length - 1].content = 
                        `RAG Context:\n${ragContext}\n\nPlease use the above context to answer the following questions.\n\n` + 
                        payloadMessage[payloadMessage.length - 1].content;
                }
            } catch (error) {
                console.error('RAG processing error:', error);
            }
        }

        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const selectedModelData = state.models.find(m => m.model === state.selectedModel);
            const modelName = selectedModelData?.name || state.selectedModel;
            const assetValue = selectedModelData?.price?.toString() || "1";

            const payload = {
                ollama_inference_input: {
                    messages: [
                        {
                            role: "user",
                            content: messageContent
                        }
                    ],
                    model: state.selectedModel,
                    temperature: state.temperature,
                    max_tokens: state.maxTokens,
                    top_p: state.topP
                },
                did: connectedWallet?.did,
                timestamp: timestamp.toString(),
                signature: "",
                asset_id: state.selectedModel,
                asset_value: assetValue
            };

            const result = await completeChat(
                payload, 
                infraProviders?.[0]?.providers?.[0]?.endpoints?.inference || null
            );

            if (result.length > 0) {
                const transformedMessages: Message[] = result
                    .filter(msg => isValidRole(msg.role))
                    .map(msg => ({
                        role: msg.role as "user" | "assistant",
                        content: msg.content
                    }));
                
                setState(prev => ({
                    ...prev,
                    messages: [...currentMessages, ...transformedMessages],
                    isProcessing: false
                }));

                try {
                    await END_POINTS.deduct_credits({ did: connectedWallet?.did || '' });
                    if (connectedWallet?.did) {
                        const newBalance = await fetchBalance(connectedWallet.did);
                        if (newBalance !== null) {
                            setState(prev => ({ ...prev, inferenceBalance: newBalance }));
                        }
                    }
                } catch (error) {
                    console.error('Credit deduction error:', error);
                }
            }
        } catch (error) {
            toast.error("Error fetching response. Please try again.");
            setState(prev => ({ ...prev, isProcessing: false }));
        }
    };

    const handleRunMessage = async () => {
        if (!connectedWallet?.did) {
            toast.error("Please connect your wallet.");
            return;
        }

        if (state.inferenceBalance === null || state.inferenceBalance <= 0) {
            toast.error("Insufficient balance. Please buy more tokens to continue.");
            return;
        }

        if (state.userMessage.trim() === '') {
            setState(prev => ({ ...prev, inputError: true }));
            return;
        }

        if (window.xell) {
            try {
                setState(prev => ({ ...prev, isRequestProcessing: true }));
                
                const currentTimestamp = Math.floor(Date.now() / 1000);
                const requestPayload = {
                    user_input: state.userMessage,
                    timestamp: currentTimestamp,
                    user_did: connectedWallet?.did,
                };

                const requestResult = await window.xell.request(requestPayload);
                
                if (requestResult?.status) {
                    toast.success('Request sent successfully');
                    
                    const signature = requestResult?.data?.signature;
                    if (signature) {
                        const newUserMessage: Message = { 
                            role: "user", 
                            content: state.userMessage 
                        };
                        const newMessages = [...state.messages, newUserMessage];
                        setState(prev => ({ 
                            ...prev, 
                            messages: newMessages, 
                            userMessage: "",
                            isRequestProcessing: false 
                        }));
                        await processMessage(state.userMessage, newMessages as Message[]);
                    }
                } else {
                    toast.error('Request failed');
                    setState(prev => ({ ...prev, isRequestProcessing: false }));
                }
            } catch (error) {
                toast.error('Request failed due to error');
                setState(prev => ({ ...prev, isRequestProcessing: false }));
            }
        }
    };

    const handleBuyMoreTokens = async () => {
        if (!connectedWallet?.did) {
            toast.error("Please connect your wallet.");
            return;
        }

        if (!infraProviders || infraProviders.length === 0) {
            toast.error("Infrastructure providers not available. Please try again later.");
            return;
        }

        setBuyingTokensLoading(true);

        const trieAmount = 5;
        const tokenAmount = 500;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        
        const providerDid = infraProviders[0]?.providers?.[0]?.providerDid;
        if (!providerDid) {
            toast.error("Provider information not available. Please try again later.");
            setBuyingTokensLoading(false);
            return;
        }

        let data = {
            purchase_credit: {
                "purchase_token_name": "TRIE",
                "purchase_token_creator": CONSTANTS.FT_DENOM_CREATOR,
                "user_did": connectedWallet.did,
                "depin_provider": providerDid,
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

        if (typeof window !== 'undefined' && window.xell) {
            try {
                const result = await window.xell.executeContract(executeData);
                
                if (result?.status) {
                    toast.success("Purchase initiated. Please approve in your wallet/extension.");
                    
                    let pollCount = 0;
                    const maxPolls = 20;
                    const initialBalance = state.inferenceBalance;
                    
                    const pollInterval = setInterval(async () => {
                        try {
                            pollCount++;
                            
                            const newBalance = await fetchBalance(connectedWallet.did);
                            
                            if (newBalance !== initialBalance || pollCount >= maxPolls) {
                                if (newBalance !== initialBalance) {
                                    setState(prev => ({ ...prev, inferenceBalance: newBalance }));
                                    toast.success(`Balance updated! New balance: ${newBalance} tokens`);
                                } else if (pollCount >= maxPolls) {
                                    toast.error("Purchase timeout. Please check your wallet or try again.");
                                }
                                
                                setBuyingTokensLoading(false);
                                clearInterval(pollInterval);
                            }
                        } catch (pollError) {
                            console.error('Balance polling error:', pollError);
                            setBuyingTokensLoading(false);
                            clearInterval(pollInterval);
                        }
                    }, 3000);
                } else {
                    const errorMessage = result?.data?.message || 'Purchase failed';
                    toast.error(errorMessage);
                    setBuyingTokensLoading(false);
                }
            } catch (error) {
                console.error('Buy tokens error:', error);
                toast.error("Purchase failed. Please check your wallet connection and try again.");
                setBuyingTokensLoading(false);
            }
        } else {
            toast.error("Wallet extension not detected. Please install the XELL extension and refresh the page.");
            setBuyingTokensLoading(false);
        }
    };

    const handleRagTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setState(prev => ({ ...prev, ragText: e.target.value }));
    };

    const handleRagFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setState(prev => ({ 
                ...prev, 
                ragFile: e.target.files![0], 
                ragText: "",
                uploading: true
            }));
            
            setTimeout(() => {
                setState(prev => ({ ...prev, uploading: false }));
            }, 1000);
        }
    };

    const handleChunkSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ 
            ...prev, 
            chunkSize: parseInt(e.target.value) || 500 
        }));
    };

    const handleKNearestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ 
            ...prev, 
            kNearest: parseInt(e.target.value) || 3 
        }));
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setState(prev => ({ ...prev, selectedModel: e.target.value }));
    };

    const handleRemoveRagFile = () => {
        setState(prev => ({ ...prev, ragFile: null }));
    };

    const handleSavePrompt = () => {
        toast.success('System prompt saved successfully!', {
            position: 'top-center',
        });
    };

    const handleCloseClearModal = () => {
        setState(prev => ({ ...prev, showClearModal: false }));
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setState(prev => ({ ...prev, activeDrawer: 'none' }));
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);



    return {
        state,
        handleTemplateChange,
        handleSystemPromptChange,
        handleEditPrompt,
        handleCancelEdit,
        handleClearSystemPrompt,
        confirmClearSystemPrompt,
        handleUserMessageChange,
        handleClearInput,
        toggleDrawer,
        closeDrawer,
        handleCopyMessage,
        handleRerunMessage,
        handleRunMessage,
        handleBuyMoreTokens,
        handleRagTextChange,
        handleRagFileChange,
        handleChunkSizeChange,
        handleKNearestChange,
        handleModelChange,
        handleRemoveRagFile,
        handleSavePrompt,
        handleCloseClearModal,
        isBuyingTokens
    };
};

