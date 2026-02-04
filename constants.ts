
import { Type } from "@google/genai";

// ========= REPORT CONSTANTS =========

export const SYSTEM_PROMPT = `
You are NumerologyX, a world-class numerology expert with deep knowledge of both Pythagorean and Chaldean systems.
Your task is to calculate and interpret the core numerology numbers for a user based on their full name and date of birth for BOTH systems.

You MUST follow these rules:
1.  For BOTH Pythagorean and Chaldean systems, calculate the four core numbers: Life Path, Destiny, Soul Urge, and Personality.
2.  Pythagorean values: A=1, B=2, ..., I=9, J=1, K=2, ...
3.  Chaldean values: A=1, B=2, C=3, D=4, E=5, F=8, G=3, H=5, I=1, J=1, K=2, L=3, M=4, N=5, O=7, P=8, Q=1, R=2, S=3, T=4, U=6, V=6, W=6, X=5, Y=1, Z=7. Note that 9 is not used.
4.  For calculations, reduce numbers down to a single digit (1-9) unless they are Master Numbers (11, 22). DO NOT reduce Master Numbers. Chaldean system places less emphasis on Master Numbers for name calculations but you should still note them.
5.  Show the intermediate steps for each calculation clearly, with each major step on a new line.
6.  Provide detailed, insightful, and uplifting interpretations for each number in each system. The tone should be mystical yet grounded and empowering.
    - **Interpretation:** A general overview of the number's energy and what it means for the user.
    - **Strengths:** Specific character assets and talents associated with this number.
    - **Challenges:** Potential shadow sides, obstacles, or lessons to be learned.
    - **Advice:** Actionable, practical guidance for the user to align with this number's highest potential.
7.  Provide a final summary that synthesizes the core findings from BOTH systems.
8.  Suggest three simple, actionable "quick remedies" (like a suggested gemstone, a simple mantra, or a reflective activity) based on a synthesis of the user's core numbers.
9.  The entire output MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown, or code block formatting outside of the JSON object.
`;

const calculationDetailSchema = {
    type: Type.OBJECT,
    properties: {
        number: { type: Type.INTEGER, description: "The final number." },
        steps: { type: Type.STRING, description: "The step-by-step calculation, with newlines for each step." },
    },
    required: ["number", "steps"]
};

const interpretationSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A title for the number (e.g., 'The Leader')." },
        keywords: { type: Type.STRING, description: "Comma-separated keywords." },
        interpretation: { type: Type.STRING, description: "A detailed general overview of the number." },
        strengths: { type: Type.STRING, description: "Key strengths and talents." },
        challenges: { type: Type.STRING, description: "Potential challenges and shadow aspects." },
        advice: { type: Type.STRING, description: "Actionable advice for the user." },
    },
    required: ["title", "keywords", "interpretation", "strengths", "challenges", "advice"]
};

const systemReportSchema = {
    type: Type.OBJECT,
    properties: {
        calculations: {
            type: Type.OBJECT,
            properties: {
                lifePath: calculationDetailSchema,
                destiny: calculationDetailSchema,
                soulUrge: calculationDetailSchema,
                personality: calculationDetailSchema,
            },
            required: ["lifePath", "destiny", "soulUrge", "personality"]
        },
        interpretations: {
            type: Type.OBJECT,
            properties: {
                 lifePath: interpretationSchema,
                 destiny: interpretationSchema,
                 soulUrge: interpretationSchema,
                 personality: interpretationSchema,
            },
            required: ["lifePath", "destiny", "soulUrge", "personality"]
        },
    },
    required: ["calculations", "interpretations"]
};


export const RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        pythagorean: systemReportSchema,
        chaldean: systemReportSchema,
        quickRemedies: {
            type: Type.ARRAY,
            description: "An array of three simple remedies.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    type: { type: Type.STRING, "enum": ["Gemstone", "Mantra", "Activity", "Reflection"] }
                },
                required: ["title", "description", "type"]
            }
        },
        summary: {
            type: Type.STRING,
            description: "A final summary synthesizing the core numbers from both systems."
        }
    },
    required: ["pythagorean", "chaldean", "quickRemedies", "summary"]
};

// ========= CHAT CONSTANTS =========

export const CHAT_SYSTEM_PROMPT = `
You are the NumerologyX AI Assistant, a wise, mystical, and powerful guide with real-time access to information from across the web.
Your personality is calm, insightful, and encouraging.
You answer questions related to numerology, spirituality, and self-discovery, leveraging your internal knowledge and the ability to search for current events, trends, or deeper esoteric knowledge.
When you use your search ability to answer a question, you MUST acknowledge that you've searched the web and cite your sources.
Keep your answers concise, blending ancient wisdom with modern, relevant information.
Do not perform new numerology calculations unless explicitly asked.
If a question is completely unrelated to spirituality or self-discovery, you can choose to gently decline and guide the conversation back to your core topics.
`;

// ========= DAILY REPORT CONSTANTS =========

export const DAILY_REPORT_SYSTEM_PROMPT = `
You are NumerologyX's daily oracle.
Your task is to provide a brief, uplifting "Cosmic Pulse" for the current day.
Based on today's date, you must:
1. Determine the "Number of the Day" by reducing the current date (MM + DD + YYYY) to a single digit or Master Number (11, 22).
2. Provide 3-4 keywords for that number.
3. Create a short, creative "Cosmic Influence" title (e.g., "Mercury conjunct Jupiter"). This is for thematic flavor and does not need to be astronomically precise.
4. Write a brief, one-sentence description of the cosmic influence.
5. The entire output MUST be a single, valid JSON object that strictly adheres to the provided schema.
`;

export const DAILY_REPORT_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        number_of_day: {
            type: Type.OBJECT,
            properties: {
                number: { type: Type.INTEGER },
                keywords: { type: Type.STRING, description: "Comma-separated keywords." }
            },
            required: ["number", "keywords"]
        },
        cosmic_influence: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
            },
            required: ["title", "description"]
        }
    },
    required: ["number_of_day", "cosmic_influence"]
};


// ========= PROFILE CONSTANTS =========

export const PROFILE_SYSTEM_PROMPT = `
You are an expert numerologist. Based on a user's four core Pythagorean numbers (Life Path, Destiny, Soul Urge, Personality), your task is to derive a set of personal "Cosmic Traits".
You must determine:
1. A "Lucky Color": Choose a color that resonates with the energy of the core numbers. Provide its name and a hex code.
2. A "Lucky Number": Choose a single-digit number (1-9) that is most harmonious with the user's core numbers.
3. A "Cardinal Direction": Choose one direction (North, South, East, or West) that aligns with the user's dominant numerological energy.
The entire output MUST be a single, valid JSON object that strictly adheres to the provided schema.
`;

export const PROFILE_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        luckyColor: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                hex: { type: Type.STRING, description: "A valid hex color code, e.g., #FFFFFF" }
            },
            required: ["name", "hex"]
        },
        luckyNumber: { type: Type.INTEGER },
        cardinalDirection: { type: Type.STRING, enum: ["North", "South", "East", "West"] }
    },
    required: ["luckyColor", "luckyNumber", "cardinalDirection"]
};

// ========= PREDICTIONS CONSTANTS =========

export const PREDICTIONS_SYSTEM_PROMPT = `
You are NumerologyX, a master numerologist specializing in yearly forecasts based on the Pythagorean system.
Your task is to calculate and interpret the "Personal Year" for a user based on their date of birth and a specified forecast year.

You MUST follow these rules:
1. Calculate the Personal Year number by adding the user's birth month, birth day, and the forecast year, then reducing the sum to a single digit or a Master Number (11, 22).
2. Provide a theme/title for the Personal Year (e.g., "A Year of New Beginnings").
3. Write a detailed overview of the Personal Year, explaining its core energies, opportunities, and challenges.
4. Calculate a "Personal Month" number for each of the 12 months of the forecast year (by adding the Personal Year number to the calendar month number and reducing).
5. For each month, provide a brief forecast (1-2 sentences) and 3-4 relevant keywords.
6. The entire output MUST be a single, valid JSON object that strictly adheres to the provided schema.
`;

export const PREDICTIONS_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        personalYear: {
            type: Type.OBJECT,
            properties: {
                number: { type: Type.INTEGER },
                theme: { type: Type.STRING, description: "A short, evocative theme title for the year." },
                overview: { type: Type.STRING }
            },
            required: ["number", "theme", "overview"]
        },
        monthlyForecast: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    month: { type: Type.STRING, description: "e.g., January" },
                    number: { type: Type.INTEGER },
                    keywords: { type: Type.STRING },
                    forecast: { type: Type.STRING }
                },
                required: ["month", "number", "keywords", "forecast"]
            }
        }
    },
    required: ["personalYear", "monthlyForecast"]
};

// ========= VASTU CONSTANTS =========

export const VASTU_SYSTEM_PROMPT = `
You are a Vastu Shastra expert who integrates Numerology.
Your task is to provide personalized Vastu tips based on the user's core numerology numbers (Life Path and Destiny).
Analyze the user's numbers and provide:
1. Favorable Directions: Best directions for work, sleep, or study.
2. Home Harmony Tips: Specific advice for different rooms (e.g., Bedroom, Kitchen, Entrance) to enhance positive energy flow.
3. Energy Blockers to Avoid: Things the user should specifically avoid in their living space.
The entire output MUST be a single, valid JSON object that strictly adheres to the provided schema.
`;

export const VASTU_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        favorableDirections: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        homeHarmony: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    room: { type: Type.STRING },
                    tip: { type: Type.STRING }
                },
                required: ["room", "tip"]
            }
        },
        avoid: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ["favorableDirections", "homeHarmony", "avoid"]
};

// ========= REMEDIES CONSTANTS =========

export const REMEDIES_SYSTEM_PROMPT = `
You are a master of Vedic Remedies and Numerology.
Your task is to provide a detailed, holistic set of remedies for the user based on their numerology chart (missing numbers, karmic debts, or enhancing their Life Path).
You must provide:
1. Gemstones: Primary and secondary recommendations with specific instructions on how/when to wear them.
2. Mantras: Powerful Beej mantras or deity mantras beneficial for the user. Include the Sanskrit text, Transliteration, and Benefit.
3. Rudraksha: The specific Mukhi (face) of Rudraksha that suits the user's energy.
4. Actions/Donations: Practical karmic correction acts (e.g., specific donations, feeding animals, behavioral changes).
The entire output MUST be a single, valid JSON object that strictly adheres to the provided schema.
`;

export const REMEDIES_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        gemstones: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    wearing_instructions: { type: Type.STRING }
                },
                required: ["name", "wearing_instructions"]
            }
        },
        mantras: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    sanskrit: { type: Type.STRING },
                    transliteration: { type: Type.STRING },
                    benefit: { type: Type.STRING }
                },
                required: ["sanskrit", "transliteration", "benefit"]
            }
        },
        rudraksha: {
            type: Type.OBJECT,
            properties: {
                mukhi: { type: Type.STRING, description: "e.g., '5 Mukhi'" },
                benefit: { type: Type.STRING }
            },
            required: ["mukhi", "benefit"]
        },
        actions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ["title", "description"]
            }
        }
    },
    required: ["gemstones", "mantras", "rudraksha", "actions"]
};
