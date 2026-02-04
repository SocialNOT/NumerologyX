
import React, { useState, useCallback, useEffect } from 'react';
import { NumerologyForm } from './components/NumerologyForm';
import { ReportDisplay } from './components/ReportDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { Forecast } from './components/Forecast';
import { VastuDisplay } from './components/VastuDisplay';
import { RemediesDisplay } from './components/RemediesDisplay';
import Chat from './components/Chat';
import UserProfile from './components/UserProfile';
import { Dashboard } from './components/Dashboard'; 
import { LoadingSpinner } from './components/LoadingSpinner';

import type { NumerologyReport, UserData, View, ChatMessage, UserProfileData, PredictionsReport, VastuReport, DetailedRemediesReport } from './types';
import { 
    generateNumerologyReport, 
    generateProfileTraits, 
    continueChat, 
    generatePredictions, 
    generateVastuReport, 
    generateDetailedRemedies 
} from './services/geminiService';
import { soundService } from './services/soundService';
import { getDayName, injectThemeVariables, DayName } from './utils/theme';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View | 'dashboard'>('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  
  // Theme State
  const [currentDay, setCurrentDay] = useState<DayName>('Sunday');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Core Data State
  const [report, setReport] = useState<NumerologyReport | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileTraits, setProfileTraits] = useState<UserProfileData | null>(null);

  // Loading States
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Predictions State
  const [predictions, setPredictions] = useState<PredictionsReport | null>(null);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState<boolean>(false);
  const [predictionsError, setPredictionsError] = useState<string | null>(null);

  // Vastu & Remedies State
  const [vastuReport, setVastuReport] = useState<VastuReport | null>(null);
  const [remediesReport, setRemediesReport] = useState<DetailedRemediesReport | null>(null);
  const [isLoadingVastu, setIsLoadingVastu] = useState(false);
  const [isLoadingRemedies, setIsLoadingRemedies] = useState(false);

  // Initialization & Theme Logic
  useEffect(() => {
    // 1. Set Day
    const day = getDayName();
    setCurrentDay(day);

    // 2. Load Data
    try {
      const savedReportJSON = localStorage.getItem('numerology_report');
      const savedUserDataJSON = localStorage.getItem('numerology_user_data');
      if (savedReportJSON && savedUserDataJSON) {
        setReport(JSON.parse(savedReportJSON));
        setUserData(JSON.parse(savedUserDataJSON));
      }
    } catch (error) {
      console.error("Failed to load data", error);
    }
  }, []);

  // Effect to apply theme variables whenever day or mode changes
  useEffect(() => {
    injectThemeVariables(currentDay, isDarkMode);
  }, [currentDay, isDarkMode]);

  const toggleThemeMode = () => {
      setIsDarkMode(prev => !prev);
      soundService.playClick();
  };

  const handleCalculate = useCallback(async (newUserData: UserData) => {
    setIsLoadingReport(true);
    setReportError(null);
    setReport(null);
    setProfileTraits(null);
    setPredictions(null);
    setVastuReport(null);
    setRemediesReport(null);
    setChatMessages([]);
    setUserData(newUserData);

    try {
      const generatedReport = await generateNumerologyReport(newUserData);
      setReport(generatedReport);
      localStorage.setItem('numerology_report', JSON.stringify(generatedReport));
      localStorage.setItem('numerology_user_data', JSON.stringify(newUserData));
      soundService.playSuccess();
      setShowFormModal(false);
      setActiveView('report');
      
      setIsLoadingProfile(true);
      generateProfileTraits(generatedReport.pythagorean.calculations).then(traits => {
          setProfileTraits(traits);
          localStorage.setItem('numerology_profile_traits', JSON.stringify(traits));
          setIsLoadingProfile(false);
      });

    } catch (err) {
      console.error(err);
      setReportError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoadingReport(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setReport(null);
    setUserData(null);
    setProfileTraits(null);
    setPredictions(null);
    setVastuReport(null);
    setRemediesReport(null);
    setChatMessages([]);
    localStorage.clear();
    soundService.playClick();
    setShowProfileModal(false);
    setActiveView('dashboard');
  }, []);

  const handleGeneratePredictions = useCallback(async (year: number) => {
      if (!userData) return;
      setIsLoadingPredictions(true);
      try {
        const result = await generatePredictions(userData, year);
        setPredictions(result);
        soundService.playSuccess();
      } catch (err) {
        setPredictionsError(err instanceof Error ? err.message : "Failed.");
      } finally { setIsLoadingPredictions(false); }
  }, [userData]);

  const handleSendMessage = useCallback(async (message: string) => {
    soundService.playSend();
    const newUserMessage: ChatMessage = { role: 'user', text: message };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);
    try {
      const response = await continueChat([...chatMessages, newUserMessage], report);
      soundService.playReceive();
      setChatMessages(prev => [...prev, { role: 'model', text: response.text, sources: response.sources }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Connection error." }]);
    } finally { setIsChatLoading(false); }
  }, [chatMessages, report]);


  const renderMainContent = () => {
      if (activeView === 'dashboard') {
          return <Dashboard onUnlock={() => setShowFormModal(true)} isDarkMode={isDarkMode} />;
      }
      
      if (!userData) {
          return (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <h2 className="text-xl font-bold text-theme-500">Access Restricted</h2>
                  <p className="text-txt-muted mb-4">You need to unlock your destiny first.</p>
                  <button onClick={() => setShowFormModal(true)} className="px-6 py-2 bg-theme-600 rounded-full text-white shadow-lg hover:bg-theme-500 transition">Unlock Now</button>
              </div>
          );
      }

      switch (activeView) {
        case 'report': return report ? <ReportDisplay report={report} userData={userData} onReset={handleReset} /> : <LoadingSpinner />;
        case 'forecast': return <Forecast userData={userData} predictions={predictions} isLoadingPredictions={isLoadingPredictions} predictionsError={predictionsError} onGeneratePredictions={handleGeneratePredictions} />;
        case 'vastu': return (!vastuReport && !isLoadingVastu) ? <div className="text-center p-8"><button onClick={() => generateVastuReport(userData!).then(setVastuReport)} className="px-6 py-2 bg-theme-600 rounded-full text-white">Load Vastu</button></div> : (vastuReport ? <VastuDisplay report={vastuReport} userData={userData} /> : <LoadingSpinner />);
        case 'remedies': return (!remediesReport && !isLoadingRemedies) ? <div className="text-center p-8"><button onClick={() => generateDetailedRemedies(userData!).then(setRemediesReport)} className="px-6 py-2 bg-theme-600 rounded-full text-white">Load Remedies</button></div> : (remediesReport ? <RemediesDisplay report={remediesReport} userData={userData} /> : <LoadingSpinner />);
        case 'chat': return <Chat messages={chatMessages} onSendMessage={handleSendMessage} isLoading={isChatLoading} />;
        default: return null;
      }
  };

  return (
    <div className={`h-screen w-full flex flex-col bg-bg-main overflow-hidden relative font-sans transition-colors duration-500`}>
      
      {/* Dynamic Background Pattern */}
      <div className={`absolute inset-0 z-0 pointer-events-none bg-grid-pattern opacity-20`}></div>
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-theme-500 to-transparent opacity-50 animate-border-flow z-0 pointer-events-none"></div>

      {/* HEADER */}
      <div className="flex-shrink-0 z-50">
          <Header onOpenProfile={() => setShowProfileModal(true)} isDarkMode={isDarkMode} toggleTheme={toggleThemeMode} />
      </div>

      {/* BODY LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative z-10">
          
          {/* Sidebar (Desktop) */}
          <aside className="hidden md:flex w-20 lg:w-64 flex-col border-r border-theme-500/20 bg-bg-card backdrop-blur-sm p-4 gap-4 transition-colors">
              <div className="text-xs font-bold text-txt-muted uppercase tracking-widest mb-2 lg:block hidden">Navigation</div>
              {['dashboard', 'report', 'forecast', 'vastu', 'remedies', 'chat'].map(view => (
                   <button 
                    key={view}
                    onClick={() => setActiveView(view as any)}
                    className={`text-left px-4 py-3 rounded-xl transition-all ${activeView === view ? 'bg-theme-500/10 text-theme-500 border border-theme-500/30' : 'text-txt-muted hover:text-txt-main hover:bg-bg-hover'}`}
                   >
                       <span className="capitalize">{view}</span>
                   </button>
              ))}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-theme-500/30 scrollbar-track-transparent p-4 pb-24 md:pb-4 relative">
             <div className="max-w-6xl mx-auto h-full">
                 {renderMainContent()}
             </div>
          </main>

          {/* Right Sidebar (Desktop) */}
          <aside className="hidden lg:flex w-72 flex-col border-l border-theme-500/20 bg-bg-card backdrop-blur-sm p-6 transition-colors">
               <h3 className="text-sm font-bold text-theme-500 uppercase tracking-widest mb-4">Cosmic Status</h3>
               <div className="space-y-4">
                   <div className="p-4 rounded-xl bg-bg-hover border border-theme-500/10">
                       <p className="text-xs text-txt-muted">Current Influence</p>
                       <div className="flex items-center gap-2 mt-1">
                           <div className="w-2 h-2 rounded-full bg-theme-500 animate-pulse"></div>
                           <span className="text-sm font-bold text-txt-main">{currentDay} Energy</span>
                       </div>
                   </div>
                   {userData && (
                       <div className="p-4 rounded-xl bg-gradient-to-br from-theme-900/10 to-transparent border border-theme-500/20">
                           <p className="text-xs text-txt-muted">Active Soul</p>
                           <p className="font-bold text-txt-main mt-1">{userData.fullName}</p>
                       </div>
                   )}
               </div>
          </aside>
      </div>

      {/* Mobile Footer Nav */}
      <div className="md:hidden flex-shrink-0 z-50">
          <BottomNav activeView={activeView === 'dashboard' ? 'report' : activeView as View} setActiveView={(v) => setActiveView(v)} />
      </div>

      {/* Modals */}
      {showFormModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="w-full max-w-md relative">
                  <button onClick={() => setShowFormModal(false)} className="absolute -top-12 right-0 text-white/50 hover:text-white">Close [x]</button>
                  <NumerologyForm 
                    onCalculate={handleCalculate} 
                    isLoading={isLoadingReport} 
                    error={reportError} 
                    onClearError={() => setReportError(null)} 
                  />
              </div>
          </div>
      )}

      {showProfileModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
             <div className="w-full max-w-lg bg-bg-card border border-theme-500/20 rounded-2xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl shadow-theme-500/10">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-txt-main">Soul Profile</h2>
                     <button onClick={() => setShowProfileModal(false)} className="text-txt-muted hover:text-txt-main">Close</button>
                 </div>
                 <UserProfile report={report} userData={userData} profileTraits={profileTraits} isLoading={isLoadingProfile} />
                 <div className="mt-8 text-center pt-4 border-t border-theme-500/10">
                    <button onClick={handleReset} className="text-red-400 hover:text-red-300 text-sm font-semibold px-4 py-2 border border-red-400/30 rounded-lg hover:bg-red-900/20 transition-colors">
                        Reset All System Data
                    </button>
                </div>
             </div>
          </div>
      )}

    </div>
  );
};

export default App;
