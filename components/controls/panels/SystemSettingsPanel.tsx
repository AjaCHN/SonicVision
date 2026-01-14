import React, { useState } from 'react';
import { Language } from '../../../core/types';
import { APP_VERSION } from '../../../core/constants';
import { CustomSelect, SettingsToggle } from '../ControlWidgets';
import { useAppContext } from '../../AppContext';

export const SystemSettingsPanel: React.FC = () => {
  const { language, setLanguage, settings, setSettings, resetSettings, t } = useAppContext();
  const [confirmReset, setConfirmReset] = useState(false);
  const hints = t?.hints || {};
  
  const handleResetClick = () => {
    if (confirmReset) {
      resetSettings();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center h-full w-full">
      <div className="w-full max-w-md space-y-4 pt-6 flex-grow flex flex-col">
        <CustomSelect 
          label={t?.language || "Language"} 
          value={language} 
          hintText={hints?.language} 
          options={[
            { value: 'en', label: 'English' }, { value: 'zh', label: '简体中文' }, 
            { value: 'tw', label: '繁體中文' }, { value: 'ja', label: '日本語' }, 
            { value: 'es', label: 'Español' }, { value: 'ko', label: '한국어' }, 
            { value: 'de', label: 'Deutsch' }, { value: 'fr', label: 'Français' }
          ]} 
          onChange={(val) => setLanguage(val as Language)} 
        />
        
        <div className="pt-2">
            <SettingsToggle 
              label={t?.wakeLock || "Stay Awake"} 
              value={settings.wakeLock} 
              onChange={() => setSettings({...settings, wakeLock: !settings.wakeLock})} 
              hintText={hints?.wakeLock} 
              statusText={settings.wakeLock ? (t?.common?.active || "Active") : (t?.common?.off || "OFF")} 
            />
        </div>
        
        <div className="mt-auto space-y-4 pt-4">
            <button 
              onClick={handleResetClick} 
              className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group ${confirmReset ? 'bg-red-600 text-white border-red-400' : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {confirmReset ? (t?.confirmReset || 'Are you sure?') : (t?.reset || "Reset App")}
            </button>
             <div className="text-center">
                <span className="text-[10px] text-white/20 font-mono tracking-widest uppercase">AURA VISION BUILD {APP_VERSION}</span>
            </div>
        </div>
      </div>
    </div>
  );
};