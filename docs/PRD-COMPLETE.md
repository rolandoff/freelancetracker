# PRD: Sistema de Gestión de Tiempo y Facturación para Freelancers

## 1. VISIÓN DEL PRODUCTO

### 1.1 Objetivo
Sistema web progresivo para freelancers franceses que gestiona el ciclo completo desde la creación de tareas hasta el cobro efectivo, con workflows granulares de estados y cálculos automáticos de cotizaciones URSSAF.

### 1.2 Usuario principal
Freelancer francés (micro-entrepreneur / auto-entrepreneur) trabajando en servicios de consultoría, desarrollo, diseño. Uso individual con potencial multi-tenant futuro.

### 1.3 Propuesta de valor diferenciadora
- Workflow de 6 estados: Por validar → En curso → En prueba → Completada → Por facturar → Facturada → Pagada
- Cálculo automático de cotizaciones sociales URSSAF (24.6% BNC 2025)
- Tarifas variables por tipo de servicio Y por cliente
- Kanban visual con drag & drop para gestión de actividades
- Generación de facturas con menciones legales francesas obligatorias

---

## 2. STACK TECNOLÓGICO

### 2.1 Frontend
- **Framework**: React 18+ con Vite
- **Lenguaje**: TypeScript 5+
- **UI Components**: shadcn/ui (Tailwind CSS + Radix UI)
- **Drag & Drop**: @dnd-kit/core
- **Forms**: react-hook-form + Zod
- **State Management**: 
  - Zustand (UI state: theme, sidebar, timer)
  - TanStack Query v5 (server state)
- **Routing**: React Router v6
- **Charts**: Recharts
- **PDF Generation**: @react-pdf/renderer
- **Date Picker**: react-day-picker
- **Icons**: Lucide React

### 2.2 Backend & Base de Datos
- **BaaS**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (archivos adjuntos)
- **Realtime**: Supabase Realtime (actualización kanban)

### 2.3 Deployment
- **Hosting Frontend**: LWS (cPanel + FTP)
- **Base de Datos**: Supabase Cloud (free tier)
- **SSL**: Let's Encrypt vía LWS
- **Subdominios**: 
  - `app.tudominio.com` → Aplicación principal
  - `app.tudominio.com/storybook` → Storybook

### 2.4 Storybook
- **Version**: Storybook 8+
- **Framework**: @storybook/react-vite
- **Addons**: 
  - @storybook/addon-essentials
  - @storybook/addon-themes (dark/light mode)

### 2.5 Herramientas de Desarrollo
- **Build Tool**: Vite
- **Linter**: ESLint + TypeScript ESLint
- **Formatter**: Prettier
- **Testing**: Vitest + React Testing Library (opcional MVP)

---

## 3. ARQUITECTURA DE BASE DE DATOS

### 3.1 Schema PostgreSQL Completo

```sql
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
```

### 3.2 Supabase Storage Buckets

```sql
-- Crear buckets para storage
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('activity-attachments', 'activity-attachments', false),
  ('invoice-pdfs', 'invoice-pdfs', false);

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
```

---

## 4. ESPECIFICACIONES FUNCIONALES POR MÓDULO

### MÓDULO 1: AUTENTICACIÓN Y CONFIGURACIÓN

#### 4.1.1 Login/Registro
**Casos de uso:**
- UC-AUTH-01: Usuario se registra con email/password
- UC-AUTH-02: Usuario inicia sesión
- UC-AUTH-03: Usuario cierra sesión
- UC-AUTH-04: Usuario recupera contraseña

**Flujo de registro:**
1. Usuario completa formulario (email, password, confirmar password)
2. Validación: email válido, password mín 8 caracteres
3. Supabase crea usuario en auth.users
4. Se crea automáticamente registro en user_settings con valores default
5. Redirección a onboarding

**Componentes UI:**
- `LoginPage.tsx`: Formulario login
- `RegisterPage.tsx`: Formulario registro
- `ForgotPasswordPage.tsx`: Recuperación contraseña

#### 4.1.2 Configuración de Usuario
**Casos de uso:**
- UC-SETTINGS-01: Usuario configura información empresa (SIRET, dirección)
- UC-SETTINGS-02: Usuario configura parámetros fiscales (tasa cotizaciones, plafond CA)
- UC-SETTINGS-03: Usuario cambia tema (light/dark)

**Datos requeridos:**
- SIRET (14 dígitos, validación formato)
- Razón social
- Dirección completa
- Taux cotisations (default 24.6%)
- Plafond CA anual (default 77700€)

**Componentes UI:**
- `SettingsPage.tsx`: Página principal configuración
- `CompanyInfoForm.tsx`: Formulario datos empresa
- `FiscalSettingsForm.tsx`: Configuración fiscal
- `ThemeToggle.tsx`: Switch dark/light mode

---

### MÓDULO 2: GESTIÓN DE CLIENTES Y PROYECTOS

#### 4.2.1 Clientes
**Casos de uso:**
- UC-CLIENT-01: Crear cliente
- UC-CLIENT-02: Editar cliente
- UC-CLIENT-03: Ver lista de clientes
- UC-CLIENT-04: Archivar/Desactivar cliente
- UC-CLIENT-05: Ver detalle cliente (proyectos, actividades, facturas)

**Datos de cliente:**
- Nombre (requerido)
- Email, teléfono
- SIRET (requerido desde julio 2024 para clientes profesionales)
- TVA intracommunautaire
- Dirección completa
- Notas

**Validaciones:**
- SIRET: 14 dígitos numéricos
- Email: formato válido
- Campos obligatorios marcados

**Componentes UI:**
- `ClientsPage.tsx`: Lista clientes con tabla/cards
- `ClientForm.tsx`: Formulario crear/editar
- `ClientDetailPage.tsx`: Vista detallada cliente
- `ClientCard.tsx`: Card individual en lista

#### 4.2.2 Proyectos
**Casos de uso:**
- UC-PROJECT-01: Crear proyecto asociado a cliente
- UC-PROJECT-02: Editar proyecto
- UC-PROJECT-03: Ver lista de proyectos por cliente
- UC-PROJECT-04: Archivar proyecto

**Datos de proyecto:**
- Nombre (requerido)
- Cliente (requerido)
- Descripción
- Color (para identificación visual)

**Componentes UI:**
- `ProjectsPage.tsx`: Lista proyectos
- `ProjectForm.tsx`: Formulario crear/editar
- `ProjectSelector.tsx`: Selector dropdown para formularios
- `ProjectBadge.tsx`: Badge con color de proyecto

---

### MÓDULO 3: GESTIÓN DE TARIFAS

#### 4.3.1 Configuración de Tarifas
**Casos de uso:**
- UC-RATE-01: Definir tarifa base por tipo de servicio
- UC-RATE-02: Definir tarifa específica por cliente y tipo de servicio
- UC-RATE-03: Ver lista de tarifas configuradas
- UC-RATE-04: Desactivar tarifa

**Lógica de tarifas:**
1. Existen tarifas BASE (sin client_id)
2. Existen tarifas ESPECÍFICAS (con client_id)
3. Al crear actividad, se busca: 
   - Primero: tarifa específica para (cliente, tipo_servicio)
   - Si no existe: tarifa base para tipo_servicio
   - Si no existe: usuario debe ingresar manualmente

**Tipos de servicio:**
- Programación
- Consultoría
- Diseño
- Reunión
- Soporte
- Otro

**Componentes UI:**
- `RatesPage.tsx`: Gestión de tarifas
- `RateForm.tsx`: Formulario configuración
- `RatesTable.tsx`: Tabla tarifas con filtros
- `ServiceTypeSelector.tsx`: Selector tipo servicio

---

### MÓDULO 4: ACTIVIDADES Y KANBAN

#### 4.4.1 Estados de Actividad (Workflow)
```
Por validar → En curso → En prueba → Completada → Por facturar → Facturada
```

**Transiciones permitidas:**
- Por validar → En curso
- En curso → En prueba
- En curso → Por validar (rollback)
- En prueba → Completada
- En prueba → En curso (rollback)
- Completada → Por facturar
- Por facturar → Facturada (al incluir en factura)

#### 4.4.2 Casos de Uso Actividades
- UC-ACTIVITY-01: Crear actividad
- UC-ACTIVITY-02: Editar actividad
- UC-ACTIVITY-03: Cambiar estado (mover en kanban)
- UC-ACTIVITY-04: Loggear tiempo trabajado
- UC-ACTIVITY-05: Adjuntar archivos
- UC-ACTIVITY-06: Ver detalle actividad
- UC-ACTIVITY-07: Eliminar actividad

**Datos de actividad:**
- Título (requerido)
- Descripción
- Cliente (requerido)
- Proyecto (requerido)
- Tipo de servicio (requerido)
- Tarifa horaria (autocompletada desde rates)
- Estimación de horas
- Estado
- Observaciones

#### 4.4.3 Kanban Board
**Requisitos:**
- Columnas = Estados (6 columnas)
- Tarjetas = Actividades
- Drag & drop para cambiar estado
- Actualización real-time (Supabase Realtime)
- Filtros: por cliente, por proyecto
- Indicadores visuales: horas estimadas vs loggeadas

**Componentes UI:**
- `KanbanPage.tsx`: Vista principal kanban
- `KanbanColumn.tsx`: Columna de estado
- `ActivityCard.tsx`: Tarjeta draggable
- `ActivityDetailModal.tsx`: Modal detalle/edición
- `ActivityForm.tsx`: Formulario crear/editar

#### 4.4.4 Time Tracking
**Casos de uso:**
- UC-TIME-01: Iniciar timer para actividad
- UC-TIME-02: Pausar/detener timer
- UC-TIME-03: Agregar tiempo manualmente
- UC-TIME-04: Ver resumen de tiempo por actividad
- UC-TIME-05: Editar entrada de tiempo

**Componentes UI:**
- `TimeTracker.tsx`: Widget timer global (visible en sidebar)
- `TimeEntryForm.tsx`: Formulario entrada manual
- `TimeEntriesList.tsx`: Lista entradas tiempo
- `ActivityTimeStats.tsx`: Estadísticas tiempo por actividad

#### 4.4.5 Archivos Adjuntos
**Requisitos:**
- Tipos permitidos: imágenes (jpg, png, webp), documentos (pdf, docx), archivos comprimidos (zip)
- Tamaño máximo: 10MB por archivo
- Storage: Supabase Storage bucket `activity-attachments`
- Organización: `/{user_id}/{activity_id}/{filename}`

**Componentes UI:**
- `FileUploader.tsx`: Componente upload drag & drop
- `AttachmentsList.tsx`: Lista archivos adjuntos
- `AttachmentPreview.tsx`: Preview/download archivos

---

### MÓDULO 5: FACTURACIÓN

#### 4.5.1 Casos de Uso Facturas
- UC-INVOICE-01: Crear factura desde actividades "por facturar"
- UC-INVOICE-02: Agregar ítems manuales a factura
- UC-INVOICE-03: Aplicar descuento (% o monto fijo)
- UC-INVOICE-04: Cambiar estado factura
- UC-INVOICE-05: Generar PDF factura
- UC-INVOICE-06: Enviar factura por email (futuro)
- UC-INVOICE-07: Marcar factura como pagada

**Flujo creación factura:**
1. Usuario selecciona cliente
2. Sistema filtra actividades en estado "por facturar" de ese cliente
3. Usuario selecciona actividades a incluir
4. Sistema calcula automáticamente:
   - Por cada actividad: horas_trabajadas * tarifa_horaria
   - Subtotal = suma de todos los ítems
5. Usuario puede agregar ítems manuales
6. Usuario puede aplicar descuento
7. Sistema calcula total final
8. Factura se crea en estado "borrador"

**Estados de factura:**
- Borrador: Editable, no genera número
- En espera de pago: Enviada al cliente, genera número automático
- Pagada: Cliente pagó, se registra fecha de pago
- Anulada: Factura cancelada

**Datos factura:**
- Cliente (requerido)
- Número factura (auto-generado formato YYYY-NNNN)
- Fecha factura (requerido)
- Fecha vencimiento
- Ítems (líneas de factura)
- Subtotal (calculado)
- Descuento % o monto
- Total (calculado)
- Términos de pago
- Notas

**Menciones legales obligatorias (Francia):**
```
SIRET/SIREN del freelancer
Mención "EI" o "Entrepreneur individuel"
SIRET del cliente (obligatorio desde julio 2024)
Categoría: "Prestation de services"
"TVA non applicable, article 293 B du CGI"
Numéro de facture secuencial
Fecha de emisión
Pénalités de retard en cas de paiement tardif
```

#### 4.5.2 Generación PDF
**Requisitos:**
- Biblioteca: @react-pdf/renderer
- Template profesional
- Incluir logo empresa (si existe)
- Tabla de ítems con: descripción, cantidad, precio unitario, total
- Subtotal, descuentos, total
- Menciones legales en footer
- Storage: Supabase Storage bucket `invoice-pdfs`

**Componentes UI:**
- `InvoicesPage.tsx`: Lista facturas
- `InvoiceForm.tsx`: Formulario crear factura
- `InvoiceItemsTable.tsx`: Tabla ítems editables
- `InvoicePDF.tsx`: Componente @react-pdf/renderer
- `InvoicePreview.tsx`: Vista previa antes de generar

#### 4.5.3 Módulo URSSAF
**Casos de uso:**
- UC-URSSAF-01: Ver chiffre d'affaires mensual
- UC-URSSAF-02: Ver chiffre d'affaires anual acumulado
- UC-URSSAF-03: Calcular cotizaciones mensuales
- UC-URSSAF-04: Alertas de plafonds

**Cálculos:**
```javascript
// Cotizaciones mensuales (solo facturas PAGADAS)
CA_mensual_encaissé = SUM(facturas.total WHERE status='pagada' AND month=X)
Cotisations_mensuales = CA_mensual_encaissé * 0.246 // 24.6% en 2025

// CA anual acumulado
CA_anual_acumulado = SUM(facturas.total WHERE status='pagada' AND year=Y)
Porcentaje_plafond = (CA_anual_acumulado / 77700) * 100

// Alertas
IF CA_anual_acumulado > 37500 THEN alert_TVA
IF CA_anual_acumulado > 77700 THEN alert_plafond_dépassé
```

**Componentes UI:**
- `URSSAFDashboard.tsx`: Dashboard resumen
- `MonthlyRevenueChart.tsx`: Gráfico CA mensual
- `CotisationsCalculator.tsx`: Calculadora cotizaciones
- `PlafondProgress.tsx`: Barra progreso vs plafond

---

### MÓDULO 6: REPORTES Y DASHBOARD

#### 4.6.1 Dashboard Principal
**KPIs a mostrar:**
- CA mes actual (facturas pagadas)
- CA año actual
- % vs plafond anual
- Cotizaciones URSSAF estimadas mes actual
- Facturas pendientes de pago (monto total)
- Horas trabajadas semana actual
- Actividades en curso
- Próximas fechas vencimiento facturas

**Gráficos:**
- CA mensual últimos 12 meses (bar chart)
- Distribución por tipo de servicio (pie chart)
- Timeline actividades completadas (gantt simplificado)

**Componentes UI:**
- `DashboardPage.tsx`: Vista principal
- `KPICard.tsx`: Tarjeta KPI individual
- `RevenueChart.tsx`: Gráfico ingresos
- `ServiceDistributionChart.tsx`: Gráfico distribución servicios
- `UpcomingInvoices.tsx`: Lista próximas facturas

#### 4.6.2 Reportes por Cliente
**Casos de uso:**
- UC-REPORT-01: Ver resumen cliente (proyectos, actividades, facturas)
- UC-REPORT-02: Exportar reporte cliente a PDF
- UC-REPORT-03: Ver histórico facturación por cliente

**Datos a mostrar:**
- Información cliente
- Proyectos activos/archivados
- Actividades completadas (agrupadas por proyecto)
- Facturas emitidas (total, pagadas, pendientes)
- CA total generado por cliente
- Horas trabajadas total

**Componentes UI:**
- `ClientReportPage.tsx`: Reporte detallado cliente
- `ClientProjectsList.tsx`: Lista proyectos cliente
- `ClientActivitiesSummary.tsx`: Resumen actividades
- `ClientInvoicesHistory.tsx`: Histórico facturas

---

## 5. ARQUITECTURA FRONTEND

### 5.1 Estructura de Directorios
```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # App principal con router
├── vite-env.d.ts              
│
├── components/                 # Componentes reutilizables
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── layout/                # Componentes layout
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ThemeProvider.tsx
│   │
│   └── shared/                # Componentes compartidos
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── DataTable.tsx
│       └── ...
│
├── features/                   # Módulos por feature
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ForgotPasswordForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   └── types.ts
│   │
│   ├── clients/
│   │   ├── components/
│   │   │   ├── ClientForm.tsx
│   │   │   ├── ClientCard.tsx
│   │   │   └── ClientsTable.tsx
│   │   ├── hooks/
│   │   │   ├── useClients.ts
│   │   │   └── useClient.ts
│   │   ├── pages/
│   │   │   ├── ClientsPage.tsx
│   │   │   └── ClientDetailPage.tsx
│   │   └── types.ts
│   │
│   ├── projects/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── types.ts
│   │
│   ├── rates/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── types.ts
│   │
│   ├── activities/
│   │   ├── components/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── ActivityCard.tsx
│   │   │   ├── ActivityForm.tsx
│   │   │   ├── TimeTracker.tsx
│   │   │   ├── TimeEntryForm.tsx
│   │   │   └── FileUploader.tsx
│   │   ├── hooks/
│   │   │   ├── useActivities.ts
│   │   │   ├── useActivity.ts
│   │   │   ├── useTimeEntries.ts
│   │   │   └── useActivityAttachments.ts
│   │   ├── pages/
│   │   │   └── KanbanPage.tsx
│   │   └── types.ts
│   │
│   ├── invoices/
│   │   ├── components/
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── InvoiceItemsTable.tsx
│   │   │   ├── InvoicePDF.tsx
│   │   │   └── InvoicePreview.tsx
│   │   ├── hooks/
│   │   │   └── useInvoices.ts
│   │   ├── pages/
│   │   │   ├── InvoicesPage.tsx
│   │   │   └── InvoiceDetailPage.tsx
│   │   └── types.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── KPICard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── URSSAFWidget.tsx
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx
│   │   └── types.ts
│   │
│   └── settings/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       └── types.ts
│
├── lib/                        # Utilidades y configuración
│   ├── supabase.ts            # Cliente Supabase
│   ├── utils.ts               # Helpers generales
│   ├── constants.ts           # Constantes globales
│   └── validations.ts         # Schemas Zod
│
├── hooks/                      # Hooks globales
│   ├── useMediaQuery.ts
│   └── useDebounce.ts
│
├── store/                      # Zustand stores
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── timerStore.ts
│
├── types/                      # Types globales TypeScript
│   ├── database.types.ts      # Auto-generado de Supabase
│   └── index.ts
│
└── styles/
    └── globals.css            # Tailwind + custom styles
```

### 5.2 Routing
```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            
            <Route path="/projects" element={<ProjectsPage />} />
            
            <Route path="/activities" element={<KanbanPage />} />
            
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="/invoices/new" element={<InvoiceCreatePage />} />
            
            <Route path="/rates" element={<RatesPage />} />
            
            <Route path="/reports/urssaf" element={<URSSAFDashboard />} />
            
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        
        {/* Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 5.3 State Management

**Zustand Stores:**

```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  session: Session | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

// store/uiStore.ts
interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  setTheme: (theme: UIState['theme']) => void;
  toggleSidebar: () => void;
}

// store/timerStore.ts
interface TimerState {
  activeTimer: {
    activityId: string;
    startTime: Date;
  } | null;
  startTimer: (activityId: string) => void;
  stopTimer: () => Promise<void>;
}
```

**TanStack Query Hooks:**

```typescript
// features/clients/hooks/useClients.ts
export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
}

// features/activities/hooks/useActivities.ts
export function useActivities(projectId?: string) {
  return useQuery({
    queryKey: ['activities', projectId],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select(`
          *,
          client:clients(*),
          project:projects(*)
        `)
        .order('sort_order');
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}
```

### 5.4 Configuración Supabase

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

---

## 6. CONFIGURACIÓN DARK/LIGHT MODE

### 6.1 Implementación Tailwind + shadcn/ui

```typescript
// components/layout/ThemeProvider.tsx
import { createContext, useContext, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  return children;
}
```

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... más variables */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    /* ... más variables */
  }
}
```

---

## 7. STORYBOOK CONFIGURACIÓN

### 7.1 Setup Storybook

```bash
# Instalación
npx storybook@latest init

# Configuración específica para Vite + React
```

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

```typescript
// .storybook/preview.ts
import '../src/styles/globals.css';
import { withThemeByClassName } from '@storybook/addon-themes';

export const decorators = [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
];
```

### 7.2 Stories Ejemplo

```typescript
// src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};
```

---

## 8. DEPLOYMENT EN LWS (cPanel)

### 8.1 Configuración Build

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:storybook": "storybook build -o dist/storybook",
    "preview": "vite preview"
  }
}
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

### 8.2 .htaccess para SPA Routing

```apache
# public/.htaccess (copiar a dist después del build)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirect to index.html for SPA routing
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
</IfModule>
```

### 8.3 Variables de Entorno

```bash
# .env.production
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_APP_URL=https://app.tudominio.com
```

### 8.4 Script de Deployment

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Building application..."
npm run build

echo "📦 Building Storybook..."
npm run build:storybook

echo "📄 Copying .htaccess..."
cp public/.htaccess dist/.htaccess

echo "✅ Build complete! Upload dist/ folder to LWS via FTP"
echo "   Main app: upload dist/* to public_html/"
echo "   Storybook: dist/storybook/ already included"
```

### 8.5 Configuración FTP (FileZilla)

```
Host: ftp.tudominio.com (o IP servidor LWS)
Usuario: usuario-cpanel
Password: password-cpanel
Puerto: 21

Carpetas locales → Carpetas remotas:
dist/* → public_html/
```

### 8.6 Subdominios en cPanel LWS

**Crear subdominio:**
1. cPanel → Dominios → Crear subdominio
2. Nombre: `app`
3. Carpeta raíz: `public_html` (o `public_html/app`)

**Configuración DNS automática por LWS**

**SSL:** 
- cPanel → SSL/TLS Status → Run AutoSSL (Let's Encrypt)

---

## 9. CRITERIOS DE ACEPTACIÓN Y VALIDACIÓN

### 9.1 Checklist MVP

**Autenticación:**
- [ ] Usuario puede registrarse con email/password
- [ ] Usuario puede iniciar sesión
- [ ] Usuario puede recuperar contraseña
- [ ] Sesión persiste en browser
- [ ] Usuario puede cerrar sesión

**Clientes:**
- [ ] Crear cliente con validación SIRET
- [ ] Editar cliente
- [ ] Ver lista clientes
- [ ] Archivar cliente
- [ ] Ver detalle cliente con proyectos/facturas

**Proyectos:**
- [ ] Crear proyecto asociado a cliente
- [ ] Editar proyecto
- [ ] Asignar color a proyecto
- [ ] Ver lista proyectos por cliente

**Tarifas:**
- [ ] Definir tarifa base por tipo servicio
- [ ] Definir tarifa específica cliente
- [ ] Autocompletar tarifa al crear actividad

**Actividades:**
- [ ] Crear actividad con todos los campos
- [ ] Visualizar kanban con 6 columnas
- [ ] Drag & drop funciona correctamente
- [ ] Estados se actualizan al mover tarjetas
- [ ] Loggear tiempo manualmente
- [ ] Iniciar/detener timer
- [ ] Adjuntar archivos (max 10MB)
- [ ] Preview/download archivos
- [ ] Editar actividad
- [ ] Eliminar actividad

**Facturas:**
- [ ] Crear factura desde actividades "por facturar"
- [ ] Número factura se genera automáticamente (YYYY-NNNN)
- [ ] Agregar ítems manuales
- [ ] Aplicar descuento % o fijo
- [ ] Calcular subtotal y total correctamente
- [ ] Generar PDF con menciones legales francesas
- [ ] Cambiar estado factura
- [ ] Marcar como pagada
- [ ] Ver lista facturas con filtros

**Dashboard:**
- [ ] Mostrar CA mes actual
- [ ] Mostrar CA año actual
- [ ] Mostrar % vs plafond
- [ ] Calcular cotizaciones URSSAF correctamente
- [ ] Mostrar facturas pendientes
- [ ] Gráfico CA mensual 12 meses

**URSSAF:**
- [ ] CA mensual calculado solo con facturas pagadas
- [ ] Cotizaciones = CA * 24.6%
- [ ] Alerta TVA si CA > 37.500€
- [ ] Alerta plafond si CA > 77.700€
- [ ] Vista anual con meses detallados

**UI/UX:**
- [ ] Dark mode funciona correctamente
- [ ] Light mode funciona correctamente
- [ ] Responsive design (desktop, tablet, mobile)
- [ ] Transiciones suaves
- [ ] Loading states
- [ ] Error states
- [ ] Success feedbacks

**Deployment:**
- [ ] Build producción funciona sin errores
- [ ] .htaccess configurado correctamente
- [ ] Routing funciona en producción
- [ ] Variables entorno configuradas
- [ ] SSL activo
- [ ] Storybook accesible en /storybook

### 9.2 Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Performance Score: > 85
- Bundle size inicial: < 500KB (gzipped)

### 9.3 Browser Support

- Chrome/Edge: últimas 2 versiones
- Firefox: últimas 2 versiones
- Safari: últimas 2 versiones
- Mobile Safari: últimas 2 versiones
- Chrome Android: últimas 2 versiones

---

## 10. PRIORIZACIÓN MVP

### Phase 1 (Funcionalidad mínima viable - 2 semanas):
1. Autenticación (login/registro)
2. Clientes CRUD
3. Proyectos CRUD
4. Actividades básicas (crear, editar, listar)
5. Kanban board sin drag & drop
6. Time tracking manual

### Phase 2 (Funcionalidad core - 2 semanas):
1. Kanban drag & drop + real-time
2. Tarifas configurables
3. Timer automático
4. Archivos adjuntos
5. Facturas básicas (crear, listar)
6. PDF facturas

### Phase 3 (Funcionalidad completa - 1 semana):
1. Dashboard con KPIs
2. Módulo URSSAF completo
3. Reportes por cliente
4. Dark mode
5. Storybook
6. Deployment LWS

---

## 11. ANEXOS

### Anexo A: Configuración Completa package.json

```json
{
  "name": "freelancer-time-tracker",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:storybook": "storybook build -o dist/storybook",
    "preview": "vite preview",
    "storybook": "storybook dev -p 6006",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@react-pdf/renderer": "^3.4.0",
    "@supabase/supabase-js": "^2.39.3",
    "@tanstack/react-query": "^5.17.19",
    "@tanstack/react-table": "^8.11.8",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "date-fns": "^3.3.1",
    "lucide-react": "^0.314.0",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.3",
    "react-router-dom": "^6.21.3",
    "recharts": "^2.12.0",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@storybook/addon-essentials": "^8.0.0",
    "@storybook/addon-themes": "^8.0.0",
    "@storybook/react": "^8.0.0",
    "@storybook/react-vite": "^8.0.0",
    "@types/node": "^20.11.10",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.19.1",
    "@typescript-eslint/parser": "^6.19.1",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.33",
    "storybook": "^8.0.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11"
  }
}
```

### Anexo B: Comandos Iniciales

```bash
# Crear proyecto
npm create vite@latest freelancer-time-tracker -- --template react-ts
cd freelancer-time-tracker

# Instalar dependencias base
npm install

# Instalar shadcn/ui
npx shadcn-ui@latest init

# Instalar dependencias adicionales
npm install @supabase/supabase-js @tanstack/react-query zustand
npm install react-router-dom @hookform/resolvers react-hook-form zod
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @react-pdf/renderer recharts date-fns
npm install lucide-react

# Instalar Storybook
npx storybook@latest init

# Instalar componentes shadcn/ui necesarios
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add calendar

# Generar types de Supabase
npx supabase gen types typescript --project-id "tu-project-id" --schema public > src/types/database.types.ts
```

---

## NOTAS FINALES PARA CLAUDE CODE

Este PRD está diseñado para ser ejecutado por Claude Code. Contiene:

1. **Especificación técnica completa** del stack
2. **Schema SQL completo** de base de datos con RLS
3. **Casos de uso detallados** por módulo
4. **Estructura de directorios** definida
5. **Componentes UI** identificados
6. **Configuración de deployment** para LWS

**Orden de implementación sugerido:**

1. Setup inicial del proyecto (Vite + React + TypeScript)
2. Configuración Supabase y schema de base de datos
3. Instalación shadcn/ui y configuración Tailwind
4. Implementación módulo autenticación
5. Implementación CRUD clientes y proyectos
6. Implementación tarifas
7. Implementación actividades y kanban
8. Implementación time tracking
9. Implementación facturas y PDF
10. Implementación dashboard y URSSAF
11. Configuración Storybook
12. Deployment y .htaccess

**Puntos críticos a considerar:**

- RLS debe estar habilitado desde el inicio
- Todas las queries deben usar `(SELECT auth.uid())` para mejor performance
- Componentes deben ser totalmente tipados con TypeScript
- Seguir convenciones shadcn/ui para consistencia
- Implementar loading y error states en todos los componentes
- Usar TanStack Query para cache y sincronización
- PDF debe incluir todas las menciones legales francesas obligatorias

**Validación final antes de deployment:**

- [ ] Todas las migraciones SQL aplicadas en Supabase
- [ ] RLS policies activas
- [ ] Variables de entorno configuradas
- [ ] Build producción funciona
- [ ] .htaccess copiado a dist/
- [ ] Storybook build generado en dist/storybook/
- [ ] SSL activo en LWS

---

FIN DEL PRD
