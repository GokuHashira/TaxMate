import { useState, useEffect, useRef } from 'react';

function ConfettiPiece({ style }) {
  return <div className="confetti-piece" style={style} />;
}

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
      backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9'][Math.floor(Math.random() * 6)],
      borderRadius: Math.random() > 0.5 ? '50%' : '0',
      transform: `rotate(${Math.random() * 360}deg)`,
    }
  }));

  return (
    <>
      {pieces.map((p) => <ConfettiPiece key={p.id} style={p.style} />)}
    </>
  );
}

export default function DownloadPackage({ taxData, onStartOver }) {
  const [forms, setForms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [refundEstimate, setRefundEstimate] = useState(null);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const hasGenerated = useRef(false);

  useEffect(() => {
    if (hasGenerated.current) return;
    hasGenerated.current = true;
    generateForms();
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  async function generateForms() {
    try {
      const res = await fetch('/api/forms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForms(data.forms);
      setRefundEstimate(data.refundEstimate);
    } catch (err) {
      setError(err.message || 'Failed to generate forms');
    } finally {
      setLoading(false);
    }
  }

  function downloadForm(formKey, label) {
    const base64 = forms[formKey];
    if (!base64) return;
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaxMate_${label}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadZip() {
    setDownloadingZip(true);
    try {
      const res = await fetch('/api/forms/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxData })
      });
      if (!res.ok) throw new Error('ZIP generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const name = (taxData?.studentProfile?.fullName || 'student').replace(/[^a-zA-Z0-9]/g, '_');
      a.href = url;
      a.download = `TaxMate_${name}_2024.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed: ' + err.message);
    } finally {
      setDownloadingZip(false);
    }
  }

  const profile = taxData?.studentProfile || {};
  const withholding = taxData?.withholding || {};
  const treatyInfo = taxData?.treatyInfo || {};
  const formsNeeded = taxData?.formsNeeded || ['8843'];

  const FORM_LABELS = {
    '8843': { key: '8843', label: 'Form_8843', title: 'Form 8843', desc: 'Statement for Exempt Individuals (required for all F-1/J-1 students)' },
    '1040NR': { key: '1040NR', label: 'Form_1040NR', title: 'Form 1040-NR', desc: 'U.S. Nonresident Alien Income Tax Return' },
    '8833': { key: '8833', label: 'Form_8833', title: 'Form 8833', desc: 'Treaty-Based Return Position Disclosure' },
    'instructions': { key: 'instructions', label: 'Filing_Instructions', title: 'Filing Instructions', desc: 'Step-by-step guide on where to mail and what to do' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Generating Your Tax Forms...</h2>
          <p className="text-gray-500">Maya is preparing your personalized IRS forms</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-5xl">😔</div>
          <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
          <button onClick={generateForms} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white relative">
      {showConfetti && <Confetti />}

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-4 animate-bounce-gentle">✅</div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Your Tax Forms Are Ready!
          </h1>
          <p className="text-lg text-gray-600">
            Great work{profile.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}! Maya has prepared your complete tax package for 2024.
          </p>
        </div>

        {/* Summary card */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
            <span>📊</span> Your Tax Summary
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {profile.visaType && (
              <SummaryItem icon="🛂" label="Visa Type" value={profile.visaType} />
            )}
            {profile.homeCountry && (
              <SummaryItem icon="🌍" label="Home Country" value={profile.homeCountry} />
            )}
            {profile.university && (
              <SummaryItem icon="🎓" label="University" value={profile.university} />
            )}
            <SummaryItem icon="📋" label="Forms Generated" value={formsNeeded.join(', ') || '8843'} />

            {refundEstimate?.totalEstimatedRefund > 0 && (
              <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-800 text-lg">💰 Estimated Total Refund</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Based on your withholding and treaty benefits</p>
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-700">
                    ${Math.round(refundEstimate.totalEstimatedRefund).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {withholding.ficaError && (
              <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="font-semibold text-amber-800 text-sm">⚠️ FICA Refund: ${parseFloat(withholding.ficaRefundAmount || 0).toFixed(2)}</p>
                <p className="text-xs text-amber-700 mt-1">Your employer incorrectly withheld FICA taxes. See Form 843 instructions in your package.</p>
              </div>
            )}

            {treatyInfo.treatyApplies && (
              <div className="sm:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="font-semibold text-blue-800 text-sm">🎉 Tax Treaty: {treatyInfo.treatyCountry} — Article {treatyInfo.treatyArticle}</p>
                <p className="text-xs text-blue-700 mt-1">{treatyInfo.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Download all ZIP */}
        <div className="mb-6">
          <button
            onClick={downloadZip}
            disabled={downloadingZip}
            className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {downloadingZip ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating ZIP...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download All Forms (ZIP)
              </>
            )}
          </button>
        </div>

        {/* Individual downloads */}
        {forms && (
          <div className="card mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Individual Downloads</h3>
            <div className="space-y-3">
              {Object.entries(FORM_LABELS).map(([key, info]) => {
                if (!forms[key]) return null;
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 text-xs font-bold">PDF</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{info.title}</p>
                        <p className="text-xs text-gray-500">{info.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadForm(key, info.label)}
                      className="flex-shrink-0 text-blue-600 hover:text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    >
                      ↓ Download
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filing instructions */}
        <div className="card mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📬</span> What to Do Next
          </h3>
          <ol className="space-y-3">
            {[
              { num: '1', text: 'Review all forms carefully — make sure your name, address, and SSN/ITIN are correct' },
              { num: '2', text: 'Sign in blue or black ink on each form where indicated ("Your signature" line)' },
              { num: '3', text: 'Attach your W-2 and/or 1042-S behind your 1040-NR' },
              { num: '4', text: 'Mail to: IRS, Austin, TX 73301-0215 (all nonresident aliens — cannot e-file)' },
              { num: '5', text: 'Deadline: April 15, 2025 — mail by this date or request extension on Form 4868' },
              { num: '6', text: 'Keep copies of everything you mail to the IRS for 7 years' },
            ].map((step) => (
              <li key={step.num} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.num}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 mb-6">
          <p className="font-semibold text-gray-700 mb-1">⚖️ Important Disclaimer</p>
          <p>TaxMate is an AI-powered preparation tool and is not a licensed tax professional.
            Always review your forms before submitting. For complex situations or if you have doubts,
            consult your university's International Student Services office or a Certified Public Accountant (CPA).
          </p>
        </div>

        {/* Share + Start Over */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onStartOver}
            className="btn-secondary flex-1"
          >
            ← Start a New Return
          </button>
          <button
            onClick={() => {
              const text = encodeURIComponent('I just filed my US taxes for free with TaxMate — an AI assistant built for F-1 and J-1 international students! 🎓💰');
              window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener');
            }}
            className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-95"
          >
            🐦 Share on Twitter
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900 text-sm">{value}</p>
      </div>
    </div>
  );
}
