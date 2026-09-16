export interface ModelConfig {
  freqModel: string
  sevModel: string
  tailThreshold: string
  copulaType: string
  inflationAdjust: boolean
  aal: number
  var99: number
  tvar99: number
  var995: number
  annualFrequency: number
  lastUpdated?: string
  isCustomSession: boolean
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  freqModel: 'Negative Binomial',
  sevModel: 'Generalized Pareto (POT)',
  tailThreshold: '$500M',
  copulaType: 'Clayton (Lower Tail Dependency)',
  inflationAdjust: true,
  aal: 2.84,
  var99: 18.72,
  tvar99: 27.34,
  var995: 34.80,
  annualFrequency: 7.4,
  isCustomSession: false,
}

const STORAGE_KEY = 'losslab_model_session_config'
const EVENT_KEY = 'losslab-model-config-updated'

export function calculateModelMetrics(config: Partial<ModelConfig>): {
  aal: number
  var99: number
  tvar99: number
  var995: number
  annualFrequency: number
} {
  const sev = config.sevModel || DEFAULT_MODEL_CONFIG.sevModel
  const freq = config.freqModel || DEFAULT_MODEL_CONFIG.freqModel
  const thresh = config.tailThreshold || DEFAULT_MODEL_CONFIG.tailThreshold
  const copula = config.copulaType || DEFAULT_MODEL_CONFIG.copulaType
  const inflation = config.inflationAdjust !== undefined ? config.inflationAdjust : DEFAULT_MODEL_CONFIG.inflationAdjust

  let baseAal = 2.84
  let baseVar99 = 18.72
  let baseTvar99 = 27.34
  let baseVar995 = 34.80
  let annualFreq = 7.4

  // Severity parametric family impact
  if (sev.includes('Lognormal')) {
    baseAal = 2.62
    baseVar99 = 16.45
    baseTvar99 = 22.80
    baseVar995 = 28.50
  } else if (sev.includes('Weibull')) {
    baseAal = 2.71
    baseVar99 = 17.15
    baseTvar99 = 24.10
    baseVar995 = 30.90
  } else if (sev.includes('Gamma')) {
    baseAal = 2.48
    baseVar99 = 15.30
    baseTvar99 = 20.80
    baseVar995 = 25.40
  } else {
    // Generalized Pareto (POT) default heavy tail
    baseAal = 2.84
    baseVar99 = 18.72
    baseTvar99 = 27.34
    baseVar995 = 34.80
  }

  // Arrival count distribution impact
  if (freq.includes('Poisson')) {
    annualFreq = 7.4
    // Pure Poisson has less variance than NegBin
    baseVar99 = parseFloat((baseVar99 * 0.94).toFixed(2))
    baseTvar99 = parseFloat((baseTvar99 * 0.93).toFixed(2))
  } else if (freq.includes('Zero-Inflated')) {
    annualFreq = 6.2
    baseAal = parseFloat((baseAal * 0.88).toFixed(2))
    baseVar99 = parseFloat((baseVar99 * 0.91).toFixed(2))
  }

  // Threshold impact
  if (thresh.includes('250')) {
    baseAal = parseFloat((baseAal * 1.05).toFixed(2))
    baseVar99 = parseFloat((baseVar99 * 1.04).toFixed(2))
  } else if (thresh.includes('1B') || thresh.includes('1000')) {
    baseAal = parseFloat((baseAal * 0.96).toFixed(2))
    baseVar99 = parseFloat((baseVar99 * 1.06).toFixed(2))
  }

  // Copula tail dependence
  if (copula.includes('Gumbel')) {
    // Upper tail dependence increases extreme co-loss
    baseTvar99 = parseFloat((baseTvar99 * 1.09).toFixed(2))
    baseVar995 = parseFloat((baseVar995 * 1.08).toFixed(2))
  } else if (copula.includes('Gaussian')) {
    // Zero asymptotic tail dependence
    baseTvar99 = parseFloat((baseTvar99 * 0.92).toFixed(2))
    baseVar995 = parseFloat((baseVar995 * 0.93).toFixed(2))
  }

  // Inflation indexing effect
  if (!inflation) {
    baseAal = parseFloat((baseAal * 0.82).toFixed(2))
    baseVar99 = parseFloat((baseVar99 * 0.82).toFixed(2))
    baseTvar99 = parseFloat((baseTvar99 * 0.82).toFixed(2))
    baseVar995 = parseFloat((baseVar995 * 0.82).toFixed(2))
  }

  return {
    aal: baseAal,
    var99: baseVar99,
    tvar99: baseTvar99,
    var995: baseVar995,
    annualFrequency: annualFreq,
  }
}

export function getModelConfig(): ModelConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_MODEL_CONFIG
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_MODEL_CONFIG, ...parsed }
    }
  } catch (e) {
    console.warn('Failed reading model config from storage', e)
  }

  return DEFAULT_MODEL_CONFIG
}

export function saveModelConfig(config: Partial<ModelConfig>): ModelConfig {
  const current = getModelConfig()
  const metrics = calculateModelMetrics({ ...current, ...config })
  const updated: ModelConfig = {
    ...current,
    ...config,
    ...metrics,
    isCustomSession: true,
    lastUpdated: new Date().toLocaleTimeString(),
  }

  if (typeof window !== 'undefined') {
    try {
      const serialized = JSON.stringify(updated)
      sessionStorage.setItem(STORAGE_KEY, serialized)
      localStorage.setItem(STORAGE_KEY, serialized)
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: updated }))
    } catch (e) {
      console.warn('Failed saving model config to storage', e)
    }
  }

  return updated
}

export function resetModelConfig(): ModelConfig {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_KEY)
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: DEFAULT_MODEL_CONFIG }))
    } catch (e) {
      console.warn('Failed clearing model config from storage', e)
    }
  }

  return DEFAULT_MODEL_CONFIG
}

export function subscribeModelConfig(callback: (config: ModelConfig) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handler = (event: any) => {
    if (event.detail) {
      callback(event.detail)
    } else {
      callback(getModelConfig())
    }
  }

  window.addEventListener(EVENT_KEY, handler)
  window.addEventListener('storage', handler)

  return () => {
    window.removeEventListener(EVENT_KEY, handler)
    window.removeEventListener('storage', handler)
  }
}
