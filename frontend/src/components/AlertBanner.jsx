import { useState } from 'react';

const STYLES = {
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: '🎉',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: '⚠️',
    badge: 'bg-amber-100 text-amber-700',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: 'ℹ️',
    badge: 'bg-blue-100 text-blue-700',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: '❌',
    badge: 'bg-red-100 text-red-700',
  },
};

export default function AlertBanner({ type = 'info', title, message, badge, details, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);
  const style = STYLES[type] || STYLES.info;

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`alert-slide-in border rounded-xl p-4 ${style.container}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {badge && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                {badge}
              </span>
            )}
            {title && <p className="font-bold text-sm">{title}</p>}
          </div>
          {message && <p className="text-sm leading-relaxed">{message}</p>}
          {details && (
            <ul className="mt-2 space-y-1">
              {details.map((d, i) => (
                <li key={i} className="text-xs flex items-start gap-1.5">
                  <span className="flex-shrink-0 mt-0.5">→</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-sm p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
