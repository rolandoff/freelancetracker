import type { ActivityStatus, InvoiceStatus, ServiceType } from '@/types/database.types'

/**
 * Application Constants
 */

// Activity Status
export const ACTIVITY_STATUSES: { value: ActivityStatus; label: string; color: string }[] = [
  { value: 'por_validar', label: 'Por Validar', color: '#a0aec0' }, // Gray
  { value: 'en_curso', label: 'En Curso', color: '#3182ce' }, // Blue
  { value: 'en_prueba', label: 'En Prueba', color: '#dd6b20' }, // Orange
  { value: 'completada', label: 'Completada', color: '#38a169' }, // Green
  { value: 'por_facturar', label: 'Por Facturar', color: '#2a4365' }, // Dark Blue
  { value: 'facturada', label: 'Facturada', color: '#4a5568' }, // Dark Gray
]

// Invoice Status
export const INVOICE_STATUSES: { value: InvoiceStatus; label: string; color: string }[] = [
  { value: 'borrador', label: 'Borrador', color: '#a0aec0' }, // Gray
  { value: 'en_espera_pago', label: 'En Espera de Pago', color: '#dd6b20' }, // Orange
  { value: 'pagada', label: 'Pagada', color: '#38a169' }, // Green
  { value: 'anulada', label: 'Anulada', color: '#c53030' }, // Red
]

// Service Types
export const SERVICE_TYPES: { value: ServiceType; label: string; icon: string }[] = [
  { value: 'programacion', label: 'Programación', icon: 'Code' },
  { value: 'consultoria', label: 'Consultoría', icon: 'Users' },
  { value: 'diseno', label: 'Diseño', icon: 'Palette' },
  { value: 'reunion', label: 'Reunión', icon: 'Calendar' },
  { value: 'soporte', label: 'Soporte', icon: 'HeadphonesIcon' },
  { value: 'otro', label: 'Otro', icon: 'MoreHorizontal' },
]

// French Legal Constants
export const FRENCH_LEGAL = {
  SIRET_LENGTH: 14,
  TVA_THRESHOLD: 37500, // €37,500 - TVA threshold
  PLAFOND_CA: 77700, // €77,700 - Annual revenue limit for micro-entrepreneur
  TAUX_COTISATIONS_BNC: 24.6, // 24.6% - Social contributions rate for BNC 2025
  ARTICLE_293B:
    "TVA non applicable, art. 293 B du CGI - Dispensé d'immatriculation au RCS/RM",
  PAYMENT_TERMS_DEFAULT:
    'Paiement à réception. En cas de retard de paiement, indemnité forfaitaire pour frais de recouvrement : 40 euros (art. L.441-6 du Code de commerce).',
}

// File Upload Constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'],
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100],
}

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy', // French format
  ISO: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm:ss',
}

// Currency
export const CURRENCY = {
  CODE: 'EUR',
  SYMBOL: '€',
  LOCALE: 'fr-FR',
}

// Validation Regex
export const VALIDATION = {
  SIRET: /^\d{14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s+()-]+$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
}

// Storage Buckets
export const STORAGE_BUCKETS = {
  ACTIVITY_ATTACHMENTS: 'activity-attachments',
  INVOICE_PDFS: 'invoice-pdfs',
}

// App Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  KANBAN: '/kanban',
  CLIENTS: '/clients',
  CLIENT_DETAIL: '/clients/:id',
  CLIENT_NEW: '/clients/new',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  PROJECT_NEW: '/projects/new',
  INVOICES: '/invoices',
  INVOICE_DETAIL: '/invoices/:id',
  INVOICE_NEW: '/invoices/new',
  URSSAF: '/urssaf',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_RATES: '/settings/rates',
  SETTINGS_LEGAL: '/settings/legal',
  SETTINGS_PREFERENCES: '/settings/preferences',
}

// Threshold Alerts
export const THRESHOLDS = {
  TVA_WARNING: 0.9, // Alert at 90% of TVA threshold
  PLAFOND_WARNING: 0.9, // Alert at 90% of plafond
  TVA_CRITICAL: 1.0, // Critical at 100%
  PLAFOND_CRITICAL: 1.0, // Critical at 100%
}
