
import { END_POINTS } from '@/api/requests';
import { ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useColors } from '@/hooks';
import { componentStyles } from '@/utils';

function Faucet() {
    const [did, setDid] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let timer: any;
        if (showModal) {
            timer = setTimeout(() => {
                setShowModal(false);
            }, 5000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [showModal]);

    useEffect(() => {
        let details = localStorage.getItem("wallet_details") as any
        details = details ? JSON.parse(details) : null
        if (details) {
            setDid(details?.did || "")
        }
    }, [])

    const addFaucet = async () => {
        if (!did.trim()) return;
        setLoading(true);
        try {
            let response = await END_POINTS.request_ft({
                username: did,
                ftCount: 10
            }) as any

            if (response && response.success) {
                setShowModal(true);
                return
            }
            toast.error(response?.message || "failed to add faucet")
        }
        catch (error) {
            console.error("Error in addFaucet:", error);
        } finally {
            setLoading(false);
            setDid('');
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[50%] mx-auto flex flex-col items-center gap-8">
                <img
                    src="/trie-nav-logo@4x.png"
                    alt="TRIE Logo"
                    className="w-32 h-auto object-contain"
                />

                <div className="w-full">
                    <h1 className="text-white text-3xl font-bold text-center mb-2 font-['IBM_Plex_Sans']">TRIE Faucet</h1>
                    <p className="text-gray-400 text-center mb-8 font-['IBM_Plex_Sans']">Get test TRIE tokens for the testnet</p>

                    <div className="flex gap-4">
                        <input
                            disabled={loading}
                            value={did}
                            onChange={(e) => setDid(e.target.value)}
                            type="text"
                            placeholder="Enter your DID"
                            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors font-['IBM_Plex_Mono']"
                        />
                        <button
                            onClick={addFaucet}
                            disabled={loading || !did.trim()}
                            className={`px-6 py-3 bg-white text-black font-semibold rounded-lg transition-colors flex items-center gap-2 font-['IBM_Plex_Sans'] ${loading || !did.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                        >
                            {loading ? <div className="flex justify-center items-center ">
                                <div className="loader border-t-transparent border-solid border-2 border-white-900 rounded-full animate-spin w-6 h-6"></div>
                            </div> : 'Get TRIE'}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
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
                                TRIE token request has been successful. You should get them in some time!
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
        </div>
    );
}

export default Faucet;