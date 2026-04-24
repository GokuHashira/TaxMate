// HeyGen integration removed — avatar uses animated fallback
export function useHeyGen() {
  return { status: 'ready', isFallback: true, speak: () => {} };
}
