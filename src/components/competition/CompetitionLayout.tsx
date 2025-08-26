import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TopNavbar } from '../dashboard/TopNavbar';
import { CnNavItem as NavItem } from './CnNavItem';
import { Modal } from '@/components/ui';
import { useCompTheme } from '@/contexts/compTheme';
import { getCompetitionTheme } from '@/config/competitions';
import { COMP_SERVER } from '@/api/requests';
import { useAuth } from '@/hooks';


interface NavigationItem {
    id: string;
    label: string;
    route: string;
    icon: string;
}

interface CompetitionLayoutProps {
    children: React.ReactNode;
}

interface AuthModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (accessKey: string) => void;
    accessKey: string;
    setAccessKey: (value: string) => void;
    primaryColor: string;
    isLoading?: boolean;
}


const MAIN_NAVIGATION: NavigationItem[] = [
    {
        id: 'models',
        label: 'AI Models',
        route: '/competition/:compid/models',
        icon: 'M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 15h19.5m-16.5 0h13.5M9 3.75l2.25 4.5m0 0L15 3.75M11.25 8.25h4.5'
    },
    {
        id: 'datasets',
        label: 'Datasets',
        route: '/competition/:compid/datasets',
        icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125'
    }
];

const UPLOAD_NAVIGATION: NavigationItem[] = [
    {
        id: 'upload-model',
        label: 'Upload AI Model',
        route: '/competition/:compid/upload-model',
        icon: 'M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 15h19.5m-16.5 0h13.5M9 3.75l2.25 4.5m0 0L15 3.75M11.25 8.25h4.5'
    },
    {
        id: 'upload-dataset',
        label: 'Upload Dataset',
        route: '/competition/:compid/upload-dataset',
        icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125'
    }
];

const GO_BACK_BUTTON: NavigationItem = {
    id: 'go-back',
    label: 'Go Back',
    route: '/dashboard/all',
    icon: 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18'
};

const COMPETITIONS_NAVIGATION: NavigationItem[] = [
    {
        id: 'home',
        label: 'Home',
        route: '/competition/:compid/home',
        icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a1.875 1.875 0 010 3.75H9.497a1.875 1.875 0 010-3.75M7.5 4.5v8.25m0 0H4.875c-.621 0-1.125-.504-1.125-1.125V4.5c0-.621.504-1.125 1.125-1.125H7.5m3.75 9.75h2.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5-9.75H15c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125M7.5 4.5h3.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H7.5c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125'
    }
];

const CREATOR_NAVIGATION: NavigationItem[] = [
    {
        id: 'my-uploads',
        label: 'My Uploads',
        route: '/competition/:compid/my-uploads',
        icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a1.875 1.875 0 010 3.75H9.497a1.875 1.875 0 010-3.75M7.5 4.5v8.25m0 0H4.875c-.621 0-1.125-.504-1.125-1.125V4.5c0-.621.504-1.125 1.125-1.125H7.5m3.75 9.75h2.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5-9.75H15c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125M7.5 4.5h3.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H7.5c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125'
    }
];


const replaceCompIdInRoute = (route: string, compId: string): string => {
    return route.replace(':compid', compId);
};

const getBannerStyle = (primaryColor: string) => ({
    background: `linear-gradient(to right, ${primaryColor}15, ${primaryColor}05)`,
    borderBottom: `1px solid ${primaryColor}30`,
    zIndex: 50
});

const getInputStyle = (primaryColor: string, hasValue: boolean) => ({
    "--tw-ring-color": primaryColor,
    "--tw-ring-opacity": 0.5,
    "--tw-border-opacity": 1,
    borderColor: `${primaryColor} var(--tw-border-opacity)`,
    boxShadow: hasValue ? `0 0 0 2px ${primaryColor}20` : 'none'
} as React.CSSProperties);


const CompetitionBanner = ({ 
    compId, 
    primaryColor, 
    compTheme, 
    onBackClick 
}: { 
    compId: string; 
    primaryColor: string; 
    compTheme: any; 
    onBackClick: () => void; 
}) => (
    <div
        className="pt-[84px] lg:pt-[84px] px-4 md:px-6 lg:px-8 py-4"
        style={getBannerStyle(primaryColor)}
    >
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-row items-center mb-2">
                <button
                    onClick={onBackClick}
                    className="lg:hidden mr-3 flex items-center justify-center p-1.5 rounded-md bg-white shadow-sm hover:shadow transition-colors"
                    style={{ color: primaryColor }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={GO_BACK_BUTTON.icon} />
                    </svg>
                    <span className="ml-1 text-xs font-medium">Back</span>
                </button>

                <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
                    {compTheme.name || `Competition: ${compId}`}
                </h1>
            </div>
            {compTheme.description && (
                <p className="text-sm text-gray-600 mt-1">{compTheme.description}</p>
            )}
        </div>
    </div>
);

const MobileNavigation = ({ 
    navigation, 
    compId 
}: { 
    navigation: NavigationItem[]; 
    compId: string; 
}) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e1e3e5] lg:hidden z-20">
        <div className="flex justify-around items-center py-2">
            {navigation.slice(0, 2).map((item) => {
                const route = replaceCompIdInRoute(item.route, compId);
                return <NavItem key={item.id} item={{ ...item, route }} isMobile={true} />;
            })}
            <NavItem
                key="home-mobile"
                item={{
                    ...COMPETITIONS_NAVIGATION[0],
                    route: `/competition/${compId}/home`
                }}
                isMobile={true}
            />
        </div>
    </div>
);

const NavigationSection = ({ 
    title, 
    items, 
    compId, 
    primaryColor 
}: { 
    title: string; 
    items: NavigationItem[]; 
    compId: string; 
    primaryColor: string; 
}) => (
    <div className="space-y-1.5 mb-6">
        <div className="px-3 mb-2">
            <h2 className="font-display text-label text-gray-400 uppercase tracking-wider">{title}</h2>
        </div>
        {items.map((item) => {
            const route = replaceCompIdInRoute(item.route, compId);
            return <NavItem key={item.id} item={{ ...item, route }} />;
        })}
    </div>
);

const Sidebar = ({ 
    compId, 
    primaryColor 
}: { 
    compId: string; 
    primaryColor: string; 
}) => (
    <div className="w-[280px] hidden lg:block flex-shrink-0 fixed left-0 top-[144px] bottom-0 border-r border-[#e1e3e5] pt-4 bg-[#f6f6f7] z-10">
        <div className="flex flex-col h-full px-6">
            <div className="mb-6">
                <NavItem
                    key="go-back-top"
                    item={{ ...GO_BACK_BUTTON }}
                    badge={
                        <div className="flex items-center">
                            <span className="ml-1 text-xs font-medium" style={{ color: primaryColor }}>
                                Dashboard
                            </span>
                        </div>
                    }
                />
            </div>

            <div className="border-t border-gray-200 mb-6 pt-6"></div>

            <NavigationSection 
                title="ALL" 
                items={COMPETITIONS_NAVIGATION} 
                compId={compId} 
                primaryColor={primaryColor} 
            />

            <NavigationSection 
                title="ALL" 
                items={MAIN_NAVIGATION} 
                compId={compId} 
                primaryColor={primaryColor} 
            />

            <NavigationSection 
                title="MY" 
                items={[...UPLOAD_NAVIGATION, ...CREATOR_NAVIGATION]} 
                compId={compId} 
                primaryColor={primaryColor} 
            />
        </div>
    </div>
);

const AuthRequiredMessage = ({ 
    primaryColor, 
    onAuthClick 
}: { 
    primaryColor: string; 
    onAuthClick: () => void; 
}) => (
    <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V7.5a3 3 0 00-6 0V12H4.5a1.5 1.5 0 00-1.5 1.5V15h10.5a1.5 1.5 0 001.5-1.5V12h-1.5A1.5 1.5 0 0112 10.5V9" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">You need an access key to view this competition content.</p>
            <button
                onClick={onAuthClick}
                style={{ backgroundColor: primaryColor }}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors"
            >
                Enter Access Key
            </button>
        </div>
    </div>
);

const AuthModal = ({ 
    show, 
    onClose, 
    onSubmit, 
    accessKey, 
    setAccessKey, 
    primaryColor, 
    isLoading = false 
}: AuthModalProps) => (
    <Modal
        show={show}
        onClose={onClose}
        title="Competition Access"
        preventOutsideClick={true}
    >
        <div className="p-4">
            <p className="mb-4 text-gray-600">
                You need an access key to enter this competition.
            </p>
            <div className="mb-4">
                <label htmlFor="accessKey" className="block text-sm font-medium text-gray-700 mb-1">
                    Access Key
                </label>
                <input
                    type="text"
                    id="accessKey"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black"
                    style={getInputStyle(primaryColor, accessKey.length > 0)}
                    placeholder="Enter access key"
                />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSubmit(accessKey)}
                    disabled={accessKey.length <= 1 || isLoading}
                    style={{ backgroundColor: primaryColor }}
                    className={`px-4 py-2 text-white rounded-md transition-colors ${
                        accessKey.length <= 1 || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                >
                    {isLoading ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </div>
    </Modal>
);

    
export default function CompetitionLayout({ children }: CompetitionLayoutProps) {
    const [isCompAuth, setIsCompAuth] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [accessKey, setAccessKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { compid = 'default' } = useParams();
    const navigate = useNavigate();
    const { primaryColor } = useCompTheme();
    const { connectedWallet } = useAuth();

    const compTheme = getCompetitionTheme(compid);

    useEffect(() => {
        if (!connectedWallet?.did) {
            return;
        }
        
        const checkCompAuth = async () => {
            try {
                const response = await COMP_SERVER.authDid({
                    did: connectedWallet?.did,
                });
                
                if (response?.data?.authenticated === true) {
                    setIsCompAuth(true);
                    return;
                }
            } catch (error) {
               
            }
            
            setShowAuthModal(true);
        };

        checkCompAuth();
    }, [compid, connectedWallet?.did]);

    const handleAuthSubmit = async (key: string) => {
        if (key.length <= 1) return;
        
        setIsLoading(true);
        try {
            const response = await COMP_SERVER.authenticate({
                token: String(key).trim(),
                wallet: connectedWallet?.did
            });
            
            if (response?.data?.error && response?.data?.error?.length > 0) {
                toast.error(response?.data?.error, { position: 'top-center' });
                return;
            }
            
            setIsCompAuth(true);
            setShowAuthModal(false);
            setAccessKey('');
        } catch (error) {
            toast.error("Authentication failed. Please try again.", { position: 'top-center' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackClick = () => navigate('/dashboard/all');

    return (
        <div className="min-h-screen bg-[#f6f6f7] flex flex-col">
            <TopNavbar />

            <CompetitionBanner 
                compId={compid}
                primaryColor={primaryColor}
                compTheme={compTheme}
                onBackClick={handleBackClick}
            />

            <main className="flex-1 pt-[0] pb-[120px] lg:pb-[84px] bg-[#f6f6f7] lg:pt-[0] lg:pl-[280px] relative">
                <MobileNavigation navigation={MAIN_NAVIGATION} compId={compid} />

                <div className="flex flex-col lg:flex-row">
                    <Sidebar compId={compid} primaryColor={primaryColor} />

                    <div className="flex-1 min-w-0 relative">
                        {isCompAuth ? (
                            children
                        ) : (
                            <AuthRequiredMessage 
                                primaryColor={primaryColor}
                                onAuthClick={() => setShowAuthModal(true)}
                            />
                        )}
                    </div>
                </div>
            </main>

            <AuthModal
                show={showAuthModal && !isCompAuth}
                onClose={handleBackClick}
                onSubmit={handleAuthSubmit}
                accessKey={accessKey}
                setAccessKey={setAccessKey}
                primaryColor={primaryColor}
                isLoading={isLoading}
            />
        </div>
    );
}
