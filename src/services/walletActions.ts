import { fetchInferenceBalance } from '@/utils/balanceUtils';
import { toast } from 'react-hot-toast';


const showToast = (message: string, type: 'success' | 'error' = 'success'): void => {
  if (type === 'success') toast.success(message);
  else toast.error(message);
};


export async function deployNFT(
  payload: any,
  socket: WebSocket | null,
  setUploadModelLoading: (b: boolean) => void,
  setUploadDatasetLoading: (b: boolean) => void
): Promise<void> {
  try {
    if (!window.xell) { showToast('Extension not available', 'error'); return; }
    const result = await window.xell.deployNFT(payload);
    if (result?.status) {
      showToast(result.data.message, 'success');
      if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(result.data));
    } else {
      setUploadModelLoading(false);
      setUploadDatasetLoading(false);
      showToast(result?.data?.message || 'Deploy failed due to error', 'error');
    }
  } catch {
    showToast('Deploy NFT failed', 'error');
    setUploadModelLoading(false);
    setUploadDatasetLoading(false);
  }
}


export async function transferFT(
  payload: any,
  socket: WebSocket | null,
  setUploadModelLoading: (b: boolean) => void,
  setUploadDatasetLoading: (b: boolean) => void,
  setBuyingTokensLoading: (b: boolean) => void,
  triggerAddCreditContract: () => Promise<void>
): Promise<void> {
  try {
    if (!window.xell) { showToast('Extension not available', 'error'); return; }
    const result = await window.xell.transferFT(payload);
    if (result?.status) {
      showToast(result.data.message, 'success');
      if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(result.data));
      setUploadModelLoading(false);
      setUploadDatasetLoading(false);
      if (payload?.comment === 'Credit Purchase') {
        try { await triggerAddCreditContract(); } catch { setBuyingTokensLoading(false); }
      } else {
        setBuyingTokensLoading(false);
      }
    } else {
      setUploadModelLoading(false);
      setUploadDatasetLoading(false);
      setBuyingTokensLoading(false);
      showToast(result?.data?.message || 'Transfer failed', 'error');
    }
  } catch {
    showToast('Transfer failed', 'error');
    setUploadModelLoading(false);
    setUploadDatasetLoading(false);
    setBuyingTokensLoading(false);
  }
}


export async function executeNFT(
  payload: any,
  socket: WebSocket | null,
  setBuyingAssetLoading: (b: boolean) => void
): Promise<void> {
  try {
    if (!window.xell) { showToast('Extension not available', 'error'); return; }
    const result = await window.xell.executeNFT(payload);
    if (result?.status) {
      showToast(result.data.message, 'success');
      if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(result.data));
      setBuyingAssetLoading(false);
    } else {
      showToast(result?.data?.message || 'Execute failed', 'error');
      setBuyingAssetLoading(false);
    }
  } catch {
    showToast('Execute failed', 'error');
    setBuyingAssetLoading(false);
  }
}


export async function executeTokens(
  payload: any,
  socket: WebSocket | null,
  setBuyingTokensLoading: (b: boolean) => void,
  userDid: string | undefined,
  refreshBalance: () => Promise<void>,
  balanceRefreshDelayMs: number
): Promise<void> {
  try {
    if (!window.xell) { showToast('Extension not available', 'error'); return; }
    const result = await window.xell.executeContract(payload);
    if (result?.status) {
      showToast(result.data.message, 'success');
      if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(result.data));
      setBuyingTokensLoading(false);
      setTimeout(async () => {
        if (userDid) {
          try {
            const balance = await fetchInferenceBalance(userDid);
            if (balance !== null) {
              window.dispatchEvent(new CustomEvent('updateInferenceBalance', { detail: balance }));
            }
            await refreshBalance();
          } catch {}
        }
      }, balanceRefreshDelayMs);
    } else {
      showToast(result?.data?.message || 'Token purchase failed', 'error');
      setBuyingTokensLoading(false);
    }
  } catch {
    showToast('Token purchase failed', 'error');
    setBuyingTokensLoading(false);
  }
}


