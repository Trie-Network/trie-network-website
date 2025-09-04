import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ANIMATION_CONFIG, LAYOUT_CLASSES } from '../types';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children, title }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                className={LAYOUT_CLASSES.drawer}
                initial={ANIMATION_CONFIG.drawer.initial}
                animate={ANIMATION_CONFIG.drawer.animate}
                exit={ANIMATION_CONFIG.drawer.exit}
                transition={ANIMATION_CONFIG.drawer.transition}
            >
                <div className={LAYOUT_CLASSES.drawerHeader}>
                    <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className={LAYOUT_CLASSES.drawerContent}>
                    {children}
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

