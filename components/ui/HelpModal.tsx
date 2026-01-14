
import React from 'react';
import { Language } from '../../core/types';
import { TRANSLATIONS } from '../../core/i18n';
import { APP_VERSION } from '../../core/constants';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[language];
  const h = t.helpModal;
  const shortcuts = [
    { keys: ['Space'], labelKey: 'toggleMic' }, { keys: ['F'], labelKey: 'fullscreen' },
    { keys: ['R'], labelKey: 'randomize' }, { keys: ['L'], labelKey: 'lyrics' },
    { keys: ['H'], labelKey: 'hideUi' }, { keys: ['G'], labelKey: 'glow' },
    { keys: ['T'], labelKey: 'trails' }, { keys: ['←', '→'], labelKey: 'changeMode' },
    { keys: ['↑', '↓'], labelKey: 'changeTheme' },
  ];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-fade-in-up overflow-hidden text-white">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">{h.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <p className="text-gray-300 leading-relaxed text-lg">{h.intro}</p>
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">!</span>{h.shortcutsTitle}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shortcuts.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                   <span className="text-sm text-gray-300">{(h.shortcutItems as any)[s.labelKey]}</span>
                   <div className="flex gap-1">{s.keys.map(k => <kbd key={k} className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono text-white/90 border border-white/10 shadow-sm min-w-[24px] text-center">{k}</kbd>)}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-5 rounded-xl">
             <h4 className="text-white font-bold mb-3 text-sm uppercase flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{h.projectInfoTitle}</h4>
             <p className="text-gray-400 text-sm leading-relaxed">{h.projectInfoText}</p>
          </section>
        </div>
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center">
          <div className="text-white/30 text-xs font-mono ml-2">{h.version} {APP_VERSION}</div>
          <button onClick={onClose} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">{t.close}</button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
