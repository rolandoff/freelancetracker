import { describe, it, expect } from 'vitest'
import {
  validateSIRET,
  validateEmail,
  validatePhone,
  validateHexColor,
  validateFile,
  validateRate,
  validatePositiveNumber,
  validatePassword,
  validateRequired,
} from './validation'
import { FILE_UPLOAD, FRENCH_LEGAL } from '@/lib/constants'

describe('validation utils', () => {
  describe('validateSIRET', () => {
    it('returns error when empty', () => {
      expect(validateSIRET('')).toEqual({ valid: false, error: 'SIRET est requis' })
    })

    it('validates format and luhn checksum', () => {
      // Valid sample SIRET that passes Luhn: 73282932000074
      expect(validateSIRET('73282932000074')).toEqual({ valid: true })
      expect(validateSIRET('123')).toEqual({
        valid: false,
        error: `SIRET doit contenir exactement ${FRENCH_LEGAL.SIRET_LENGTH} chiffres`,
      })
      expect(validateSIRET('11111111111111')).toEqual({
        valid: false,
        error: 'SIRET invalide (échec de la vérification Luhn)',
      })
    })
  })

  describe('validateEmail', () => {
    it('validates email format and required constraint', () => {
      expect(validateEmail('')).toEqual({ valid: false, error: 'Email est requis' })
      expect(validateEmail('invalid-email')).toEqual({ valid: false, error: 'Format email invalide' })
      expect(validateEmail('test@example.com')).toEqual({ valid: true })
    })
  })

  describe('validatePhone', () => {
    it('allows optional phone and enforces format', () => {
      expect(validatePhone('')).toEqual({ valid: true })
      expect(validatePhone('123')).toEqual({
        valid: false,
        error: 'Téléphone doit contenir au moins 10 chiffres',
      })
      expect(validatePhone('01 23 45 67 89')).toEqual({ valid: true })
    })
  })

  describe('validateHexColor', () => {
    it('accepts optional color and validates pattern', () => {
      expect(validateHexColor('')).toEqual({ valid: true })
      expect(validateHexColor('12345')).toEqual({
        valid: false,
        error: 'Format couleur invalide (utilisez #RRGGBB)',
      })
      expect(validateHexColor('#FFAACC')).toEqual({ valid: true })
    })
  })

  describe('validateFile', () => {
    const buildFile = (overrides: Partial<File> = {}): File =>
      ({
        size: 1024,
        type: FILE_UPLOAD.ALLOWED_TYPES[0],
        ...overrides,
      }) as File

    it('rejects oversized files', () => {
      const file = buildFile({ size: FILE_UPLOAD.MAX_SIZE_BYTES + 1 })
      expect(validateFile(file)).toEqual({
        valid: false,
        error: `Fichier trop volumineux. Taille maximum: ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
      })
    })

    it('rejects unsupported file types', () => {
      const file = buildFile({ type: 'application/zip' })
      expect(validateFile(file)).toEqual({
        valid: false,
        error: `Type de fichier non autorisé. Types acceptés: ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')}`,
      })
    })

    it('accepts valid file', () => {
      expect(validateFile(buildFile())).toEqual({ valid: true })
    })
  })

  describe('validateRate', () => {
    it('requires positive rate within bounds', () => {
      expect(validateRate(null)).toEqual({ valid: false, error: 'Tarif horaire requis' })
      expect(validateRate(0)).toEqual({ valid: false, error: 'Tarif horaire doit être supérieur à 0' })
      expect(validateRate(20000)).toEqual({
        valid: false,
        error: 'Tarif horaire semble trop élevé',
      })
      expect(validateRate(100)).toEqual({ valid: true })
    })
  })

  describe('validatePositiveNumber', () => {
    it('checks required and positive constraint with custom field name', () => {
      expect(validatePositiveNumber(null, 'Montant')).toEqual({
        valid: false,
        error: 'Montant est requis',
      })
      expect(validatePositiveNumber(-5, 'Montant')).toEqual({
        valid: false,
        error: 'Montant doit être positif',
      })
      expect(validatePositiveNumber(10, 'Montant')).toEqual({ valid: true })
    })
  })

  describe('validatePassword', () => {
    it('enforces required, length, and complexity rules', () => {
      expect(validatePassword('')).toEqual({ valid: false, error: 'Mot de passe requis' })
      expect(validatePassword('short')).toEqual({
        valid: false,
        error: 'Mot de passe doit contenir au moins 8 caractères',
      })
      expect(validatePassword('password1')).toEqual({
        valid: false,
        error: 'Mot de passe doit contenir majuscules, minuscules et chiffres',
      })
      expect(validatePassword('StrongPass1')).toEqual({ valid: true })
    })
  })

  describe('validateRequired', () => {
    it('detects empty values with custom field name', () => {
      expect(validateRequired('', 'Nom')).toEqual({ valid: false, error: 'Nom est requis' })
      expect(validateRequired('value', 'Nom')).toEqual({ valid: true })
    })
  })
})
