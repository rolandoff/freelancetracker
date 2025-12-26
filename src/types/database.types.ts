/**
 * Database Types
 * Auto-generated from Supabase schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Enums
export type ActivityStatus =
  | 'por_validar'
  | 'en_curso'
  | 'en_prueba'
  | 'completada'
  | 'por_facturar'
  | 'facturada'

export type InvoiceStatus = 'borrador' | 'en_espera_pago' | 'pagada' | 'anulada'

export type ServiceType =
  | 'programacion'
  | 'consultoria'
  | 'diseno'
  | 'reunion'
  | 'soporte'
  | 'otro'

// Insert types
export type InsertUserSettings = {
  id?: string
  user_id: string
  company_name?: string | null
  siret?: string | null
  address?: string | null
  city?: string | null
  postal_code?: string | null
  country?: string
  tva_applicable?: boolean
  taux_cotisations?: number
  plafond_ca_annuel?: number
  theme?: 'light' | 'dark'
  language?: string
  created_at?: string
  updated_at?: string
}

// Database Tables
export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: UserSettings
        Insert: InsertUserSettings
        Update: Partial<UserSettings>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Client>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Project>
      }
      rates: {
        Row: Rate
        Insert: Omit<Rate, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Rate>
      }
      activities: {
        Row: Activity
        Insert: Omit<Activity, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Activity>
      }
      time_entries: {
        Row: TimeEntry
        Insert: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<TimeEntry>
      }
      activity_attachments: {
        Row: ActivityAttachment
        Insert: Omit<ActivityAttachment, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<ActivityAttachment>
      }
      invoices: {
        Row: Invoice
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Invoice>
      }
      invoice_items: {
        Row: InvoiceItem
        Insert: Omit<InvoiceItem, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<InvoiceItem>
      }
    }
    Views: {
      activities_with_time: {
        Row: ActivityWithTime
      }
      monthly_revenue_summary: {
        Row: MonthlyRevenueSummary
      }
      annual_revenue_summary: {
        Row: AnnualRevenueSummary
      }
    }
  }
}

// Table Types
export interface UserSettings {
  id: string
  user_id: string
  company_name: string | null
  siret: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string
  tva_applicable: boolean
  taux_cotisations: number
  plafond_ca_annuel: number
  theme: 'light' | 'dark'
  language: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  siret: string | null
  tva_intracommunautaire: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  client_id: string
  name: string
  description: string | null
  color: string | null
  is_active: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface Rate {
  id: string
  user_id: string
  service_type: ServiceType
  client_id: string | null
  hourly_rate: number
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  user_id: string
  client_id: string
  project_id: string
  title: string
  description: string | null
  service_type: ServiceType
  hourly_rate: number | null
  estimated_hours: number | null
  status: ActivityStatus
  sort_order: number
  observations: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  invoiced_at: string | null
}

export interface TimeEntry {
  id: string
  user_id: string
  activity_id: string
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ActivityAttachment {
  id: string
  user_id: string
  activity_id: string
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

export interface Invoice {
  id: string
  user_id: string
  client_id: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  paid_date: string | null
  sent_date: string | null
  subtotal: number
  discount_percentage: number
  discount_amount: number
  total: number
  status: InvoiceStatus
  notes: string | null
  payment_terms: string | null
  pdf_path: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  activity_id: string | null
  description: string
  quantity: number
  unit_price: number
  total: number
  service_type: ServiceType | null
  sort_order: number
  created_at: string
}

// View Types
export interface ActivityWithTime extends Activity {
  total_minutes_logged: number
  total_hours_logged: number
  total_amount: number
}

export interface MonthlyRevenueSummary {
  user_id: string
  month: string
  invoice_count: number
  revenue_paid: number
  revenue_pending: number
  revenue_total: number
}

export interface AnnualRevenueSummary {
  user_id: string
  year: number
  invoice_count: number
  revenue_paid: number
  revenue_pending: number
  revenue_total: number
}

// Extended types with relations
export interface ActivityWithRelations extends Activity {
  client?: Client
  project?: Project
  time_entries?: TimeEntry[]
  attachments?: ActivityAttachment[]
}

export interface InvoiceWithRelations extends Invoice {
  client?: Client
  items?: InvoiceItem[]
}

export interface ProjectWithRelations extends Project {
  client?: Client
  activities?: Activity[]
}
