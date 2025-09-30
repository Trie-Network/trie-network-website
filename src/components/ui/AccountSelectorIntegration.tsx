import React, { useState } from 'react';
import AccountSelector from './AccountSelector';
import { useAuth } from '@/hooks/useAuth';
import { getNetworkColor } from '@/config/colors';

interface AccountSelectorIntegrationProps {
  onTransfer?: (fromAccount: string, toAccount: string) => void;
  className?: string;
}

const AccountSelectorIntegration: React.FC<AccountSelectorIntegrationProps> = ({
  onTransfer,
  className = ''
}) => {
  const { connectedWallet } = useAuth();
  const [fromAccount, setFromAccount] = useState(connectedWallet?.did || '');
  const [toAccount, setToAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const primaryColor = getNetworkColor();

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount) return;
    
    setIsLoading(true);
    try {
      await onTransfer?.(fromAccount, toAccount);
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Account Selector */}
      <AccountSelector
        fromAccount={fromAccount}
        toAccount={toAccount}
        onFromAccountChange={setFromAccount}
        onToAccountChange={setToAccount}
        primaryColor={primaryColor}
      />

      {/* Transfer Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFromAccount(connectedWallet?.did || '')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Use My Account
          </button>
          
          <button
            onClick={() => {
              setFromAccount('');
              setToAccount('');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>

        <button
          onClick={handleTransfer}
          disabled={!fromAccount || !toAccount || isLoading}
          className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 4px 14px 0 ${primaryColor}40`
          }}
        >
          {isLoading ? 'Processing...' : 'Transfer Assets'}
        </button>
      </div>
    </div>
  );
};

export default AccountSelectorIntegration;

