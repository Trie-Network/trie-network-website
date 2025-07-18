import React, { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks';

const ProviderDetails: React.FC = () => {
    const [selectedProviderIndex, setSelectedProviderIndex] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate()
    const [model, setModel] = useState<any>({})
    const { loader, infraProviders } = useAuth()
    const modelData = location.state?.model || null;
    const { id } = useParams();
    useEffect(() => {
        if (modelData) {
            setModel(modelData)
        }
        else if (!loader && infraProviders?.length) {
            let name = id?.split("-")?.join(" ")
            let result = infraProviders?.find((item: any) => item?.name == name)
            if (!result) {
                navigate('/dashboard/all')
            }
            setModel({
                metadata: {
                    ...result,
                }
            })
        }
        else if (!loader && infraProviders?.length) {
            navigate('/dashboard/all')
        }

    }, [modelData, infraProviders, loader])
    useEffect(() => {
        filteredProviders()
    }, [searchQuery])

    const filteredProviders = useCallback(() => {
        if (!searchQuery) {
            return model?.metadata?.providers
        }
        return model?.metadata?.providers?.filter((provider: any) =>
            provider.providerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, model?.metadata?.providers])

    return (

        <div style={{ paddingTop: 150 }} className="pb-16 lg:px-12 h-screen  ">
            {!loader ? <p className='text-gray-900 py-4 text-lg font-semibold'>Providers List - {model?.metadata?.name}</p> :
                <div className="w-[400px] ms-3 border-s p-2 animate-pulse rounded-xl p-3 space-y-6">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div></div>}
            <div className='flex'>
                <div className="w-[40%] rounded-xl">
                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search providers..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-2">
                        {filteredProviders()?.length > 0 ? filteredProviders()?.map((provider: any, index: number) => (
                            <div
                                key={provider.id}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${selectedProviderIndex === index
                                    ? 'bg-primary/5 border-r-4 border-primary'
                                    : 'hover:bg-gray-50 border-r-4 border-transparent'
                                    }`}
                                onClick={() => setSelectedProviderIndex(index)}
                            >
                                <input
                                    type="radio"
                                    checked={selectedProviderIndex === index}
                                    onChange={() => setSelectedProviderIndex(index)}
                                    className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary/20 border-gray-300"
                                />
                                <span className="font-medium text-gray-900">{provider?.providerName}</span>
                            </div>
                        )) : <p className='text-gray-900 text-center'>No Data Available</p>}
                    </div>
                </div>
                <>
                    {loader ? (
                        <div className="w-2/3 ms-3 border-s h-screen animate-pulse rounded-xl p-8 space-y-6">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>

                            <div className="grid grid-cols-2 gap-8 mt-8">
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-300 w-1/2 rounded"></div>
                                    <div className="bg-gray-100 p-4 rounded-lg space-y-4">
                                        <div className="flex justify-between">
                                            <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                                            <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                                            <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-300 w-1/2 rounded"></div>
                                    <div className="bg-gray-100 p-4 rounded-lg space-y-4">
                                        <div className="flex justify-between">
                                            <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                                            <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                                            <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) :
                        selectedProviderIndex >= 0 && (
                            <div className="w-2/3 ms-3 border-s h-screen  rounded-xl p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-display-sm text-gray-900">{model?.metadata?.providers[selectedProviderIndex]?.providerName}</h2>
                                        <p className="text-body-base text-gray-500 mt-2">
                                            Region: {model?.metadata?.providers[selectedProviderIndex]?.region} • {model?.metadata?.providers[selectedProviderIndex]?.storage} Storage
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-body-sm text-gray-500">Hosting Cost</p>
                                            <p className="text-display-sm text-primary font-semibold">
                                                {model?.metadata?.providers[selectedProviderIndex]?.hostingCost} TRIE
                                            </p>
                                        </div>
                                        {

}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mt-8">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-body-sm font-semibold text-gray-900 mb-4">System Specifications</h3>
                                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center">

                                                    <span className="text-gray-500">Operating System</span>
                                                    <span className="font-medium text-gray-900">{model?.metadata?.providers[selectedProviderIndex]?.os}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Processor</span>
                                                    <span className="font-medium text-gray-900">{model?.metadata?.providers[selectedProviderIndex]?.processor}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">GPU</span>
                                                    <span className="font-medium text-gray-900">{model?.metadata?.providers[selectedProviderIndex]?.gpu}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Supports</span>
                                                    <span className="font-medium text-gray-900 truncate">{model?.metadata?.providers[selectedProviderIndex]?.supportedModels || "-"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-body-sm font-semibold text-gray-900 mb-4">Resource Allocation</h3>
                                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Storage</span>
                                                    <span className="font-medium text-gray-900">{model?.metadata?.providers[selectedProviderIndex]?.storage}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Memory</span>
                                                    <span className="font-medium text-gray-900">{model?.metadata?.providers[selectedProviderIndex]?.memory}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Cores</span>
                                                    <span className="font-medium text-gray-900">{model?.metadata?.providers[selectedProviderIndex]?.core}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                </>
            </div>
        </div>
    );
};

export default ProviderDetails;