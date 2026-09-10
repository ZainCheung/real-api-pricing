export const VENDOR_COLORS: Record<string, string> = {
  OpenAI: '#12B886',
  Anthropic: '#F47A35',
  Claude: '#F47A35',
  xAI: '#9267EF',
  Cursor: '#F2BC22',
  Kimi: '#26A9F5',
  GLM: '#94a3b8',
  Zhipu: '#94a3b8',
  MiniMax: '#F45BA5',
  Alibaba: '#F34E54',
  OpenCode: '#00B9BC',
  DeepSeek: '#4570F5',
  Google: '#91C83E',
  Gemini: '#91C83E',
  Xiaomi: '#FFA000',
  Tencent: '#26C6DA',
  Meituan: '#FFD100',
  Muse: '#A78BFA',
  NVIDIA: '#76B900',
}

export function vendorColor(vendor: string): string {
  return VENDOR_COLORS[vendor] ?? '#64748b'
}
