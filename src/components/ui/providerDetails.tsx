
import React from 'react';

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
  isOpen: boolean;
  isSelected: boolean;
  action?: string;
  providerDid?: string;
  onToggle: () => void;
  onSelect: () => void;
  onSelectAction?: (args: { providerDid: string | undefined; hostingCost: number }) => void;
}

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
  return (
    <>
      <tr
        className="border-t border-gray-100 transition-colors hover:bg-gray-50"
        onClick={onSelect}
      >
        <td className="pl-6 py-4 flex items-center gap-3">
          <div className="flex items-center h-5">
            <input
              type="radio"
              checked={isSelected}
              onChange={onSelect}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
          </div>
          <span className="font-medium text-gray-900">{providerName}</span>
        </td>
        <td>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">OS:</span>
              <span className="ml-1 text-gray-900">{os}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Processor:</span>
              <span className="ml-1 text-gray-900">{processor}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Region:</span>
              <span className="ml-1 text-gray-900">{region}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Storage:</span>
              <span className="ml-1 text-gray-900">{storage}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Memory:</span>
              <span className="ml-1 text-gray-900">{memory}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">GPU:</span>
              <span className="ml-1 text-gray-900">{gpu}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Core:</span>
              <span className="ml-1 text-gray-900">{core}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Hosting Cost:</span>
              <span className="ml-1 text-gray-900">{hostingCost} TRIE</span>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
};

export default ProviderDetails;
