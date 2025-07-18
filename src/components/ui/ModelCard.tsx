import { getRelativeTimeString, componentStyles } from '@/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useColors } from '@/hooks';

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
  type: string;
  modalType?: string;
  onSelect?: () => void;
  isLiked?: boolean;
  onLike?: () => void;
}

export function ModelCard({ model, type }: ModelCardProps) {
  const navigate = useNavigate();
  const { colors } = useColors();
  if (!model) return null;
  const handleCardClick = () => {
    if (type == "upload") {
      return
    }
    let slug = model?.metadata?.name || model?.name as any
    slug = slug.replace(/\s+/g, '-');
    if (type == "infra") {
      navigate(`/dashboard/providerDetails/${slug}`, {
        state: { model: { ...model, type } }
      });
      return
    }

    navigate(`/dashboard/${type}/${slug}`, {
      state: { model: { ...model, type } }
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={handleCardClick}
      className="group bg-white rounded-xl border hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col cursor-pointer min-h-[300px] relative"
      style={{ borderColor: colors.ui.slate[200] }}
    >
      <div className="relative h-[200px] overflow-hidden bg-gray-50 flex-shrink-0 group-hover:after:absolute group-hover:after:inset-0 group-hover:after:bg-black/10 group-hover:after:transition-opacity">
        <img
          src="/modelph.png"
          alt={model?.metadata?.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium shadow-sm flex-shrink-0">
              {model?.metadata?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 leading-snug tracking-tight truncate font-display">
                {model?.metadata?.name}
              </h3>
              <p className="text-xs text-gray-500 truncate font-mono">
                {model?.serviceName?.split('/')[0]}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
            {model?.metadata?.description}
          </p>

          {model?.metrics && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(model?.metrics).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="text-sm font-medium text-gray-900">{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            {

}
            {model?.pricing && (
              <div className="text-sm font-medium" style={{ color: colors.brand.primary }}>
                ${model?.pricing?.price} {model?.pricing?.model === 'pay-per-use' ? '/ call' : ''}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {(model?.usageHistory && model?.usageHistory?.length > 0) ? `Updated ${getRelativeTimeString(model?.usageHistory[model?.usageHistory?.length - 1]?.Epoch)}` : "-"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}