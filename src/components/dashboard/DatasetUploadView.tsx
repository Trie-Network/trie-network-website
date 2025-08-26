import { useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { getNetworkColor } from '../../config/colors';
import { Breadcrumbs, Modal } from '@/components/ui';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks';
import { END_POINTS } from '@/api/requests';
import { Plus, X } from 'lucide-react';
import { InfraModal } from '../ui/infraModal';
import { CONSTANTS, TOKEN_NAME } from '@/config/network';
import { useNavigate } from 'react-router-dom';
import { useTokenName } from '@/contexts/TokenNameContext';
import { useLoader } from '@/contexts/LoaderContext';


interface FormData {
  name: string;
  description: string;
  category: string;
  format: string;
  license: string;
  url: string;
  providerid: string;
  pricing: {
    model: string;
    price: string;
    currency: string;
  };
  metadata: {
    dataPoints: string;
    coverage: string;
    source: string;
    size: string;
    rows: string;
    columns: string;
    schema: string;
  };
  files: File[];
}

interface DatasetUploadViewProps {
  primaryColor?: string;
  compId?: string;
}

interface StepNavigationProps {
  currentStep: Step;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  uploading: boolean;
  primaryColor: string;
}

interface DetailsStepProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  onSelectProvider: () => void;
  primaryColor: string;
}

interface MetadataStepProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  primaryColor: string;
}

interface PricingStepProps {
  formData: FormData;
  onPriceChange: (value: string) => void;
  tokenName: string;
  primaryColor: string;
}

interface ReviewStepProps {
  formData: FormData;
}

interface FileUploadAreaProps {
  formData: FormData;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  primaryColor: string;
}

interface SuccessModalProps {
  show: boolean;
  onClose: () => void;
  tokenName: string;
}

interface ProviderSelectionModalProps {
  show: boolean;
  onClose: () => void;
  onSelectProvider: (data: any) => void;
}

interface PublishAssetData {
  publish_asset: {
    asset_artifact?: string;
    asset_metadata?: string;
    asset_owner_did: string;
    asset_publish_description: string;
    asset_value: number;
    depin_provider_did: string;
    depin_hosting_cost: number;
    ft_denom: string;
    ft_denom_creator: string;
    asset_id?: string;
    asset_filename?: string;
  };
}


const STEPS = {
  DETAILS: 'details',
  METADATA: 'metadata',
  PRICING: 'pricing',
  REVIEW: 'review'
} as const;

type Step = typeof STEPS[keyof typeof STEPS];

const BREADCRUMB_ITEMS = [
  { label: 'Details' },
  { label: 'Metadata' },
  { label: 'Pricing' },
  { label: 'Review' }
];

const INITIAL_FORM_DATA: FormData = {
  name: '',
  description: '',
  category: '',
  format: '',
  license: '',
  url: '',
  providerid: '',
  pricing: {
    model: 'one-time',
    price: '',
    currency: 'USD'
  },
  metadata: {
    dataPoints: '',
    coverage: '',
    source: '',
    size: '',
    rows: '',
    columns: '',
    schema: ''
  },
  files: []
};

const LAYOUT_CLASSES = {
  container: 'max-w-3xl mx-auto px-4 py-12',
  breadcrumbContainer: 'mb-8',
  stepContainer: 'space-y-6',
  inputGroup: 'space-y-6',
  inputField: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-700',
  textareaField: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-700',
  label: 'block text-sm font-medium text-gray-700 mb-2',
  providerSection: 'flex my-2 items-center',
  providerLabel: 'block text-base font-semibold text-gray-900 me-3',
  selectButton: 'text-white flex bg-primary pe-2 py-1 text-sm font-medium rounded-md items-center justify-center',
  assetSection: 'my-4 mt-6',
  assetTitle: 'text-lg font-semibold text-gray-900 mt-4',
  fileUploadArea: 'mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer',
  fileUploadContent: 'space-y-1 text-center',
  fileUploadIcon: 'mx-auto h-12 w-12 text-gray-400',
  fileUploadText: 'flex text-sm text-gray-600',
  fileUploadLabel: 'relative cursor-pointer bg-white rounded-md font-medium focus-within:outline-none',
  fileUploadInput: 'sr-only',
  fileUploadDescription: 'text-xs text-gray-500',
  divider: 'text-gray-900 text-sm text-center mt-4',
  urlInput: 'flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900',
  pricingSection: 'space-y-6',
  pricingHeader: 'flex items-center justify-between mb-4',
  pricingTitle: 'text-lg font-semibold text-gray-900',
  pricingDescription: 'text-sm text-gray-600 mt-1',
  priceInputContainer: 'relative max-w-md',
  priceInputWrapper: 'relative flex items-center',
  priceInput: 'block w-full pl-6 pr-20 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none hover:border-gray-400 transition-colors text-base font-medium bg-white shadow-sm',
  tokenDisplay: 'text-gray-600 border border-gray-300 bg-gray-100 ms-2 rounded-lg p-2.5 font-medium text-sm focus:outline-none',
  equalsSign: 'text-gray-600 px-2 text-lg',
  convertedAmount: 'text-gray-600 border text-center border-gray-300 bg-white ms-2 rounded-lg p-2.5 font-medium text-sm focus:outline-none w-auto',
  reviewSection: 'space-y-6',
  reviewTitle: 'text-lg font-medium text-gray-900 mb-4',
  reviewContainer: 'bg-gray-50 p-4 rounded-lg',
  reviewList: 'space-y-4',
  reviewItem: '',
  reviewLabel: 'text-sm font-medium text-gray-500',
  reviewValue: 'mt-1 text-sm text-gray-900',
  actionsContainer: 'flex items-center justify-end gap-4 mt-8',
  cancelButton: 'px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors',
  backButton: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50',
  nextButton: 'px-4 py-2 text-sm font-medium text-white rounded-lg',
  loader: 'loader border-t-transparent border-solid border-2 border-white-500 rounded-full animate-spin w-6 h-6',
  modalOverlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
  modalContainer: 'bg-gray-800 rounded-lg p-6 max-w-md w-full relative',
  modalCloseButton: 'absolute top-4 right-4 text-gray-400 hover:text-white',
  modalContent: 'text-center mb-6',
  successIcon: 'w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4',
  successCheckmark: 'w-8 h-8 text-white',
  successTitle: 'text-white text-xl font-bold font-[\'IBM_Plex_Sans\']',
  successDescription: 'text-gray-300 mt-2 font-[\'IBM_Plex_Sans\']',
  modalButton: 'w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors font-[\'IBM_Plex_Sans\']',
  providerModalContainer: 'bg-white relative rounded-lg p-6 w-[70%] h-[90%] relative',
  providerModalCloseButton: 'absolute top-5 right-10 text-gray-400',
  providerModalContent: 'overflow-auto h-full p-5'
} as const;

const MODAL_TIMEOUT = 5000; 


const getFocusRingStyle = (primaryColor: string) => ({
  outline: 'none',
  borderColor: 'transparent',
  boxShadow: `0 0 0 2px ${primaryColor}33`
});

const getButtonStyle = (primaryColor: string) => ({
  backgroundColor: primaryColor
});

const getButtonHoverStyle = (primaryColor: string) => ({
  backgroundColor: `${primaryColor}dd`
});

const getTextStyle = (primaryColor: string) => ({
  color: primaryColor
});

const getTextHoverStyle = (primaryColor: string) => ({
  color: `${primaryColor}dd`
});

const getBorderHighlightStyle = (primaryColor: string) => ({
  borderColor: primaryColor
});

const getBgHighlightStyle = (primaryColor: string) => ({
  backgroundColor: `${primaryColor}11`,
  borderColor: primaryColor
});

const getFileUploadBorderClass = (isDragging: boolean, hasFiles: boolean, primaryColor: string) => {
  if (isDragging) return `border-[${primaryColor}] bg-[${primaryColor}]/5`;
  if (hasFiles) return 'border-green-300 bg-green-50';
  return 'border-gray-300 hover:border-gray-400';
};

const createMetadata = (formData: FormData, compId?: string) => {
  const metadata: any = {
    type: "dataset",
    name: formData.name,
    description: formData.description,
    price: formData.pricing.price,
    size: formData.metadata.size,
    rows: formData.metadata.rows,
    columns: formData.metadata.columns,
    depinProviderDid: formData?.providerid,
  };
  
  if (compId && compId?.length > 0) {
    metadata['compId'] = String(compId).trim();
  }
  
  return metadata;
};

const createPublishAssetData = (formData: FormData, connectedWallet: any, hostingCost: number): PublishAssetData => ({
  "publish_asset": {
    "asset_owner_did": connectedWallet?.did,
    "asset_publish_description": `Dataset published and owned by ${connectedWallet?.did}`,
    "asset_value": parseFloat(`${(parseFloat(formData?.pricing?.price) || 1) * 0.001}`),
    "depin_provider_did": formData?.providerid,
    "depin_hosting_cost": hostingCost || 1,
    "ft_denom": CONSTANTS.FT_DENOM,
    "ft_denom_creator": CONSTANTS.FT_DENOM_CREATOR
  }
});

const createExecuteData = (data: PublishAssetData, connectedWallet: any) => ({
  "comment": "string",
  "executorAddr": connectedWallet?.did,
  "quorumType": 2,
  "smartContractData": JSON.stringify(data),
  smartContractToken: CONSTANTS.CONTRACT_TOKEN
});

const validateFormData = (formData: FormData): boolean => {
  if (formData?.files?.length > 0 && formData?.url && formData?.url?.length > 0) {
    toast.error("Please provide either a file upload or a Hugging Face dataset URL, not both.");
    return false;
  }
  
  if (formData?.files?.length === 0 && !formData?.url) {
    toast.error("Please upload a file or provide a Hugging Face dataset URL.");
    return false;
  }
  
  return true;
};

const uploadFile = async (formData: FormData, selectProvider: any, setUploading: (value: boolean) => void, setUploadDatasetLoading: (value: boolean) => void) => {
  const formDatas = new FormData();
  const fname = `${parseInt(Date.now().toString())}_${formData.files[0]?.name}`;
  const renamedFile = new File([formData.files[0]], fname, { type: formData.files[0].type });
  
  formDatas.append('file', renamedFile);
  formDatas.append('assetName', fname);
  formDatas.append('assetType', 'dataset');
  
  setUploading(true);
  setUploadDatasetLoading(true);
  
  const result = await END_POINTS.upload_obj(selectProvider?.endpoints?.upload, formDatas);
  
  if (!result?.status) {
    toast.error("Error uploading files. Please try again.");
    setUploading(false);
    setUploadDatasetLoading(false);
    return null;
  }
  
  return { assetId: result?.data?.data?.assetId, fileName: fname };
};

const uploadUrl = async (formData: FormData, selectProvider: any, setUploading: (value: boolean) => void, setUploadDatasetLoading: (value: boolean) => void) => {
  const formDatas = new FormData();
  const hfUrl = String(formData?.url).trim();
  const fname = `${parseInt(Date.now().toString())}`;
  
  formDatas.append('assetName', fname);
  formDatas.append('assetType', 'dataset');
  formDatas.append('url', hfUrl);
  
  setUploading(true);
  setUploadDatasetLoading(true);
  
  const result = await END_POINTS.upload_obj(selectProvider?.endpoints?.upload, formDatas);
  
  if (!result?.status) {
    toast.error("Error uploading files. Please try again.");
    setUploading(false);
    setUploadDatasetLoading(false);
    return null;
  }
  
  return { 
    assetId: result?.data?.data?.assetId, 
    fileName: result?.data?.data?.fileName || fname 
  };
};


const FileUploadArea = ({ 
  formData, 
  onFileSelect, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  isDragging, 
  primaryColor 
}: FileUploadAreaProps) => (
  <div
    className={`${LAYOUT_CLASSES.fileUploadArea} ${getFileUploadBorderClass(isDragging, formData?.files?.length > 0, primaryColor)}`}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    style={isDragging ? getBgHighlightStyle(primaryColor) : {}}
  >
    <div className={LAYOUT_CLASSES.fileUploadContent}>
      <svg
        className={LAYOUT_CLASSES.fileUploadIcon}
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className={LAYOUT_CLASSES.fileUploadText}>
        <label
          htmlFor="file-upload"
          className={LAYOUT_CLASSES.fileUploadLabel}
          style={getTextStyle(primaryColor)}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, getTextHoverStyle(primaryColor))}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, getTextStyle(primaryColor))}
        >
          <span>{!formData?.files || formData?.files?.length == 0 ? 'Upload file' : formData?.files[0]?.name}</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className={LAYOUT_CLASSES.fileUploadInput}
            multiple
            onChange={onFileSelect}
          />
        </label>
        {formData?.files?.length == 0 ? <p className="pl-1">or drag and drop</p> : null}
      </div>
      {formData?.files?.length == 0 ? <p className={LAYOUT_CLASSES.fileUploadDescription}>Any file up to 10 Gb</p> : null}
    </div>
  </div>
);

const DetailsStep = ({ 
  formData, 
  onInputChange, 
  onFileSelect, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  isDragging, 
  onSelectProvider, 
  primaryColor 
}: DetailsStepProps) => (
  <div className={LAYOUT_CLASSES.stepContainer}>
    <div>
      <label className={LAYOUT_CLASSES.label}>Dataset Name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={onInputChange}
        className={LAYOUT_CLASSES.inputField}
        placeholder="e.g., Common Voice Dataset"
        onFocus={(e) => Object.assign(e.target.style, getFocusRingStyle(primaryColor))}
        onBlur={(e) => e.target.style.boxShadow = ''}
      />
    </div>

    <div>
      <label className={LAYOUT_CLASSES.label}>Description</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={onInputChange}
        rows={4}
        className={LAYOUT_CLASSES.textareaField}
        placeholder="Describe your dataset's contents and potential use cases..."
        onFocus={(e) => Object.assign(e.target.style, getFocusRingStyle(primaryColor))}
        onBlur={(e) => e.target.style.boxShadow = ''}
      />
    </div>

    <div>
      <div className={LAYOUT_CLASSES.providerSection}>
        <label className={LAYOUT_CLASSES.providerLabel}>
          Depin provider DID
          <span className="text-red-500 ml-1">*</span>
        </label>
        <button 
          onClick={onSelectProvider}
          className={LAYOUT_CLASSES.selectButton}
        >
          <Plus height={15} />Select
        </button>
      </div>
      <input
        disabled={true}
        name="providerid"
        value={formData.providerid}
        onChange={onInputChange}
        className={LAYOUT_CLASSES.inputField}
        placeholder="Add your provider DID"
        onFocus={(e) => Object.assign(e.target.style, getFocusRingStyle(primaryColor))}
        onBlur={(e) => e.target.style.boxShadow = ''}
      />
    </div>

    <div className={LAYOUT_CLASSES.assetSection}>
      <h3 className={LAYOUT_CLASSES.assetTitle}>Asset</h3>
      <div>
        <label className={LAYOUT_CLASSES.label}>File</label>
        <FileUploadArea
          formData={formData}
          onFileSelect={onFileSelect}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          isDragging={isDragging}
          primaryColor={primaryColor}
        />
      </div>
      <div className={LAYOUT_CLASSES.divider}>-- OR --</div>
      <div>
        <label className={LAYOUT_CLASSES.label}>Hugging Face Dataset Link</label>
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            name="url"
            value={formData?.url}
            onChange={onInputChange}
            className={LAYOUT_CLASSES.urlInput}
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            placeholder="e.g., https://huggingface.co/datasets/nvidia/OpenScience"
          />
        </div>
      </div>
    </div>
  </div>
);

const MetadataStep = ({ formData, onInputChange, primaryColor }: MetadataStepProps) => (
  <div className={LAYOUT_CLASSES.stepContainer}>
    <div>
      <label className={LAYOUT_CLASSES.label}>Dataset Size</label>
      <input
        type="text"
        name="metadata.size"
        value={formData.metadata.size}
        onChange={onInputChange}
        className={LAYOUT_CLASSES.inputField}
        placeholder="e.g., 1.2GB"
        onFocus={(e) => Object.assign(e.target.style, getFocusRingStyle(primaryColor))}
        onBlur={(e) => e.target.style.boxShadow = ''}
      />
    </div>

    <div>
      <label className={LAYOUT_CLASSES.label}>Number of Rows</label>
      <input
        type="text"
        name="metadata.rows"
        value={formData.metadata.rows}
        onChange={onInputChange}
        className={LAYOUT_CLASSES.inputField}
        placeholder="e.g., 1000000"
        onFocus={(e) => Object.assign(e.target.style, getFocusRingStyle(primaryColor))}
        onBlur={(e) => e.target.style.boxShadow = ''}
      />
    </div>

    <div>
      <label className={LAYOUT_CLASSES.label}>Number of Columns</label>
      <input
        type="text"
        name="metadata.columns"
        value={formData.metadata.columns}
        onChange={onInputChange}
        className={LAYOUT_CLASSES.inputField}
        placeholder="e.g., 15"
        onFocus={(e) => Object.assign(e.target.style, getFocusRingStyle(primaryColor))}
        onBlur={(e) => e.target.style.boxShadow = ''}
      />
    </div>
  </div>
);

const PricingStep = ({ formData, onPriceChange, tokenName, primaryColor }: PricingStepProps) => (
  <div className={LAYOUT_CLASSES.pricingSection}>
    <div>
      <div className={LAYOUT_CLASSES.pricingHeader}>
        <div>
          <h2 className={LAYOUT_CLASSES.pricingTitle}>One-time Purchase</h2>
          <p className={LAYOUT_CLASSES.pricingDescription}>Set a fixed price for dataset access</p>
        </div>
      </div>
    </div>

    <div>
      <label className={LAYOUT_CLASSES.label}>Price</label>
      <div className={LAYOUT_CLASSES.priceInputContainer}>
        <div className={LAYOUT_CLASSES.priceInputWrapper}>
          <input
            type="text"
            name="pricing.price"
            value={formData?.pricing?.price}
            onChange={(e) => {
              const value = e?.target?.value?.replace(/[^0-9.]/g, '');
              onPriceChange(value);
            }}
            className={LAYOUT_CLASSES.priceInput}
            placeholder="Enter amount"
          />
          <p className={LAYOUT_CLASSES.tokenDisplay}>{tokenName.toUpperCase()}</p>
          <p className={LAYOUT_CLASSES.equalsSign}>=</p>
          <p className={LAYOUT_CLASSES.convertedAmount}>
            {formData?.pricing?.price ? (parseFloat(formData?.pricing?.price) / 1000) : 0}
          </p>
          <p className={LAYOUT_CLASSES.tokenDisplay}>{tokenName.toUpperCase()}</p>
        </div>
      </div>
    </div>
  </div>
);

const ReviewStep = ({ formData }: ReviewStepProps) => (
  <div className={LAYOUT_CLASSES.reviewSection}>
    <div>
      <h3 className={LAYOUT_CLASSES.reviewTitle}>Review Details</h3>
      <div className={LAYOUT_CLASSES.reviewContainer}>
        <dl className={LAYOUT_CLASSES.reviewList}>
          <div>
            <dt className={LAYOUT_CLASSES.reviewLabel}>Name</dt>
            <dd className={LAYOUT_CLASSES.reviewValue}>{formData.name}</dd>
          </div>
          <div>
            <dt className={LAYOUT_CLASSES.reviewLabel}>Description</dt>
            <dd className={LAYOUT_CLASSES.reviewValue}>{formData.description}</dd>
          </div>
          <div>
            <dt className={LAYOUT_CLASSES.reviewLabel}>Files</dt>
            <dd className={LAYOUT_CLASSES.reviewValue}>
              {formData.files.map(file => file.name).join(', ')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
);

const StepNavigation = ({ 
  currentStep, 
  onNext, 
  onBack, 
  onCancel, 
  uploading, 
  primaryColor 
}: StepNavigationProps) => (
  <div className={LAYOUT_CLASSES.actionsContainer}>
    <button
      type="button"
      onClick={onCancel}
      className={LAYOUT_CLASSES.cancelButton}
    >
      Cancel
    </button>
    {currentStep !== STEPS.DETAILS && (
      <button
        type="button"
        onClick={onBack}
        className={LAYOUT_CLASSES.backButton}
      >
        Back
      </button>
    )}
    <button
      type="button"
      onClick={onNext}
      className={LAYOUT_CLASSES.nextButton}
      style={getButtonStyle(primaryColor)}
      onMouseOver={(e) => Object.assign(e.currentTarget.style, getButtonHoverStyle(primaryColor))}
      onMouseOut={(e) => Object.assign(e.currentTarget.style, getButtonStyle(primaryColor))}
    >
      {uploading ? (
        <div className="flex justify-center items-center">
          <div className={LAYOUT_CLASSES.loader}></div>
        </div>
      ) : (
        currentStep === STEPS.REVIEW ? 'Publish Dataset' : 'Next'
      )}
    </button>
  </div>
);

const SuccessModal = ({ show, onClose, tokenName }: SuccessModalProps) => (
  show && (
    <div className={LAYOUT_CLASSES.modalOverlay}>
      <div className={LAYOUT_CLASSES.modalContainer}>
        <button onClick={onClose} className={LAYOUT_CLASSES.modalCloseButton}>
          <X className="w-5 h-5" />
        </button>

        <div className={LAYOUT_CLASSES.modalContent}>
          <div className={LAYOUT_CLASSES.successIcon}>
            <svg className={LAYOUT_CLASSES.successCheckmark} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={LAYOUT_CLASSES.successTitle}>Success!</h3>
          <p className={LAYOUT_CLASSES.successDescription}>
            Transfer of {tokenName.toUpperCase()} tokens to Infra Provider is successful and the hosting of your Asset is in progress.
          </p>
        </div>

        <button onClick={onClose} className={LAYOUT_CLASSES.modalButton}>
          Close
        </button>
      </div>
    </div>
  )
);

const ProviderSelectionModal = ({ show, onClose, onSelectProvider }: ProviderSelectionModalProps) => (
  show && (
    <div className={LAYOUT_CLASSES.modalOverlay}>
      <div className={LAYOUT_CLASSES.providerModalContainer}>
        <button onClick={onClose} className={LAYOUT_CLASSES.providerModalCloseButton}>
          <X className="w-5 h-5" />
        </button>

        <div className={LAYOUT_CLASSES.providerModalContent}>
          <InfraModal onselectProvider={onSelectProvider} />
        </div>
      </div>
    </div>
  )
);


export function DatasetUploadView({ primaryColor = getNetworkColor(), compId }: DatasetUploadViewProps = {}) {
  const [currentStep, setCurrentStep] = useState<Step>(STEPS.DETAILS);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { connectedWallet, socketRef, setShowExtensionModal, refreshBalance } = useAuth();
  const { setUploadDatasetLoading, loaders } = useLoader();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectModal, setSelectModal] = useState<boolean>(false);
  const [hostingCost, setHostingCost] = useState<number>(1);
  const [selectProvider, setSelectProvider] = useState<any>(null);
  const navigate = useNavigate();
  const tokenName = useTokenName();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const fileInputRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    if (!loaders.uploadDataset && uploading) {
      setUploading(false);
      window.location.href = '/dashboard/assets';
    }
  }, [loaders.uploadDataset, uploading]);

  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showModal) {
      timer = setTimeout(() => {
        setShowModal(false);
        navigate('dashboard/assets');
      }, MODAL_TIMEOUT);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showModal, navigate]);

  const closeModal = () => {
    setShowModal(false);
    navigate('dashboard/assets');
  };

  const onSelectProvider = (data: any) => {
    setSelectModal(false);
    setFormData((prev: FormData) => ({
      ...prev,
      providerid: data?.providerDid
    }));
    setSelectProvider(data);
    setHostingCost(Number(data?.hostingCost));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFormData(prev => ({
        ...prev,
        files: Array.from(event.target.files || [])
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFormData(prev => ({
      ...prev,
      files: droppedFiles
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        return {
          ...prev,
          [parentKey]: {
            ...(prev as any)[parentKey],
            [childKey]: value
          }
        };
      } else {
        return {
          ...prev,
          [name]: value
        };
      }
    });
  };

  const handlePriceChange = (value: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      pricing: {
        ...prev?.pricing,
        price: value
      }
    }));
  };

  const handleUpload = useCallback(async () => {
    if (!connectedWallet?.did) {
      toast.error("Please connect your wallet.");
      return;
    }

    if (!validateFormData(formData)) {
      return;
    }

    try {
      const metadata = createMetadata(formData, compId);
      const metadataJSON = JSON.stringify(metadata, null);
      let asset_id, fname;

      if (formData?.files?.length > 0) {
        const uploadResult = await uploadFile(formData, selectProvider, setUploading, setUploadDatasetLoading);
        if (!uploadResult) return;
        asset_id = uploadResult.assetId;
        fname = uploadResult.fileName;
      } else if (formData?.url) {
        const uploadResult = await uploadUrl(formData, selectProvider, setUploading, setUploadDatasetLoading);
        if (!uploadResult) return;
        asset_id = uploadResult.assetId;
        fname = uploadResult.fileName;
      }

      const data = createPublishAssetData(formData, connectedWallet, hostingCost);
      data['publish_asset'] = {
        ...data['publish_asset'],
        'asset_id': asset_id,
        'asset_metadata': metadataJSON,
        "asset_filename": fname,
      };

      const executeData = createExecuteData(data, connectedWallet);

      if (!window.xell) {
        setShowExtensionModal(true);
        alert("Extension not detected. Please install the extension and refresh the page.");
        setUploading(false);
        setUploadDatasetLoading(false);
        return;
      }

      try {
        const result = await window.xell.executeContract(executeData);
        
        if (result?.status) {
          toast.success(result?.data?.message);
        } else {
          toast.error(result?.data?.message);
          setUploading(false);
          setUploadDatasetLoading(false);
        }
      } catch (error) {
        toast.error("Contract execution failed. Please try again.");
        setUploading(false);
        setUploadDatasetLoading(false);
      }
    } catch (error) {
      alert("Please refresh the page to use the extension features");
      setUploading(false);
    }
  }, [formData, connectedWallet, setUploadDatasetLoading, compId, selectProvider, hostingCost, setShowExtensionModal]);

  const handleNext = () => {
    switch (currentStep) {
      case STEPS.DETAILS:
        setCurrentStep(STEPS.METADATA);
        break;
      case STEPS.METADATA:
        setCurrentStep(STEPS.PRICING);
        break;
      case STEPS.PRICING:
        setCurrentStep(STEPS.REVIEW);
        break;
      case STEPS.REVIEW:
        handleUpload();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case STEPS.METADATA:
        setCurrentStep(STEPS.DETAILS);
        break;
      case STEPS.PRICING:
        setCurrentStep(STEPS.METADATA);
        break;
      case STEPS.REVIEW:
        setCurrentStep(STEPS.PRICING);
        break;
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(true);
  };

  const resetForm = () => {
    setCurrentStep(STEPS.DETAILS);
    setFormData(INITIAL_FORM_DATA);
  };

  return (
    <div className={LAYOUT_CLASSES.container}>
      <div className={LAYOUT_CLASSES.breadcrumbContainer}>
        <Breadcrumbs
          items={BREADCRUMB_ITEMS}
          showSteps={true}
          currentStep={Object.values(STEPS).indexOf(currentStep) + 1}
          totalSteps={Object.values(STEPS).length}
        />
      </div>

     
      {currentStep === STEPS.DETAILS && (
        <DetailsStep
          formData={formData}
          onInputChange={handleInputChange}
          onFileSelect={handleFileSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          isDragging={isDragging}
          onSelectProvider={() => setSelectModal(true)}
          primaryColor={primaryColor}
        />
      )}

      {currentStep === STEPS.METADATA && (
        <MetadataStep
          formData={formData}
          onInputChange={handleInputChange}
          primaryColor={primaryColor}
        />
      )}

      {currentStep === STEPS.PRICING && (
        <PricingStep
          formData={formData}
          onPriceChange={handlePriceChange}
          tokenName={tokenName}
          primaryColor={primaryColor}
        />
      )}

      {currentStep === STEPS.REVIEW && (
        <ReviewStep formData={formData} />
      )}

      <StepNavigation
        currentStep={currentStep}
        onNext={handleNext}
        onBack={handleBack}
        onCancel={handleCancel}
        uploading={uploading}
        primaryColor={primaryColor}
      />

      <Modal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Cancel"
      >
        <div className="p-6">
          <p className="text-gray-600">
            Are you sure you want to cancel? All progress will be lost.
          </p>
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              No, continue editing
            </button>
            <button
              onClick={() => {
                setShowConfirmModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Yes, cancel
            </button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        show={showModal}
        onClose={closeModal}
        tokenName={tokenName}
      />

      <ProviderSelectionModal
        show={selectModal}
        onClose={() => {
          setSelectModal(false);
          document.body.style.overflow = "auto";
        }}
        onSelectProvider={onSelectProvider}
      />
    </div>
  );
}
