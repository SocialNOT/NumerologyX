export interface UserData {
  fullName: string;
  dob: string;
}

export type View = 'report' | 'daily' | 'predictions' | 'chat' | 'profile';

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
        theme: string;
        overview: string;
    };
    monthlyForecast: PredictionMonth[];
}