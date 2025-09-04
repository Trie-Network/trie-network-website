import { motion, AnimatePresence } from 'framer-motion';
import { usePlayground } from './hooks';
import {
    MobileHeader,
    SystemPanel,
    SettingsDrawer,
    ChatInterface,
    UserInput,
    BalancePanel,
    ClearConfirmationModal
} from './components';

const PlayGround = () => {
    const {
        state,
        handleTemplateChange,
        handleSystemPromptChange,
        handleEditPrompt,
        handleCancelEdit,
        handleClearSystemPrompt,
        confirmClearSystemPrompt,
        handleUserMessageChange,
        handleClearInput,
        toggleDrawer,
        closeDrawer,
        handleCopyMessage,
        handleRerunMessage,
        handleRunMessage,
        handleBuyMoreTokens,
        handleRagTextChange,
        handleRagFileChange,
        handleChunkSizeChange,
        handleKNearestChange,
        handleModelChange,
        handleRemoveRagFile,
        handleSavePrompt,
        handleCloseClearModal,
        isBuyingTokens
    } = usePlayground();

    const {
        activeDrawer,
        messages,
        isProcessing,
        copiedMessageId,
        userMessage,
        inputError,
        isRequestProcessing,
        projects,
        selectedProject,
        systemPrompt,
        isEditing,
        originalSystemPrompt,
        showClearModal,
        inferenceBalance,
        balanceLoading,
        uploading,
        selectedModel,
        models,
    ragText,
    ragFile,
    chunkSize,
        kNearest
    } = state;

    return (
        <div className="fixed inset-0 flex flex-col bg-slate-50" style={{ top: "110px", bottom: 0, left: 0, right: 0 }}>
            {/* Mobile Header */}
            <MobileHeader
                activeDrawer={activeDrawer}
                onToggleSystemDrawer={() => toggleDrawer('system')}
                onToggleSettingsDrawer={() => toggleDrawer('settings')}
            />

            {/* Main Container */}
            <div className="flex flex-1 overflow-hidden rounded-lg mx-4 mb-4 bg-white border border-slate-100 relative">
                {/* Backdrop for mobile drawers */}
                <AnimatePresence>
                    {activeDrawer !== 'none' && (
                        <motion.div
                            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeDrawer}
                        />
                    )}
                </AnimatePresence>

                {/* System Panel (Left Sidebar) */}
                <AnimatePresence>
                    {(activeDrawer === 'system' || window.innerWidth >= 1024) && (
                        <motion.div
                            className={`${activeDrawer === 'system' ? 'fixed left-0 top-0 bottom-0 z-40 w-[85%] max-w-[320px]' : 'hidden lg:block w-64'} border-r border-slate-100 overflow-y-auto bg-slate-50 h-full`}
                            initial={activeDrawer === 'system' ? { x: -320 } : false}
                            animate={activeDrawer === 'system' ? { x: 0 } : {}}
                            exit={activeDrawer === 'system' ? { x: -320 } : {}}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <div className="sticky top-0 bg-slate-50 px-5 py-4 border-b border-slate-100 z-10">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold mb-3 text-primary uppercase tracking-wide flex items-center">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                                        System
                                    </div>
                                    {activeDrawer === 'system' && (
                                        <button onClick={closeDrawer} className="p-1 text-slate-400 hover:text-slate-700">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                            <SystemPanel
                                projects={projects}
                                selectedProject={selectedProject}
                                systemPrompt={systemPrompt}
                                isEditing={isEditing}
                                originalSystemPrompt={originalSystemPrompt}
                                activeDrawer={activeDrawer}
                                onProjectChange={handleTemplateChange}
                                onSystemPromptChange={handleSystemPromptChange}
                                onClearSystemPrompt={handleClearSystemPrompt}
                                onCancelEdit={handleCancelEdit}
                                onEditPrompt={handleEditPrompt}
                                onSavePrompt={handleSavePrompt}
                                onCloseDrawer={closeDrawer}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chat Interface (Center) */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white border-x border-slate-100">
                    <ChatInterface
                        messages={messages}
                        isProcessing={isProcessing}
                        copiedMessageId={copiedMessageId}
                        onCopy={handleCopyMessage}
                        onRerun={handleRerunMessage}
                    />

                    <UserInput
                        userMessage={userMessage}
                        inputError={inputError}
                        isProcessing={isProcessing}
                        isRequestProcessing={isRequestProcessing}
                        onMessageChange={handleUserMessageChange}
                        onRunMessage={handleRunMessage}
                        onClearInput={handleClearInput}
                            />
                        </div>

                {/* Settings Panel (Right Sidebar) */}
                <AnimatePresence>
                    {(activeDrawer === 'settings' || window.innerWidth >= 1024) && (
                        <motion.div
                            className={`${activeDrawer === 'settings' ? 'fixed right-0 top-0 bottom-0 z-40 w-[85%] max-w-[320px]' : 'hidden lg:block w-80'} border-l border-slate-100 overflow-y-auto bg-slate-50 h-full`}
                            initial={activeDrawer === 'settings' ? { x: 320 } : false}
                            animate={activeDrawer === 'settings' ? { x: 0 } : {}}
                            exit={activeDrawer === 'settings' ? { x: 320 } : {}}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <div className="sticky top-0 bg-slate-50 px-5 py-4 border-b border-slate-100 z-10">
                                {/* Balance Panel */}
                                <BalancePanel
                                    inferenceBalance={inferenceBalance}
                                    balanceLoading={balanceLoading}
                                    uploading={uploading}
                                    isBuyingTokens={isBuyingTokens}
                                    onBuyMoreTokens={handleBuyMoreTokens}
                                />
                                   
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                                        Settings
                                    </div>
                                    {activeDrawer === 'settings' && (
                                        <button onClick={closeDrawer} className="p-1 text-slate-400 hover:text-slate-700">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                            <SettingsDrawer
                                activeDrawer={activeDrawer}
                                selectedModel={selectedModel}
                                models={models}
                                ragText={ragText}
                                ragFile={ragFile}
                                chunkSize={chunkSize}
                                kNearest={kNearest}
                                onCloseDrawer={closeDrawer}
                                onModelChange={handleModelChange}
                                onRagTextChange={handleRagTextChange}
                                onRagFileChange={handleRagFileChange}
                                onChunkSizeChange={handleChunkSizeChange}
                                onKNearestChange={handleKNearestChange}
                                onRemoveRagFile={handleRemoveRagFile}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Clear Confirmation Modal */}
            <ClearConfirmationModal
                show={showClearModal}
                onClose={handleCloseClearModal}
                onConfirm={confirmClearSystemPrompt}
            />
        </div>
    );
};

export default PlayGround;

