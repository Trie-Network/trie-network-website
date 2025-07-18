import { useColors } from '@/hooks';
import { componentStyles } from '@/utils';

interface Tab {
  id: string;
  label: string;
}

interface NavigationTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function NavigationTabs({ tabs, activeTab, onTabChange }: NavigationTabsProps) {
  const { colors } = useColors();
  return (
    <div className="bg-white border-b shadow-sm" style={{ borderColor: colors.border.slate[200] }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto scrollbar-hide">
          <nav className="flex -mb-px space-x-8 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  px-1 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap relative
                  ${activeTab === tab.id
                    ? 'border-current'
                    : 'border-transparent text-gray-900 hover:border-current'
                  }
                `}
                style={{
                  color: activeTab === tab.id ? colors.brand.primary : undefined,
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}