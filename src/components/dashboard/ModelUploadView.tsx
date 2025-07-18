import { useEffect, useState } from 'react';
import { useCallback, useRef } from 'react';
import { Breadcrumbs } from '@/components/ui';
import toast from 'react-hot-toast';
import { useAuth , useColors } from '@/hooks';
import { END_POINTS } from '@/api/requests';
import { Plus, X } from 'lucide-react';
import { InfraModal } from '../ui/infraModal';
import { CONSTANTS , componentStyles } from '@/utils';
import { useNavigate } from 'react-router-dom';

const STEPS = {
  DETAILS: 'details',
  PRICING: 'pricing',
  REVIEW: 'review'
} as const;

type Step = typeof STEPS[keyof typeof STEPS];

const TASK_CATEGORIES = {
  'Multimodal': [
    'Audio-Text-to-Text',
    'Image-Text-to-Text',
    'Visual Question Answering',
    'Document Question Answering',
    'Video-Text-to-Text',
    'Visual Document Retrieval',
    'Any-to-Any'
  ],
  'Computer Vision': [
    'Depth Estimation',
    'Image Classification',
    'Object Detection',
    'Image Segmentation',
    'Text-to-Image',
    'Image-to-Text',
    'Image-to-Image',
    'Image-to-Video',
    'Unconditional Image Generation',
    'Video Classification',
    'Text-to-Video',
    'Zero-Shot Image Classification',
    'Mask Generation',
    'Zero-Shot Object Detection',
    'Text-to-3D',
    'Image-to-3D',
    'Image Feature Extraction',
    'Keypoint Detection'
  ],
  'Natural Language Processing': [
    'Text Classification',
    'Token Classification',
    'Table Question Answering',
    'Question Answering',
    'Zero-Shot Classification',
    'Translation',
    'Summarization',
    'Feature Extraction',
    'Text Generation',
    'Text2Text Generation',
    'Fill-Mask',
    'Sentence Similarity'
  ],
  'Audio': [
    'Text-to-Speech',
    'Text-to-Audio',
    'Automatic Speech Recognition',
    'Audio-to-Audio',
    'Audio Classification',
    'Voice Activity Detection'
  ],
  'Tabular': [
    'Tabular Classification',
    'Tabular Regression',
    'Time Series Forecasting'
  ],
  'Reinforcement Learning': [
    'Reinforcement Learning',
    'Robotics'
  ],
  'Other': [
    'Graph Machine Learning'
  ]
};




interface ModelUploadViewProps {
  primaryColor?: string;
  compId?: string;
}

export function ModelUploadView({ primaryColor = '#0284a5', compId }: ModelUploadViewProps = {}) {
  const [currentStep, setCurrentStep] = useState<Step>(STEPS.DETAILS);
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    providerid: '',
    mainCategory: '',
    metrics: {
      accuracy: '',
      precision: '',
      recall: '',
      f1Score: ''
    },
    category: '',
    files: [] as File[],
    pricing: {
      price: '',
      model: '',
      currency: ''
    }
  });
  const [uploading, setUploading] = useState(false);
  const messageHandlerRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { connectedWallet, socketRef, setShowExtensionModal, refreshBalance } = useAuth()
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectModal, setSelectModal] = useState<boolean>(false)
  const [hostingCost, setHostingCost] = useState<number>(1)
  const [selectProvider, setSelectProvider] = useState<any>(null);
  const navigate = useNavigate()

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
    let timer: NodeJS.Timeout;
    if (showModal) {
      timer = setTimeout(() => {
        setShowModal(false);
        navigate('/dashboard/assets')
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showModal]);

  const closeModal = () => {
    setShowModal(false);
    navigate('/dashboard/assets')
  };


  useEffect(() => {
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
        messageHandlerRef.current = null;
      }
    };
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value
        }
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpload = useCallback(async () => {
    if (!connectedWallet?.did) {
      toast.error("Please connect your wallet.")
      return
    }

    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
      messageHandlerRef.current = null;
    }

    const messageHandler = (event: any) => {


      const result = event?.data?.data;
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
      else if (event?.data?.type == "NFT_RESULT" && result?.step == "SIGNATURE") {
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
      else if (event?.data?.type == "FT_RESULT" && result?.step == "SIGNATURE") {
        let message = {
          resut: null,
          message: event.data.data?.message,
          status: true,
        }
        setUploading(false)
        refreshBalance()
        setFormData({
          name: '',
          description: '',
          providerid: '',
          mainCategory: '',
          metrics: {
            accuracy: '',
            precision: '',
            recall: '',
            f1Score: ''
          },
          category: '',
          pricing: {
            price: '',
          },
          files: []
        })

        setShowModal(true)
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
          console.log('Message sent:', message);
          return true;
        } else {
          console.error('WebSocket is not connected. Message not sent.');
          return false;
        }
      } else {
        
      }
    };

    messageHandlerRef.current = messageHandler;

    window.addEventListener('message', messageHandler);

    let metadata = {
      type: "model",
      name: formData.name,
      description: formData.description,
      price: formData.pricing.price,
      category: formData.category,
      mainCategory: formData.mainCategory,
      depinProviderDid: formData?.providerid,
      ...formData.metrics
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
        "asset_publish_description": `Model published and owned by ${connectedWallet?.did}`,
        "asset_value": parseFloat(`${(parseFloat(formData?.pricing?.price) || 1) * 0.001}`),
        "depin_provider_did": formData?.providerid ?? "bafybmialabl2a23voctghw2i2unny3h5flztwt2obr6t44jd2mpuna4m4m",
        "depin_hosting_cost": hostingCost,
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

      const invalidExtensions = ['.jpg', '.png', '.jpeg', '.gif'];

      if (invalidExtensions.some(ext => fname.toLowerCase().endsWith(ext))) {
        toast.error("Please provide a valid model file. Image files are not allowed.");
        return;
      }

      const renamedFile = new File([formData.files[0]], fname, { type: formData.files[0].type });
      formDatas.append('file', renamedFile);

      formDatas.append('assetName', fname);
      formDatas.append('assetType', 'model');
      setUploading(true)

      const r1 = await END_POINTS.upload_obj(selectProvider?.endpoints?.upload, formDatas)
      if (!r1?.status) {
        toast.error("Error uploading files. Please try again.");
        setUploading(false)
        return;
      }
      asset_id = r1?.data?.data?.assetId;
    } else if (formData?.url) {
      let hfUrl = String(formData?.url).trim();
      
      const formDatas = new FormData();
      fname = `${parseInt(Date.now().toString())}`;
      formDatas.append('assetName', fname);
      formDatas.append('assetType', 'model');
      formDatas.append('url', hfUrl);
      setUploading(true)
      const r1 = await END_POINTS.upload_obj(selectProvider?.endpoints?.upload, formDatas)
      if (!r1?.status) {
        toast.error("Error uploading files. Please try again.");
        setUploading(false)
        return;
      }
      asset_id = r1?.data?.data?.assetId;
      fname = r1?.data?.data?.fileName || fname;
    } else {
      toast.error("Please upload a file or provide a Hugging Face model URL.");
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
  }, [formData]);

  const handleNext = () => {
    switch (currentStep) {
      case STEPS.DETAILS:
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
      case STEPS.PRICING:
        setCurrentStep(STEPS.DETAILS);
        break;
      case STEPS.REVIEW:
        setCurrentStep(STEPS.PRICING);
        break;
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
    setFormData((prev: any) => ({
      ...prev,
      files: droppedFiles
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFormData((prev: any) => ({
        ...prev,
        files: Array.from(event.target.files || [])
      }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { label: 'Details' },
            { label: 'Pricing' },
            { label: 'Review' }
          ]}
          showSteps={true}
          currentStep={Object.values(STEPS).indexOf(currentStep) + 1}
          totalSteps={Object.values(STEPS).length}
        />
        <div className="text-center mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your AI Model</h1>
          <p className="text-lg text-gray-600 font-medium">Share your AI model with the community</p>
        </div>
      </div>

      {currentStep === STEPS.DETAILS && (
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Model Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 text-gray-900"
                placeholder="e.g., Advanced NLP Model"
                onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
                onBlur={(e) => e.target.style.boxShadow = ''}
              />
              <p className="mt-2 text-sm text-gray-600">
                Choose a clear, descriptive name for your model
              </p>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Description
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 text-gray-900"
                placeholder="Describe your model's capabilities and use cases..."
                onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
                onBlur={(e) => e.target.style.boxShadow = ''}
              />
              <p className="mt-2 text-sm text-gray-600">
                Provide a detailed description of your model's features and capabilities
              </p>
            </div>
            <div>
              <div className='flex my-2 items-center '>
                <label className="block text-base font-semibold text-gray-900  me-3">
                  Depin provider DID
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <button onClick={() => {
                  setSelectModal(true)


                }} className='text-white flex bg-primary pe-2 py-1 text-sm font-medium rounded-md items-center justify-center'> <Plus height={15} />Select </button>
              </div>

              <input
                type="text"
                name="providerid"
                disabled={true}
                value={formData.providerid}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 text-gray-900"
                placeholder="e.g., bafy...."
              />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Main Category
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="mainCategory"
                  value={formData.mainCategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 bg-white text-gray-900"
                >
                  <option value="">Select main category</option>
                  {Object.keys(TASK_CATEGORIES).map((category) => (
                    <option key={category} value={category} className="py-2">
                      {category}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-600">
                  Choose the primary category for your model
                </p>
              </div>

              {formData.mainCategory && (
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">
                    Specific Task
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 bg-white text-gray-900"
                  >
                    <option value="">Select specific task</option>
                    {TASK_CATEGORIES[formData.mainCategory as keyof typeof TASK_CATEGORIES].map((task) => (
                      <option key={task} value={task} className="py-2">
                        {task}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-600">
                    Select the specific task type for your model
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 mb-2">
                  <p className="text-sm text-gray-600 font-medium">
                    Enter your model's performance metrics (values between 0 and 1)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accuracy
                  </label>
                  <input
                    type="text"
                    name="metrics.accuracy"
                    value={formData.metrics.accuracy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900"
                    placeholder="e.g., 0.95"
                    pattern="[0-9]*\.?[0-9]*"
                    onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
                    onBlur={(e) => e.target.style.boxShadow = ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precision
                  </label>
                  <input
                    type="text"
                    name="metrics.precision"
                    value={formData.metrics.precision}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900"
                    placeholder="e.g., 0.92"
                    pattern="[0-9]*\.?[0-9]*"
                    onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
                    onBlur={(e) => e.target.style.boxShadow = ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recall
                  </label>
                  <input
                    type="text"
                    name="metrics.recall"
                    value={formData.metrics.recall}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900"
                    placeholder="e.g., 0.94"
                    pattern="[0-9]*\.?[0-9]*"
                    onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
                    onBlur={(e) => e.target.style.boxShadow = ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    F1 Score
                  </label>
                  <input
                    type="text"
                    name="metrics.f1Score"
                    value={formData.metrics.f1Score}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900"
                    placeholder="e.g., 0.93"
                    pattern="[0-9]*\.?[0-9]*"
                    onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
                    onBlur={(e) => e.target.style.boxShadow = ''}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='my-4 mt-6'>
            <h3 className="text-lg font-semibold text-gray-900 mt-4">Asset</h3>
            <div>
              <label className="block text-sm mt-2 font-medium text-gray-700 mb-2">
                Asset Upload
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
                      <span>{formData?.files?.length == 0 ? 'Upload file' : formData?.files?.[0]?.name}</span>
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
                  {formData?.files?.length == 0 ? <p className="text-xs text-gray-500">Any file up to 10 GB</p> : null}
                </div>
              </div>
            </div>
            <div className='text-gray-900 text-sm text-center mt-4'> -- OR -- </div>
            <div className=''>
              <label className="block text-sm mt-4 font-medium text-gray-700 mb-2">
                Hugging Face Model Link
              </label>
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  name="url"
                  value={formData?.url}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                  placeholder="e.g., https://huggingface.co/models/facebook/bart-large-cnn"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === STEPS.PRICING && (
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">One-time Purchase</h2>
                <p className="text-sm text-gray-600 mt-1">Set a fixed price for model access</p>
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
                  <p className='text-gray-600 border text-center border-gray-300  bg-white ms-2  rounded-lg  p-2.5 font-medium text-sm focus:outline-none w-auto'>{formData?.pricing?.price ? (formData?.pricing?.price / 1000) : 0}</p>
                  <p className='text-gray-600 border border-gray-300 bg-gray-100 ms-2  rounded-lg  p-2.5 font-medium text-sm focus:outline-none '>RBT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === STEPS.REVIEW && (
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Review Model Details</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{formData.name || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Category</label>
                    <p className="mt-1 text-sm text-gray-900">{formData.category || '—'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{formData.description || '—'}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Accuracy</label>
                    <p className="mt-1 text-sm text-gray-900">{formData.metrics.accuracy || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Precision</label>
                    <p className="mt-1 text-sm text-gray-900">{formData.metrics.precision || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Recall</label>
                    <p className="mt-1 text-sm text-gray-900">{formData.metrics.recall || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">F1 Score</label>
                    <p className="mt-1 text-sm text-gray-900">{formData.metrics.f1Score || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {formData?.pricing?.model !== 'free' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Price</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formData?.pricing?.price} TRIE ({formData?.pricing?.price / 1000} RBT)
                        {formData?.pricing?.model === 'subscription' ? '/month' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-4 mt-8">
        <button
          type="button"
          disabled={uploading}
          onClick={() => setCurrentStep(STEPS.DETAILS)}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
        {currentStep !== STEPS.DETAILS && (
          <button
            type="button"
            disabled={uploading}
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={uploading}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg"
          style={buttonStyle}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
        >
          {uploading ? <div className="flex justify-center items-center ">
            <div className="loader border-t-transparent border-solid border-2 border-white-500 rounded-full animate-spin w-6 h-6"></div>
          </div>
            :
            currentStep === STEPS.REVIEW ? 'Publish Model' : 'Next'}
        </button>
      </div>
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
