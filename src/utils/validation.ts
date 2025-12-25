import { VALIDATION, FRENCH_LEGAL, FILE_UPLOAD } from '@/lib/constants'

/**
 * Validate SIRET (14 digits)
 */
export function validateSIRET(siret: string): { valid: boolean; error?: string } {
  if (!siret) {
    return { valid: false, error: 'SIRET est requis' }
  }

  const cleaned = siret.replace(/\s/g, '')

  if (!VALIDATION.SIRET.test(cleaned)) {
    return {
      valid: false,
      error: `SIRET doit contenir exactement ${FRENCH_LEGAL.SIRET_LENGTH} chiffres`,
    }
  }

  // Luhn algorithm check (optional but recommended)
  if (!luhnCheck(cleaned)) {
    return { valid: false, error: 'SIRET invalide (échec de la vérification Luhn)' }
  }

  return { valid: true }
}

/**
 * Luhn algorithm for SIRET validation
 */
function luhnCheck(siret: string): boolean {
  let sum = 0
  let isEven = false

  for (let i = siret.length - 1; i >= 0; i--) {
    let digit = parseInt(siret[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email est requis' }
  }

  if (!VALIDATION.EMAIL.test(email)) {
    return { valid: false, error: 'Format email invalide' }
  }

  return { valid: true }
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone) {
    return { valid: true } // Phone is optional
  }

  if (!VALIDATION.PHONE.test(phone)) {
    return { valid: false, error: 'Format téléphone invalide' }
  }

  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length < 10) {
    return { valid: false, error: 'Téléphone doit contenir au moins 10 chiffres' }
  }

  return { valid: true }
}

/**
 * Validate HEX color
 */
export function validateHexColor(color: string): { valid: boolean; error?: string } {
  if (!color) {
    return { valid: true } // Color is optional
  }

  if (!VALIDATION.HEX_COLOR.test(color)) {
    return { valid: false, error: 'Format couleur invalide (utilisez #RRGGBB)' }
  }

  return { valid: true }
}

/**
 * Validate file upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximum: ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
    }
  }

  // Check file type
  if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Types acceptés: ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Validate hourly rate
 */
export function validateRate(rate: number | null): { valid: boolean; error?: string } {
  if (rate === null || rate === undefined) {
    return { valid: false, error: 'Tarif horaire requis' }
  }

  if (rate <= 0) {
    return { valid: false, error: 'Tarif horaire doit être supérieur à 0' }
  }

  if (rate > 10000) {
    return { valid: false, error: 'Tarif horaire semble trop élevé' }
  }

  return { valid: true }
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(
  value: number | null,
  fieldName = 'Valeur'
): { valid: boolean; error?: string } {
  if (value === null || value === undefined) {
    return { valid: false, error: `${fieldName} est requis` }
  }

  if (value < 0) {
    return { valid: false, error: `${fieldName} doit être positif` }
  }

  return { valid: true }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Mot de passe requis' }
  }

  if (password.length < 8) {
    return { valid: false, error: 'Mot de passe doit contenir au moins 8 caractères' }
  }

  // Optional: Check for complexity
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      valid: false,
      error: 'Mot de passe doit contenir majuscules, minuscules et chiffres',
    }
  }

  return { valid: true }
}

/**
 * Validate required field
 */
export function validateRequired(value: unknown, fieldName = 'Ce champ'): {
  valid: boolean
  error?: string
} {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} est requis` }
  }

  return { valid: true }
}
