
import React from 'react';
import { useTokenName } from '@/contexts/TokenNameContext';


interface ProviderRowProps {
  providerName: string;
  storage: string;
  memory: string;
  os: string;
  core: string;
  gpu: string;
  processor: string;
  region: string;
  hostingCost: number;
  isOpen?: boolean;
  isSelected: boolean;
  action?: string;
  providerDid?: string;
  onToggle?: () => void;
  onSelect: () => void;
  onSelectAction?: (args: { providerDid: string | undefined; hostingCost: number }) => void;
}

interface ProviderSpecificationProps {
  label: string;
  value: string | number;
  tokenName?: string;
  className?: string;
}

interface RadioButtonProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

interface ProviderNameProps {
  name: string;
  className?: string;
}

interface SpecificationsGridProps {
  specifications: Array<{ label: string; value: string | number; tokenName?: string }>;
  className?: string;
}


const PROVIDER_DETAILS_CLASSES = {
  tableRow: 'border-t border-gray-100 transition-colors hover:bg-gray-50',
  nameCell: 'pl-6 py-4 flex items-center gap-3',
  radioContainer: 'flex items-center h-5',
  radioButton: 'h-4 w-4 text-primary focus:ring-primary border-gray-300',
  providerName: 'font-medium text-gray-900',
  specificationsCell: '',
  specificationsGrid: 'grid grid-cols-4 gap-4 text-sm',
  specificationItem: '',
  specificationLabel: 'font-medium text-gray-500',
  specificationValue: 'ml-1 text-gray-900'
} as const;

const PROVIDER_DETAILS_DEFAULT_CONFIG = {
  defaultClassName: '',
  gridColumns: 4,
  transitionDuration: 'transition-colors'
} as const;

const PROVIDER_SPECIFICATIONS_CONFIG = {
  labels: {
    os: 'OS',
    processor: 'Processor',
    region: 'Region',
    storage: 'Storage',
    memory: 'Memory',
    gpu: 'GPU',
    core: 'Core',
    hostingCost: 'Hosting Cost'
  }
} as const;


const providerDetailsUtils = {
  
  formatHostingCost: (cost: number, tokenName: string): string => {
    return `${cost} ${tokenName.toUpperCase()}`;
  },


  createSpecifications: (
    os: string,
    processor: string,
    region: string,
    storage: string,
    memory: string,
    gpu: string,
    core: string,
    hostingCost: number,
    tokenName: string
  ): Array<{ label: string; value: string | number; tokenName?: string }> => {
    return [
      { label: PROVIDER_SPECIFICATIONS_CONFIG.labels.os, value: os },
      { label: PROVIDER_SPECIFICATIONS_CONFIG.labels.processor, value: processor },
      { label: PROVIDER_SPECIFICATIONS_CONFIG.labels.region, value: region },
      { label: PROVIDER_SPECIFICATIONS_CONFIG.labels.storage, value: storage },
      { label: PROVIDER_SPECIFICATIONS_CONFIG.labels.memory, value: memory },
      { label: PROVIDER_SPECIFICATIONS_CONFIG.labels.gpu, value: gpu },
      { label: PROVIDER_SPECIFICATIONS_CONFIG.labels.core, value: core },
      { label: PROVIDER_SPECIFICATIONS_CONFIG.labels.hostingCost, value: hostingCost, tokenName }
    ];
  },


  getTableRowClasses: (className: string): string => {
    return `${PROVIDER_DETAILS_CLASSES.tableRow} ${className}`.trim();
  },


  getNameCellClasses: (className: string): string => {
    return `${PROVIDER_DETAILS_CLASSES.nameCell} ${className}`.trim();
  },


  getRadioContainerClasses: (className: string): string => {
    return `${PROVIDER_DETAILS_CLASSES.radioContainer} ${className}`.trim();
  },


  getRadioButtonClasses: (className: string): string => {
    return `${PROVIDER_DETAILS_CLASSES.radioButton} ${className}`.trim();
  },


  getProviderNameClasses: (className: string): string => {
    return `${PROVIDER_DETAILS_CLASSES.providerName} ${className}`.trim();
  },


  getSpecificationsGridClasses: (className: string): string => {
    return `${PROVIDER_DETAILS_CLASSES.specificationsGrid} ${className}`.trim();
  },


  getSpecificationLabelClasses: (className: string): string => {
    return `${PROVIDER_DETAILS_CLASSES.specificationLabel} ${className}`.trim();
  },


  getSpecificationValueClasses: (className: string): string => {
    return `${PROVIDER_DETAILS_CLASSES.specificationValue} ${className}`.trim();
  },


  validateProps: (props: ProviderRowProps): boolean => {
    return (
      typeof props.providerName === 'string' && props.providerName.length > 0 &&
      typeof props.storage === 'string' && props.storage.length > 0 &&
      typeof props.memory === 'string' && props.memory.length > 0 &&
      typeof props.os === 'string' && props.os.length > 0 &&
      typeof props.core === 'string' && props.core.length > 0 &&
      typeof props.gpu === 'string' && props.gpu.length > 0 &&
      typeof props.processor === 'string' && props.processor.length > 0 &&
      typeof props.region === 'string' && props.region.length > 0 &&
      typeof props.hostingCost === 'number' && props.hostingCost >= 0 &&
      typeof props.isSelected === 'boolean' &&
      typeof props.onSelect === 'function' &&
      (props.isOpen === undefined || typeof props.isOpen === 'boolean') &&
      (props.action === undefined || typeof props.action === 'string') &&
      (props.providerDid === undefined || typeof props.providerDid === 'string') &&
      (props.onToggle === undefined || typeof props.onToggle === 'function') &&
      (props.onSelectAction === undefined || typeof props.onSelectAction === 'function')
    );
  },


  handleRowClick: (onSelect: () => void): void => {
    onSelect();
  },


  handleRadioChange: (onSelect: () => void): void => {
    onSelect();
  }
} as const;


const RadioButton: React.FC<RadioButtonProps> = ({ 
  checked, 
  onChange, 
  className = PROVIDER_DETAILS_DEFAULT_CONFIG.defaultClassName 
}) => (
  <input
    type="radio"
    checked={checked}
    onChange={onChange}
    className={providerDetailsUtils.getRadioButtonClasses(className)}
  />
);

const ProviderName: React.FC<ProviderNameProps> = ({ 
  name, 
  className = PROVIDER_DETAILS_DEFAULT_CONFIG.defaultClassName 
}) => (
  <span className={providerDetailsUtils.getProviderNameClasses(className)}>
    {name}
  </span>
);

const ProviderSpecification: React.FC<ProviderSpecificationProps> = ({ 
  label, 
  value, 
  tokenName, 
  className = PROVIDER_DETAILS_DEFAULT_CONFIG.defaultClassName 
}) => (
  <div className={className}>
    <span className={providerDetailsUtils.getSpecificationLabelClasses('')}>
      {label}:
    </span>
    <span className={providerDetailsUtils.getSpecificationValueClasses('')}>
      {tokenName && typeof value === 'number' 
        ? providerDetailsUtils.formatHostingCost(value, tokenName)
        : value
      }
    </span>
  </div>
);

const SpecificationsGrid: React.FC<SpecificationsGridProps> = ({ 
  specifications, 
  className = PROVIDER_DETAILS_DEFAULT_CONFIG.defaultClassName 
}) => (
  <div className={providerDetailsUtils.getSpecificationsGridClasses(className)}>
    {specifications.map((spec, index) => (
      <ProviderSpecification
        key={`${spec.label}-${index}`}
        label={spec.label}
        value={spec.value}
        tokenName={spec.tokenName}
      />
    ))}
  </div>
);



const ProviderDetails: React.FC<ProviderRowProps> = ({
  providerName,
  storage,
  memory,
  os,
  core,
  gpu,
  processor,
  region,
  hostingCost,
  isSelected,
  onSelect,
}) => {
  const tokenName = useTokenName();

  if (!providerDetailsUtils.validateProps({ 
    providerName, 
    storage, 
    memory, 
    os, 
    core, 
    gpu, 
    processor, 
    region, 
    hostingCost, 
    isSelected, 
    onSelect 
  })) {
   
    return null;
  }

  const specifications = providerDetailsUtils.createSpecifications(
    os,
    processor,
    region,
    storage,
    memory,
    gpu,
    core,
    hostingCost,
    tokenName
  );

  return (
    <tr
      className={providerDetailsUtils.getTableRowClasses('')}
      onClick={() => providerDetailsUtils.handleRowClick(onSelect)}
    >
      <td className={providerDetailsUtils.getNameCellClasses('')}>
        <div className={providerDetailsUtils.getRadioContainerClasses('')}>
          <RadioButton
            checked={isSelected}
            onChange={() => providerDetailsUtils.handleRadioChange(onSelect)}
          />
        </div>
        <ProviderName name={providerName} />
      </td>
      <td>
        <SpecificationsGrid specifications={specifications} />
      </td>
    </tr>
  );
};

export default ProviderDetails;

export type { 
  ProviderRowProps, 
  ProviderSpecificationProps, 
  RadioButtonProps, 
  ProviderNameProps, 
  SpecificationsGridProps 
};


export { 
  PROVIDER_DETAILS_CLASSES, 
  PROVIDER_DETAILS_DEFAULT_CONFIG, 
  PROVIDER_SPECIFICATIONS_CONFIG, 
  providerDetailsUtils 
};
