import { GoogleGenAI, Chat } from "@google/genai";
import type { UserData, NumerologyReport, NumerologyCalculations, ChatMessage, DailyReportData, UserProfileData, PredictionsReport, SystemReport } from '../types';
import { 
    SYSTEM_PROMPT, 
    RESPONSE_SCHEMA, 
    CHAT_SYSTEM_PROMPT,
    DAILY_REPORT_SYSTEM_PROMPT,
    DAILY_REPORT_RESPONSE_SCHEMA,
    PROFILE_SYSTEM_PROMPT,
    PROFILE_RESPONSE_SCHEMA,
    PREDICTIONS_SYSTEM_PROMPT,
    PREDICTIONS_RESPONSE_SCHEMA
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

    const reportData = JSON.parse(response.text.trim());
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
        return JSON.parse(response.text.trim()) as DailyReportData;
    } catch (error) {
        console.error("Error in getDailyReport:", error);
        throw new Error("Failed to fetch the Daily Cosmic Pulse.");
    }
}

let chatInstance: Chat | null = null;

async function getChatInstance(): Promise<Chat> {
    if (!chatInstance) {
        const ai = getAIClient();
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: CHAT_SYSTEM_PROMPT,
            },
        });
    }
    return chatInstance;
}

export async function continueChat(history: ChatMessage[]): Promise<string> {
    try {
        const chat = await getChatInstance();
        // The Gemini Chat API expects only the most recent user message.
        // The history is maintained within the chat instance itself.
        const lastUserMessage = history[history.length - 1];
        if (lastUserMessage.role !== 'user') {
            throw new Error("Last message must be from user to continue chat.");
        }
        
        const response = await chat.sendMessage({ message: lastUserMessage.text });
        return response.text;
    } catch (error) {
        console.error("Error in continueChat:", error);
        // In case of error, reset chat instance
        chatInstance = null; 
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
        return JSON.parse(response.text.trim()) as UserProfileData;
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
        return JSON.parse(response.text.trim()) as PredictionsReport;
    } catch (error) {
        console.error("Error in generatePredictions:", error);
        throw new Error("Failed to generate yearly forecast.");
    }
}