
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { NumerologyForm } from './components/NumerologyForm';
import { ReportDisplay } from './components/ReportDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import DailyReport from './components/DailyReport';
import Predictions from './components/Predictions';
import Chat from './components/Chat';
import UserProfile from './components/UserProfile';
import type { NumerologyReport, UserData, View, ChatMessage, UserProfileData, PredictionsReport } from './types';
import { generateNumerologyReport, generateProfileTraits, continueChat, generatePredictions } from './services/geminiService';
import { soundService } from './services/soundService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('report');
  const [viewTransitionKey, setViewTransitionKey] = useState(Date.now());

  // Report State
  const [report, setReport] = useState<NumerologyReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Profile State
  const [profileTraits, setProfileTraits] = useState<UserProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Predictions State
  const [predictions, setPredictions] = useState<PredictionsReport | null>(null);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState<boolean>(false);
  const [predictionsError, setPredictionsError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedReportJSON = localStorage.getItem('numerology_report');
      const savedUserDataJSON = localStorage.getItem('numerology_user_data');
      const savedProfileTraitsJSON = localStorage.getItem('numerology_profile_traits');
      const savedPredictionsJSON = localStorage.getItem('predictions_report');

      if (savedReportJSON && savedUserDataJSON) {
        const savedReport: NumerologyReport = JSON.parse(savedReportJSON);
        const savedUserData: UserData = JSON.parse(savedUserDataJSON);
        setReport(savedReport);
        setUserData(savedUserData);

        if (savedProfileTraitsJSON) {
          const savedProfileTraits: UserProfileData = JSON.parse(savedProfileTraitsJSON);
          setProfileTraits(savedProfileTraits);
        }
        if (savedPredictionsJSON) {
          const savedPredictions: PredictionsReport = JSON.parse(savedPredictionsJSON);
          setPredictions(savedPredictions);
        }
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
      // Clear potentially corrupted data
      localStorage.removeItem('numerology_report');
      localStorage.removeItem('numerology_user_data');
      localStorage.removeItem('numerology_profile_traits');
      localStorage.removeItem('predictions_report');
    }
  }, []);


  const handleCalculate = useCallback(async (newUserData: UserData) => {
    setIsLoadingReport(true);
    setReportError(null);
    setReport(null);
    setProfileTraits(null);
    setPredictions(null); // Clear old predictions
    localStorage.removeItem('predictions_report'); // Also clear from storage
    setUserData(newUserData);
    setChatMessages([]); // Reset chat when a new report is generated

    try {
      const generatedReport = await generateNumerologyReport(newUserData);
      setReport(generatedReport);
      soundService.playSuccess();
      
      // After report is generated, fetch profile traits based on Pythagorean calculations
      setIsLoadingProfile(true);
      try {
        const traits = await generateProfileTraits(generatedReport.pythagorean.calculations);
        setProfileTraits(traits);
        // Save all data to local storage on complete success
        localStorage.setItem('numerology_report', JSON.stringify(generatedReport));
        localStorage.setItem('numerology_user_data', JSON.stringify(newUserData));
        localStorage.setItem('numerology_profile_traits', JSON.stringify(traits));
      } catch (profileErr) {
        // Handle profile-specific error gracefully, the main report is still visible
        console.error("Could not generate profile traits:", profileErr);
        localStorage.removeItem('numerology_profile_traits'); // Clear any old traits
      } finally {
        setIsLoadingProfile(false);
      }

    } catch (err) {
      console.error(err);
      setReportError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      // Clear storage on error
      localStorage.removeItem('numerology_report');
      localStorage.removeItem('numerology_user_data');
      localStorage.removeItem('numerology_profile_traits');
      localStorage.removeItem('predictions_report');
    } finally {
      setIsLoadingReport(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setReport(null);
    setReportError(null);
    setIsLoadingReport(false);
    setUserData(null);
    setProfileTraits(null);
    setPredictions(null);
    setPredictionsError(null);
    setChatMessages([]); // Reset chat
    // Clear from localStorage
    localStorage.removeItem('numerology_report');
    localStorage.removeItem('numerology_user_data');
    localStorage.removeItem('numerology_profile_traits');
    localStorage.removeItem('predictions_report');
    soundService.playClick();
  }, []);
  
  const handleGeneratePredictions = useCallback(async (year: number) => {
    if (!userData) {
      setPredictionsError("User data not found. Please generate a report first.");
      return;
    }
    setIsLoadingPredictions(true);
    setPredictionsError(null);
    setPredictions(null);
    localStorage.removeItem('predictions_report'); // Clear old predictions

    try {
      const result = await generatePredictions(userData, year);
      setPredictions(result);
      localStorage.setItem('predictions_report', JSON.stringify(result));
      soundService.playSuccess();
    } catch (err) {
      setPredictionsError(err instanceof Error ? err.message : "Failed to generate predictions.");
    } finally {
      setIsLoadingPredictions(false);
    }
  }, [userData]);


  const handleSendMessage = useCallback(async (message: string) => {
    soundService.playSend();
    const newUserMessage: ChatMessage = { role: 'user', text: message };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      const response = await continueChat([...chatMessages, newUserMessage], report);
      soundService.playReceive();
      const newModelMessage: ChatMessage = { 
        role: 'model', 
        text: response.text,
        sources: response.sources
      };
      setChatMessages(prev => [...prev, newModelMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again." };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatMessages, report]);

  const handleViewChange = (view: View) => {
    setActiveView(view);
    setViewTransitionKey(Date.now());
  };
  
  const content = useMemo(() => {
    switch (activeView) {
      case 'report':
        return (
          <div className="w-full">
            {report ? (
              <ReportDisplay report={report} onReset={handleReset} />
            ) : (
              <NumerologyForm 
                onCalculate={handleCalculate} 
                isLoading={isLoadingReport}
                error={reportError}
                onClearError={() => setReportError(null)}
              />
            )}
          </div>
        );
      case 'daily':
        return <DailyReport />;
      case 'predictions':
        return (
            <Predictions 
                userData={userData}
                predictions={predictions}
                isLoading={isLoadingPredictions}
                error={predictionsError}
                onGenerate={handleGeneratePredictions}
            />
        );
      case 'chat':
        return <Chat messages={chatMessages} onSendMessage={handleSendMessage} isLoading={isChatLoading} />;
      case 'profile':
        return <UserProfile report={report} userData={userData} profileTraits={profileTraits} isLoading={isLoadingProfile} />;
      default:
        return null;
    }
  }, [activeView, report, handleReset, handleCalculate, isLoadingReport, reportError, chatMessages, handleSendMessage, isChatLoading, userData, predictions, isLoadingPredictions, predictionsError, handleGeneratePredictions, profileTraits, isLoadingProfile]);

  return (
    <div className="min-h-screen text-white flex flex-col items-center">
      <Header />
      <main key={viewTransitionKey} className="w-full max-w-2xl mx-auto px-4 pt-20 pb-40 flex-grow animate-fade-in">
        {content}
      </main>
      <Footer />
      <BottomNav activeView={activeView} setActiveView={handleViewChange} />
    </div>
  );
};

export default App;
    