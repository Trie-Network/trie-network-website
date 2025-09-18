import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface AccountSelectorProps {
  fromAccount?: string;
  toAccount?: string;
  onFromAccountChange?: (account: string) => void;
  onToAccountChange?: (account: string) => void;
  primaryColor?: string;
  className?: string;
}

interface AccountCardProps {
  label: 'From' | 'To';
  account: string;
  onAccountChange?: (account: string) => void;
  primaryColor: string;
  isActive?: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({
  label,
  account,
  onAccountChange,
  primaryColor,
  isActive = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(account);

  const truncateDid = (did: string, maxLength: number = 20): string => {
    if (did.length <= maxLength) return did;
    const start = did.substring(0, 8);
    const end = did.substring(did.length - 8);
    return `${start}...${end}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('DID copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy DID');
    }
  };

  const handleSave = () => {
    if (editValue.trim() && onAccountChange) {
      onAccountChange(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(account);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-semibold text-gray-900">
        {label}
      </label>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative rounded-xl border-2 transition-all duration-200 cursor-pointer
          ${isActive 
            ? 'border-[#0284a5] bg-[#0284a5]/5 shadow-md' 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
          }
        `}
        style={{
          borderColor: isActive ? primaryColor : undefined,
          backgroundColor: isActive ? `${primaryColor}08` : undefined
        }}
      >
        <div className="p-4 flex items-center space-x-3">
          {/* Account Icon */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
          </div>

          {/* Account Info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSave}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                style={{ 
                  '--tw-ring-color': primaryColor,
                  '--tw-ring-opacity': '0.5'
                } as React.CSSProperties}
                autoFocus
              />
            ) : (
              <div className="flex items-center space-x-2">
                <span 
                  className="text-sm font-medium truncate"
                  style={{ color: primaryColor }}
                >
                  {truncateDid(account)}
                </span>
                <button
                  onClick={() => copyToClipboard(account)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Copy full DID"
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Edit Button */}
          {!isEditing && onAccountChange && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Edit account"
            >
              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>

        {/* Full DID Tooltip */}
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {account}
        </div>
      </motion.div>
    </div>
  );
};

const AccountSelector: React.FC<AccountSelectorProps> = ({
  fromAccount = '',
  toAccount = '',
  onFromAccountChange,
  onToAccountChange,
  primaryColor = '#0284a5',
  className = ''
}) => {
  const [activeAccount, setActiveAccount] = useState<'from' | 'to' | null>(null);

  const handleFromAccountChange = (account: string) => {
    setActiveAccount('from');
    onFromAccountChange?.(account);
    setTimeout(() => setActiveAccount(null), 2000);
  };

  const handleToAccountChange = (account: string) => {
    setActiveAccount('to');
    onToAccountChange?.(account);
    setTimeout(() => setActiveAccount(null), 2000);
  };

  const swapAccounts = () => {
    if (fromAccount && toAccount) {
      onFromAccountChange?.(toAccount);
      onToAccountChange?.(fromAccount);
    }
  };

  return (
    <div className={`bg-gray-50 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between space-x-6">
        {/* From Account */}
        <div className="flex-1">
          <AccountCard
            label="From"
            account={fromAccount}
            onAccountChange={handleFromAccountChange}
            primaryColor={primaryColor}
            isActive={activeAccount === 'from'}
          />
        </div>

        {/* Swap Button */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={swapAccounts}
            className="p-3 rounded-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            title="Swap accounts"
            disabled={!fromAccount || !toAccount}
          >
            <svg 
              className="w-5 h-5 text-gray-600 hover:text-gray-800 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
              />
            </svg>
          </button>
          
          {/* Direction Arrow */}
          <div className="flex items-center space-x-1 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* To Account */}
        <div className="flex-1">
          <AccountCard
            label="To"
            account={toAccount}
            onAccountChange={handleToAccountChange}
            primaryColor={primaryColor}
            isActive={activeAccount === 'to'}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const currentDid = localStorage.getItem('connectedWallet') || '';
                if (currentDid) {
                  handleFromAccountChange(currentDid);
                }
              }}
              className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Use Current DID
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            {fromAccount && toAccount ? 'Ready to transfer' : 'Select accounts'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSelector;

