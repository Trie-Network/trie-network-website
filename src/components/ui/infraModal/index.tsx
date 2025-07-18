import { useAuth } from "@/hooks"
import { ModelCard } from "../ModelCard"
import { useCallback, useEffect, useState } from "react"
import { Search } from "lucide-react";

interface InfraModalProps {
    onselectProvider: any;
}

export function InfraModal({ onselectProvider }: InfraModalProps) {
    const { infraProviders } = useAuth()
    const [selectedPlatform, setSelectedPlatform] = useState<any>(null)
    const [selectedProviderIndex, setSelectedProviderIndex] = useState(0)
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
        if (!selectedPlatform) {
            return
        }
        filteredProviders()
    }, [searchQuery, selectedPlatform])

    const filteredProviders = useCallback(() => {
        if (!searchQuery) {
            return selectedPlatform?.providers
        }
        return selectedPlatform?.providers?.filter((provider: any) =>
            provider.providerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, selectedPlatform?.providers])

    return (
        <div>
            {!selectedPlatform ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-3">
                {infraProviders.map((provider: any, index: number) => (
                    <div onClick={() => setSelectedPlatform(provider)} key={index} className="cursor-pointer">
                        <ModelCard
                            type="upload"
                            model={{
                                metadata: {
                                    ...provider,
                                    name: provider.name,
                                    description: provider.description,
                                },
                                likes: provider.likes || 0,
                            }}
                            isLiked={false}
                            onLike={() => { }}
                        />
                    </div>
                ))}
            </div> :
                <div style={{ paddingTop: 10 }} >
                    <p className='text-gray-900 py-4 text-lg font-semibold'>Providers List - {selectedPlatform?.name}</p>
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

                        {selectedProviderIndex >= 0 && (
                            <div className="w-2/3 ms-3 border-s   rounded-xl p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-display-sm text-gray-900">{selectedPlatform?.providers[selectedProviderIndex]?.providerName}</h2>
                                        <p className="text-body-base text-gray-500 mt-2">
                                            <strong> Region:</strong> {selectedPlatform?.providers[selectedProviderIndex]?.region} • {selectedPlatform?.providers[selectedProviderIndex]?.storage} Storage
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-body-sm text-gray-500">Hosting Cost</p>
                                            <p className="text-display-sm text-primary font-semibold">
                                                {selectedPlatform?.providers[selectedProviderIndex]?.hostingCost} TRIE
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
                                                    <span className="font-medium text-gray-900">{selectedPlatform?.providers[selectedProviderIndex]?.os}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Processor</span>
                                                    <span className="font-medium text-gray-900">{selectedPlatform?.providers[selectedProviderIndex]?.processor}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">GPU</span>
                                                    <span className="font-medium text-gray-900">{selectedPlatform?.providers[selectedProviderIndex]?.gpu}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Supports</span>
                                                    <span className="font-medium text-gray-900">{selectedPlatform?.providers[selectedProviderIndex]?.supportedModels || "-"}</span>
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
                                                    <span className="font-medium text-gray-900">{selectedPlatform?.providers[selectedProviderIndex]?.storage}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Memory</span>
                                                    <span className="font-medium text-gray-900">{selectedPlatform?.providers[selectedProviderIndex]?.memory}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Cores</span>
                                                    <span className="font-medium text-gray-900">{selectedPlatform?.providers[selectedProviderIndex]?.core}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-1">
                                    <button
                                        onClick={() => onselectProvider({
                                            providerDid: selectedPlatform?.providers[selectedProviderIndex].providerDid,
                                            hostingCost: selectedPlatform?.providers[selectedProviderIndex].hostingCost,
                                            endpoints: selectedPlatform?.providers[selectedProviderIndex]?.endpoints,
                                        })}
                                        className="px-4 py-2 bg-primary self-end text-white rounded-lg text-body-base font-medium hover:bg-primary-hover transition-all shadow-sm hover:shadow-md"
                                    >
                                        Select Provider
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            }
        </div >
    )
}