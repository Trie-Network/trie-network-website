import { BetweenVerticalStart, Settings } from 'lucide-react';

interface MobileHeaderProps {
    activeDrawer: 'none' | 'system' | 'settings';
    onToggleSystemDrawer: () => void;
    onToggleSettingsDrawer: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
    activeDrawer,
    onToggleSystemDrawer,
    onToggleSettingsDrawer
}) => {
    return (
        <div className="lg:hidden bg-white border-b border-slate-100 p-4 flex justify-between items-center sticky top-0 z-20">
            <div className="text-primary font-medium">AI Playground</div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSystemDrawer}
                    className={`p-2 rounded-full ${activeDrawer === 'system' ? 'bg-primary-light text-primary' : 'text-slate-500 hover:text-primary hover:bg-slate-50'}`}
                >
                    <BetweenVerticalStart size={20} />
                </button>
                <button
                    onClick={onToggleSettingsDrawer}
                    className={`p-2 rounded-full ${activeDrawer === 'settings' ? 'bg-primary-light text-primary' : 'text-slate-500 hover:text-primary hover:bg-slate-50'}`}
                >
                    <Settings size={20} />
                </button>
            </div>
        </div>
    );
};

