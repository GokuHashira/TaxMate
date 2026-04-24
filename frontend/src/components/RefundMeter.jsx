import { useEffect, useState } from 'react';

export default function RefundMeter({ amount = 0, breakdown = [] }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (amount <= 0) return;
    const step = amount / 60;
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + step, amount);
      setDisplayed(Math.round(current));
      if (current >= amount) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [amount]);

  if (amount <= 0) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4">
      <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
        <span>💰</span> Estimated Refund
      </h4>

      <div className="text-center mb-3">
        <div className="text-4xl font-extrabold text-emerald-700 tabular-nums">
          ${displayed.toLocaleString()}
        </div>
        <p className="text-xs text-emerald-600 mt-1">Estimated total refund</p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-emerald-100 rounded-full h-2 mb-3">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full progress-fill"
          style={{ width: amount > 0 ? `${Math.min((displayed / amount) * 100, 100)}%` : '0%' }}
        />
      </div>

      {/* Breakdown */}
      {breakdown.length > 0 && (
        <div className="space-y-1.5">
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs text-emerald-700">
              <span className="truncate mr-2">{item.label}</span>
              <span className="font-semibold flex-shrink-0">${Math.round(item.amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2 text-center">
        Estimate only · actual amount may vary
      </p>
    </div>
  );
}
