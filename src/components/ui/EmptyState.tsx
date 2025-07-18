import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  showBackToHome?: boolean;
}

export function EmptyState({ title, description, icon, action, showBackToHome = true }: EmptyStateProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (action?.href) {
      navigate(action.href);
    } else if (action?.onClick) {
      action.onClick();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d={icon || 'M6 18L18 6M6 6l12 12'}
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-sm mb-6">{description}</p>
      <div className="flex flex-col items-center gap-4">
        {action && !title.includes("No") && (
          <button
            onClick={handleAction}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {action.label}
          </button>
        )}
        {showBackToHome && (
          <button
            onClick={() => navigate('/dashboard/all')}
            className="text-sm text-primary hover:text-primary-hover font-medium"
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}