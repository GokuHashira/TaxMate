import { useState, useRef, useEffect } from 'react';
import DocumentUpload from './DocumentUpload';
import AlertBanner from './AlertBanner';
import RefundMeter from './RefundMeter';

const INITIAL_TAX_DATA = {
  studentProfile: { taxYear: 2024 },
  income: { wagesOnCampus: 0, wagesCPT: 0, wagesOPT: 0, scholarshipTaxable: 0, fellowshipIncome: 0 },
  withholding: { federalIncomeTax: 0, stateIncomeTax: 0, socialSecurityWithheld: 0, medicareWithheld: 0, ficaError: false, ficaRefundAmount: 0 },
  treatyInfo: { treatyApplies: false },
  formsNeeded: [],
  uploadedDocuments: { w2: null, form1042S: null }
};

function Message({ msg }) {
  const isUser = msg.role === 'user';

  if (msg.type === 'treaty-alert') {
    return (
      <div className="px-2 py-1">
        <AlertBanner type="success" badge="Treaty Found!" title={msg.content} onDismiss={undefined} />
      </div>
    );
  }

  if (msg.type === 'fica-alert') {
    return (
      <div className="px-2 py-1">
        <AlertBanner type="warning" badge="FICA Alert" title={msg.content} details={msg.details} onDismiss={undefined} />
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3 animate-fade-in`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <span className="text-white font-bold text-xs">M</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'chat-bubble-user rounded-tr-sm'
            : 'chat-bubble-maya rounded-tl-sm text-gray-800'
        }`}
      >
        {msg.content}
      </div>
      {isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <span className="text-white font-bold text-xs">You</span>
        </div>
      )}
    </div>
  );
}

export default function ChatInterface({ onTaxDataUpdate, onStepChange, onComplete, onAvatarSpeak }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [taxData, setTaxData] = useState(INITIAL_TAX_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [showUpload, setShowUpload] = useState(null);
  const [refundEstimate, setRefundEstimate] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const conversationHistoryRef = useRef([]);
  const chatBottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Init greeting
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/conversation/init', { method: 'POST' });
        const data = await res.json();
        const greeting = data.message;
        addMessage('assistant', greeting);
        onAvatarSpeak?.(greeting);
      } catch {
        const fallback = "Hi! I'm Maya, your TaxMate assistant. I'm here to help you file your US taxes for free. First — are you on an F-1 or J-1 visa?";
        addMessage('assistant', fallback);
        onAvatarSpeak?.(fallback);
      }
    }
    init();
  }, []);

  // Web Speech API setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  function addMessage(role, content, type = 'text', extra = {}) {
    setMessages((prev) => [...prev, { role, content, type, ...extra, id: Date.now() + Math.random() }]);
  }

  function addAlert(type, title, message, details) {
    setAlerts((prev) => [...prev, { type, title, message, details, id: Date.now() }]);
  }

  async function sendMessage(text, taxDataOverride) {
    if (!text.trim() || loading) return;
    setInput('');
    setShowUpload(null);

    addMessage('user', text);
    conversationHistoryRef.current.push({ role: 'user', content: text });
    setLoading(true);

    try {
      const res = await fetch('/api/conversation/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: conversationHistoryRef.current.slice(-20),
          userMessage: text,
          taxData: taxDataOverride || taxData
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      const aiMessage = data.message;
      addMessage('assistant', aiMessage);
      conversationHistoryRef.current.push({ role: 'assistant', content: aiMessage });
      onAvatarSpeak?.(aiMessage);

      // Update tax data
      if (data.updatedTaxData) {
        setTaxData(data.updatedTaxData);
        onTaxDataUpdate?.(data.updatedTaxData);
      }

      // Treaty detection
      if (data.treatyDetected) {
        const { treatyDetected: t } = data;
        addAlert('success', `Tax Treaty Found: ${t.treatyCountry}!`, t.description);
        addMessage('assistant', `🎉 Great news! I detected that ${t.treatyCountry} has a tax treaty with the US (Article ${t.treatyArticle}). ${t.description}. I'll file Form 8833 on your behalf.`, 'text');
        onAvatarSpeak?.(`Great news! Your country has a tax treaty with the United States! This could save you significant money on your taxes.`);
      }

      // Upload request
      if (data.requestUploadType) {
        setShowUpload(data.requestUploadType);
      }

      // Refund estimate
      if (data.refundEstimate?.totalEstimatedRefund > 0) {
        setRefundEstimate(data.refundEstimate);
      }

      // Step progression
      if (data.isStepComplete && currentStep < 7) {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
        onStepChange?.(newStep);
      }

      // All complete
      if (data.isAllComplete) {
        setCurrentStep(7);
        onStepChange?.(7);
        setTimeout(() => onComplete?.(taxData), 1500);
      }
    } catch (err) {
      addMessage('assistant', `I'm having trouble connecting right now. Please try again in a moment.`);
      console.error('Message error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleUploadComplete(data) {
    setShowUpload(null);

    const docLabel = data.docType === 'W2' ? 'W-2' : 'Form 1042-S';

    addMessage('assistant', `✅ Your ${docLabel} was processed successfully! Let me update your tax profile.`);
    onAvatarSpeak?.(`I've successfully read your ${docLabel}. Let me update your information.`);

    // Update tax data with extracted document
    const updated = { ...taxData };
    if (data.docType === 'W2' && data.extractedData) {
      updated.income = {
        ...updated.income,
        wagesOnCampus: data.extractedData.box1_wages || 0
      };
      updated.withholding = {
        ...updated.withholding,
        federalIncomeTax: data.extractedData.box2_federalTax || 0,
        socialSecurityWithheld: data.extractedData.box4_socialSecurity || 0,
        medicareWithheld: data.extractedData.box6_medicare || 0
      };
      updated.uploadedDocuments = { ...updated.uploadedDocuments, w2: data.extractedData };
    } else if (data.docType === '1042S' && data.extractedData) {
      updated.income = {
        ...updated.income,
        scholarshipTaxable: data.extractedData.grossIncome || 0
      };
      updated.withholding = {
        ...updated.withholding,
        federalIncomeTax: (parseFloat(updated.withholding.federalIncomeTax || 0) + parseFloat(data.extractedData.taxWithheld || 0))
      };
      updated.uploadedDocuments = { ...updated.uploadedDocuments, form1042S: data.extractedData };
    }

    setTaxData(updated);
    onTaxDataUpdate?.(updated);

    // FICA alert
    if (data.ficaIssue?.ficaError) {
      const fica = data.ficaIssue;
      updated.withholding = {
        ...updated.withholding,
        ficaError: true,
        ficaRefundAmount: fica.ficaRefundAmount
      };
      setTaxData({ ...updated });
      onTaxDataUpdate?.({ ...updated });

      addAlert('warning', `FICA Refund Found: $${fica.ficaRefundAmount.toFixed(2)}!`, fica.message, fica.instructions);
      addMessage('assistant', `⚠️ Important! ${fica.message} I'll help you reclaim this.`, 'fica-alert', { details: fica.instructions });
      onAvatarSpeak?.(`I found something important! Your employer incorrectly withheld ${fica.ficaRefundAmount.toFixed(2)} dollars in FICA taxes. As an international student, you're exempt from these taxes and can get that money back!`);
    }

    // Treaty alert from 1042-S
    if (data.treatyDetected?.treatyApplies) {
      const t = data.treatyDetected;
      updated.treatyInfo = {
        treatyApplies: true,
        treatyCountry: t.treatyCountry,
        treatyArticle: t.treatyArticle,
        description: t.description
      };
      setTaxData({ ...updated });
      onTaxDataUpdate?.({ ...updated });
      addMessage('assistant', `🎉 Your 1042-S shows a tax treaty from ${t.treatyCountry} (Article ${t.treatyArticle}). ${t.description}`, 'treaty-alert');
    }

    // Pass updated taxData directly so Claude sees uploadedDocuments already set
    sendMessage(`I uploaded my ${docLabel} and it was processed successfully. Please continue to the next step.`, updated);
  }

  function toggleListening() {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="px-4 pt-3 space-y-2">
          {alerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              type={alert.type}
              title={alert.title}
              message={alert.message}
              details={alert.details}
              onDismiss={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
            />
          ))}
        </div>
      )}

      {/* Refund meter */}
      {refundEstimate?.totalEstimatedRefund > 0 && (
        <div className="px-4 pt-3">
          <RefundMeter
            amount={refundEstimate.totalEstimatedRefund}
            breakdown={refundEstimate.breakdown}
          />
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <div className="chat-bubble-maya px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
              <div className="speaking-dot w-2 h-2 bg-blue-400 rounded-full" />
              <div className="speaking-dot w-2 h-2 bg-blue-400 rounded-full" />
              <div className="speaking-dot w-2 h-2 bg-blue-400 rounded-full" />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div className="px-4 pb-3">
          <DocumentUpload
            docType={showUpload}
            onUploadComplete={handleUploadComplete}
            onClose={() => setShowUpload(null)}
          />
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-100 px-4 py-3 bg-white">
        <div className="flex items-end gap-2">
          {/* File upload button */}
          <button
            onClick={() => setShowUpload(showUpload ? null : 'W2')}
            className={`p-2.5 rounded-xl border transition-all duration-200 flex-shrink-0 ${
              showUpload
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title="Upload tax document"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Type your answer..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              disabled={loading}
            />
          </div>

          {/* Mic button */}
          {recognitionRef.current && (
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border flex-shrink-0 transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              <svg className="w-5 h-5" fill={isListening ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}

          {/* Send button */}
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl flex-shrink-0 transition-all duration-200 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-2">
          Maya is an AI assistant · Not a licensed tax professional · {' '}
          <span className="text-gray-300">Your data is never stored</span>
        </p>
      </div>
    </div>
  );
}
