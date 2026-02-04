
import { GoogleGenAI, Chat } from "@google/genai";
import type { UserData, NumerologyReport, NumerologyCalculations, ChatMessage, DailyReportData, UserProfileData, PredictionsReport, VastuReport, DetailedRemediesReport } from '../types';
import { 
    SYSTEM_PROMPT, 
    RESPONSE_SCHEMA, 
    CHAT_SYSTEM_PROMPT,
    DAILY_REPORT_SYSTEM_PROMPT,
    DAILY_REPORT_RESPONSE_SCHEMA,
    PROFILE_SYSTEM_PROMPT,
    PROFILE_RESPONSE_SCHEMA,
    PREDICTIONS_SYSTEM_PROMPT,
    PREDICTIONS_RESPONSE_SCHEMA,
    VASTU_SYSTEM_PROMPT,
    VASTU_RESPONSE_SCHEMA,
    REMEDIES_SYSTEM_PROMPT,
    REMEDIES_RESPONSE_SCHEMA
} from '../constants';


const getAIClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not configured. Please set it up in your environment.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function generateNumerologyReport(userData: UserData): Promise<NumerologyReport> {
  const ai = getAIClient();
  const userPrompt = `Full Name: ${userData.fullName}\nDate of Birth: ${userData.dob}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from the AI service.");

    const reportData = JSON.parse(text.trim());
    if (!reportData.pythagorean || !reportData.chaldean || !reportData.pythagorean.calculations || !reportData.chaldean.interpretations) {
        throw new Error("Invalid report structure received from AI. Missing Pythagorean or Chaldean data.");
    }
    return reportData as NumerologyReport;
  } catch (error) {
    console.error("Error in generateNumerologyReport:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('API_KEY'))) {
        throw new Error("The API key is invalid or missing. Please check your configuration.");
    }
    throw new Error("Failed to generate numerology report. The AI service may be experiencing issues.");
  }
}

export async function getDailyReport(currentDate: string): Promise<DailyReportData> {
    const ai = getAIClient();
    const prompt = `Today's date is ${currentDate}.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: DAILY_REPORT_SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: DAILY_REPORT_RESPONSE_SCHEMA,
            },
        });
        
        const text = response.text;
        if (!text) throw new Error("No data returned from the AI service.");

        return JSON.parse(text.trim()) as DailyReportData;
    } catch (error) {
        console.error("Error in getDailyReport:", error);
        throw new Error("Failed to fetch the Daily Cosmic Pulse.");
    }
}

let chatInstance: Chat | null = null;
let lastReportContext: string | null = null;

function createChatSystemPrompt(report: NumerologyReport | null): string {
    if (!report) {
        return CHAT_SYSTEM_PROMPT;
    }

    const reportSummary = `
        The user you are chatting with has already generated their numerology report. Here are their key details:
        - Pythagorean Core Numbers:
          - Life Path: ${report.pythagorean.calculations.lifePath.number} (${report.pythagorean.interpretations.lifePath.title})
          - Destiny: ${report.pythagorean.calculations.destiny.number} (${report.pythagorean.interpretations.destiny.title})
          - Soul Urge: ${report.pythagorean.calculations.soulUrge.number} (${report.pythagorean.interpretations.soulUrge.title})
          - Personality: ${report.pythagorean.calculations.personality.number} (${report.pythagorean.interpretations.personality.title})
        - Chaldean Core Numbers:
          - Life Path: ${report.chaldean.calculations.lifePath.number} (${report.chaldean.interpretations.lifePath.title})
          - Destiny: ${report.chaldean.calculations.destiny.number} (${report.chaldean.interpretations.destiny.title})
          - Soul Urge: ${report.chaldean.calculations.soulUrge.number} (${report.chaldean.interpretations.soulUrge.title})
          - Personality: ${report.chaldean.calculations.personality.number} (${report.chaldean.interpretations.personality.title})
        - Summary: ${report.summary}
        
        Use this information to provide personalized and context-aware responses.
        Refer to their numbers when relevant to their questions.
    `;
    
    return `${CHAT_SYSTEM_PROMPT}\n\n--- User's Numerology Context ---\n${reportSummary.trim()}`;
}

async function getChatInstance(report: NumerologyReport | null): Promise<Chat> {
    const newContext = JSON.stringify(report ? report.summary : null);

    // If context has changed (new report generated or report cleared), reset the chat instance.
    if (newContext !== lastReportContext) {
        chatInstance = null;
        lastReportContext = newContext;
    }

    if (!chatInstance) {
        const ai = getAIClient();
        const systemInstruction = createChatSystemPrompt(report);
        chatInstance = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction,
                tools: [{
                    googleSearch: {}
                }],
            },
        });
    }
    return chatInstance;
}

export async function continueChat(history: ChatMessage[], report: NumerologyReport | null): Promise<{ text: string; sources?: { title: string; uri: string }[] }> {
    try {
        const chat = await getChatInstance(report);
        const lastUserMessage = history[history.length - 1];
        if (lastUserMessage.role !== 'user') {
            throw new Error("Last message must be from user to continue chat.");
        }
        
        const response = await chat.sendMessage({ message: lastUserMessage.text });
        
        const text = response.text;
        if (!text) throw new Error("No response text received from AI.");

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        const sources: { title: string; uri: string }[] = [];
        if (groundingChunks) {
            for (const chunk of groundingChunks) {
                if (chunk.web) {
                    sources.push({ title: chunk.web.title, uri: chunk.web.uri });
                }
            }
        }

        return { text, sources: sources.length > 0 ? sources : undefined };

    } catch (error) {
        console.error("Error in continueChat:", error);
        // In case of error, reset chat instance so it can be re-initialized on next message
        chatInstance = null;
        lastReportContext = null; 
        throw new Error("Failed to get a response from the AI assistant.");
    }
}


export async function generateProfileTraits(calculations: NumerologyCalculations): Promise<UserProfileData> {
    const ai = getAIClient();
    const prompt = `
        The user's core Pythagorean numbers are:
        - Life Path: ${calculations.lifePath.number}
        - Destiny: ${calculations.destiny.number}
        - Soul Urge: ${calculations.soulUrge.number}
        - Personality: ${calculations.personality.number}
        
        Based on these numbers, please derive their Cosmic Traits.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: PROFILE_SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: PROFILE_RESPONSE_SCHEMA,
            },
        });

        const text = response.text;
        if (!text) throw new Error("No data returned from the AI service.");

        return JSON.parse(text.trim()) as UserProfileData;
    } catch (error) {
        console.error("Error in generateProfileTraits:", error);
        throw new Error("Failed to generate personalized profile traits.");
    }
}

export async function generatePredictions(userData: UserData, year: number): Promise<PredictionsReport> {
    const ai = getAIClient();
    const prompt = `
        The user's date of birth is ${userData.dob}.
        The forecast year is ${year}.
        
        Please generate the Personal Year forecast based on the Pythagorean system.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: PREDICTIONS_SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: PREDICTIONS_RESPONSE_SCHEMA,
            },
        });
        
        const text = response.text;
        if (!text) throw new Error("No data returned from the AI service.");

        return JSON.parse(text.trim()) as PredictionsReport;
    } catch (error) {
        console.error("Error in generatePredictions:", error);
        throw new Error("Failed to generate yearly forecast.");
    }
}

export async function generateVastuReport(userData: UserData): Promise<VastuReport> {
    const ai = getAIClient();
    const prompt = `
        User Name: ${userData.fullName}
        Date of Birth: ${userData.dob}
        
        Generate a personalized Vastu Shastra report based on their numerology.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: VASTU_SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: VASTU_RESPONSE_SCHEMA,
            },
        });

        const text = response.text;
        if (!text) throw new Error("No data returned from Vastu service.");
        
        return JSON.parse(text.trim()) as VastuReport;
    } catch (error) {
        console.error("Error in generateVastuReport:", error);
        throw new Error("Failed to generate Vastu report.");
    }
}

export async function generateDetailedRemedies(userData: UserData): Promise<DetailedRemediesReport> {
    const ai = getAIClient();
    const prompt = `
        User Name: ${userData.fullName}
        Date of Birth: ${userData.dob}
        
        Generate a detailed set of Vedic and Numerological remedies for this user.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: REMEDIES_SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: REMEDIES_RESPONSE_SCHEMA,
            },
        });

        const text = response.text;
        if (!text) throw new Error("No data returned from Remedies service.");

        return JSON.parse(text.trim()) as DetailedRemediesReport;
    } catch (error) {
        console.error("Error in generateDetailedRemedies:", error);
        throw new Error("Failed to generate Remedies report.");
    }
}

export async function translateContent(data: any, targetLang: string, context: string): Promise<any> {
    const ai = getAIClient();
    const prompt = `
        You are a professional translator. 
        Translate the values of the following JSON ${context} into ${targetLang}.
        
        IMPORTANT INSTRUCTIONS:
        1. Keep the JSON structure EXACTLY the same.
        2. Do NOT translate object keys.
        3. ONLY translate the string values associated with these keys.
        4. If a value is a number or a date, keep it unchanged.
        5. For proper nouns (names), do not translate them unless common practice in the target language.
        6. Return ONLY the valid JSON string. No markdown, no code blocks.
        
        Data to translate:
        ${JSON.stringify(data)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) throw new Error("No data returned from translation service.");

        return JSON.parse(text.trim());
    } catch (error) {
        console.error("Error in translateContent:", error);
        throw new Error("Failed to translate content.");
    }
}
