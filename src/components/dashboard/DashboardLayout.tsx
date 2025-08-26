
import { TopNavbar } from './TopNavbar';
import { NavItem } from './NavItem';
import { useAuth } from '@/hooks';
import { useState, useEffect, ReactNode } from 'react';


interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

interface UploadState {
  models: boolean;
  datasets: boolean;
  infra: boolean;
}

interface NavigationSectionProps {
  title: string;
  items: NavigationItem[];
  badge?: ReactNode;
}

interface MobileNavigationProps {
  mainNavigation: NavigationItem[];
  settings: NavigationItem[];
}

interface SidebarProps {
  mainNavigation: NavigationItem[];
  uploadNavigation: NavigationItem[];
  competitionsNavigation: NavigationItem[];
  additionalNavigation: NavigationItem[];
  creatorNavigation: NavigationItem[];
  settings: NavigationItem[];
  isAuthenticated: boolean;
  hasAnyUploads: boolean;
}


const STORAGE_KEYS = {
  models: 'user_uploads_models',
  datasets: 'user_uploads_datasets',
  infra: 'user_uploads_infra'
} as const;

const MAIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'models',
    label: 'AI Models',
    icon: 'M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 15h19.5m-16.5 0h13.5M9 3.75l2.25 4.5m0 0L15 3.75M11.25 8.25h4.5'
  },
  {
    id: 'datasets',
    label: 'Datasets',
    icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125'
  }
];

const UPLOAD_NAVIGATION: NavigationItem[] = [
  {
    id: 'upload-model',
    label: 'Upload AI Model',
    icon: 'M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 15h19.5m-16.5 0h13.5M9 3.75l2.25 4.5m0 0L15 3.75M11.25 8.25h4.5'
  },
  {
    id: 'upload-dataset',
    label: 'Upload Dataset',
    icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125'
  }
];

const COMPETITIONS_NAVIGATION: NavigationItem[] = [
  {
    id: 'competitions',
    label: 'Competitions',
    icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a1.875 1.875 0 010 3.75H9.497a1.875 1.875 0 010-3.75M7.5 4.5v8.25m0 0H4.875c-.621 0-1.125-.504-1.125-1.125V4.5c0-.621.504-1.125 1.125-1.125H7.5m3.75 9.75h2.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5-9.75H15c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125M7.5 4.5h3.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H7.5c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125'
  }
];

const ADDITIONAL_NAVIGATION: NavigationItem[] = [
  {
    id: 'infra-providers',
    label: 'Infra Providers',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
  },
  {
    id: 'become-partner',
    label: 'Become a Partner',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
  }
];

const CREATOR_NAVIGATION: NavigationItem[] = [
  {
    id: 'my-uploads',
    label: 'My Uploads',
    icon: 'M7 4V20M7 4L3 8M7 4L11 8M17 4V20M17 4L13 8M17 4L21 8'
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'withdraw',
    label: 'Withdraw',
    icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z'
  }
];

const SETTINGS: NavigationItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z'
  }
];

const LAYOUT_CLASSES = {
  container: 'min-h-screen bg-[#f6f6f7] flex flex-col',
  main: 'flex-1 pt-[84px] pb-[120px] md:pb-[84px] bg-[#f6f6f7] md:pt-[104px] md:pl-[280px] relative',
  mobileNav: 'fixed bottom-0 left-0 right-0 bg-white border-t border-[#e1e3e5] md:hidden z-20',
  mobileNavContainer: 'flex justify-around items-center py-2',
  sidebar: 'w-[280px] hidden md:block flex-shrink-0 fixed left-0 top-[104px] bottom-0 border-r border-[#e1e3e5] pt-12 bg-[#f6f6f7] z-10',
  sidebarContent: 'flex flex-col h-full px-6',
  navigationSection: 'space-y-1.5 mb-6',
  sectionTitle: 'px-3 mb-2',
  sectionTitleText: 'font-display text-label text-gray-400 uppercase tracking-wider',
  creatorSection: 'pl-6 mt-2 space-y-1',
  settingsSection: 'mt-auto pt-4 pb-6 border-t border-[#e1e3e5] flex flex-col items-center',
  contentArea: 'flex-1 min-w-0 relative'
} as const;


const checkUploadsInStorage = (): UploadState => {
  return {
    models: !!localStorage.getItem(STORAGE_KEYS.models),
    datasets: !!localStorage.getItem(STORAGE_KEYS.datasets),
    infra: !!localStorage.getItem(STORAGE_KEYS.infra)
  };
};

const hasAnyUploads = (uploadState: UploadState): boolean => {
  return Object.values(uploadState).some(Boolean);
};


const NavigationSection = ({ title, items, badge }: NavigationSectionProps) => (
  <div className={LAYOUT_CLASSES.navigationSection}>
    <div className={LAYOUT_CLASSES.sectionTitle}>
      <h2 className={LAYOUT_CLASSES.sectionTitleText}>{title}</h2>
    </div>
    {items.map((item) => (
      <NavItem 
        key={item.id} 
        item={item} 
        badge={badge}
      />
    ))}
  </div>
);

const MobileNavigation = ({ mainNavigation, settings }: MobileNavigationProps) => (
  <div className={LAYOUT_CLASSES.mobileNav}>
    <div className={LAYOUT_CLASSES.mobileNavContainer}>
      {mainNavigation.slice(0, 2).map((item) => (
        <NavItem key={item.id} item={item} isMobile={true} />
      ))}
      <NavItem
        key="settings-mobile"
        item={settings[0]}
        isMobile={true}
      />
    </div>
  </div>
);

const Sidebar = ({ 
  mainNavigation, 
  uploadNavigation, 
  competitionsNavigation, 
  additionalNavigation, 
  creatorNavigation, 
  settings, 
  isAuthenticated, 
  hasAnyUploads 
}: SidebarProps) => (
  <div className={LAYOUT_CLASSES.sidebar}>
    <div className={LAYOUT_CLASSES.sidebarContent}>
     
      <NavigationSection title="BUY" items={mainNavigation} />

     
      <NavigationSection title="Sell" items={uploadNavigation} />

     
      {isAuthenticated && hasAnyUploads && (
        <div className={LAYOUT_CLASSES.creatorSection}>
          {creatorNavigation.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>
      )}

    
      <NavigationSection 
        title="COMPETITIONS" 
        items={competitionsNavigation}
        badge={<span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">New</span>}
      />

     
      <NavigationSection title="ADDITIONAL" items={additionalNavigation} />

     
      <div className={LAYOUT_CLASSES.settingsSection}>
        {settings.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  </div>
);


export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated } = useAuth();
  const [hasUploads, setHasUploads] = useState<UploadState>({
    models: false,
    datasets: false,
    infra: false
  });

  useEffect(() => {
    const uploadState = checkUploadsInStorage();
    setHasUploads(uploadState);
  }, []);

  const userHasAnyUploads = hasAnyUploads(hasUploads);

  return (
    <div className={LAYOUT_CLASSES.container}>
    
      <TopNavbar />

      <main className={LAYOUT_CLASSES.main}>
        
        <MobileNavigation 
          mainNavigation={MAIN_NAVIGATION}
          settings={SETTINGS}
        />

        <div className="flex flex-col lg:flex-row">
        
          <Sidebar
            mainNavigation={MAIN_NAVIGATION}
            uploadNavigation={UPLOAD_NAVIGATION}
            competitionsNavigation={COMPETITIONS_NAVIGATION}
            additionalNavigation={ADDITIONAL_NAVIGATION}
            creatorNavigation={CREATOR_NAVIGATION}
            settings={SETTINGS}
            isAuthenticated={isAuthenticated}
            hasAnyUploads={userHasAnyUploads}
          />

        
          <div className={LAYOUT_CLASSES.contentArea}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}