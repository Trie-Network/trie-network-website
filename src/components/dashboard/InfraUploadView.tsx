import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNetworkColor, getNetworkHoverColor } from '../../config/colors';
import { Breadcrumbs } from '@/components/ui';


interface InfraUploadViewProps {
  primaryColor?: string;
}

interface FormData {
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
}

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: 'text' | 'textarea' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
}

interface SpecsFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder: string;
}

interface ActionButtonsProps {
  onCancel: () => void;
  onBack: () => void;
  onNext: () => void;
}


const STORAGE_KEY = 'user_uploads_infra';

const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: 'Choose Type', href: '/dashboard/upload' },
  { label: 'Details', href: '/dashboard/upload/infra' },
  { label: 'Pricing', href: '/dashboard/upload/infra/pricing' },
  { label: 'Review', href: '/dashboard/upload/infra/review' }
];

const INITIAL_FORM_DATA: FormData = {
  name: '',
  description: '',
  type: '',
  region: '',
  specs: {
    cpu: '',
    memory: '',
    storage: '',
    gpu: ''
  }
};

const INFRASTRUCTURE_TYPES = [
  { value: 'gpu', label: 'GPU Compute' },
  { value: 'cpu', label: 'CPU Compute' },
  { value: 'memory', label: 'Memory Optimized' },
  { value: 'storage', label: 'Storage Optimized' }
];

const REGIONS = [
  { value: 'us-east', label: 'US East (N. Virginia)' },
  { value: 'us-west', label: 'US West (Oregon)' },
  { value: 'eu-central', label: 'EU Central (Frankfurt)' },
  { value: 'ap-southeast', label: 'Asia Pacific (Singapore)' }
];

const LAYOUT_CLASSES = {
  container: 'max-w-3xl mx-auto px-4 py-12',
  header: 'mb-8',
  content: 'text-center mb-12',
  title: 'text-3xl font-bold text-gray-900 mb-4',
  subtitle: 'text-lg text-gray-600',
  mainContainer: 'bg-white rounded-xl border border-[#e1e3e5] p-8',
  contentWrapper: 'space-y-8',
  fieldContainer: 'space-y-4',
  field: 'space-y-2',
  label: 'block text-sm font-medium text-gray-700 mb-2',
  input: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent',
  textarea: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent',
  select: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent',
  specsSection: 'space-y-4',
  specsTitle: 'text-lg font-medium text-gray-900',
  specsGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  actions: 'flex items-center justify-end gap-4',
  cancelButton: 'px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors',
  backButton: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50',
  nextButton: 'px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
} as const;


const getFocusRingStyle = (): React.CSSProperties => {
  return { '--tw-ring-color': getNetworkColor() } as React.CSSProperties;
};

const getButtonStyle = (): React.CSSProperties => {
  return { backgroundColor: getNetworkColor() };
};

const getButtonHoverStyle = (): string => {
  return getNetworkHoverColor();
};

const handleNestedFieldChange = (
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  name: string,
  value: string
): void => {
  if (name.includes('.')) {
    const [parent, child] = name.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, string>),
        [child]: value
      }
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

const saveToLocalStorage = (): void => {
  localStorage.setItem(STORAGE_KEY, 'true');
};


const FormField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  options, 
  rows = 4 
}: FormFieldProps) => {
  const baseClasses = type === 'textarea' 
    ? LAYOUT_CLASSES.textarea 
    : type === 'select' 
    ? LAYOUT_CLASSES.select 
    : LAYOUT_CLASSES.input;

  return (
    <div className={LAYOUT_CLASSES.field}>
      <label className={LAYOUT_CLASSES.label}>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          className={baseClasses}
          style={getFocusRingStyle()}
          placeholder={placeholder}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={baseClasses}
          style={getFocusRingStyle()}
        >
          <option value="">Select a {label.toLowerCase()}</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={baseClasses}
          style={getFocusRingStyle()}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

const SpecsField = ({ label, name, value, onChange, placeholder }: SpecsFieldProps) => (
  <div>
    <label className={LAYOUT_CLASSES.label}>
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className={LAYOUT_CLASSES.input}
      style={getFocusRingStyle()}
      placeholder={placeholder}
    />
  </div>
);

const BasicInfoSection = ({ formData, onChange }: { formData: FormData; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void }) => (
  <div className={LAYOUT_CLASSES.fieldContainer}>
    <FormField
      label="Service Name"
      name="name"
      value={formData.name}
      onChange={onChange}
      placeholder="e.g., High-Performance GPU Cluster"
    />
    
    <FormField
      label="Description"
      name="description"
      value={formData.description}
      onChange={onChange}
      type="textarea"
      placeholder="Describe your infrastructure service and its capabilities..."
    />
    
    <FormField
      label="Infrastructure Type"
      name="type"
      value={formData.type}
      onChange={onChange}
      type="select"
      options={INFRASTRUCTURE_TYPES}
    />
    
    <FormField
      label="Region"
      name="region"
      value={formData.region}
      onChange={onChange}
      type="select"
      options={REGIONS}
    />
  </div>
);

const SpecsSection = ({ formData, onChange }: { formData: FormData; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void }) => (
  <div className={LAYOUT_CLASSES.specsSection}>
    <h3 className={LAYOUT_CLASSES.specsTitle}>Hardware Specifications</h3>
    
    <div className={LAYOUT_CLASSES.specsGrid}>
      <SpecsField
        label="CPU Cores"
        name="specs.cpu"
        value={formData.specs.cpu}
        onChange={onChange}
        placeholder="e.g., 32 cores"
      />
      
      <SpecsField
        label="Memory (RAM)"
        name="specs.memory"
        value={formData.specs.memory}
        onChange={onChange}
        placeholder="e.g., 128GB"
      />
      
      <SpecsField
        label="Storage"
        name="specs.storage"
        value={formData.specs.storage}
        onChange={onChange}
        placeholder="e.g., 2TB NVMe SSD"
      />
      
      <SpecsField
        label="GPU"
        name="specs.gpu"
        value={formData.specs.gpu}
        onChange={onChange}
        placeholder="e.g., 4x NVIDIA A100"
      />
    </div>
  </div>
);

const ActionButtons = ({ onCancel, onBack, onNext }: ActionButtonsProps) => (
  <div className={LAYOUT_CLASSES.actions}>
    <button
      type="button"
      onClick={onCancel}
      className={LAYOUT_CLASSES.cancelButton}
    >
      Cancel
    </button>
    <button
      type="button"
      onClick={onBack}
      className={LAYOUT_CLASSES.backButton}
    >
      Back
    </button>
    <button
      type="button"
      onClick={onNext}
      className={LAYOUT_CLASSES.nextButton}
      style={getButtonStyle()}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getButtonHoverStyle()}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = getNetworkColor()}
    >
      Next
    </button>
  </div>
);


export function InfraUploadView({ primaryColor }: InfraUploadViewProps = {}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleNestedFieldChange(formData, setFormData, name, value);
  };

  const handleCancel = () => {
    navigate('/dashboard/upload');
  };

  const handleBack = () => {
    navigate('/dashboard/upload');
  };

  const handleNext = () => {
    saveToLocalStorage();
    navigate('/dashboard/upload/infra/pricing');
  };

  return (
    <div className={LAYOUT_CLASSES.container}>
      <div className={LAYOUT_CLASSES.header}>
        <Breadcrumbs
          items={BREADCRUMB_ITEMS}
          showSteps={true}
          currentStep={2}
          totalSteps={4}
        />
      </div>

      <div className={LAYOUT_CLASSES.content}>
        <h1 className={LAYOUT_CLASSES.title}>Add Infrastructure Service</h1>
        <p className={LAYOUT_CLASSES.subtitle}>Provide computing resources for AI workloads</p>
      </div>

      <div className={LAYOUT_CLASSES.mainContainer}>
        <div className={LAYOUT_CLASSES.contentWrapper}>
          <BasicInfoSection formData={formData} onChange={handleChange} />
          <SpecsSection formData={formData} onChange={handleChange} />
          <ActionButtons
            onCancel={handleCancel}
            onBack={handleBack}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
}