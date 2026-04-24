export default function HeyGenAvatar({ isSpeaking }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden avatar-glow border-2 border-blue-200 bg-gradient-to-b from-blue-800 to-blue-600 flex flex-col items-center justify-center gap-6">
        {/* Animated background rings when speaking */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isSpeaking && (
            <>
              <div className="absolute w-48 h-48 bg-blue-400/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute w-36 h-36 bg-blue-400/25 rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }} />
            </>
          )}
          <div className="absolute w-32 h-32 bg-blue-400/15 rounded-full" />
        </div>

        {/* Avatar initials */}
        <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-sky-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30">
          <span className="text-white font-extrabold text-5xl">M</span>
        </div>

        {/* Sound wave bars when speaking */}
        {isSpeaking && (
          <div className="relative z-10 flex items-center gap-1.5">
            {[4, 7, 5, 9, 5, 7, 4].map((h, i) => (
              <div
                key={i}
                className="bg-white/80 rounded-full speaking-dot"
                style={{ width: 4, height: h * 3, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        {isSpeaking ? (
          <div className="relative z-10 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
            Maya is speaking...
          </div>
        ) : (
          <div className="relative z-10 text-blue-200 text-sm text-center px-6">
            Your AI tax assistant<br />is ready to help
          </div>
        )}
      </div>

      <div className="text-center">
        <div className="flex items-center gap-2 justify-center">
          <div className={`w-2 h-2 rounded-full bg-green-400 ${isSpeaking ? 'animate-pulse' : ''}`} />
          <span className="font-bold text-gray-900 text-lg">Maya</span>
        </div>
        <p className="text-sm text-gray-500">TaxMate AI Assistant</p>
      </div>
    </div>
  );
}
