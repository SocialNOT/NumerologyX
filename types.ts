
export interface UserData {
  fullName: string;
  dob: string;
}

export type View = 'report' | 'forecast' | 'vastu' | 'remedies' | 'chat';

export interface CalculationDetail {
  number: number;
  steps: string;
}

export interface NumerologyCalculations {
  lifePath: CalculationDetail;
  destiny: CalculationDetail;
  soulUrge: CalculationDetail;
  personality: CalculationDetail;
}

export interface Interpretation {
  title: string;
  keywords: string;
  interpretation: string;
  strengths?: string;
  challenges?: string;
  advice?: string;
}

export interface NumerologyInterpretations {
  lifePath: Interpretation;
  destiny: Interpretation;
  soulUrge: Interpretation;
  personality: Interpretation;
}

export interface Remedy {
  title: string;
  description: string;
  type: 'Gemstone' | 'Mantra' | 'Activity' | 'Reflection';
}

export interface SystemReport {
    calculations: NumerologyCalculations;
    interpretations: NumerologyInterpretations;
}

export interface NumerologyReport {
  pythagorean: SystemReport;
  chaldean: SystemReport;
  quickRemedies: Remedy[];
  summary: string;
}

// For Chat Module
export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    sources?: { title: string; uri: string }[];
}

// For Daily Report Module
export interface DailyReportData {
    number_of_day: {
        number: number;
        keywords: string;
    };
    cosmic_influence: {
        title: string;
        description: string;
    };
}

// For User Profile Module
export interface UserProfileData {
    luckyColor: {
        name: string;
        hex: string;
    };
    luckyNumber: number;
    cardinalDirection: string;
}

// For Predictions Module
export interface PredictionMonth {
    month: string;
    number: number;
    keywords: string;
    forecast: string;
}

export interface PredictionsReport {
    personalYear: {
        number: number;
        /** A short, evocative theme title for the year */
        theme: string;
        overview: string;
    };
    monthlyForecast: PredictionMonth[];
}

// For Vastu Module
export interface VastuReport {
    favorableDirections: string[];
    homeHarmony: {
        room: string;
        tip: string;
    }[];
    avoid: string[];
}

// For Remedies Module
export interface DetailedRemediesReport {
    gemstones: {
        name: string;
        wearing_instructions: string;
    }[];
    mantras: {
        sanskrit: string;
        transliteration: string;
        benefit: string;
    }[];
    rudraksha: {
        mukhi: string;
        benefit: string;
    };
    actions: {
        title: string;
        description: string;
    }[];
}
