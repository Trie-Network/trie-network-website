import { useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { Breadcrumbs, Modal } from '@/components/ui';
import toast from 'react-hot-toast';
import { useAuth , useColors } from '@/hooks';
import { END_POINTS } from '@/api/requests';
import { Plus, X } from 'lucide-react';
import { InfraModal } from '../ui/infraModal';
import { CONSTANTS , componentStyles } from '@/utils';
import { useNavigate } from 'react-router-dom';


const STEPS = {
  DETAILS: 'details',
  METADATA: 'metadata',
  PRICING: 'pricing',
  REVIEW: 'review'
} as const;

type Step = typeof STEPS[keyof typeof STEPS];

interface DatasetUploadViewProps {
  primaryColor?: string;
  compId?: string;
}

export function DatasetUploadView({ primaryColor = '#0284a5', compId }: DatasetUploadViewProps = {}) {
  const [currentStep, setCurrentStep] = useState<Step>(STEPS.DETAILS);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { connectedWallet, socketRef, setShowExtensionModal, refreshBalance } = useAuth()
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectModal, setSelectModal] = useState<boolean>(false)
  const [hostingCost, setHostingCost] = useState<number>(1)
  const [selectProvider, setSelectProvider] = useState<any>(null);

  const [formData, setFormData] = useState({
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
    files: [] as File[]
  });

  const focusRingStyle = {
    outline: 'none',
    borderColor: 'transparent',
    boxShadow: `0 0 0 2px ${primaryColor}33`
  };

  const buttonStyle = {
    backgroundColor: primaryColor
  };

  const buttonHoverStyle = {
    backgroundColor: `${primaryColor}dd`
  };

  const textStyle = {
    color: primaryColor
  };

  const textHoverStyle = {
    color: `${primaryColor}dd`
  };

  const borderHighlightStyle = {
    borderColor: primaryColor
  };

  const bgHighlightStyle = {
    backgroundColor: `${primaryColor}11`,
    borderColor: primaryColor
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const messageHandlerRef = useRef<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showModal) {
      timer = setTimeout(() => {
        setShowModal(false);
        navigate('dashboard/assets')
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showModal]);

  const closeModal = () => {
    setShowModal(false);
    navigate('dashboard/assets')
  };

  const onSelectProvider = (data: any) => {
    setSelectModal(false)
    setFormData((prev: any) => ({
      ...prev,
      providerid: data?.providerDid

    }))
    setSelectProvider(data)
    setHostingCost(Number(data?.hostingCost))
  }
  
  useEffect(() => {
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
        messageHandlerRef.current = null;
      }
    };
  }, []);

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


  const handleUpload = useCallback(async () => {
    if (!connectedWallet?.did) {
      toast.error("Please connect your wallet.")
      return
    }
    try {
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
        messageHandlerRef.current = null;
      }

      const messageHandler = (event: any) => {


        const result = event.data.data;
        if (!result?.status) {
          if (result?.message) {
            toast.error(result?.message);
          }
          return
        }
        toast.success(result?.message);
        if (event?.data?.type == "CONTRACT_RESULT" && result?.step == "EXECUTE" && result?.status) {
          setUploading(true)
          return
        }
        else if (event?.data?.type == "NFT_RESULT" && result?.status && result?.step == "SIGNATURE") {
          let message = {
            resut: null,
            message: event.data.data?.message,
            status: true,
          }
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
            console.log('Message sent:', message);
            return true;
          } else {
            console.error('WebSocket is not connected. Message not sent.');
            return false;
          }
        }
        else if (event?.data?.type == "FT_RESULT" && result?.status && result?.step == "SIGNATURE") {
          let message = {
            resut: null,
            message: event.data.data?.message,
            status: true,
          }
          setUploading(false)
          refreshBalance()
          setShowModal(true)
          setFormData({
            name: '',
            description: '',
            category: '',
            format: '',
            license: '',
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
            url: '',
            files: []
          })
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
            console.log('Message sent:', message);
            return true;
          } else {
            console.error('WebSocket is not connected. Message not sent.');
            return false;
          }
        }

      };

      messageHandlerRef.current = messageHandler;

      
      window.addEventListener('message', messageHandler);
      let metadata = {
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
        }
      }
      let data: PublishAssetData = {
        "publish_asset": {
          "asset_owner_did": connectedWallet?.did,
          "asset_publish_description": `Dataset published and owned by ${connectedWallet?.did}`,
          "asset_value": parseFloat(`${(parseFloat(formData?.pricing?.price) || 1) * 0.001}`),
          "depin_provider_did": formData?.providerid,
          "depin_hosting_cost": hostingCost || 1,
          "ft_denom": CONSTANTS.FT_DENOM,
          "ft_denom_creator": CONSTANTS.FT_DENOM_CREATOR
        }
      }

      const metadataJSON = JSON.stringify(metadata, null);


      let asset_id, fname;

      if (formData?.files?.length > 0) {
        const formDatas = new FormData();
        if (formData?.url && formData?.url?.length > 0) {
          toast.error("Please provide either a file upload or a Hugging Face model URL, not both.");
          return;
        }

        fname = `${parseInt(Date.now().toString())}_${formData.files[0]?.name}`;
        const renamedFile = new File([formData.files[0]], fname, { type: formData.files[0].type });
        formDatas.append('file', renamedFile);

        formDatas.append('assetName', fname);
        formDatas.append('assetType', 'dataset');
        setUploading(true)

        const r1 = await END_POINTS.upload_obj(selectProvider?.endpoints?.upload, formDatas)
        if (!r1?.status) {
          toast.error("Error uploading files. Please try again.");
          setUploading(false);
          return;
        }
        asset_id = r1?.data?.data?.assetId;
      } else if (formData?.url) {
        let hfUrl = String(formData?.url).trim();
        const formDatas = new FormData();
        fname = `${parseInt(Date.now().toString())}`;
        formDatas.append('assetName', fname);
        formDatas.append('assetType', 'dataset');
        formDatas.append('url', hfUrl);
        setUploading(true)
        const r1 = await END_POINTS.upload_obj(selectProvider?.endpoints?.upload, formDatas)
        if (!r1?.status) {
          toast.error("Error uploading files. Please try again.");
          setUploading(false);
          return;
        }
        asset_id = r1?.data?.data?.assetId;
        fname = r1?.data?.data?.fileName || fname;
      } else {
        toast.error("Please upload a file or provide a Hugging Face model URL.");
        setUploading(false);
        return;
      }



      data['publish_asset'] = {
        ...data['publish_asset'],
        'asset_id': asset_id,
        'asset_metadata': metadataJSON,
        "asset_filename": fname,
      }

      const executeData = {
        "comment": "string",
        "executorAddr": connectedWallet?.did,
        "quorumType": 2,
        "smartContractData": JSON.stringify(data),
        smartContractToken: CONSTANTS.CONTRACT_TOKEN
      }

      if (window.myExtension) {
        try {
          window.myExtension.trigger({
            type: "INITIATE_CONTRACT",
            data: executeData
          });
        } catch (error) {
          console.error("Extension error:", error);
          alert("Please refresh the page to use the extension features");
        }
      } else {
        setShowExtensionModal(true)
        alert("Extension not detected.Please install the extension and refresh the page.");
        console.warn("Extension not detected. Please install the extension and refresh the page.");
      }

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      
    }
  }, [formData, connectedWallet]);

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
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { label: 'Details' },
            { label: 'Metadata' },
            { label: 'Pricing' },
            { label: 'Review' }
          ]}
          showSteps={true}
          currentStep={Object.values(STEPS).indexOf(currentStep) + 1}
          totalSteps={Object.values(STEPS).length}
        />
      </div>

      {currentStep === STEPS.DETAILS && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dataset Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-700"
              placeholder="e.g., Common Voice Dataset"
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-700"
              placeholder="Describe your dataset's contents and potential use cases..."
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />
          </div>
          <div>
            <div className='flex my-2 items-center '>
              <label className="block text-base font-semibold text-gray-900  me-3">
                Depin provider DID
                <span className="text-red-500 ml-1">*</span>
              </label>
              <button onClick={() => {
                setSelectModal(true)

              }}
                className='text-white flex bg-primary pe-2 py-1 text-sm font-medium rounded-md items-center justify-center'> <Plus height={15} />Select </button>
            </div>
            <input
              disabled={true}
              name="providerid"
              value={formData.providerid}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-700"
              placeholder="Add your provider DID"
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />
          </div>

          <div className='my-4 mt-6'>
            <h3 className="text-lg font-semibold text-gray-900 mt-4">Asset</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File
              </label>
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${isDragging
                  ? 'border-primary bg-primary/5'
                  : formData?.files?.length > 0
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={isDragging ? bgHighlightStyle : {}}
              >
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
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
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium focus-within:outline-none"
                      style={textStyle}
                      onMouseOver={(e) => Object.assign(e.currentTarget.style, textHoverStyle)}
                      onMouseOut={(e) => Object.assign(e.currentTarget.style, textStyle)}
                    >
                      <span>{!formData?.files || formData?.files?.length == 0 ? 'Upload file' : formData?.files[0]?.name}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileSelect}
                      />
                    </label>
                    {formData?.files?.length == 0 ? <p className="pl-1">or drag and drop</p> : null}
                  </div>
                  {formData?.files?.length == 0 ? <p className="text-xs text-gray-500">Any file up to 10 Gb</p> : null}
                </div>
              </div>
            </div>
            <div className='text-gray-900 text-sm text-center mt-4'> -- OR -- </div>
            <div className=''>
              <label className="block text-sm mt-4 font-medium text-gray-700 mb-2">
                Hugging Face Dataset Link
              </label>
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  name="url"
                  value={formData?.url}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                  placeholder="e.g., https://huggingface.co/datasets/nvidia/OpenScience"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === STEPS.METADATA && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dataset Size
            </label>
            <input
              type="text"
              name="metadata.size"
              value={formData.metadata.size}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-700"
              placeholder="e.g., 1.2GB"
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Rows
            </label>
            <input
              type="text"
              name="metadata.rows"
              value={formData.metadata.rows}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-700"
              placeholder="e.g., 1000000"
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Columns
            </label>
            <input
              type="text"
              name="metadata.columns"
              value={formData.metadata.columns}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-700"
              placeholder="e.g., 15"
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />
          </div>
        </div>
      )}

      {currentStep === STEPS.PRICING && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">One-time Purchase</h2>
                <p className="text-sm text-gray-600 mt-1">Set a fixed price for dataset access</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <div className="relative max-w-md">
              <div className="relative flex items-center">
                <input
                  type="text"
                  name="pricing.price"
                  value={formData?.pricing?.price}
                  onChange={(e) => {
                    const value = e?.target?.value?.replace(/[^0-9.]/g, '');
                    setFormData((prev: any) => ({
                      ...prev,
                      pricing: {
                        ...prev?.pricing,
                        price: value
                      }
                    }));
                  }}
                  className="block w-full pl-6 pr-20 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none hover:border-gray-400 transition-colors text-base font-medium bg-white shadow-sm"
                  placeholder="Enter amount"
                />
                <p className='text-gray-600 border border-gray-300 bg-gray-100 ms-2  rounded-lg  p-2.5 font-medium text-sm focus:outline-none '>TRIE</p>
                <p className='text-gray-600 px-2 text-lg'>=</p>
                <p className='text-gray-600 border text-center border-gray-300  bg-white ms-2  rounded-lg  p-2.5 font-medium text-sm focus:outline-none w-auto'>{formData?.pricing?.price ? (parseFloat(formData?.pricing?.price) / 1000) : 0}</p>
                <p className='text-gray-600 border border-gray-300 bg-gray-100 ms-2  rounded-lg  p-2.5 font-medium text-sm focus:outline-none '>RBT</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === STEPS.REVIEW && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Files</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formData.files.map(file => file.name).join(', ')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
        {currentStep !== STEPS.DETAILS && (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg"
          style={buttonStyle}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
        >
          {uploading ? <div className="flex justify-center items-center ">
            <div className="loader border-t-transparent border-solid border-2 border-white-500 rounded-full animate-spin w-6 h-6"></div>
          </div> :
            currentStep === STEPS.REVIEW ? 'Publish Dataset' : 'Next'}
        </button>
      </div>

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
                setCurrentStep(STEPS.DETAILS);
                setFormData({
                  name: '',
                  description: '',
                  category: '',
                  format: '',
                  license: '',
                  pricing: {
                    model: '',
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
                  url: '',
                  providerid: '',
                  files: []
                });
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Yes, cancel
            </button>
          </div>
        </div>
      </Modal>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-bold font-['IBM_Plex_Sans']">Success!</h3>
              <p className="text-gray-300 mt-2 font-['IBM_Plex_Sans']">
                Transfer of TRIE tokens to Infra Provider is successful and the hosting of your Asset is in progress.
              </p>
            </div>

            <button
              onClick={closeModal}
              className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors font-['IBM_Plex_Sans']"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {selectModal && (
        <div className="fixed  inset-0 bg-black  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white relative rounded-lg p-6 w-[70%] h-[90%] relative">
            <button
              onClick={() => {
                setSelectModal(false)
                document.body.style.overflow = "auto"
              }}
              className="absolute top-5 right-10 text-gray-400 "
            >
              <X className="w-5 h-5" />
            </button>

            <div className='overflow-auto  h-full p-5'>
              <InfraModal onselectProvider={onSelectProvider} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
