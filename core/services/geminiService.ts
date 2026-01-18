
/**
 * File: core/services/geminiService.ts
 * Version: 0.8.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

const REQUEST_TIMEOUT_MS = 20000; // 20s Hard Timeout for Robustness

export const identifySongFromAudio = async (
  base64Audio: string, 
  mimeType: string, 
  language: Language = 'en', 
  region: Region = 'global',
  provider: 'GEMINI' | 'MOCK' | 'OPENAI' | 'CLAUDE' | 'GROK' | 'DEEPSEEK' | 'QWEN' = 'GEMINI'
): Promise<SongInfo | null> => {
  if (provider === 'MOCK') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { title: "Midnight City", artist: "M83", lyricsSnippet: "Waiting in the car...", mood: "Electric", identified: true, matchSource: 'MOCK', searchUrl: 'https://google.com' };
  }

  // GEMINI Implementation
  // Note: For other providers (GROK, DEEPSEEK, etc.), we currently use Gemini as the backend engine
  // but we can adjust the system prompt to simulate different "personalities" if needed.
  // This ensures the app doesn't crash when users select other providers in the UI.

  // Use the API key exclusively from process.env.API_KEY directly when initializing the client.
  // Assume it is pre-configured, valid, and accessible.
  const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });


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
        const regionName = region === 'global' ? 'Global' : (REGION_NAMES[region] || region);
        
        // Map language code to full language name for the prompt
        const langMap: Record<string, string> = {
            en: 'English', zh: 'Simplified Chinese', tw: 'Traditional Chinese', 
            ja: 'Japanese', es: 'Spanish', ko: 'Korean', de: 'German', 
            fr: 'French', ru: 'Russian', ar: 'Arabic'
        };
        const targetLang = langMap[language] || 'English';

        // FIX: Refined system instruction for clarity and branding alignment with OpenSpec.
        const systemInstruction = `
          You are the "Aura Vision AI Synesthesia Engine". Your specialty is Identifying tracks from low-fidelity 6-second microphone snapshots.
          
          MARKET CONTEXT: The user is in the '${regionName}' market. 
          USER LANGUAGE: ${targetLang}.
          
          CORE CAPABILITIES:
          1. SPECTRAL ANALYSIS: Listen past background noise to find the primary melodic signature.
          2. SEARCH GROUNDING: Use Google Search to verify Title/Artist.
          3. REGIONAL BIAS: Prioritize tracks popular in ${regionName}.
          4. LINGUISTIC ADAPTATION: 
             - Return 'mood' and 'lyricsSnippet' translated into ${targetLang}.
             - Keep Title/Artist in their original script (e.g. Kanji for Japanese songs) BUT if the user's language is different, provide a ${targetLang} translation in parentheses.
          
          NOISE POLICY:
          - If NO music is heard, set "identified" to false.
          
          MOOD ANALYSIS:
          - Provide a evocative 2-3 word aesthetic mood tag in ${targetLang} (e.g., 'Retro Synthwave' -> '复古合成波' if Chinese).
          
          STRICT OUTPUT:
          - Return valid JSON only.
        `;

        const identifyPromise = aiClient.models.generateContent({ // Use aiClient here
          model: GEMINI_MODEL,
          contents: { 
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Audio } }, 
              { text: `Analyze this audio. Identify the song and describe its mood in ${targetLang}.` }
            ] 
          },
          config: { 
            tools: [{ googleSearch: {} }], 
            systemInstruction: systemInstruction,
            temperature: 0.15, 
            topP: 0.8,
            topK: 20,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { 
                  type: Type.STRING, 
                  // FIX: Concise and clear description for linguistic adaptation
                  description: `The track title. If different from ${targetLang}, keep original script and include ${targetLang} translation in parentheses.` 
                },
                artist: { 
                  type: Type.STRING, 
                  // FIX: Concise and clear description for linguistic adaptation
                  description: `The artist name. If different from ${targetLang}, keep original script and include ${targetLang} translation in parentheses.` 
                },
                lyricsSnippet: { type: Type.STRING, description: `A relevant line or chorus translated into ${targetLang}.` },
                mood: { type: Type.STRING, description: `2-3 word mood description in ${targetLang}.` },
                identified: { type: Type.BOOLEAN, description: "True only if a specific song was found." },
              },
              required: ['title', 'artist', 'identified']
            }
          }
        });

        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("AI_TIMEOUT")), REQUEST_TIMEOUT_MS)
        );

        const response: any = await Promise.race([identifyPromise, timeoutPromise]);

        const text = response.text;
        if (!text) return null;

        let songInfo: SongInfo = JSON.parse(text.trim());
        if (!songInfo.identified) return null;

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          const webSource = groundingChunks.find((chunk: any) => chunk.web?.uri);
          if (webSource?.web?.uri) songInfo.searchUrl = webSource.web.uri;
        }
        
        songInfo.matchSource = 'AI';
        return songInfo;
    } catch (error: any) {
        console.error("[AI] Error:", error.message || error);
        
        // Don't retry if it's a timeout or explicit API key issue
        if (error.message === "AI_TIMEOUT") return null;
        
        if (retryCount < 1) return callGemini(retryCount + 1);
        return null;
    }
  };

  const aiResult = await callGemini();
  if (aiResult && aiResult.identified && features.length > 0) saveToLocalCache(features, aiResult);
  return aiResult;
};
