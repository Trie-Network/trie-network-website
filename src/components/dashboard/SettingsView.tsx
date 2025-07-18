import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks';
import { Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsView() {
  const [isLoading, setIsLoading] = useState(true);
  const { setIsAuthenticated, connectedWallet, setConnectedWallet, setShowExtensionModal } = useAuth()
  const [copied, setCopied] = useState(false)
  const messageHandlerRef = useRef<any>(null);

  const onHandleConnectWallet = () => {
    if (window.myExtension) {
      window.myExtension.trigger({
        type: "WALLET_SIGN_REQUEST",
        data: {}
      });
    }
    else {
      setShowExtensionModal(true)
    }
    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
      messageHandlerRef.current = null;
    }

    const messageHandler = (event: any) => {
      if (event?.data?.type == "WALLET_SIGN_RESPONSE") {

        if (event?.data?.data) {

          setIsAuthenticated(true)
          setConnectedWallet(event?.data?.data)
          toast.success("Wallet connection successfull!", {
            duration: 2000
          })
          localStorage.setItem("wallet_details", JSON.stringify(event?.data?.data))
          if (messageHandlerRef.current) {
            window.removeEventListener('message', messageHandlerRef.current);
            messageHandlerRef.current = null;
            return
          }
        }
      }

    }

    messageHandlerRef.current = messageHandler;

    window.addEventListener('message', messageHandler);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(connectedWallet?.did);
      setCopied(true);
      toast.success("DID copied", { duration: 1000 })
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!connectedWallet?.did) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-112px)]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <img src="/xell.png" alt="XELL" className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-6">Please connect your XELL wallet to access settings</p>
          <button
            onClick={onHandleConnectWallet}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover"
          >
            Connect XELL Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-112px)] overflow-y-auto scrollbar-hide">
      {isLoading ? (
        <Skeleton className="w-48 h-8 mb-8" />
      ) : (
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        {isLoading ? (
          <>
            <Skeleton className="w-32 h-6 mb-6" />
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="w-48 h-4 mb-2" />
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div>
                      <Skeleton className="w-32 h-4 mb-2" />
                      <Skeleton className="w-48 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-24 h-8" />
                </div>
              </div>
              <div>
                <Skeleton className="w-40 h-4 mb-2" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-64 h-4 mt-2" />
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Wallet</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Connection
                </label>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"

                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full p-2 shadow-sm">
                      <img src="/xell.png" alt="XELL" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">XELL</h3>
                      <p className="text-xs text-gray-500">Recommended wallet for TRIE AI Marketplace</p>
                    </div>
                  </div>
                  {connectedWallet?.did ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Connected</span>
                  ) : (
                    <span className="text-xs font-medium text-gray-600">Connect</span>
                  )}
                </div>
              </div>

              {connectedWallet?.did && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Connected Address</p>
                      <div className='flex'>
                        <p className="text-xs font-mono text-gray-500 me-3">{connectedWallet?.did}</p>
                        {copied ? <Check color='gray' size={18} /> : <Copy color='gray' className='cursor-pointer' onClick={handleCopy} size={18} />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex w-2 h-2 bg-green-500 rounded-full"></span>

                      <span className="text-xs text-gray-500">Active</span>

                    </div>
                  </div>
                </div>
              )}

              {

}
            </div>
          </>
        )}
      </div>


    </div>
  );
}