import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Lang } from '../types'

const dict = {
  en: {
    brand: 'Real API Pricing',
    navCharts: 'Charts',
    navMethod: 'Method',
    navData: 'Data',
    github: 'GitHub',
    heroKicker: 'Subscription token economics',
    heroTitle: 'Real unit price = monthly fee ÷ usable tokens',
    heroSub:
      'Compare coding-plan subscriptions and metered APIs on one $/MTok scale. Month = four weeks of saturated use; input, output, and cache tokens are all included.',
    ctaExplore: 'Explore charts',
    ctaData: 'Download data',
    snapshotTitle: 'Data snapshot',
    snapshotAsOf: 'Snapshot',
    statTotal: 'Plan × model points',
    statSub: 'Subscription points',
    statApi: 'Metered API baselines',
    statOpenCode: 'OpenCode Go models',
    statArena: 'Code / Agent Arena scored',
    statAA: 'AA Intel / Coding scored',
    overviewTitle: 'Overview charts',
    allowanceTitle: 'Monthly allowance',
    allowanceSub:
      'Subscription plan × served model, sorted by monthly usable tokens (log scale).',
    priceTitle: 'Real unit price',
    priceSub:
      'All subscription and API points on one comparable $/MTok scale (log scale; cheaper is lower).',
    paretoTitle: 'Pareto by leaderboard',
    paretoSub:
      'Score vs real price. The line is the subscription frontier; hollow markers are API baselines. Unscored models stay in the overviews above but are not invented into a board.',
    cheaperRight: 'Cheaper →',
    methodTitle: 'How the numbers work',
    method1Title: 'Define the unit',
    method1Body:
      'Real unit price is monthly subscription fee divided by monthly usable tokens under saturated use (four weeks).',
    method2Title: 'Count every token',
    method2Body:
      'Input, output, and cache tokens are all included, blended with an observed traffic mix.',
    method3Title: 'Keep boards separate',
    method3Body:
      'Scores are never mixed across leaderboards. Missing scores stay missing — they are not fabricated for Pareto charts.',
    method4Title: 'Frontier, not ranking',
    method4Body:
      'The connected line is the subscription Pareto frontier (higher score at equal-or-lower price). Metered APIs are reference baselines.',
    downloadTitle: 'Download',
    downloadJson: 'points.json',
    downloadCsv: 'points.csv',
    downloadAdopted: 'adopted.csv',
    footerLicense: 'Original software: MIT.',
    footerSources: 'Sources & attribution',
    footerNote:
      'Independent research visualization. Not affiliated with Arena, Artificial Analysis, or plan vendors.',
    langToggle: '中文',
    billingSub: 'Subscription',
    billingApi: 'API',
    tooltipPrice: 'Real $/MTok',
    tooltipAllowance: 'Monthly tokens (×10⁸)',
    tooltipScore: 'Score',
    tooltipPlan: 'Plan',
    tooltipModel: 'Model',
    tooltipVendor: 'Vendor',
    loading: 'Loading pricing data…',
    error: 'Failed to load points.json',
    showTop: 'Show top',
    allPoints: 'All points',
    frontierLegend: 'Subscription frontier',
    apiLegend: 'API baseline',
    subLegend: 'Subscription',
    mixLabel: 'Token mix',
    mixCache: 'cache',
    mixInput: 'input',
    mixOutput: 'output',
  },
  zh: {
    brand: '真实 API 定价',
    navCharts: '图表',
    navMethod: '口径',
    navData: '数据',
    github: 'GitHub',
    heroKicker: '订阅 Token 经济学',
    heroTitle: '真实单价 = 订阅月费 ÷ 每月实际可用 token',
    heroSub:
      '把编程订阅套餐与按量 API 放在同一套 $/MTok 口径下比较。按饱和使用、每月四周计算；输入、输出与缓存 token 全部计入。',
    ctaExplore: '查看图表',
    ctaData: '下载数据',
    snapshotTitle: '数据快照',
    snapshotAsOf: '快照日期',
    statTotal: '套餐 × 模型点',
    statSub: '有月额度的订阅点',
    statApi: '按量 API 基准点',
    statOpenCode: 'OpenCode Go 模型',
    statArena: 'Code / Agent Arena 有分',
    statAA: 'AA 智力 / 编程有分',
    overviewTitle: '总览图',
    allowanceTitle: '月额度总览',
    allowanceSub: '订阅套餐 × 实际服务模型，按每月可用 token 排序（对数轴）。',
    priceTitle: '真实单价总览',
    priceSub: '全部订阅与 API 点放在同一套 $/MTok 口径下（对数轴；越低越便宜）。',
    paretoTitle: '分榜帕累托',
    paretoSub:
      '得分对真实单价。折线为订阅前沿；空心点为 API 基线。某榜缺分的模型仍保留在上方总览中，但不会编造分数塞入该榜。',
    cheaperRight: '越右越便宜 →',
    methodTitle: '数字如何得出',
    method1Title: '定义单位',
    method1Body: '真实单价 = 订阅月费 ÷ 饱和使用下的每月可用 token（每月四周）。',
    method2Title: '计入口径完整',
    method2Body: '输入、输出与缓存 token 全部计入，并按实测流量分布混合。',
    method3Title: '榜单不混分',
    method3Body: '不同榜单分数互不混用。缺分就是缺分——不会为了画帕累托而编造分数。',
    method4Title: '前沿不是排名',
    method4Body:
      '连线为订阅帕累托前沿（同价或更低价下更高分）。按量 API 仅作比较基线。',
    downloadTitle: '下载',
    downloadJson: 'points.json',
    downloadCsv: 'points.csv',
    downloadAdopted: 'adopted.csv',
    footerLicense: '原创代码：MIT。',
    footerSources: '来源与署名',
    footerNote: '独立研究可视化，与 Arena、Artificial Analysis 及各套餐厂商无隶属关系。',
    langToggle: 'EN',
    billingSub: '订阅',
    billingApi: 'API',
    tooltipPrice: '真实 $/MTok',
    tooltipAllowance: '月可用 token（亿）',
    tooltipScore: '得分',
    tooltipPlan: '套餐',
    tooltipModel: '模型',
    tooltipVendor: '厂商',
    loading: '正在加载定价数据…',
    error: '无法加载 points.json',
    showTop: '显示前',
    allPoints: '全部点',
    frontierLegend: '订阅前沿',
    apiLegend: 'API 基线',
    subLegend: '订阅',
    mixLabel: 'Token 分布',
    mixCache: '缓存',
    mixInput: '输入',
    mixOutput: '输出',
  },
} as const

export type DictKey = keyof typeof dict.en

type I18nValue = {
  lang: Lang
  t: (key: DictKey) => string
  toggle: () => void
  setLang: (lang: Lang) => void
}

const I18nContext = createContext<I18nValue | null>(null)

function initialLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const saved = localStorage.getItem('rap-lang')
  if (saved === 'en' || saved === 'zh') return saved
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem('rap-lang', next)
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
  }, [])

  const toggle = useCallback(() => {
    setLang(lang === 'en' ? 'zh' : 'en')
  }, [lang, setLang])

  const t = useCallback((key: DictKey) => dict[lang][key], [lang])

  const value = useMemo(
    () => ({ lang, t, toggle, setLang }),
    [lang, t, toggle, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n outside provider')
  return ctx
}
