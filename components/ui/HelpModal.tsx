
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { GuideContent } from './help/GuideContent';
import { ShortcutsContent } from './help/ShortcutsContent';
import { AboutContent } from './help/AboutContent';

type HelpTab = 'guide' | 'shortcuts' | 'about';

export const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useAppContext();
    const [activeTab, setActiveTab] = useState<HelpTab>('guide');
    const h = t?.helpModal || {};
    const s = h?.shortcutItems || {};
    const guideSteps = h?.howItWorksSteps || [];
    
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-lg" onClick={onClose}>
            <div 
                className="w-full max-w-3xl bg-[#0a0a0c]/90 border border-white/10 rounded-3xl shadow-2xl relative flex flex-col h-[80vh] max-h-[600px] animate-fade-in-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">{h.title || 'Help & Information'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    <div className="w-full md:w-48 p-4 border-b md:border-b-0 md:border-r border-white/5 flex-shrink-0">
                        <nav className="flex flex-row md:flex-col gap-2">
                            {(['guide', 'shortcuts', 'about'] as HelpTab[]).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full px-4 py-3 rounded-lg text-left text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600/20 text-blue-300' : 'text-white/40 hover:bg-white/5'}`}>
                                    {h?.tabs?.[tab] || tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        {activeTab === 'guide' && <GuideContent h={h} guideSteps={guideSteps} />}
                        {activeTab === 'shortcuts' && <ShortcutsContent h={h} s={s} />}
                        {activeTab === 'about' && <AboutContent h={h} t={t} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
