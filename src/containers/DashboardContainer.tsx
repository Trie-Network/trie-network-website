
import React, { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout, HomeView, ModelsView, DatasetsView, InfraProvidersView, SettingsView, BecomePartnerView, ModelUploadView, DatasetUploadView } from '@/components/dashboard';
import { MyUploadsView, EarningsView, WithdrawView, TransactionsView, Assets, CompetitionsView } from '@/components/dashboard';


interface DashboardView {
  readonly component: React.ComponentType;
  readonly title: string;
  readonly description?: string;
  readonly requiresAuth?: boolean;
  readonly permissions?: readonly string[];
  readonly icon?: string;
  readonly category?: 'main' | 'upload' | 'management' | 'financial' | 'settings';
}

interface DashboardViews {
  readonly [key: string]: DashboardView;
}

interface DashboardContainerProps {
  readonly fallbackView?: string;
  readonly enableErrorBoundary?: boolean;
  readonly enableLoadingState?: boolean;
}

interface DashboardContainerState {
  readonly currentView: string;
  readonly isValidView: boolean;
  readonly viewMetadata: DashboardView | null;
  readonly availableViews: readonly string[];
}

interface DashboardContainerUtility {
  readonly getCurrentView: () => string;
  readonly isValidView: (viewName: string) => boolean;
  readonly getViewMetadata: (viewName: string) => DashboardView | null;
  readonly getAllViews: () => DashboardViews;
  readonly getViewsByCategory: (category: DashboardView['category']) => readonly string[];
  readonly navigateToView: (viewName: string) => void;
  readonly getAvailableViews: () => readonly string[];
}


const DASHBOARD_VIEWS: DashboardViews = {
  all: {
    component: HomeView,
    title: 'Dashboard Home',
    description: 'Main dashboard overview and statistics',
    requiresAuth: true,
    permissions: ['dashboard:read'],
    icon: '🏠',
    category: 'main'
  },
  models: {
    component: ModelsView,
    title: 'AI Models',
    description: 'Browse and manage AI models',
    requiresAuth: true,
    permissions: ['models:read'],
    icon: '🤖',
    category: 'main'
  },
  datasets: {
    component: DatasetsView,
    title: 'Datasets',
    description: 'Browse and manage datasets',
    requiresAuth: true,
    permissions: ['datasets:read'],
    icon: '📊',
    category: 'main'
  },
  assets: {
    component: Assets,
    title: 'Assets',
    description: 'Manage your digital assets',
    requiresAuth: true,
    permissions: ['assets:read'],
    icon: '💎',
    category: 'main'
  },
  'infra-providers': {
    component: InfraProvidersView,
    title: 'Infrastructure Providers',
    description: 'Browse and connect to infrastructure providers',
    requiresAuth: true,
    permissions: ['infra:read'],
    icon: '🏗️',
    category: 'main'
  },
  'upload-model': {
    component: ModelUploadView,
    title: 'Upload Model',
    description: 'Upload a new AI model',
    requiresAuth: true,
    permissions: ['models:write'],
    icon: '📤',
    category: 'upload'
  },
  'upload-dataset': {
    component: DatasetUploadView,
    title: 'Upload Dataset',
    description: 'Upload a new dataset',
    requiresAuth: true,
    permissions: ['datasets:write'],
    icon: '📁',
    category: 'upload'
  },
  'my-uploads': {
    component: MyUploadsView,
    title: 'My Uploads',
    description: 'View and manage your uploads',
    requiresAuth: true,
    permissions: ['uploads:read'],
    icon: '📋',
    category: 'management'
  },
  earnings: {
    component: EarningsView,
    title: 'Earnings',
    description: 'View your earnings and revenue',
    requiresAuth: true,
    permissions: ['earnings:read'],
    icon: '💰',
    category: 'financial'
  },
  withdraw: {
    component: WithdrawView,
    title: 'Withdraw',
    description: 'Withdraw your earnings',
    requiresAuth: true,
    permissions: ['withdraw:write'],
    icon: '💳',
    category: 'financial'
  },
  transactions: {
    component: TransactionsView,
    title: 'Transactions',
    description: 'View transaction history',
    requiresAuth: true,
    permissions: ['transactions:read'],
    icon: '📈',
    category: 'financial'
  },
  settings: {
    component: SettingsView,
    title: 'Settings',
    description: 'Manage your account settings',
    requiresAuth: true,
    permissions: ['settings:read'],
    icon: '⚙️',
    category: 'settings'
  },
  'become-partner': {
    component: BecomePartnerView,
    title: 'Become Partner',
    description: 'Apply to become a partner',
    requiresAuth: true,
    permissions: ['partner:write'],
    icon: '🤝',
    category: 'management'
  },
  competitions: {
    component: CompetitionsView,
    title: 'Competitions',
    description: 'Participate in AI competitions',
    requiresAuth: true,
    permissions: ['competitions:read'],
    icon: '🏆',
    category: 'main'
  }
} as const;


const dashboardUtils: DashboardContainerUtility = {
  
  getCurrentView: (): string => {
    
    return 'all';
  },

  
  isValidView: (viewName: string): boolean => {
    return viewName in DASHBOARD_VIEWS;
  },

  
  getViewMetadata: (viewName: string): DashboardView | null => {
    return DASHBOARD_VIEWS[viewName] || null;
  },

  
  getAllViews: (): DashboardViews => {
    return DASHBOARD_VIEWS;
  },

  
  getViewsByCategory: (category: DashboardView['category']): readonly string[] => {
    return Object.entries(DASHBOARD_VIEWS)
      .filter(([_, view]) => view.category === category)
      .map(([name]) => name);
  },

  
  navigateToView: (viewName: string): void => {
    
  },

  
  getAvailableViews: (): readonly string[] => {
    return Object.keys(DASHBOARD_VIEWS);
  }
};


const DashboardErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="dashboard-error-boundary">
      {children}
    </div>
  );
};


const DashboardLoading: React.FC = () => {
  return (
    <div className="dashboard-loading">
      <div className="loading-spinner">Loading...</div>
    </div>
  );
};


export function DashboardContainer({ 
  fallbackView = 'all', 
  enableErrorBoundary = true, 
  enableLoadingState = true 
}: DashboardContainerProps = {}) {
  const { view = fallbackView } = useParams();
  const navigate = useNavigate();

  
  const { ViewComponent, viewMetadata, isValidView } = useMemo(() => {
    const metadata = DASHBOARD_VIEWS[view as keyof typeof DASHBOARD_VIEWS];
    const isValid = !!metadata;
    const Component = metadata?.component || DASHBOARD_VIEWS[fallbackView].component;

    return {
      ViewComponent: Component,
      viewMetadata: metadata || DASHBOARD_VIEWS[fallbackView],
      isValidView: isValid
    };
  }, [view, fallbackView]);

  
  const handleViewNavigation = useCallback((viewName: string) => {
    if (dashboardUtils.isValidView(viewName)) {
      navigate(`/dashboard/${viewName}`);
    } else {
     
      navigate(`/dashboard/${fallbackView}`);
    }
  }, [navigate, fallbackView]);

  
  const enhancedDashboardUtils = useMemo(() => ({
    ...dashboardUtils,
    getCurrentView: () => view,
    navigateToView: handleViewNavigation
  }), [view, handleViewNavigation]);

  
  const containerState: DashboardContainerState = useMemo(() => ({
    currentView: view,
    isValidView,
    viewMetadata,
    availableViews: dashboardUtils.getAvailableViews()
  }), [view, isValidView, viewMetadata]);

  
  if (!isValidView && view !== fallbackView) {
    
    handleViewNavigation(fallbackView);
    return enableLoadingState ? <DashboardLoading /> : null;
  }

  
  const dashboardContent = (
    <DashboardLayout>
      <ViewComponent />
    </DashboardLayout>
  );

  return (
    <div className="dashboard-container" data-view={view} data-valid={isValidView}>
      {enableErrorBoundary ? (
        <DashboardErrorBoundary>
          {dashboardContent}
        </DashboardErrorBoundary>
      ) : (
        dashboardContent
      )}
    </div>
  );
}


export const VIEWS = Object.fromEntries(
  Object.entries(DASHBOARD_VIEWS).map(([key, view]) => [key, view.component])
);


export { 
  dashboardUtils, 
  DASHBOARD_VIEWS,
  DashboardErrorBoundary,
  DashboardLoading
};


export type { 
  DashboardView, 
  DashboardViews, 
  DashboardContainerProps, 
  DashboardContainerState, 
  DashboardContainerUtility 
};