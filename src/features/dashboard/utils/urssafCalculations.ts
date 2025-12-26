import { FRENCH_LEGAL } from '@/lib/constants'

export interface URSSAFData {
  annualRevenue: number
  cotisationsAmount: number
  cotisationsRate: number
  plafondCA: number
  percentageOfPlafond: number
  tvaThreshold: number
  exceedsTVAThreshold: boolean
  exceedsPlafond: boolean
  isApproachingPlafond: boolean
}

export function calculateURSSAF(annualRevenue: number, customRate?: number): URSSAFData {
  const cotisationsRate = customRate || FRENCH_LEGAL.TAUX_COTISATIONS_BNC
  const cotisationsAmount = annualRevenue * (cotisationsRate / 100)
  const plafondCA = FRENCH_LEGAL.PLAFOND_CA
  const tvaThreshold = FRENCH_LEGAL.TVA_THRESHOLD
  
  const percentageOfPlafond = plafondCA > 0 ? (annualRevenue / plafondCA) * 100 : 0
  const exceedsTVAThreshold = annualRevenue > tvaThreshold
  const exceedsPlafond = annualRevenue > plafondCA
  const isApproachingPlafond = percentageOfPlafond >= 90 && !exceedsPlafond

  return {
    annualRevenue,
    cotisationsAmount,
    cotisationsRate,
    plafondCA,
    percentageOfPlafond,
    tvaThreshold,
    exceedsTVAThreshold,
    exceedsPlafond,
    isApproachingPlafond,
  }
}

export function getURSSAFAlert(data: URSSAFData): { type: 'error' | 'warning' | 'info' | null; message: string } | null {
  if (data.exceedsPlafond) {
    return {
      type: 'error',
      message: `🚨 Plafond dépassé ! Votre CA (${data.annualRevenue.toFixed(2)}€) dépasse le plafond micro-entrepreneur de ${data.plafondCA.toFixed(0)}€. Vous devez changer de régime fiscal.`,
    }
  }

  if (data.exceedsTVAThreshold) {
    return {
      type: 'warning',
      message: `⚠️ Seuil TVA dépassé ! Votre CA (${data.annualRevenue.toFixed(2)}€) dépasse ${data.tvaThreshold.toFixed(0)}€. Vous devez facturer la TVA.`,
    }
  }

  if (data.isApproachingPlafond) {
    return {
      type: 'warning',
      message: `⚠️ Attention ! Vous approchez du plafond (${data.percentageOfPlafond.toFixed(1)}%). Surveillez votre CA de près.`,
    }
  }

  return null
}
