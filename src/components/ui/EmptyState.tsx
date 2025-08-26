

import { useNavigate } from 'react-router-dom';
import { getNetworkColor, getNetworkHoverColor } from '../../config/colors';


interface ActionConfig {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: ActionConfig;
  showBackToHome?: boolean;
}

interface IconContainerProps {
  icon?: string;
}

interface ActionButtonProps {
  action: ActionConfig;
  title: string;
  onAction: () => void;
}

interface BackToHomeButtonProps {
  onNavigate: () => void;
}


const EMPTY_STATE_LAYOUT_CLASSES = {
  container: 'flex flex-col items-center justify-center h-full text-center px-4',
  iconContainer: 'w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6',
  icon: 'w-8 h-8 text-gray-400',
  title: 'text-xl font-semibold text-gray-900 mb-2',
  description: 'text-gray-600 max-w-sm mb-6',
  actionsContainer: 'flex flex-col items-center gap-4',
  actionButton: 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2',
  backButton: 'text-sm font-medium'
} as const;

const EMPTY_STATE_DEFAULT_CONFIG = {
  showBackToHome: true,
  defaultIcon: 'M6 18L18 6M6 6l12 12',
  homePath: '/dashboard/all'
} as const;

const EMPTY_STATE_ANIMATION_CONFIG = {
  transition: 'transition-colors duration-200 ease-in-out'
} as const;


const emptyStateUtils = {
  
  shouldShowAction: (title: string, action?: ActionConfig): boolean => {
    return Boolean(action && !title.includes("No"));
  },

  getNetworkColor: (): string => {
    return getNetworkColor();
  },

  
  getNetworkHoverColor: (): string => {
    return getNetworkHoverColor();
  },

  
  createActionButtonStyles: (): React.CSSProperties => {
    return {
      backgroundColor: getNetworkColor(),
      '--tw-ring-color': getNetworkColor()
    } as React.CSSProperties;
  },

  
  createBackButtonStyles: (): React.CSSProperties => {
    return {
      color: getNetworkColor()
    } as React.CSSProperties;
  },

  
  handleActionHover: (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean): void => {
    e.currentTarget.style.backgroundColor = isEnter ? getNetworkHoverColor() : getNetworkColor();
  },

  
  handleBackHover: (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean): void => {
    e.currentTarget.style.color = isEnter ? getNetworkHoverColor() : getNetworkColor();
  },

  
  validateProps: (props: EmptyStateProps): boolean => {
    return (
      typeof props.title === 'string' &&
      (props.description === undefined || typeof props.description === 'string') &&
      (props.icon === undefined || typeof props.icon === 'string') &&
      (props.action === undefined || (
        typeof props.action.label === 'string' &&
        (props.action.onClick === undefined || typeof props.action.onClick === 'function') &&
        (props.action.href === undefined || typeof props.action.href === 'string')
      )) &&
      (props.showBackToHome === undefined || typeof props.showBackToHome === 'boolean')
    );
  }
} as const;


const IconContainer: React.FC<IconContainerProps> = ({ icon }) => (
  <div className={EMPTY_STATE_LAYOUT_CLASSES.iconContainer}>
    <svg className={EMPTY_STATE_LAYOUT_CLASSES.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d={icon || EMPTY_STATE_DEFAULT_CONFIG.defaultIcon}
      />
    </svg>
  </div>
);

const ActionButton: React.FC<ActionButtonProps> = ({ action, title, onAction }) => {
  if (!emptyStateUtils.shouldShowAction(title, action)) {
    return null;
  }

  return (
    <button
      onClick={onAction}
      className={EMPTY_STATE_LAYOUT_CLASSES.actionButton}
      style={emptyStateUtils.createActionButtonStyles()}
      onMouseEnter={(e) => emptyStateUtils.handleActionHover(e, true)}
      onMouseLeave={(e) => emptyStateUtils.handleActionHover(e, false)}
    >
      {action.label}
    </button>
  );
};

const BackToHomeButton: React.FC<BackToHomeButtonProps> = ({ onNavigate }) => (
  <button
    onClick={onNavigate}
    className={EMPTY_STATE_LAYOUT_CLASSES.backButton}
    style={emptyStateUtils.createBackButtonStyles()}
    onMouseEnter={(e) => emptyStateUtils.handleBackHover(e, true)}
    onMouseLeave={(e) => emptyStateUtils.handleBackHover(e, false)}
  >
    Back to Home
  </button>
);


export function EmptyState({ 
  title, 
  description, 
  icon, 
  action, 
  showBackToHome = EMPTY_STATE_DEFAULT_CONFIG.showBackToHome 
}: EmptyStateProps) {
  const navigate = useNavigate();

  if (!emptyStateUtils.validateProps({ title, description, icon, action, showBackToHome })) {
   
    return null;
  }

  
  const handleAction = (): void => {
    if (action?.href) {
      navigate(action.href);
    } else if (action?.onClick) {
      action.onClick();
    }
  };

  
  const handleBackToHome = (): void => {
    navigate(EMPTY_STATE_DEFAULT_CONFIG.homePath);
  };

  return (
    <div className={EMPTY_STATE_LAYOUT_CLASSES.container}>
      <IconContainer icon={icon} />
      
      <h3 className={EMPTY_STATE_LAYOUT_CLASSES.title}>{title}</h3>
      
      {description && (
        <p className={EMPTY_STATE_LAYOUT_CLASSES.description}>{description}</p>
      )}
      
      <div className={EMPTY_STATE_LAYOUT_CLASSES.actionsContainer}>
        {action && (
          <ActionButton 
            action={action} 
            title={title} 
            onAction={handleAction} 
          />
        )}
        
        {showBackToHome && (
          <BackToHomeButton onNavigate={handleBackToHome} />
        )}
      </div>
    </div>
  );
}


export type { 
  EmptyStateProps,
  ActionConfig,
  IconContainerProps,
  ActionButtonProps,
  BackToHomeButtonProps
};


export { EMPTY_STATE_LAYOUT_CLASSES, EMPTY_STATE_DEFAULT_CONFIG, EMPTY_STATE_ANIMATION_CONFIG, emptyStateUtils };