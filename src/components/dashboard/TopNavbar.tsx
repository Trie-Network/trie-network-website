import { useState, useRef, useCallback, Fragment, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover, Transition } from '@headlessui/react';
import { useAuth, useColors } from '@/hooks';
import toast from 'react-hot-toast';








const PROFILE_MENU_ITEMS = [
  { label: 'Home', href: '/dashboard/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'My Assets', href: '/dashboard/assets', icon: 'M3 7a2 2 0 012-2h3l2 2h7a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z' },

  { label: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

const SEARCH_OPTIONS = [
  { id: 'model', label: 'AI Models' },
  { id: 'dataset', label: 'Datasets' },
  { id: 'infra', label: 'Infra Providers' }
];

declare global {
  interface Window {
    myExtension: {
      trigger: (params: { type: string, data: any }) => void;
    }
  }
}

export function TopNavbar() {
  const { colors } = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedOption, setSelectedOption] = useState(SEARCH_OPTIONS[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, setConnectedWallet, connectedWallet, logout, setShowExtensionModal,
    nftData, infraProviders, tokenBalance, refreshBalance } = useAuth();
  const messageHandlerRef = useRef<any>(null);
  const [searchData, setSearchData] = useState([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshBalance();
  }, [connectedWallet]);



  useEffect(() => {
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
        messageHandlerRef.current = null;
      }
    };
  }, [isAuthenticated])

  const focusSearchInput = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchFocused) {
        searchInputRef.current?.blur();
        setIsSearchFocused(false);
        return;
      }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !isSearchFocused) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
    },
    [isSearchFocused]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', focusSearchInput);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', focusSearchInput);
    };
  }, [focusSearchInput]);

  const handleConnectWallet = () => {

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
      if (event?.data?.type === "WALLET_SIGN_RESPONSE" && event?.data?.data) {
        setIsAuthenticated(true);
        setConnectedWallet(event?.data?.data);
        toast.success("Wallet connected!", { duration: 2000 });
        localStorage.setItem("wallet_details", JSON.stringify(event?.data?.data));
        if (messageHandlerRef.current) {
          window.removeEventListener('message', messageHandlerRef.current);
          messageHandlerRef.current = null;
        }
      }
    }

    messageHandlerRef.current = messageHandler;

    window.addEventListener('message', messageHandler);

  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (!value) {
      setSearchData([]);
      return;
    }
    
    if (selectedOption?.id === "model" || selectedOption?.id === "dataset") {
      setSearchData(
        nftData?.filter((data: any) =>
          data?.metadata?.type === selectedOption?.id &&
          data?.usageHistory?.length > 0 &&
          data?.metadata?.name?.toLowerCase().includes(value.toLowerCase())
        ) || []
      );
    } else if (selectedOption?.id === "infra") {
      setSearchData(
        infraProviders?.filter((data: any) => 
          data?.name?.toLowerCase()?.includes(value.toLowerCase())
        ) || []
      );
    }
  }

  const handleResultClick = (data: any) => {
    const slug = (data?.metadata?.name || data?.name || '').replace(/\s+/g, '-');
    setSearchQuery('');
    
    if (selectedOption?.id === "infra") {
      const infraData = {
        metadata: { ...data, name: data?.name, description: data?.description }
      };
      navigate(`/dashboard/providerDetails/${slug}`, {
        state: { model: { ...infraData, type: selectedOption?.id } }
      });
    } else {
      navigate(`/dashboard/${selectedOption?.id}/${slug}`, {
        state: { model: { ...data, type: selectedOption?.id } }
      });
    }
  }

  return (
    <nav className="fixed top-0 right-0 left-0 z-20" style={{ backgroundColor: '#191919' }}>
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          <div className="flex items-center">
            <button
              type="button"
              className="xl:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-6">
              <img
                src="/trie-nav-logo@4x.png"
                alt="TRIE AI"
                className="h-8 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => navigate('/')}
              />
              <div className="hidden xl:flex items-center relative">
                <div className="relative">
                  <div className="relative flex items-center">
                    <div ref={dropdownRef} className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 px-3 h-10 rounded-l-lg border border-r-0 border-border text-sm text-text-secondary transition-colors focus:outline-none focus:ring-0"
                        style={{ backgroundColor: colors.ui.slate[700] }}
                      >
                        <span>{selectedOption.label}</span>
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-48 rounded-lg shadow-popup border border-border py-1 z-50" style={{ backgroundColor: colors.ui.slate[900] }}>
                          {SEARCH_OPTIONS.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => {
                                setSelectedOption(option);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-background-tertiary flex items-center space-x-2 focus:outline-none focus:ring-0 ${selectedOption.id === option.id ? 'bg-background-tertiary' : 'text-text-primary'
                                }`}
                              style={{ color: selectedOption.id === option.id ? colors.ui.slate[400] : colors.text.primary }}
                            >
                              <span>{option.label}</span>
                              {selectedOption.id === option.id && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.ui.slate[400] }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="search"
                        value={searchQuery}
                        ref={searchInputRef}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search AI models, datasets..."
                        className="block w-[480px] pl-10 pr-8 h-10 border border-border rounded-r-lg text-sm placeholder-text-tertiary focus:outline-none focus:ring-1 text-text-primary transition-all"
                        style={{ backgroundColor: colors.ui.slate[700] }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-xs text-gray-400">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500">/</kbd>
                      </div>
                      {searchQuery ? <div ref={searchRef} className="absolute h-100 max-h-[200px] min-h-[50px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] cursor-pointer overflow-auto scroll-hidden shadow-lg p-2 w-full rounded-lg z-50" style={{ top: 50, backgroundColor: colors.ui.slate[900] }}>
                        {searchData?.length > 0 ? searchData?.map((data: any) => <p onClick={() => handleResultClick(data)} className='p-2 text-white'>{data?.metadata?.name || data?.name}</p>)
                          : <p className='p-2 text-white text-center'>No Data Available</p>}
                      </div> : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {

}
            {connectedWallet?.did ? <button onClick={() => {
              window.open(`/faucet`, '_blank')
            }} className="px-4 py-2 border border-none rounded-md text-sm font-medium transition bg-primary text-white hover:bg-primary-hover">
              Request TRIE Tokens
            </button> : null}
            {connectedWallet?.did ? <div className="text-white text-sm font-medium">TRIE Balance: {tokenBalance} </div> : null}

            {!isAuthenticated ? (
              <button
                onClick={handleConnectWallet}
                className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${isAuthenticated ? 'hidden' : ''
                  }`}
                style={{ backgroundColor: colors.brand.primary }}
              >
                <img src="/xell.png" alt="XELL" className="w-5 h-5 mr-2" />
                Connect Wallet
              </button>
            ) : null}

            {isAuthenticated && (
              <div className="relative hidden xl:block">
                <Popover className="relative">
                  {({ open, close }) => (
                    <>
                      <Popover.Button className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: colors.brand.primary }}>
                          {connectedWallet?.username?.slice(0, 1)?.toUpperCase()}
                        </div>
                      </Popover.Button>
                      <Transition
                        show={open}
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <Popover.Panel className="absolute right-0 mt-2 w-56 rounded-lg shadow-popup border border-border py-1 z-50" style={{ backgroundColor: colors.ui.slate[900] }}>
                          {PROFILE_MENU_ITEMS.map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                navigate(item.href);
                                close()
                              }}
                              className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:text-white"
                              style={{ color: colors.ui.slate[300] }}
                            >
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
                              </svg>
                              <span>{item.label}</span>
                            </button>
                          ))}
                          <div className="border-t border-border mt-1">
                            <button
                              onClick={() => {
                                logout();
                                localStorage.setItem('connect', JSON.stringify(false));
                                navigate('/');
                              }}
                              className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2"
                              style={{ color: colors.status.error }}
                            >
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span>Disconnect Wallet</span>
                            </button>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </>
                  )}
                </Popover>
              </div>
            )}
          </div>
        </div>
      </div>


    </nav>
  );
}