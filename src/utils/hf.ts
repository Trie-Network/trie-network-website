import axios from 'axios';

interface ChatCompletionMessage {
    role: string;
    content: string;
}

interface OllamaResponse {
    model: string;
    created_at: string;
    message: {

        role: string;
        content: string;
    };
    done: boolean;
}


export const modelIds = ['gemma3:4b', 'mistral:7b', 'llama3.2:latest', 'deepseek-r1:8b', 'phi:latest', 'orca-mini:latest', 'tinyllama:latest', 'deepseek-r1:latest']


export const modelsList = modelIds.map(item => ({
    id: item,
    provider: {}
}))


const OLLAMA_BASE_URL = "https://dev-api.xellwallet.com:8445"
const RAG_BASE_URL = "https://dev-api.xellwallet.com:8447"


export async function getRAGContext(formdata: FormData): Promise<string> {
    try {
        
        const response = await axios.post(`${RAG_BASE_URL}/rag`, formdata, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data && response.data?.rag) {
            return String(response.data?.rag).trim();
        } else {
       
            return '';
        }
    } catch (error) {
        
        
        return '';
    }
}

export async function getModels(): Promise<string[]> {
    try {
        const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
        return response.data.models.map((model: any) => model?.model);
    } catch (error) {
       
        return [];
    }
}

export async function completeChat(
    
    payload: any,
    ollama_url: string | null = null
): Promise<ChatCompletionMessage[]> {
   

    try {
        const response = await axios.post<OllamaResponse>(
            ollama_url || `${OLLAMA_BASE_URL}/api/chat`,
            payload
        );

     
        return [{
            role: response.data.message.role,
            content: response.data.message.content
        }];

    } catch (error) {
       
        throw error;
    }
}

