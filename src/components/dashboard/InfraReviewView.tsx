import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/ui';
import confetti from 'canvas-confetti';
import { STORAGE_KEYS, storageUtils } from '@/constants/storage';


interface InfraReviewViewProps {
  primaryColor?: string;
}

interface InfraDetails {
  name: string;
  description: string;
  type: string;
  region: string;
  specs: {
    cpu: string;
    memory: string;
    storage: string;
    gpu: string;
  };
  pricing: {
    model: string;
    price: string;
    currency: string;
    billingPeriod: string;
  };
  terms: {
    usage: string[];
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
  infraDetails: InfraDetails;
}

interface SpecsSectionProps {
  specs: InfraDetails['specs'];
}

interface PricingSectionProps {
  pricing: InfraDetails['pricing'];
}

interface TermsSectionProps {
  terms: InfraDetails['terms'];
}

interface ActionButtonsProps {
  onBack: () => void;
  onPublish: () => void;
  isPublishing: boolean;
}

interface LoadingSpinnerProps {
  className?: string;
}




const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: 'Choose Type', href: '/dashboard/upload' },
  { label: 'Details', href: '/dashboard/upload/infra' },
  { label: 'Pricing', href: '/dashboard/upload/infra/pricing' },
  { label: 'Review', href: '/dashboard/upload/infra/review' }
];


const getDefaultInfraDetails = (): InfraDetails => ({
  name: '',
  description: '',
  type: '',
  region: '',
  specs: {
    cpu: '',
    memory: '',
    storage: '',
    gpu: ''
  },
  pricing: {
    model: 'pay-per-use',
    price: '0',
    currency: 'USD',
    billingPeriod: 'hourly'
  },
  terms: {
    usage: [],
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
  specsGrid: 'grid grid-cols-2 sm:grid-cols-4 gap-4',
  pricingGrid: 'grid grid-cols-2 gap-4',
  termsContainer: 'space-y-4',
  termsList: 'mt-2 space-y-2',
  termItem: 'flex items-center',
  checkIcon: 'w-5 h-5 text-green-500 mr-2',
  label: 'block text-sm font-medium text-gray-500',
  value: 'mt-1 text-sm text-gray-900',
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


const formatSpecKey = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').trim();
};

const formatPricingModel = (model: string): string => {
  return model.replace(/-/g, ' ');
};

const formatPrice = (pricing: InfraDetails['pricing']): string => {
  return `${pricing.currency} ${pricing.price}/${pricing.billingPeriod}`;
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const createInfraRecord = (infraDetails: InfraDetails) => {
  return {
    ...infraDetails,
    id: `infra-${Date.now()}`,
    createdAt: new Date().toISOString(),
    image: '/modelph.png',
    status: 'active'
  };
};

const saveToLocalStorage = (infraRecord: any) => {
      const existingInfra = storageUtils.getItem(STORAGE_KEYS.USER_INFRA, []);
      storageUtils.setItem(STORAGE_KEYS.USER_INFRA, [...existingInfra, infraRecord]);
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

const ReviewSection = ({ title, children }: ReviewSectionProps) => (
  <div className={LAYOUT_CLASSES.section}>
    <h2 className={LAYOUT_CLASSES.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const BasicInfoSection = ({ infraDetails }: BasicInfoSectionProps) => (
  <ReviewSection title="Basic Information">
    <div className={LAYOUT_CLASSES.infoContainer}>
      <div className={LAYOUT_CLASSES.infoGrid}>
        <div>
          <label className={LAYOUT_CLASSES.label}>Name</label>
          <p className={LAYOUT_CLASSES.value}>{infraDetails.name}</p>
        </div>
        <div>
          <label className={LAYOUT_CLASSES.label}>Type</label>
          <p className={LAYOUT_CLASSES.value}>{infraDetails.type}</p>
        </div>
      </div>
      <div>
        <label className={LAYOUT_CLASSES.label}>Description</label>
        <p className={LAYOUT_CLASSES.value}>{infraDetails.description}</p>
      </div>
      <div>
        <label className={LAYOUT_CLASSES.label}>Region</label>
        <p className={LAYOUT_CLASSES.value}>{infraDetails.region}</p>
      </div>
    </div>
  </ReviewSection>
);

const SpecsSection = ({ specs }: SpecsSectionProps) => (
  <ReviewSection title="Hardware Specifications">
    <div className={LAYOUT_CLASSES.infoContainer}>
      <div className={LAYOUT_CLASSES.specsGrid}>
        {Object.entries(specs).map(([key, value]) => (
          <div key={key}>
            <label className={`${LAYOUT_CLASSES.label} capitalize`}>
              {formatSpecKey(key)}
            </label>
            <p className={LAYOUT_CLASSES.value}>{value}</p>
          </div>
        ))}
      </div>
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

const TermsSection = ({ terms }: TermsSectionProps) => (
  <ReviewSection title="Usage Terms">
    <div className={LAYOUT_CLASSES.infoContainer}>
      <div className={LAYOUT_CLASSES.termsContainer}>
        <div>
          <label className={LAYOUT_CLASSES.label}>Included Resources</label>
          <div className={LAYOUT_CLASSES.termsList}>
            {terms.usage.map(term => (
              <div key={term} className={LAYOUT_CLASSES.termItem}>
                <svg className={LAYOUT_CLASSES.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className={`${LAYOUT_CLASSES.value} capitalize`}>
                  {term} access included
                </span>
              </div>
            ))}
          </div>
        </div>
        {terms.custom && (
          <div>
            <label className={LAYOUT_CLASSES.label}>Additional Terms</label>
            <p className={LAYOUT_CLASSES.value}>{terms.custom}</p>
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
        'Publish Infrastructure'
      )}
    </button>
  </div>
);


export function InfraReviewView({ primaryColor }: InfraReviewViewProps = {}) {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [infraDetails] = useState<InfraDetails>(getDefaultInfraDetails());

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      
      const newInfra = createInfraRecord(infraDetails);
      saveToLocalStorage(newInfra);

      
      await new Promise(resolve => setTimeout(resolve, PUBLISH_DELAY));

      
      triggerConfetti();

      
      setTimeout(() => {
        navigate('/dashboard/my-uploads');
      }, PUBLISH_DELAY);

    } catch (error) {
      
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/upload/infra/pricing');
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
        <h1 className={LAYOUT_CLASSES.title}>Review Infrastructure Service</h1>
        <p className={LAYOUT_CLASSES.subtitle}>Review all details before publishing to the marketplace</p>
      </div>

      <div className={LAYOUT_CLASSES.mainContainer}>
        <div className={LAYOUT_CLASSES.contentWrapper}>
          <BasicInfoSection infraDetails={infraDetails} />
          <SpecsSection specs={infraDetails.specs} />
          <PricingSection pricing={infraDetails.pricing} />
          <TermsSection terms={infraDetails.terms} />
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