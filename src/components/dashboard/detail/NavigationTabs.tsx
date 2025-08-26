import React from 'react';


interface Tab {
  id: string;
  label: string;
}

interface NavigationTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

interface TabButtonProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}


const ACTIVE_TAB_STYLES = 'border-[#0284a5] text-[#0284a5]';
const INACTIVE_TAB_STYLES = 'border-transparent text-gray-900 hover:text-[#0284a5] hover:border-[#0284a5]/50';
const BASE_TAB_STYLES = 'px-1 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap relative';


const getTabStyles = (isActive: boolean): string => {
  return `${BASE_TAB_STYLES} ${isActive ? ACTIVE_TAB_STYLES : INACTIVE_TAB_STYLES}`;
};


const TabButton = ({ tab, isActive, onClick }: TabButtonProps) => (
  <button
    key={tab.id}
    onClick={onClick}
    className={getTabStyles(isActive)}
  >
    {tab.label}
  </button>
);


export function NavigationTabs({ tabs, activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="bg-white border-b border-[#e1e3e5] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto scrollbar-hide">
          <nav className="flex -mb-px space-x-8 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}