
import React from 'react';

interface AboutContentProps { 
  h: any; // helpModal translations
  t: any; // full translations object (for APP_VERSION)
}

export const AboutContent: React.FC<AboutContentProps> = ({ h, t }) => (
    <div className="space-y-6">
        <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
           <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {h?.projectInfoTitle || "About Aura"}
           </h4>
           <p className="text-sm text-white/50 leading-relaxed font-medium">
             {h?.aboutDescription || "Immersive AI visualizer for Streamers, VJs, Ambient decor, and Focus sessions."}
           </p>
        </div>
        <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
           <h4 className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             {h?.privacyTitle || "Privacy"}
           </h4>
           <p className="text-sm text-white/50 leading-relaxed font-medium">{h?.privacyText || "Local analysis only."}</p>
        </div>
    </div>
);
