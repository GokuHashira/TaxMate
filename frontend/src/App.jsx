import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './components/LandingPage';
import HeyGenAvatar from './components/HeyGenAvatar';
import ChatInterface from './components/ChatInterface';
import ProgressBar from './components/ProgressBar';
import FormPreview from './components/FormPreview';
import DownloadPackage from './components/DownloadPackage';

function AppPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [taxData, setTaxData] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [avatarSpeechText, setAvatarSpeechText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  function handleAvatarSpeak(text) {
    setAvatarSpeechText(text);
    setIsSpeaking(true);
    // Clear speaking flag after estimated duration
    const words = text.split(' ').length;
    const duration = Math.max(2000, words * 300);
    setTimeout(() => setIsSpeaking(false), duration);
  }

  function handleComplete(finalTaxData) {
    setTaxData(finalTaxData || taxData);
    setIsComplete(true);
  }

  function handleStartOver() {
    setCurrentStep(1);
    setTaxData({});
    setIsComplete(false);
    setAvatarSpeechText('');
    // Reload to reset conversation
    window.location.reload();
  }

  if (isComplete) {
    return <DownloadPackage taxData={taxData} onStartOver={handleStartOver} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top navigation bar */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="font-bold text-gray-900">TaxMate</span>
          </button>

          <div className="flex-1 max-w-sm mx-4 hidden md:block">
            <ProgressBar currentStep={currentStep} totalSteps={7} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">Tax Year 2024</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="md:hidden px-4 pb-3">
          <ProgressBar currentStep={currentStep} totalSteps={7} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* LEFT — Avatar panel (40%) */}
        <div className="hidden lg:flex w-[40%] bg-gradient-to-b from-blue-50 to-white border-r border-gray-100 flex-col items-center justify-start pt-8 px-6 gap-6">
          <HeyGenAvatar
            isSpeaking={isSpeaking}
            currentMessage={avatarSpeechText}
            onAvatarReady={() => {}}
          />

          {/* Mic hint */}
          <div className="text-center text-xs text-gray-400 max-w-xs">
            Maya understands you — type or use the microphone button to speak your answers
          </div>

          {/* Form preview */}
          <div className="w-full">
            <FormPreview taxData={taxData} />
          </div>

          {/* Disclaimer */}
          <div className="text-center text-xs text-gray-400 max-w-xs pb-4">
            🔒 Your data stays in this session only and is never stored
          </div>
        </div>

        {/* RIGHT — Chat panel (60%) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <ChatInterface
            onTaxDataUpdate={setTaxData}
            onStepChange={setCurrentStep}
            onComplete={handleComplete}
            onAvatarSpeak={handleAvatarSpeak}
          />
        </div>
      </main>

      {/* Mobile: show avatar above chat on small screens */}
      <style>{`
        @media (max-width: 1024px) {
          .mobile-avatar-strip {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
