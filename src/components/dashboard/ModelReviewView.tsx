import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/ui';
import confetti from 'canvas-confetti';


interface ModelReviewViewProps {
  primaryColor?: string;
}

interface ModelDetails {
  name: string;
  description: string;
  mainCategory: string;
  category: string;
  tags: string[];
  metrics: {
    accuracy: string;
    precision: string;
    recall: string;
    f1Score: string;
  };
  files: string[];
  pricing: {
    model: string;
    price: string;
    currency: string;
  };
  license: {
    terms: string[];
    custom: string;
  };
}

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface ReviewSectionProps {
  title: string;
  children: React.ReactNode;
}

interface BasicInfoSectionProps {
  modelDetails: ModelDetails;
}

interface MetricsSectionProps {
  metrics: ModelDetails['metrics'];
}

interface FilesSectionProps {
  files: string[];
}

interface PricingSectionProps {
  pricing: ModelDetails['pricing'];
}

interface LicenseSectionProps {
  license: ModelDetails['license'];
}

interface ActionButtonsProps {
  onBack: () => void;
  onPublish: () => void;
  isPublishing: boolean;
}

interface LoadingSpinnerProps {
  className?: string;
}

interface TagProps {
  tag: string;
}


const STORAGE_KEY = 'user_models';

const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: 'Choose Type', href: '/dashboard/upload' },
  { label: 'Details', href: '/dashboard/upload/model' },
  { label: 'Pricing', href: '/dashboard/upload/model/pricing' },
  { label: 'Review', href: '/dashboard/upload/model/review' }
];


const getDefaultModelDetails = (): ModelDetails => ({
  name: '',
  description: '',
  mainCategory: '',
  category: '',
  tags: [],
  metrics: {
    accuracy: '0',
    precision: '0',
    recall: '0',
    f1Score: '0'
  },
  files: [],
  pricing: {
    model: 'pay-per-use',
    price: '0',
    currency: 'USD'
  },
  license: {
    terms: [],
    custom: ''
  }
});

const LAYOUT_CLASSES = {
  container: 'max-w-3xl mx-auto px-4 py-12',
  header: 'mb-8',
  content: 'text-center mb-12',
  title: 'text-3xl font-bold text-gray-900 mb-4',
  subtitle: 'text-lg text-gray-600',
  mainContainer: 'bg-white rounded-xl border border-[#e1e3e5] p-8',
  contentWrapper: 'space-y-8',
  section: 'space-y-4',
  sectionTitle: 'text-lg font-medium text-gray-900 mb-4',
  infoContainer: 'bg-gray-50 rounded-lg p-4',
  infoGrid: 'grid grid-cols-2 gap-4',
  metricsGrid: 'grid grid-cols-2 sm:grid-cols-4 gap-4',
  pricingGrid: 'grid grid-cols-2 gap-4',
  licenseContainer: 'space-y-4',
  tagsContainer: 'mt-1 flex flex-wrap gap-2',
  tag: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
  label: 'block text-sm font-medium text-gray-500',
  value: 'mt-1 text-sm text-gray-900',
  filesList: 'divide-y divide-gray-200',
  fileItem: 'py-3 flex items-center',
  fileIcon: 'w-5 h-5 text-gray-400 mr-3',
  licenseList: 'mt-2 space-y-2',
  licenseItem: 'flex items-center',
  checkIcon: 'w-5 h-5 text-green-500 mr-2',
  actions: 'flex items-center justify-end gap-4 pt-4 border-t border-gray-200',
  backButton: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50',
  publishButton: 'px-4 py-2 text-sm font-medium text-white bg-[#0284a5] rounded-lg hover:bg-[#026d8a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center',
  loadingSpinner: 'animate-spin -ml-1 mr-2 h-4 w-4 text-white'
} as const;

const CONFETTI_CONFIG = {
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
} as const;

const PUBLISH_DELAY = 2000;


const formatMetricKey = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').trim();
};

const formatPricingModel = (model: string): string => {
  return model.replace(/-/g, ' ');
};

const formatPrice = (pricing: ModelDetails['pricing']): string => {
  const basePrice = `${pricing.currency} ${pricing.price}`;
  return pricing.model === 'pay-per-use' ? `${basePrice} per call` : basePrice;
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const createModelRecord = (modelDetails: ModelDetails) => {
  return {
    ...modelDetails,
    id: `model-${Date.now()}`,
    createdAt: new Date().toISOString(),
    image: '/modelph.png',
    downloads: '0',
    likes: '0'
  };
};

const saveToLocalStorage = (modelRecord: any) => {
  const existingModels = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existingModels, modelRecord]));
};

const triggerConfetti = () => {
  confetti(CONFETTI_CONFIG);
};


const LoadingSpinner = ({ className = LAYOUT_CLASSES.loadingSpinner }: LoadingSpinnerProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const Tag = ({ tag }: TagProps) => (
  <span className={LAYOUT_CLASSES.tag}>
    {tag}
  </span>
);

const ReviewSection = ({ title, children }: ReviewSectionProps) => (
  <div className={LAYOUT_CLASSES.section}>
    <h2 className={LAYOUT_CLASSES.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const BasicInfoSection = ({ modelDetails }: BasicInfoSectionProps) => (
  <ReviewSection title="Basic Information">
    <div className={LAYOUT_CLASSES.infoContainer}>
      <div className={LAYOUT_CLASSES.infoGrid}>
        <div>
          <label className={LAYOUT_CLASSES.label}>Name</label>
          <p className={LAYOUT_CLASSES.value}>{modelDetails.name}</p>
        </div>
        <div>
          <label className={LAYOUT_CLASSES.label}>Category</label>
          <p className={LAYOUT_CLASSES.value}>{modelDetails.mainCategory}</p>
        </div>
      </div>
      <div>
        <label className={LAYOUT_CLASSES.label}>Description</label>
        <p className={LAYOUT_CLASSES.value}>{modelDetails.description}</p>
      </div>
      <div>
        <label className={LAYOUT_CLASSES.label}>Tags</label>
        <div className={LAYOUT_CLASSES.tagsContainer}>
          {modelDetails.tags.map(tag => (
            <Tag key={tag} tag={tag} />
          ))}
        </div>
      </div>
    </div>
  </ReviewSection>
);

const MetricsSection = ({ metrics }: MetricsSectionProps) => (
  <ReviewSection title="Performance Metrics">
    <div className={LAYOUT_CLASSES.infoContainer}>
      <div className={LAYOUT_CLASSES.metricsGrid}>
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key}>
            <label className={`${LAYOUT_CLASSES.label} capitalize`}>
              {formatMetricKey(key)}
            </label>
            <p className={LAYOUT_CLASSES.value}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  </ReviewSection>
);

const FilesSection = ({ files }: FilesSectionProps) => (
  <ReviewSection title="Model Files">
    <div className={LAYOUT_CLASSES.infoContainer}>
      <ul className={LAYOUT_CLASSES.filesList}>
        {files.map((file) => (
          <li key={file} className={LAYOUT_CLASSES.fileItem}>
            <svg className={LAYOUT_CLASSES.fileIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className={LAYOUT_CLASSES.value}>{file}</span>
          </li>
        ))}
      </ul>
    </div>
  </ReviewSection>
);

const PricingSection = ({ pricing }: PricingSectionProps) => (
  <ReviewSection title="Pricing">
    <div className={LAYOUT_CLASSES.infoContainer}>
      <div className={LAYOUT_CLASSES.pricingGrid}>
        <div>
          <label className={LAYOUT_CLASSES.label}>Model</label>
          <p className={`${LAYOUT_CLASSES.value} capitalize`}>
            {formatPricingModel(pricing.model)}
          </p>
        </div>
        <div>
          <label className={LAYOUT_CLASSES.label}>Price</label>
          <p className={LAYOUT_CLASSES.value}>
            {formatPrice(pricing)}
          </p>
        </div>
      </div>
    </div>
  </ReviewSection>
);

const LicenseSection = ({ license }: LicenseSectionProps) => (
  <ReviewSection title="License Terms">
    <div className={LAYOUT_CLASSES.infoContainer}>
      <div className={LAYOUT_CLASSES.licenseContainer}>
        <div>
          <label className={LAYOUT_CLASSES.label}>Included Rights</label>
          <div className={LAYOUT_CLASSES.licenseList}>
            {license.terms.map(term => (
              <div key={term} className={LAYOUT_CLASSES.licenseItem}>
                <svg className={LAYOUT_CLASSES.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className={`${LAYOUT_CLASSES.value} capitalize`}>
                  {term} use allowed
                </span>
              </div>
            ))}
          </div>
        </div>
        {license.custom && (
          <div>
            <label className={LAYOUT_CLASSES.label}>Additional Terms</label>
            <p className={LAYOUT_CLASSES.value}>{license.custom}</p>
          </div>
        )}
      </div>
    </div>
  </ReviewSection>
);

const ActionButtons = ({ onBack, onPublish, isPublishing }: ActionButtonsProps) => (
  <div className={LAYOUT_CLASSES.actions}>
    <button
      type="button"
      onClick={onBack}
      className={LAYOUT_CLASSES.backButton}
    >
      Back
    </button>
    <button
      type="button"
      onClick={onPublish}
      disabled={isPublishing}
      className={LAYOUT_CLASSES.publishButton}
    >
      {isPublishing ? (
        <>
          <LoadingSpinner />
          Publishing...
        </>
      ) : (
        'Publish Model'
      )}
    </button>
  </div>
);


export function ModelReviewView({ primaryColor }: ModelReviewViewProps = {}) {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [modelDetails] = useState<ModelDetails>(getDefaultModelDetails());

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      
      const newModel = createModelRecord(modelDetails);
      saveToLocalStorage(newModel);

      
      await new Promise(resolve => setTimeout(resolve, PUBLISH_DELAY));

      
      triggerConfetti();

      
      setTimeout(() => {
        navigate('/dashboard/models');
      }, PUBLISH_DELAY);

    } catch (error) {
        
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/upload/model/pricing');
  };

  return (
    <div className={LAYOUT_CLASSES.container}>
      <div className={LAYOUT_CLASSES.header}>
        <Breadcrumbs
          items={BREADCRUMB_ITEMS}
          currentStep={4}
          totalSteps={4}
        />
      </div>

      <div className={LAYOUT_CLASSES.content}>
        <h1 className={LAYOUT_CLASSES.title}>Review Your Model</h1>
        <p className={LAYOUT_CLASSES.subtitle}>Review all details before publishing to the marketplace</p>
      </div>

      <div className={LAYOUT_CLASSES.mainContainer}>
        <div className={LAYOUT_CLASSES.contentWrapper}>
          <BasicInfoSection modelDetails={modelDetails} />
          <MetricsSection metrics={modelDetails.metrics} />
          <FilesSection files={modelDetails.files} />
          <PricingSection pricing={modelDetails.pricing} />
          <LicenseSection license={modelDetails.license} />
          <ActionButtons
            onBack={handleBack}
            onPublish={handlePublish}
            isPublishing={isPublishing}
          />
        </div>
      </div>
    </div>
  );
}