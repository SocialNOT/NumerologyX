
import React, { useState, useEffect } from 'react';
import { TranslateIcon } from './icons/TranslateIcon';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { StopIcon } from './icons/StopIcon';
import { ShareIcon } from './icons/ShareIcon';
import { soundService } from '../services/soundService';

interface ReportActionsProps {
    onTranslate: (lang: string) => void;
    currentLanguage: string;
    isTranslating: boolean;
    textToCopy: string;
    textToDownload: string;
    textToSpeak: string;
    filename: string;
}

export const ReportActions: React.FC<ReportActionsProps> = ({ 
    onTranslate, 
    currentLanguage, 
    isTranslating, 
    textToCopy, 
    textToDownload,
    textToSpeak,
    filename
}) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // Speech Synthesis
    const speak = () => {
        if (!window.speechSynthesis) return;
        
        // Cancel any current speech
        window.speechSynthesis.cancel();
        
        if (isSpeaking) {
            setIsSpeaking(false);
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // Map language codes to BCP 47 tags for speech synthesis
        let langTag = 'en-US';
        if (currentLanguage === 'hi') langTag = 'hi-IN';
        if (currentLanguage === 'bn') langTag = 'bn-IN';
        
        utterance.lang = langTag;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        soundService.playSelect();
    };

    // Clean up speech on unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        soundService.playSuccess();
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        soundService.playSelect();
        
        const shareData = {
            title: filename.replace(/_/g, ' ').replace('.txt', ''),
            text: textToCopy,
        };

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.debug('Share failed or cancelled', err);
            }
        } else {
            // Fallback to copy behavior if share is not supported
            handleCopy();
        }
    };

    const handleDownload = () => {
        soundService.playSelect();
        const element = document.createElement("a");
        const file = new Blob([textToDownload], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value;
        if (lang !== currentLanguage) {
            soundService.playProcessing();
            onTranslate(lang);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 mt-6 animate-fade-in-up">
            {/* Translate */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    {isTranslating ? (
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <TranslateIcon className="w-4 h-4 text-cyan-400" />
                    )}
                </div>
                <select 
                    value={currentLanguage} 
                    onChange={handleLanguageChange}
                    disabled={isTranslating}
                    className="bg-black/40 text-sm text-white pl-8 pr-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer hover:bg-black/60 transition-colors"
                >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="bn">Bengali (বাংলা)</option>
                </select>
            </div>

            {/* Actions Divider */}
            <div className="w-px h-6 bg-white/20 mx-1"></div>

            {/* Copy */}
            <button 
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-purple-300 hover:text-purple-200 focus:outline-none relative"
                title="Copy to Clipboard"
            >
                <CopyIcon className="w-5 h-5" />
                {copied && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg animate-fade-in">
                        Copied!
                    </span>
                )}
            </button>

             {/* Share */}
             <button 
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-blue-300 hover:text-blue-200 focus:outline-none"
                title="Share Report"
            >
                <ShareIcon className="w-5 h-5" />
            </button>

            {/* Listen */}
            <button 
                onClick={speak}
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none ${isSpeaking ? 'text-green-400 animate-pulse' : 'text-cyan-300 hover:text-cyan-200'}`}
                title="Listen to Report"
            >
                {isSpeaking ? <StopIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
            </button>

            {/* Download */}
            <button 
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-yellow-300 hover:text-yellow-200 focus:outline-none"
                title="Download Report"
            >
                <DownloadIcon className="w-5 h-5" />
            </button>
        </div>
    );
};
