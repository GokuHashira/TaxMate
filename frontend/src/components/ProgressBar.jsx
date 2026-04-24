const STEPS = [
  { label: 'Visa Info', icon: '🛂' },
  { label: 'Personal', icon: '👤' },
  { label: 'Income', icon: '💼' },
  { label: 'Treaties', icon: '🌍' },
  { label: 'FICA Check', icon: '🔍' },
  { label: 'Forms', icon: '📋' },
  { label: 'Review', icon: '✅' },
];

export default function ProgressBar({ currentStep, totalSteps = 7 }) {
  const pct = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full">
      {/* Step counter */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {STEPS[currentStep - 1]?.icon} {STEPS[currentStep - 1]?.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
        <div
          className="progress-fill bg-gradient-to-r from-blue-500 to-sky-400 h-2.5 rounded-full"
          style={{ width: `${Math.max(pct, 8)}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isPending = stepNum > currentStep;

          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-blue-600 text-white'
                    : isCurrent
                    ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-sm'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span className={`hidden sm:block text-xs ${isCurrent ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
