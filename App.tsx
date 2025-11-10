import React, { useState, useCallback, useMemo } from 'react';
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


  const handleCalculate = useCallback(async (newUserData: UserData) => {
    setIsLoadingReport(true);
    setReportError(null);
    setReport(null);
    setProfileTraits(null);
    setPredictions(null); // Clear old predictions
    setUserData(newUserData);

    try {
      const generatedReport = await generateNumerologyReport(newUserData);
      setReport(generatedReport);
      
      // After report is generated, fetch profile traits based on Pythagorean calculations
      setIsLoadingProfile(true);
      try {
        const traits = await generateProfileTraits(generatedReport.pythagorean.calculations);
        setProfileTraits(traits);
      } catch (profileErr) {
        // Handle profile-specific error gracefully, the main report is still visible
        console.error("Could not generate profile traits:", profileErr);
      } finally {
        setIsLoadingProfile(false);
      }

    } catch (err) {
      console.error(err);
      setReportError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
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
  }, []);
  
  const handleGeneratePredictions = useCallback(async (year: number) => {
    if (!userData) {
      setPredictionsError("User data not found. Please generate a report first.");
      return;
    }
    setIsLoadingPredictions(true);
    setPredictionsError(null);
    setPredictions(null);

    try {
      const result = await generatePredictions(userData, year);
      setPredictions(result);
    } catch (err) {
      setPredictionsError(err instanceof Error ? err.message : "Failed to generate predictions.");
    } finally {
      setIsLoadingPredictions(false);
    }
  }, [userData]);


  const handleSendMessage = useCallback(async (message: string) => {
    const newUserMessage: ChatMessage = { role: 'user', text: message };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      const responseText = await continueChat([...chatMessages, newUserMessage]);
      const newModelMessage: ChatMessage = { role: 'model', text: responseText };
      setChatMessages(prev => [...prev, newModelMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again." };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatMessages]);

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
  }, [activeView, report, handleReset, handleCalculate, isLoadingReport, reportError, chatMessages, handleSendMessage, isChatLoading, userData, profileTraits, isLoadingProfile, predictions, isLoadingPredictions, predictionsError, handleGeneratePredictions]);
  
  const showVerticalCenter = (activeView === 'report' && !report) || (activeView === 'predictions' && !userData);

  return (
    <div className="h-screen text-white font-sans bg-gray-900">
      <Header />
      <main className="h-full overflow-y-auto pt-20 pb-40">
        <div className={`w-full max-w-2xl mx-auto flex flex-col min-h-full p-4 sm:p-6 lg:p-8 ${showVerticalCenter ? 'justify-center' : ''}`}>
            <div key={viewTransitionKey} className="animate-fade-in w-full">
              {content}
            </div>
        </div>
      </main>
      <Footer />
      <BottomNav activeView={activeView} setActiveView={handleViewChange} />
    </div>
  );
};

export default App;