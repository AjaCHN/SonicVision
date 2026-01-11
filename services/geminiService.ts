import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region } from '../types';

let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const identifySongFromAudio = async (base64Audio: string, mimeType: string, language: Language = 'en', region: Region = 'global'): Promise<SongInfo | null> => {
  try {
    const ai = getGenAI();
    
    // 1. Language Context
    const langContext = language === 'zh' 
      ? 'Output "mood" in Simplified Chinese. For Chinese songs, "title" and "artist" MUST be in Chinese characters.' 
      : 'Output "mood" in English. "title" and "artist" should be in their original language or English.';

    // 2. Region Prioritization
    let regionContext = '';
    if (region !== 'global') {
       const regionName = REGION_NAMES[region] || region;
       regionContext = `CONTEXT: User is in the "${regionName}" market. Prioritize identifying songs trending or classic in this region.`;
    }

    // 3. System Instruction for the Persona
    const systemInstruction = `You are an expert Musicologist AI with perfect pitch and an encyclopedic knowledge of global music lyrics. 
    Your task is to identify the song from the audio clip and provide accurate lyrics.
    
    CRITICAL RULES:
    1. **Identify First, Lyrics Second**: Do not just transcribe what you hear. First, identify the song (Title/Artist). Then, access your internal database to retrieve the OFFICIAL lyrics for that part of the song.
    2. **Lyric Accuracy**: Correct any mumbled or unclear words in the audio using the official lyrics. 
    3. **Fallback to Chorus**: If the audio is instrumental or the specific verse is unrecognizable, BUT you recognized the song, return the song's **Chorus/Hook** in the 'lyricsSnippet' field. 
    4. **Instrumental Tracks**: If the song is purely instrumental (no lyrics exist), return "[Instrumental]" in the 'lyricsSnippet' field.
    5. **Formatting**: Break lyrics into natural lines (using \\n).
    6. **Hallucination Check**: If you are not >80% sure of the song identity, set 'identified' to false and title to "Unknown".`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: `Analyze this audio clip.
                   
                   ${regionContext}
                   ${langContext}

                   Steps to execute:
                   1. Listen to the melody, beat, and vocal timbre.
                   2. Match against songs popular in the specified region.
                   3. If vocals are heard: Match the phonetic sounds to official lyrics.
                   4. If instrumental: Identify the underlying track and retrieve the most iconic lyrics (Chorus).

                   Return JSON object:
                   {
                     "title": "Song Title",
                     "artist": "Artist Name",
                     "lyricsSnippet": "The most relevant lyrics for this moment OR the song's chorus. Cannot be empty.",
                     "mood": "Vibe description (e.g. Energetic, Dreamy)",
                     "identified": true/false
                   }`
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            lyricsSnippet: { type: Type.STRING },
            mood: { type: Type.STRING },
            identified: { type: Type.BOOLEAN }
          },
          required: ["title", "artist", "identified", "lyricsSnippet"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as SongInfo;

  } catch (error) {
    console.error("Gemini identification failed:", error);
    return null;
  }
};