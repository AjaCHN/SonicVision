
import React from 'react';
import { AVAILABLE_FONTS, getPositionOptions } from '../../../core/constants';
import { SettingsToggle, Slider, CustomSelect, PositionSelector } from '../ControlWidgets';
import { useAppContext } from '../../AppContext';
import { Position } from '../../../core/types';

export const CustomTextSettingsPanel: React.FC = () => {
  const { settings, setSettings, resetTextSettings, t } = useAppContext();
  
  const positionOptions = getPositionOptions(t);

  const handleTextPositionChange = (value: Position) => {
    setSettings({ ...settings, customTextPosition: value });
  };

  // Expanded color palette (18 original + 12 new = 30 total)
  const colorPresets = [
    '#ffffff', '#00e5ff', '#00ff41', '#ff007f', '#ffcc00', '#ff9500', '#af52de',
    '#c0c0c0', '#cd7f32', '#718096', '#4a5568', '#2d3748',
    '#feb2b2', '#faf089', '#9ae6b4', '#81e6d9', '#90cdf4', '#a3bffa',
    '#ef4444', '#f87171', '#ea580c', '#facc15', '#84cc16', '#14b8a6', 
    '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#a1a1aa'
  ];

  return (
    <>
      {/* Col 1: Content & Typography & Layout Sizing */}
      <div className="p-4 h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 pt-6 overflow-hidden">
        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-2">
                <SettingsToggle 
                  label={t?.customText || "Text Content"}
                  value={settings.showCustomText}
                  onChange={() => setSettings({...settings, showCustomText: !settings.showCustomText})}
                  hintText={t?.showText}
                  activeColor="blue"
                />
                <textarea 
                  value={settings.customText} 
                  onChange={(e) => setSettings({...settings, customText: e.target.value.toUpperCase()})} 
                  placeholder={t?.customTextPlaceholder || "ENTER TEXT"} 
                  rows={2} 
                  className="w-full bg-white/[0.04] rounded-xl px-3 py-2 text-sm font-bold text-white tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none min-h-[60px]" 
                />
            </div>
            <div className="space-y-5 pt-2">
              <CustomSelect label={t?.textFont || "Font Style"} value={settings.customTextFont || 'Inter, sans-serif'} options={AVAILABLE_FONTS} onChange={(val) => setSettings({...settings, customTextFont: val})} />
              <Slider label={t?.textSize || "Size"} value={settings.customTextSize ?? 12} min={2} max={60} step={1} onChange={(v: number) => setSettings({...settings, customTextSize: v})} />
              <Slider label={t?.textRotation || "Rotate"} value={settings.customTextRotation ?? 0} min={-180} max={180} step={5} onChange={(v: number) => setSettings({...settings, customTextRotation: v})} unit="°" />
              <div className="pt-2 border-t border-white/5">
                 <Slider label={t?.textOpacity || "Opacity"} value={settings.customTextOpacity ?? 1.0} min={0} max={1} step={0.05} onChange={(v: number) => setSettings({...settings, customTextOpacity: v})} />
              </div>
            </div>
        </div>
      </div>

      {/* Col 2: Visual Style (Color) */}
      <div className="p-4 h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 pt-6 overflow-hidden">
        <div className="space-y-6 flex-grow overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-3">
                <span className="text-xs font-bold uppercase text-white/50 tracking-[0.15em] block ml-1">{t?.customColor || 'TEXT COLOR'}</span>
                
                <SettingsToggle 
                  label={t?.cycleColors || "Cycle Color"} 
                  value={settings.customTextCycleColor} 
                  onChange={() => setSettings({...settings, customTextCycleColor: !settings.customTextCycleColor})}
                  variant="clean"
                />
                
                {settings.customTextCycleColor && (
                    <div className="pl-1 animate-fade-in-up">
                        <Slider 
                            label={t?.cycleSpeed || "Cycle Speed (Time)"} 
                            value={settings.customTextCycleInterval || 5} 
                            min={1} 
                            max={60} 
                            step={1} 
                            unit="s"
                            onChange={(v) => setSettings({...settings, customTextCycleInterval: v})} 
                        />
                    </div>
                )}

                <div className={`flex flex-col gap-3 p-1 transition-opacity duration-300 ${settings.customTextCycleColor ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <div className="relative w-full h-10 rounded-xl border border-white/20 overflow-hidden group cursor-pointer shadow-lg">
                        <div className="absolute inset-0 transition-colors duration-300" style={{ backgroundColor: settings.customTextColor || '#ffffff' }} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-base font-black text-white uppercase tracking-widest drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
                                {settings.customTextColor}
                            </span>
                        </div>
                        <input 
                            type="color" 
                            value={settings.customTextColor || '#ffffff'} 
                            onChange={(e) => setSettings({...settings, customTextColor: e.target.value})} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                    </div>
                    <div className="grid grid-cols-6 gap-2 pt-1">
                        {colorPresets.map(c => ( <button key={c} onClick={() => setSettings({...settings, customTextColor: c})} className={`aspect-square rounded-full transition-all duration-300 ${settings.customTextColor === c ? 'ring-2 ring-white/80 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'}`} style={{backgroundColor: c}} aria-label={`Color ${c}`} /> ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Col 3: Layout & Actions */}
      <div className="p-4 h-full flex flex-col pt-6">
         <div className="flex-grow">
            <PositionSelector label={t?.textPosition || "Text Position"} value={settings.customTextPosition} onChange={handleTextPositionChange} options={positionOptions} activeColor="blue" />
         </div>
         
         <div className="mt-auto pt-4">
            <button onClick={resetTextSettings} className="w-full py-3 bg-white/[0.04] rounded-xl text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white flex items-center justify-center gap-2 border border-transparent hover:border-white/10 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               {t?.resetText || "Reset Text"}
            </button>
         </div>
      </div>
    </>
  );
};
