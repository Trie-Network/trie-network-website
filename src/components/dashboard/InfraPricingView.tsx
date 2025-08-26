import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/ui';
import { getNetworkColor, getNetworkHoverColor } from '../../config/colors';


interface PricingFormData {
  pricingModel: string;
  price: string;
  currency: string;
  billingPeriod: string;
  customTerms: string;
  usageTerms: string[];
}

interface PricingOption {
  id: string;
  label: string;
  description: string;
}

interface UsageTerm {
  id: string;
  label: string;
  description: string;
}

interface InfraPricingViewProps {
  primaryColor?: string;
}

interface PricingModelSelectorProps {
  options: PricingOption[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

interface PriceInputProps {
  formData: PricingFormData;
  onFormDataChange: (updates: Partial<PricingFormData>) => void;
}

interface UsageTermsSelectorProps {
  terms: UsageTerm[];
  selectedTerms: string[];
  onTermToggle: (term: string) => void;
}

interface CustomTermsInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface ActionButtonsProps {
  onBack: () => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
}

interface BreadcrumbItem {
  label: string;
  href: string;
}


const STORAGE_KEY = 'user_uploads_infra';

const PRICING_OPTIONS: PricingOption[] = [
  { id: 'pay-per-use', label: 'Pay Per Use', description: 'Charge based on actual resource usage' },
  { id: 'subscription', label: 'Subscription', description: 'Monthly or annual access fee' },
  { id: 'reserved', label: 'Reserved Capacity', description: 'Pre-purchased compute capacity' }
];

const USAGE_TERMS: UsageTerm[] = [
  { id: 'gpu', label: 'GPU Access', description: 'Access to GPU resources' },
  { id: 'cpu', label: 'CPU Access', description: 'Access to CPU resources' },
  { id: 'memory', label: 'Memory Usage', description: 'Access to memory resources' },
  { id: 'storage', label: 'Storage', description: 'Access to storage resources' },
  { id: 'network', label: 'Network', description: 'Network bandwidth usage' }
];

const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: 'Choose Type', href: '/dashboard/upload' },
  { label: 'Details', href: '/dashboard/upload/infra' },
  { label: 'Pricing', href: '/dashboard/upload/infra/pricing' },
  { label: 'Review', href: '/dashboard/upload/infra/review' }
];

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP'];

const BILLING_PERIODS = [
  { value: 'hourly', label: 'Per Hour' },
  { value: 'daily', label: 'Per Day' },
  { value: 'monthly', label: 'Per Month' },
  { value: 'yearly', label: 'Per Year' }
];

const LAYOUT_CLASSES = {
  container: 'max-w-3xl mx-auto px-4 py-12',
  header: 'mb-8',
  title: 'text-3xl font-bold text-gray-900 mb-4',
  subtitle: 'text-lg text-gray-600',
  content: 'text-center mb-12',
  formContainer: 'bg-white rounded-xl border border-[#e1e3e5] p-8',
  formContent: 'space-y-8',
  section: 'space-y-4',
  sectionLabel: 'block text-lg font-medium text-gray-900 mb-4',
  optionGrid: 'grid gap-4',
  optionItem: 'relative flex items-center p-4 cursor-pointer rounded-lg border-2 transition-all duration-200',
  optionSelected: 'border-gray-200 hover:border-gray-300',
  optionContent: 'flex items-center h-5 pointer-events-none',
  optionRadio: 'h-4 w-4 border-gray-300',
  optionDetails: 'ml-4 pointer-events-none',
  optionTitle: 'text-sm font-medium text-gray-900',
  optionDescription: 'text-sm text-gray-500',
  inputLabel: 'block text-sm font-medium text-gray-700 mb-2',
  priceContainer: 'relative max-w-xs',
  priceInput: 'block w-full pl-6 pr-20 py-2.5 text-gray-900 border border-gray-300 rounded-l-lg focus:ring-2 hover:border-gray-400 transition-colors text-base font-medium bg-white shadow-sm',
  currencySelect: 'absolute right-0 h-full py-0 pl-3 pr-8 border-l border-gray-300 bg-white text-gray-600 font-medium text-sm rounded-r-lg focus:ring-2 hover:border-gray-400 transition-colors appearance-none',
  currencyIcon: 'absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none',
  billingContainer: 'relative max-w-xs mb-2',
  billingSelect: 'block w-full pl-3 pr-10 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 hover:border-gray-400 text-base font-medium appearance-none transition-colors',
  billingIcon: 'absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none',
  billingDescription: 'text-sm text-gray-600',
  termsContainer: 'space-y-4',
  termItem: 'relative flex items-start py-4 border-b border-gray-200 last:border-0',
  termContent: 'min-w-0 flex-1 text-sm',
  termLabel: 'font-medium text-gray-700 select-none',
  termDescription: 'text-gray-500',
  termCheckbox: 'ml-3 flex items-center h-5',
  checkbox: 'h-4 w-4 border-gray-300 rounded',
  textarea: 'block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 hover:border-gray-400 transition-all duration-200 resize-none text-base leading-relaxed shadow-sm',
  textareaHelp: 'mt-2 text-xs text-gray-500',
  actions: 'flex items-center justify-end gap-4',
  backButton: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50',
  submitButton: 'px-4 py-2 text-sm font-medium text-white rounded-lg',
  submitDisabled: 'opacity-50 cursor-not-allowed',
  submitEnabled: 'cursor-pointer'
} as const;

const INITIAL_FORM_DATA: PricingFormData = {
  pricingModel: '',
  price: '',
  currency: 'USD',
  billingPeriod: 'hourly',
  customTerms: '',
  usageTerms: []
};


const getBillingDescription = (pricingModel: string): string => {
  switch (pricingModel) {
    case 'pay-per-use':
      return 'Price per API call';
    case 'subscription':
      return 'Monthly subscription fee';
    case 'reserved':
      return 'One-time purchase price';
    default:
      return '';
  }
};

const getPricePlaceholder = (pricingModel: string): string => {
  return pricingModel === 'pay-per-use' ? '0.50' : '99.99';
};

const isFormValid = (formData: PricingFormData): boolean => {
  return !!(formData.pricingModel && formData.price && formData.usageTerms.length > 0);
};

const getOptionStyle = (isSelected: boolean): string => {
  return isSelected 
    ? 'border-blue-500 bg-blue-50'
    : LAYOUT_CLASSES.optionSelected;
};

const getFocusStyle = (element: HTMLElement): void => {
  element.style.borderColor = getNetworkColor();
  element.style.setProperty('--tw-ring-color', getNetworkColor());
};

const getBlurStyle = (element: HTMLElement): void => {
  element.style.borderColor = '#d1d5db';
};


const PricingModelSelector = ({ options, selectedModel, onModelChange }: PricingModelSelectorProps) => (
  <div>
    <label className={LAYOUT_CLASSES.sectionLabel}>
      Choose Pricing Model
    </label>
    <div className={LAYOUT_CLASSES.optionGrid}>
      {options.map((option) => (
        <div
          key={option.id}
          onClick={() => onModelChange(option.id)}
          className={`${LAYOUT_CLASSES.optionItem} ${getOptionStyle(selectedModel === option.id)}`}
        >
          <div className={LAYOUT_CLASSES.optionContent}>
            <input
              type="radio"
              name="pricingModel"
              checked={selectedModel === option.id}
              readOnly
              className={LAYOUT_CLASSES.optionRadio}
              style={{ color: getNetworkColor() }}
            />
          </div>
          <div className={LAYOUT_CLASSES.optionDetails}>
            <div className={LAYOUT_CLASSES.optionTitle}>
              {option.label}
            </div>
            <p className={LAYOUT_CLASSES.optionDescription}>{option.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PriceInput = ({ formData, onFormDataChange }: PriceInputProps) => (
  <div>
    <label className={LAYOUT_CLASSES.inputLabel}>
      Set Price
    </label>
    <div className={LAYOUT_CLASSES.priceContainer}>
      <div className="relative flex items-center">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          <span className="text-gray-600 sm:text-sm font-medium">$</span>
        </span>
        <input
          type="text"
          value={formData.price}
          onChange={(e) => onFormDataChange({ price: e.target.value })}
          className={LAYOUT_CLASSES.priceInput}
          style={{ '--tw-ring-color': getNetworkColor(), '--tw-border-opacity': 1 } as React.CSSProperties}
          onFocus={(e) => getFocusStyle(e.currentTarget)}
          onBlur={(e) => getBlurStyle(e.currentTarget)}
          placeholder={getPricePlaceholder(formData.pricingModel)}
        />
        <select
          name="currency"
          value={formData.currency}
          onChange={(e) => onFormDataChange({ currency: e.target.value })}
          className={LAYOUT_CLASSES.currencySelect}
          style={{ '--tw-ring-color': getNetworkColor(), '--tw-border-opacity': 1 } as React.CSSProperties}
          onFocus={(e) => getFocusStyle(e.currentTarget)}
          onBlur={(e) => getBlurStyle(e.currentTarget)}
        >
          {CURRENCY_OPTIONS.map(currency => (
            <option key={currency}>{currency}</option>
          ))}
        </select>
        <div className={LAYOUT_CLASSES.currencyIcon}>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
    <div className="mt-4">
      <label className={LAYOUT_CLASSES.inputLabel}>
        Billing Period
      </label>
      <div className={LAYOUT_CLASSES.billingContainer}>
        <select
          value={formData.billingPeriod}
          onChange={(e) => onFormDataChange({ billingPeriod: e.target.value })}
          className={LAYOUT_CLASSES.billingSelect}
          style={{ '--tw-ring-color': getNetworkColor(), '--tw-border-opacity': 1 } as React.CSSProperties}
          onFocus={(e) => getFocusStyle(e.currentTarget)}
          onBlur={(e) => getBlurStyle(e.currentTarget)}
        >
          {BILLING_PERIODS.map(period => (
            <option key={period.value} value={period.value}>{period.label}</option>
          ))}
        </select>
        <div className={LAYOUT_CLASSES.billingIcon}>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <p className={LAYOUT_CLASSES.billingDescription}>
        {getBillingDescription(formData.pricingModel)}
      </p>
    </div>
  </div>
);

const UsageTermsSelector = ({ terms, selectedTerms, onTermToggle }: UsageTermsSelectorProps) => (
  <div>
    <label className={LAYOUT_CLASSES.sectionLabel}>
      Usage Terms
    </label>
    <div className={LAYOUT_CLASSES.termsContainer}>
      {terms.map((term) => (
        <div
          key={term.id}
          className={LAYOUT_CLASSES.termItem}
        >
          <div className={LAYOUT_CLASSES.termContent}>
            <label className={LAYOUT_CLASSES.termLabel}>
              {term.label}
            </label>
            <p className={LAYOUT_CLASSES.termDescription}>{term.description}</p>
          </div>
          <div className={LAYOUT_CLASSES.termCheckbox}>
            <input
              type="checkbox"
              checked={selectedTerms.includes(term.id)}
              onChange={() => onTermToggle(term.id)}
              className={LAYOUT_CLASSES.checkbox}
              style={{ color: getNetworkColor(), '--tw-ring-color': getNetworkColor() } as React.CSSProperties}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CustomTermsInput = ({ value, onChange }: CustomTermsInputProps) => (
  <div>
    <label className={LAYOUT_CLASSES.inputLabel}>
      Custom Terms (Optional)
    </label>
    <textarea
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={LAYOUT_CLASSES.textarea}
      style={{ '--tw-ring-color': getNetworkColor(), '--tw-border-opacity': 1 } as React.CSSProperties}
      onFocus={(e) => getFocusStyle(e.currentTarget)}
      onBlur={(e) => getBlurStyle(e.currentTarget)}
      placeholder="Enter any additional terms or conditions..."
    />
    <p className={LAYOUT_CLASSES.textareaHelp}>
      These terms will be displayed to users alongside the standard terms
    </p>
  </div>
);

const ActionButtons = ({ onBack, onSubmit, isSubmitDisabled }: ActionButtonsProps) => (
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
      onClick={onSubmit}
      className={`${LAYOUT_CLASSES.submitButton} ${
        isSubmitDisabled ? LAYOUT_CLASSES.submitDisabled : LAYOUT_CLASSES.submitEnabled
      }`}
      style={{ backgroundColor: getNetworkColor() }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getNetworkHoverColor()}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = getNetworkColor()}
    >
      Next
    </button>
  </div>
);


export function InfraPricingView({ primaryColor }: InfraPricingViewProps = {}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PricingFormData>(INITIAL_FORM_DATA);

  const handlePricingModelChange = (model: string) => {
    setFormData(prev => ({ ...prev, pricingModel: model }));
  };

  const handleUsageTermToggle = (term: string) => {
    setFormData(prev => ({
      ...prev,
      usageTerms: prev.usageTerms.includes(term)
        ? prev.usageTerms.filter(t => t !== term)
        : [...prev.usageTerms, term]
    }));
  };

  const handleFormDataChange = (updates: Partial<PricingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = () => {

    
    localStorage.setItem(STORAGE_KEY, 'true');
    
   
    navigate('/dashboard/upload/infra/review');
  };

  const handleBack = () => {
    navigate('/dashboard/upload/infra');
  };

  return (
    <div className={LAYOUT_CLASSES.container}>
      <div className={LAYOUT_CLASSES.header}>
        <Breadcrumbs
          items={BREADCRUMB_ITEMS}
          currentStep={3}
          totalSteps={4}
        />
      </div>

      <div className={LAYOUT_CLASSES.content}>
        <h1 className={LAYOUT_CLASSES.title}>Set Pricing & Terms</h1>
        <p className={LAYOUT_CLASSES.subtitle}>Define how users can access and use your infrastructure</p>
      </div>

      <div className={LAYOUT_CLASSES.formContainer}>
        <div className={LAYOUT_CLASSES.formContent}>
          <PricingModelSelector
            options={PRICING_OPTIONS}
            selectedModel={formData.pricingModel}
            onModelChange={handlePricingModelChange}
          />

          {formData.pricingModel && (
            <PriceInput
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />
          )}

          <UsageTermsSelector
            terms={USAGE_TERMS}
            selectedTerms={formData.usageTerms}
            onTermToggle={handleUsageTermToggle}
          />

          <CustomTermsInput
            value={formData.customTerms}
            onChange={(value) => handleFormDataChange({ customTerms: value })}
          />

          <ActionButtons
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitDisabled={!isFormValid(formData)}
          />
        </div>
      </div>
    </div>
  );
}