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
    navCompare: 'Compare',
    navLeaderboard: 'Leaderboard',
    navOverview: 'Overview',
    navMethod: 'Method',
    navData: 'Data',
    github: 'GitHub',
    heroEyebrow: 'REAL API PRICING',
    heroKicker: 'Subscription token economics',
    heroTitle: 'Real unit price = monthly fee ÷ usable tokens',
    heroSub:
      'Compare coding-plan subscriptions and metered APIs on one $/MTok scale. Month = four weeks of saturated use; input, output, and cache tokens are all included.',
    ctaExplore: 'Explore charts',
    ctaData: 'Download data',
    ctaCompare: 'Compare plans',
    ctaMethod: 'Methodology',
    snapshotTitle: 'Data snapshot',
    snapshotAsOf: 'Snapshot',
    snapPoints: 'points',
    snapSubs: 'subscriptions',
    snapApis: 'APIs',
    snapVendors: 'vendors',
    snapshotUpdated: 'Updated',
    insightLowest: 'Lowest real price',
    insightLargest: 'Largest allowance',
    insightFrontier: 'Code Arena frontier',
    insightFrontierHint: 'Highest score on the subscription Pareto frontier',
    insightSnapshot: 'Snapshot',
    statTotal: 'Plan × model points',
    statSub: 'Subscription points',
    statApi: 'Metered API baselines',
    statOpenCode: 'OpenCode Go models',
    statArena: 'Code / Agent Arena scored',
    statAA: 'AA Intel / Coding scored',
    statVendors: 'Vendors',
    overviewTitle: 'Overview charts',
    allowanceTitle: 'Monthly allowance',
    allowanceSub:
      'Subscription plan × served model, sorted by monthly usable tokens (log scale).',
    priceTitle: 'Real unit price',
    priceSub:
      'All subscription and API points on one comparable $/MTok scale (log scale; cheaper is to the left).',
    priceCheap: 'Cheap',
    priceExpensive: 'Expensive',
    paretoTitle: 'Pareto by leaderboard',
    paretoSub:
      'Score vs real price. The line is the subscription frontier; hollow markers are API baselines. Unscored models stay in the overviews above but are not invented into a board.',
    advancedTitle: 'Advanced analysis',
    showAllBoards: 'Show all boards',
    showOneBoard: 'One board',
    leaderboardTitle: 'Leaderboard',
    leaderboardSub:
      'Score vs real $/MTok. Cheaper is to the right. Color is vendor; a line spans each model’s observed prices.',
    compareTitle: 'Compare',
    compareSub:
      'Search, filter, and scan plans on one dense list. Models view shows the cheapest plan per model; expand a row for every plan × model point.',
    searchPlaceholder: 'Search model or plan…',
    viewModels: 'Models',
    viewPlans: 'Plan × Model',
    sortPrice: 'Price',
    sortAllowance: 'Allowance',
    filterAll: 'All',
    filterVendor: 'Vendor',
    filterConfidence: 'Confidence',
    confHigh: 'High',
    confMedium: 'Medium',
    confLow: 'Low',
    colModel: 'Model',
    colPlan: 'Plan',
    colPrice: 'Price',
    colAllowance: 'Allowance',
    colScore: 'Score',
    colConfidence: 'Confidence',
    addToCompare: 'Add to compare',
    removeFromCompare: 'Remove',
    compareSelected: 'selected',
    clearCompare: 'Clear',
    compareTray: 'Compare tray',
    plansLabel: 'plans',
    noResults: 'No matching plans',
    detailTitle: 'Details',
    detailHint: 'Select a row for confidence, source, and notes.',
    fieldMonthlyFee: 'Monthly fee',
    fieldUsableTokens: 'Usable tokens',
    fieldRealPrice: 'Real price',
    fieldListPrice: 'List API price',
    fieldConfidence: 'Confidence',
    fieldTier: 'Tier',
    fieldSource: 'Source',
    fieldNote: 'Note',
    fieldVendor: 'Vendor',
    fieldBilling: 'Billing',
    viewSource: 'View source',
    closeDetail: 'Close',
    perMtok: '/ MTok',
    expandPlans: 'Show plan variants',
    collapsePlans: 'Hide plan variants',
    compareFull: 'Compare is full',
    mostEfficient: 'most efficient ↗',
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
    footerUpstream:
      'Data and test methodology from FeiZhuLulu/real-api-pricing',
    footerNote:
      'Independent research visualization. Not affiliated with Arena, Artificial Analysis, or plan vendors.',
    methodUpstream:
      'Data and test methodology are from the source project FeiZhuLulu/real-api-pricing (this site is built on a fork).',
    langToggle: '中文',
    billingSub: 'Subscription',
    billingApi: 'API',
    tooltipPrice: 'Real $/MTok',
    tooltipAllowance: 'Monthly tokens (billions)',
    colPlanModel: 'Plan × model',
    colValue: 'Value',
    tooltipScore: 'Score',
    tooltipPlan: 'Plan',
    tooltipModel: 'Model',
    tooltipVendor: 'Vendor',
    loading: 'Loading pricing data…',
    error: 'Failed to load points.json',
    showTop: 'Show top',
    allPoints: 'All points',
    limitTop15: 'Top 15',
    limitTop30: 'Top 30',
    limitAll: 'All',
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
    navCompare: '比较',
    navLeaderboard: '排行榜',
    navOverview: '总览',
    navMethod: '口径',
    navData: '数据',
    github: 'GitHub',
    heroEyebrow: 'REAL API PRICING · 真实 API 定价',
    heroKicker: '订阅 Token 经济学',
    heroTitle: '真实单价 = 订阅月费 ÷ 每月实际可用 token',
    heroSub:
      '把编程订阅套餐与按量 API 放在同一套 $/MTok 口径下比较。按饱和使用、每月四周计算；输入、输出与缓存 token 全部计入。',
    ctaExplore: '查看图表',
    ctaData: '下载数据',
    ctaCompare: '开始比较',
    ctaMethod: '查看方法',
    snapshotTitle: '数据快照',
    snapshotAsOf: '快照日期',
    snapPoints: '个点',
    snapSubs: '个订阅',
    snapApis: '个 API',
    snapVendors: '家厂商',
    snapshotUpdated: '更新于',
    insightLowest: '最低真实单价',
    insightLargest: '最大月额度',
    insightFrontier: 'Code Arena 前沿',
    insightFrontierHint: '订阅帕累托前沿上的最高分',
    insightSnapshot: '快照',
    statTotal: '套餐 × 模型点',
    statSub: '有月额度的订阅点',
    statApi: '按量 API 基准点',
    statOpenCode: 'OpenCode Go 模型',
    statArena: 'Code / Agent Arena 有分',
    statAA: 'AA 智力 / 编程有分',
    statVendors: '厂商',
    overviewTitle: '总览图',
    allowanceTitle: '月额度总览',
    allowanceSub: '订阅套餐 × 实际服务模型，按每月可用 token 排序（对数轴）。',
    priceTitle: '真实单价总览',
    priceSub: '全部订阅与 API 点放在同一套 $/MTok 口径下（对数轴；越左越便宜）。',
    priceCheap: '便宜',
    priceExpensive: '昂贵',
    paretoTitle: '分榜帕累托',
    paretoSub:
      '得分对真实单价。折线为订阅前沿；空心点为 API 基线。某榜缺分的模型仍保留在上方总览中，但不会编造分数塞入该榜。',
    advancedTitle: '进阶分析',
    showAllBoards: '显示全部榜单',
    showOneBoard: '单榜',
    leaderboardTitle: '排行榜',
    leaderboardSub:
      '得分对真实 $/MTok。越右越便宜。颜色按厂商；横线为同一模型的观测单价区间。',
    compareTitle: '比较',
    compareSub:
      '搜索、筛选并扫读套餐。模型视图每行展示该模型最低真实单价方案，展开后可见全部套餐 × 模型点。',
    searchPlaceholder: '搜索模型或套餐…',
    viewModels: '模型',
    viewPlans: '套餐 × 模型',
    sortPrice: '单价',
    sortAllowance: '月额度',
    filterAll: '全部',
    filterVendor: '厂商',
    filterConfidence: '置信度',
    confHigh: '高',
    confMedium: '中',
    confLow: '低',
    colModel: '模型',
    colPlan: '套餐',
    colPrice: '单价',
    colAllowance: '月额度',
    colScore: '得分',
    colConfidence: '置信度',
    addToCompare: '加入比较',
    removeFromCompare: '移除',
    compareSelected: '已选',
    clearCompare: '清空',
    compareTray: '比较栏',
    plansLabel: '个套餐',
    noResults: '没有匹配的套餐',
    detailTitle: '详情',
    detailHint: '点选一行查看置信度、来源与备注。',
    fieldMonthlyFee: '月费',
    fieldUsableTokens: '可用 token',
    fieldRealPrice: '真实单价',
    fieldListPrice: '官方 API 单价',
    fieldConfidence: '置信度',
    fieldTier: '档位',
    fieldSource: '来源',
    fieldNote: '备注',
    fieldVendor: '厂商',
    fieldBilling: '计费',
    viewSource: '查看来源',
    closeDetail: '关闭',
    perMtok: '/ MTok',
    expandPlans: '展开套餐变体',
    collapsePlans: '收起套餐变体',
    compareFull: '比较已满',
    mostEfficient: '最划算 ↗',
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
    footerUpstream: '数据与测试方案来自 FeiZhuLulu/real-api-pricing',
    footerNote: '独立研究可视化，与 Arena、Artificial Analysis 及各套餐厂商无隶属关系。',
    methodUpstream: '数据与测试方案来自源项目 FeiZhuLulu/real-api-pricing（本站基于该项目的 fork 构建）。',
    langToggle: 'EN',
    billingSub: '订阅',
    billingApi: 'API',
    tooltipPrice: '真实 $/MTok',
    tooltipAllowance: '月可用 token（亿）',
    colPlanModel: '套餐 × 模型',
    colValue: '数值',
    tooltipScore: '得分',
    tooltipPlan: '套餐',
    tooltipModel: '模型',
    tooltipVendor: '厂商',
    loading: '正在加载定价数据…',
    error: '无法加载 points.json',
    showTop: '显示前',
    allPoints: '全部点',
    limitTop15: '前 15',
    limitTop30: '前 30',
    limitAll: '全部',
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
type ZhKey = keyof typeof dict.zh
type _MissingZh = Exclude<DictKey, ZhKey>
type _MissingEn = Exclude<ZhKey, DictKey>
type _AssertParity<_T extends never = _MissingZh | _MissingEn> = true
const _parity: _AssertParity = true
void _parity

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
