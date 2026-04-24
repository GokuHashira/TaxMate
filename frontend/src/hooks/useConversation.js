import { useState, useRef, useCallback } from 'react';

const INITIAL_TAX_DATA = {
  studentProfile: { taxYear: 2024 },
  income: { wagesOnCampus: 0, wagesCPT: 0, wagesOPT: 0, scholarshipTaxable: 0, fellowshipIncome: 0 },
  withholding: { federalIncomeTax: 0, stateIncomeTax: 0, socialSecurityWithheld: 0, medicareWithheld: 0, ficaError: false, ficaRefundAmount: 0 },
  treatyInfo: { treatyApplies: false },
  formsNeeded: [],
  uploadedDocuments: { w2: null, form1042S: null }
};

export function useConversation() {
  const [messages, setMessages] = useState([]);
  const [taxData, setTaxData] = useState(INITIAL_TAX_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const historyRef = useRef([]);

  const addMessage = useCallback((role, content, extra = {}) => {
    setMessages((prev) => [...prev, { role, content, ...extra, id: Date.now() + Math.random() }]);
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return null;

    addMessage('user', text);
    historyRef.current.push({ role: 'user', content: text });
    setLoading(true);

    try {
      const res = await fetch('/api/conversation/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: historyRef.current.slice(-20),
          userMessage: text,
          taxData
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addMessage('assistant', data.message);
      historyRef.current.push({ role: 'assistant', content: data.message });

      if (data.updatedTaxData) {
        setTaxData(data.updatedTaxData);
      }

      if (data.isStepComplete) {
        setCurrentStep((s) => Math.min(s + 1, 7));
      }

      if (data.isAllComplete) {
        setCurrentStep(7);
        setIsComplete(true);
      }

      return data;
    } catch (err) {
      console.error('sendMessage error:', err);
      addMessage('assistant', 'Sorry, I had trouble with that. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loading, taxData, addMessage]);

  const reset = useCallback(() => {
    setMessages([]);
    setTaxData(INITIAL_TAX_DATA);
    setCurrentStep(1);
    setIsComplete(false);
    historyRef.current = [];
  }, []);

  return { messages, taxData, setTaxData, currentStep, setCurrentStep, loading, isComplete, sendMessage, addMessage, reset };
}
