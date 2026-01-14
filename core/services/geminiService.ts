
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

export const identifySongFromAudio = async (
  base64Audio: string, 
  mimeType: string, 
  language: Language = 'en', 
  region: Region = 'global',
  provider: 'GEMINI' | 'MOCK' | 'OPENAI' | 'CLAUDE' | 'GROK' = 'GEMINI'
): Promise<SongInfo | null> => {
  if (provider !== 'GEMINI') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { title: "Midnight City", artist: "M83", lyricsSnippet: "Waiting in the car...", mood: "Electric", identified: true, matchSource: provider as any, searchUrl: 'https://google.com' };
  }

  let features: number[] = [];
  try {
    features = await generateFingerprint(base64Audio);
    const localMatch = findLocalMatch(features);
    if (localMatch) return localMatch;
  } catch (e) {
    console.warn("[Recognition] Local match failed", e);
  }

  const callGemini = async (retryCount = 0): Promise<SongInfo | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const regionName = region === 'global' ? 'Global' : (REGION_NAMES[region] || region);
        const systemInstruction = `You are a Music Expert. Identify song from clip. Market: ${regionName}. Return raw JSON: {title, artist, lyricsSnippet, mood, identified}.`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: { parts: [{ inlineData: { mimeType: mimeType, data: base64Audio } }, { text: "Identify this song. JSON ONLY." }] },
          config: { tools: [{ googleSearch: {} }], systemInstruction: systemInstruction }
        });

        const text = response.text;
        if (!text) return null;

        // More robust JSON extraction
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd <= jsonStart) {
            console.error("[AI] No valid JSON found in response:", text);
            return null;
        }

        const jsonStr = text.substring(jsonStart, jsonEnd);
        const songInfo: SongInfo = JSON.parse(jsonStr);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          const webSource = groundingChunks.find(chunk => chunk.web?.uri);
          if (webSource?.web?.uri) songInfo.searchUrl = webSource.web.uri;
        }
        
        songInfo.matchSource = 'AI';
        return songInfo;
    } catch (error: any) {
        console.error("[AI] Error identifying song:", error);
        if (retryCount < 1) return callGemini(retryCount + 1);
        return null;
    }
  };

  const aiResult = await callGemini();
  if (aiResult && aiResult.identified && features.length > 0) saveToLocalCache(features, aiResult);
  return aiResult;
};
