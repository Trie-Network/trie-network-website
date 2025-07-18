
import { END_POINTS } from '@/api/requests';
import { useAuth, useColors } from '@/hooks';
import { CONSTANTS, componentStyles } from '@/utils';
import moment from 'moment';
import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface HeroSectionProps {
  history: any[];
  item: any;
}

export function HeroSection({ history, item, }: HeroSectionProps) {
  const [showRatingModal, setShowRatingModal] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [ratingData, setRatingData] = React.useState<any>({})
  const { connectedWallet, setShowExtensionModal } = useAuth()
  const { colors } = useColors()
  const messageHandlerRef = useRef<any>(null);
  const [ratingLoading, setRatingLoading] = React.useState(false)
  const [refecthapi, setRefecthapi] = React.useState(false)


  useEffect(() => {
    (async () => {
      if (item?.nft) {

        let result = await END_POINTS.get_rating_by_asset({
          asset_id: item?.nft
        }) as any
        if (result) {
          setRatingData(result)
        }
      }
    })()
  }, [item, refecthapi]);

  useEffect(() => {
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
        messageHandlerRef.current = null;
      }
    };
  }, []);

  const handleAddRating = () => {
    if (!connectedWallet?.did) {
      return toast.error("Please connect your wallet to rate the asset")
    }
    if (!rating) {
      return toast.error("Please select atleast 1 rating")
    }

    const messageHandler = (event: any) => {
      const result = event.data.data;
      if (!result?.status) {
        if (result?.message) {
          if (messageHandlerRef.current) {
            window.removeEventListener('message', messageHandlerRef.current);
            messageHandlerRef.current = null;

          }
          setShowRatingModal(false);
          setRatingLoading(false);
          setRating(0);
          toast.error(result?.message);
        }
        return
      }
      if (event?.data?.type == "CONTRACT_RESULT" && result?.status) {
        if (result?.step == "EXECUTE") {
          setRatingLoading(true);
          toast.success(result?.message)
        }
        else if (result?.step == "SIGNATURE") {
          toast.success(result?.message)
          setShowRatingModal(false);
          setRatingLoading(false);
          setRating(0);
          setRefecthapi(prev => !prev)
          if (messageHandlerRef.current) {
            window.removeEventListener('message', messageHandlerRef.current);
            messageHandlerRef.current = null;
            return
          }
        }
      }

    }
    messageHandlerRef.current = messageHandler;

    window.addEventListener('message', messageHandler);
    let smartContractData = {
      "rate_asset": {
        "user_did": connectedWallet?.did,
        rating: rating,
        asset_id: item?.nft
      }
    }
    let payload = {
      "comment": Date.now()?.toString(),
      "executorAddr": connectedWallet?.did,
      "quorumType": 2,
      "smartContractData": JSON.stringify(smartContractData),
      "smartContractToken": CONSTANTS.RATING_TOKEN
    }
    if (window.myExtension) {

      try {
        window.myExtension.trigger({
          type: "INITIATE_CONTRACT",
          data: payload
        });
      } catch (error) {
        console.error("Extension error:", error);
        alert("Please refresh the page to use the extension features");
        setRatingLoading(false);
      }
    } else {
      setShowExtensionModal(true);
      alert("Extension not detected.Please install the extension and refresh the page.");
      console.warn("Extension not detected. Please install the extension and refresh the page.");
      setRatingLoading(false);
    }

  };


  return (
    <div className="bg-white border-b mt-6" style={{ borderColor: colors.border.slate[200] }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                <div className="flex items-center gap-2">
                  {item?.metadata?.name}
                  <div className="relative group">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: colors.brand.primary }}>
                      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    
                  </div>
                </div>
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize" style={{ backgroundColor: `${colors.brand.primary}1A`, color: colors.brand.primary }}>
                {item.metadata?.type}
              </span>
            </div>
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-gray-500 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
                  {item?.metadata?.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="transition-colors hover:text-primary">
                  {item?.metadata?.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                {history?.length ? <span>Updated {moment(history?.[history?.length - 1]?.Epoch * 1000).format("DD-MMM-YYYY HH:mm:ss")}</span> : '-'}
                
                
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-gray-900">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {history?.length ? <span className="font-medium text-gray-900">{history?.length - 1 || 0}</span> : '-'}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.318l2.09 4.243 4.686.682-3.392 3.305.8 4.654L12 15.77l-4.194 2.2.8-4.654-3.392-3.305 4.686-.682L12 4.318z" />
            </svg>
            <span className="font-medium text-gray-900">
              {ratingData?.average_rating || 0}    <span className="text-xs ms-1 text-gray-400">({ratingData?.user_count || 0} {ratingData?.user_count == 1 ? 'user' : 'users'})</span>        </span>
            <button
              className={`ml-2 px-3 py-1 text-sm font-medium ${componentStyles.button.primary}`}
              onClick={() => setShowRatingModal(true)}
            >
              Rate
            </button>

            {showRatingModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                  <h2 className="text-lg font-bold mb-4">Add Rating</h2>
                  <div className="mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={() => setRating(star)}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.392 2.46a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.392-2.46a1 1 0 00-1.176 0l-3.392 2.46c-.784.57-1.838-.197-1.54-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.98 9.401c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      disabled={ratingLoading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        setShowRatingModal(false);
                        setRating(0);
                        
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium ${componentStyles.button.primary}`}
                      onClick={handleAddRating}
                      disabled={ratingLoading}
                    >
                      {ratingLoading ? (
                        <div className="flex justify-center items-center ">
                          <div className="loader border-t-transparent border-solid border-2 border-white-500 rounded-full animate-spin w-6 h-6"></div>
                        </div>
                      ) : 'Submit'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          {item?.tags?.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}