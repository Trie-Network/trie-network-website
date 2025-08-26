

import { getRelativeTimeString } from '@/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


export interface ModelCardData {
  metadata?: {
    name?: string;
    description?: string;
    creator?: string;
    tags?: string[];
  };
  usageHistory?: any[] | undefined;
  image?: string;
  name?: string;
  likes: string | number;
  downloads?: string | number;
  id?: string;
  type?: string;
  pricing?: {
    model?: string;
    price?: string;
    currency?: string;
  };
  serviceName?: string;
  description?: string;
  categories?: string[];
  metrics?: Record<string, string | number>;
  epoch?: number;
}

interface ModelCardProps {
  model: ModelCardData;
  isLiked: boolean;
  likeCount?: number;
  onLike: (id: string, likes: string) => void;
  type: string;
  modalType?: string;
  onSelect?: () => void;
}

interface ImageContainerProps {
  model: ModelCardData;
  className?: string;
}

interface ModelCardCreatorInfoProps {
  model: ModelCardData;
  className?: string;
}

interface MetricsGridProps {
  metrics: Record<string, string | number>;
  className?: string;
}

interface FooterProps {
  model: ModelCardData;
  className?: string;
}

const CARD_ANIMATION_CONFIG = {
  whileHover: { y: -4 },
  transition: { 
    type: "spring" as const, 
    stiffness: 300, 
    damping: 30 
  }
} as const;

const IMAGE_HOVER_CONFIG = {
  scale: 1.05,
  duration: 0.7,
  ease: "ease-out"
} as const;


const CATEGORY_STYLES = {
  'Natural Language Processing': 'bg-green-50 text-green-700',
  'Multimodal': 'bg-purple-50 text-purple-700',
  'Computer Vision': 'bg-blue-50 text-blue-700',
  'Audio': 'bg-orange-50 text-orange-700',
  'Tabular': 'bg-indigo-50 text-indigo-700',
  'Reinforcement Learning': 'bg-yellow-50 text-yellow-700',
  'Text Generation': 'bg-emerald-50 text-emerald-700',
  'Image Generation': 'bg-rose-50 text-rose-700',
  'Video Generation': 'bg-cyan-50 text-cyan-700',
  'Chat Models': 'bg-fuchsia-50 text-fuchsia-700',
  'Vision Models': 'bg-sky-50 text-sky-700',
  'Other': 'bg-gray-50 text-gray-700'
} as const;

const MODEL_CARD_CLASSES = {
  container: 'group bg-white rounded-xl border border-[#e1e3e5] hover:border-[#0284a5] hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col cursor-pointer min-h-[300px] relative',
  imageContainer: 'relative h-[200px] overflow-hidden bg-gray-50 flex-shrink-0 group-hover:after:absolute group-hover:after:inset-0 group-hover:after:bg-black/10 group-hover:after:transition-opacity',
  image: 'w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ease-out',
  imageOverlay: 'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500',
  content: 'p-5 flex-1 flex flex-col',
  creatorAvatar: 'w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium shadow-sm flex-shrink-0',
  creatorName: 'text-base font-semibold text-gray-900 leading-snug tracking-tight truncate font-display',
  creatorService: 'text-xs text-gray-500 truncate font-mono',
  description: 'text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4',
  metricsGrid: 'grid grid-cols-2 gap-2 mb-4',
  metricItem: 'bg-gray-50 rounded-lg p-2',
  metricLabel: 'text-xs text-gray-500 capitalize',
  metricValue: 'text-sm font-medium text-gray-900',
  footer: 'mt-auto pt-4 flex items-center justify-between border-t border-gray-100 flex-shrink-0',
  pricing: 'text-sm font-medium text-[#0284a5]',
  updateTime: 'text-xs text-gray-500'
} as const;

const MODEL_CARD_DEFAULT_CONFIG = {
  defaultImage: '/modelph.png',
  defaultAvatarText: 'M',
  defaultUpdateText: '-'
} as const;


const modelCardUtils = {
  
  createSlug: (name: string | undefined): string => {
    if (!name) return '';
    return name.replace(/\s+/g, '-');
  },

  
  getAvatarText: (name: string | undefined): string => {
    return name?.charAt(0)?.toUpperCase() || MODEL_CARD_DEFAULT_CONFIG.defaultAvatarText;
  },

  
  getServiceName: (serviceName: string | undefined): string => {
    return serviceName?.split('/')[0] || '';
  },

  
  formatMetricKey: (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1').trim();
  },

  
  getLastUpdateTime: (usageHistory: any[] | undefined): string => {
    if (!usageHistory || usageHistory.length === 0) {
      return MODEL_CARD_DEFAULT_CONFIG.defaultUpdateText;
    }
    const lastUsage = usageHistory[usageHistory.length - 1];
    return `Updated ${getRelativeTimeString(lastUsage?.Epoch)}`;
  },

  
  getNavigationPath: (type: string, slug: string): string => {
    if (type === 'infra') {
      return `/dashboard/providerDetails/${slug}`;
    }
    return `/dashboard/${type}/${slug}`;
  },

  
  handleCardClick: (type: string, model: ModelCardData, navigate: any): void => {
    if (type === 'upload') {
      return;
    }
    
    const slug = modelCardUtils.createSlug(model?.metadata?.name || model?.name);
    const path = modelCardUtils.getNavigationPath(type, slug);
    
    navigate(path, {
      state: { model: { ...model, type } }
    });
  },

  
  validateProps: (props: ModelCardProps): boolean => {
    return (
      props.model !== undefined &&
      typeof props.type === 'string' &&
      (props.isLiked === undefined || typeof props.isLiked === 'boolean') &&
      (props.likeCount === undefined || typeof props.likeCount === 'number') &&
      (props.onLike === undefined || typeof props.onLike === 'function') &&
      (props.modalType === undefined || typeof props.modalType === 'string') &&
      (props.onSelect === undefined || typeof props.onSelect === 'function')
    );
  }
} as const;


const ImageContainer: React.FC<ImageContainerProps> = ({ model, className = '' }) => (
  <div className={`${MODEL_CARD_CLASSES.imageContainer} ${className}`}>
    <img
      src={MODEL_CARD_DEFAULT_CONFIG.defaultImage}
      alt={model?.metadata?.name}
      className={MODEL_CARD_CLASSES.image}
    />
    <div className={MODEL_CARD_CLASSES.imageOverlay} />
  </div>
);

const CreatorInfo: React.FC<ModelCardCreatorInfoProps> = ({ model, className = '' }) => (
  <div className={`flex items-center gap-2 mb-4 ${className}`}>
    <div className={MODEL_CARD_CLASSES.creatorAvatar}>
      {modelCardUtils.getAvatarText(model?.metadata?.name)}
    </div>
    <div className="min-w-0">
      <h3 className={MODEL_CARD_CLASSES.creatorName}>
        {model?.metadata?.name}
      </h3>
      <p className={MODEL_CARD_CLASSES.creatorService}>
        {modelCardUtils.getServiceName(model?.serviceName)}
      </p>
    </div>
  </div>
);

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, className = '' }) => (
  <div className={`${MODEL_CARD_CLASSES.metricsGrid} ${className}`}>
    {Object.entries(metrics).map(([key, value]) => (
      <div key={key} className={MODEL_CARD_CLASSES.metricItem}>
        <div className={MODEL_CARD_CLASSES.metricLabel}>
          {modelCardUtils.formatMetricKey(key)}
        </div>
        <div className={MODEL_CARD_CLASSES.metricValue}>
          {value}
        </div>
      </div>
    ))}
  </div>
);

const Footer: React.FC<FooterProps> = ({ model, className = '' }) => (
  <div className={`${MODEL_CARD_CLASSES.footer} ${className}`}>
    <div className="flex items-center gap-4">
      {model?.pricing && (
        <div className={MODEL_CARD_CLASSES.pricing}>
          ${model?.pricing?.price} {model?.pricing?.model === 'pay-per-use' ? '/ call' : ''}
        </div>
      )}
    </div>
    <span className={MODEL_CARD_CLASSES.updateTime}>
      {modelCardUtils.getLastUpdateTime(model?.usageHistory)}
    </span>
  </div>
);


export function ModelCard({ 
  model, 
  type,
  isLiked,
  likeCount,
  onLike,
  modalType,
  onSelect
}: ModelCardProps) {
  const navigate = useNavigate();

  
  if (!modelCardUtils.validateProps({ model, type, isLiked, likeCount, onLike, modalType, onSelect })) {
   
    return null;
  }

  
  if (!model) return null;

  const handleCardClick = () => {
    modelCardUtils.handleCardClick(type, model, navigate);
  };

  return (
    <motion.div
      whileHover={CARD_ANIMATION_CONFIG.whileHover}
      transition={CARD_ANIMATION_CONFIG.transition}
      onClick={handleCardClick}
      className={MODEL_CARD_CLASSES.container}
    >
      <ImageContainer model={model} />
      
      <div className={MODEL_CARD_CLASSES.content}>
        <div className="flex-1">
          <CreatorInfo model={model} />
          
          <p className={MODEL_CARD_CLASSES.description}>
            {model?.metadata?.description}
          </p>

          {model?.metrics && (
            <MetricsGrid metrics={model.metrics} />
          )}
        </div>

        <Footer model={model} />
      </div>
    </motion.div>
  );
}


export type { 
  ModelCardProps, 
  ImageContainerProps, 
  ModelCardCreatorInfoProps, 
  MetricsGridProps, 
  FooterProps 
};


export { 
  CATEGORY_STYLES, 
  MODEL_CARD_CLASSES, 
  MODEL_CARD_DEFAULT_CONFIG, 
  CARD_ANIMATION_CONFIG, 
  IMAGE_HOVER_CONFIG, 
  modelCardUtils 
};