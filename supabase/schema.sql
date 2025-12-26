-- =======================
-- FREELANCER TIME TRACKER - Complete Database Schema
-- =======================
-- Copy and paste this entire file into Supabase SQL Editor

-- =======================
-- EXTENSIONES Y TIPOS
-- =======================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos ENUM para estados
CREATE TYPE activity_status AS ENUM (
  'por_validar',
  'en_curso',
  'en_prueba',
  'completada',
  'por_facturar',
  'facturada'
);

CREATE TYPE invoice_status AS ENUM (
  'borrador',
  'en_espera_pago',
  'pagada',
  'anulada'
);

CREATE TYPE service_type AS ENUM (
  'programacion',
  'consultoria',
  'diseno',
  'reunion',
  'soporte',
  'otro'
);

-- =======================
-- TABLA: user_settings
-- =======================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información empresa
  company_name VARCHAR(255),
  siret VARCHAR(14) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(2) DEFAULT 'FR',

  -- Configuración fiscal
  tva_applicable BOOLEAN DEFAULT FALSE,
  taux_cotisations DECIMAL(5,2) DEFAULT 24.60, -- 24.6% BNC 2025
  plafond_ca_annuel DECIMAL(10,2) DEFAULT 77700.00,

  -- Configuración UI
  theme VARCHAR(10) DEFAULT 'light',
  language VARCHAR(5) DEFAULT 'fr',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- =======================
-- TABLA: clients
-- =======================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información básica
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Información fiscal (obligatoria desde julio 2024)
  siret VARCHAR(14),
  tva_intracommunautaire VARCHAR(20),

  -- Dirección
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(2) DEFAULT 'FR',

  -- Notas
  notes TEXT,

  -- Estado
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índices
  CONSTRAINT unique_client_siret UNIQUE(user_id, siret)
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_active ON clients(user_id, is_active);

-- =======================
-- TABLA: projects
-- =======================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Información básica
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Configuración
  color VARCHAR(7), -- HEX color para UI

  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_active ON projects(user_id, is_active);

-- =======================
-- TABLA: rates (Tarifas)
-- =======================
CREATE TABLE rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo de servicio
  service_type service_type NOT NULL,

  -- Tarifa (puede ser específica por cliente o default)
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  hourly_rate DECIMAL(10,2) NOT NULL,

  -- Metadata
  description TEXT,

  -- Estado
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Solo una tarifa default por tipo de servicio
  CONSTRAINT unique_default_rate UNIQUE(user_id, service_type, client_id)
);

CREATE INDEX idx_rates_user_id ON rates(user_id);
CREATE INDEX idx_rates_client_id ON rates(client_id);

-- =======================
-- TABLA: activities (Tareas/Actividades)
-- =======================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Información básica
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Tipo de servicio y tarifa aplicable
  service_type service_type NOT NULL,
  hourly_rate DECIMAL(10,2), -- Se copia de rates al crear

  -- Estimación
  estimated_hours DECIMAL(10,2),

  -- Estado y workflow
  status activity_status DEFAULT 'por_validar',

  -- Orden en kanban
  sort_order INTEGER DEFAULT 0,

  -- Observaciones
  observations TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  invoiced_at TIMESTAMPTZ
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_project_id ON activities(project_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_client_id ON activities(client_id);

-- =======================
-- TABLA: time_entries (Registro de tiempo)
-- =======================
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,

  -- Tiempo
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER, -- Calculado automáticamente

  -- Notas
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_activity_id ON time_entries(activity_id);
CREATE INDEX idx_time_entries_date ON time_entries(start_time);

-- =======================
-- TABLA: activity_attachments
-- =======================
CREATE TABLE activity_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,

  -- Storage info
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Path en Supabase Storage
  file_size INTEGER, -- bytes
  mime_type VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_attachments_activity_id ON activity_attachments(activity_id);

-- =======================
-- TABLA: invoices
-- =======================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Número de factura (formato: YYYY-NNNN)
  invoice_number VARCHAR(50) UNIQUE NOT NULL,

  -- Fechas
  invoice_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,

  -- Montos
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Estado
  status invoice_status DEFAULT 'borrador',

  -- Notas
  notes TEXT,
  payment_terms TEXT,

  -- PDF generado
  pdf_path TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date DESC);

-- =======================
-- TABLA: invoice_items
-- =======================
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Puede ser de una actividad o item manual
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,

  -- Información del item
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,

  -- Tipo de servicio (para reportes)
  service_type service_type,

  -- Orden
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_activity_id ON invoice_items(activity_id);

-- =======================
-- ROW LEVEL SECURITY (RLS)
-- =======================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Políticas para user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Políticas para clients
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Políticas para projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Políticas para rates
CREATE POLICY "Users can view their own rates"
  ON rates FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own rates"
  ON rates FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own rates"
  ON rates FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own rates"
  ON rates FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Políticas para activities
CREATE POLICY "Users can view their own activities"
  ON activities FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own activities"
  ON activities FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own activities"
  ON activities FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own activities"
  ON activities FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Políticas para time_entries
CREATE POLICY "Users can view their own time entries"
  ON time_entries FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own time entries"
  ON time_entries FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own time entries"
  ON time_entries FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own time entries"
  ON time_entries FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Políticas para activity_attachments
CREATE POLICY "Users can view their own attachments"
  ON activity_attachments FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own attachments"
  ON activity_attachments FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own attachments"
  ON activity_attachments FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Políticas para invoices
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own invoices"
  ON invoices FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own invoices"
  ON invoices FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own invoices"
  ON invoices FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Políticas para invoice_items
CREATE POLICY "Users can view items from their own invoices"
  ON invoice_items FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert items to their own invoices"
  ON invoice_items FOR INSERT
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update items from their own invoices"
  ON invoice_items FOR UPDATE
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete items from their own invoices"
  ON invoice_items FOR DELETE
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = (SELECT auth.uid())
    )
  );

-- =======================
-- FUNCIONES Y TRIGGERS
-- =======================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas relevantes
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rates_updated_at
  BEFORE UPDATE ON rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular duration_minutes en time_entries
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_duration_on_insert
  BEFORE INSERT ON time_entries
  FOR EACH ROW EXECUTE FUNCTION calculate_time_entry_duration();

CREATE TRIGGER calculate_duration_on_update
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION calculate_time_entry_duration();

-- Función para generar invoice_number automáticamente
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix VARCHAR(4);
  next_number INTEGER;
  new_invoice_number VARCHAR(50);
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    year_prefix := TO_CHAR(NEW.invoice_date, 'YYYY');

    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 6) AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices
    WHERE user_id = NEW.user_id
      AND invoice_number LIKE year_prefix || '-%';

    new_invoice_number := year_prefix || '-' || LPAD(next_number::TEXT, 4, '0');
    NEW.invoice_number := new_invoice_number;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- =======================
-- VISTAS ÚTILES
-- =======================

-- Vista: Actividades con tiempo total trabajado
CREATE OR REPLACE VIEW activities_with_time AS
SELECT
  a.*,
  COALESCE(SUM(te.duration_minutes), 0) AS total_minutes_logged,
  ROUND(COALESCE(SUM(te.duration_minutes), 0) / 60.0, 2) AS total_hours_logged,
  CASE
    WHEN a.hourly_rate IS NOT NULL AND COALESCE(SUM(te.duration_minutes), 0) > 0
    THEN ROUND((COALESCE(SUM(te.duration_minutes), 0) / 60.0) * a.hourly_rate, 2)
    ELSE 0
  END AS total_amount
FROM activities a
LEFT JOIN time_entries te ON te.activity_id = a.id
GROUP BY a.id;

-- Vista: Resumen de facturación mensual (para URSSAF)
CREATE OR REPLACE VIEW monthly_revenue_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', invoice_date) AS month,
  COUNT(*) AS invoice_count,
  SUM(CASE WHEN status = 'pagada' THEN total ELSE 0 END) AS revenue_paid,
  SUM(CASE WHEN status = 'en_espera_pago' THEN total ELSE 0 END) AS revenue_pending,
  SUM(total) AS revenue_total
FROM invoices
WHERE status != 'anulada'
GROUP BY user_id, DATE_TRUNC('month', invoice_date)
ORDER BY month DESC;

-- Vista: Chiffre d'affaires anual
CREATE OR REPLACE VIEW annual_revenue_summary AS
SELECT
  user_id,
  EXTRACT(YEAR FROM invoice_date) AS year,
  COUNT(*) AS invoice_count,
  SUM(CASE WHEN status = 'pagada' THEN total ELSE 0 END) AS revenue_paid,
  SUM(CASE WHEN status = 'en_espera_pago' THEN total ELSE 0 END) AS revenue_pending,
  SUM(total) AS revenue_total
FROM invoices
WHERE status != 'anulada'
GROUP BY user_id, EXTRACT(YEAR FROM invoice_date)
ORDER BY year DESC;

-- =======================
-- STORAGE BUCKETS
-- =======================
-- Run this AFTER creating the buckets in Supabase Storage UI

-- Create buckets for storage (run in SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('activity-attachments', 'activity-attachments', false),
  ('invoice-pdfs', 'invoice-pdfs', false)
ON CONFLICT DO NOTHING;

-- Políticas de storage para activity-attachments
CREATE POLICY "Users can upload their own activity attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'activity-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own activity attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'activity-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own activity attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'activity-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Políticas de storage para invoice-pdfs
CREATE POLICY "Users can upload their own invoice PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoice-pdfs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own invoice PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoice-pdfs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
