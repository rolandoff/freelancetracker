# Ejemplos de Código y Configuración

## 1. Configuración Inicial Vite + React + TypeScript

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 2. Configuración Supabase

### lib/supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper para obtener el user_id actual
export const getCurrentUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not authenticated');
  return user.id;
};

// Helper para uploads a Storage
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data;
};

// Helper para obtener URL pública
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};
```

---

## 3. Hooks Principales

### hooks/useAuth.ts
```typescript
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    navigate('/dashboard');
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate('/login');
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return data;
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}
```

### features/clients/hooks/useClients.ts
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Client[];
    },
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          projects:projects(count),
          invoices:invoices(count)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: ClientInsert) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ClientUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', data.id] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete
      const { error } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
```

### features/activities/hooks/useKanbanRealtime.ts
```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useKanbanRealtime(projectId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: projectId ? `project_id=eq.${projectId}` : undefined,
        },
        (payload) => {
          console.log('Activity changed:', payload);
          
          // Invalidar queries para refrescar datos
          queryClient.invalidateQueries({ queryKey: ['activities'] });
          
          // También podríamos hacer updates optimistas aquí
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);
}
```

---

## 4. Componentes Ejemplo

### features/activities/components/KanbanColumn.tsx
```typescript
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ActivityCard } from './ActivityCard';
import type { Database } from '@/types/database.types';

type Activity = Database['public']['Tables']['activities']['Row'];
type ActivityStatus = Database['public']['Enums']['activity_status'];

interface KanbanColumnProps {
  status: ActivityStatus;
  activities: Activity[];
  title: string;
}

const statusColors: Record<ActivityStatus, string> = {
  por_validar: 'bg-yellow-100 dark:bg-yellow-900',
  en_curso: 'bg-blue-100 dark:bg-blue-900',
  en_prueba: 'bg-purple-100 dark:bg-purple-900',
  completada: 'bg-green-100 dark:bg-green-900',
  por_facturar: 'bg-orange-100 dark:bg-orange-900',
  facturada: 'bg-gray-100 dark:bg-gray-900',
};

export function KanbanColumn({ status, activities, title }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col min-w-[300px] max-w-[300px]">
      <div className={`p-4 rounded-t-lg ${statusColors[status]}`}>
        <h3 className="font-semibold text-sm uppercase tracking-wide">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground">
          {activities.length} {activities.length === 1 ? 'tarea' : 'tareas'}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className="flex-1 p-2 bg-muted/20 rounded-b-lg min-h-[500px]"
      >
        <SortableContext
          items={activities.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
```

### features/activities/components/ActivityCard.tsx
```typescript
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Paperclip } from 'lucide-react';
import type { Database } from '@/types/database.types';

type Activity = Database['public']['Tables']['activities']['Row'];

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move hover:shadow-md transition-shadow"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {activity.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {activity.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {activity.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{activity.estimated_hours}h estimadas</span>
          </div>
          
          {activity.hourly_rate && (
            <Badge variant="secondary" className="text-xs">
              {activity.hourly_rate}€/h
            </Badge>
          )}
        </div>
        
        {/* Aquí podríamos agregar más info: attachments count, time logged, etc */}
      </CardContent>
    </Card>
  );
}
```

### features/invoices/components/InvoicePDF.tsx
```typescript
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Database } from '@/types/database.types';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type UserSettings = Database['public']['Tables']['user_settings']['Row'];

interface InvoicePDFProps {
  invoice: Invoice & {
    client: Client;
    items: InvoiceItem[];
  };
  userSettings: UserSettings;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  companyInfo: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 12,
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '1pt solid #000',
    paddingBottom: 5,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1pt solid #000',
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottom: '0.5pt solid #ccc',
  },
  col1: { width: '50%' },
  col2: { width: '15%', textAlign: 'right' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: '40%',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  finalTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    borderTop: '2pt solid #000',
    paddingTop: 5,
    marginTop: 5,
  },
  legalMentions: {
    marginTop: 30,
    fontSize: 8,
    color: '#666',
    borderTop: '0.5pt solid #ccc',
    paddingTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
});

export function InvoicePDF({ invoice, userSettings }: InvoicePDFProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Info Empresa */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              {userSettings.company_name || 'Votre Entreprise'}
            </Text>
            <Text>SIRET: {userSettings.siret}</Text>
            <Text>{userSettings.address}</Text>
            <Text>
              {userSettings.postal_code} {userSettings.city}
            </Text>
          </View>

          <View>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceNumber}>
              N° {invoice.invoice_number}
            </Text>
            <Text>Date: {formatDate(invoice.invoice_date)}</Text>
            {invoice.due_date && (
              <Text>Échéance: {formatDate(invoice.due_date)}</Text>
            )}
          </View>
        </View>

        {/* Info Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text style={{ fontWeight: 'bold' }}>{invoice.client.name}</Text>
          {invoice.client.siret && (
            <Text>SIRET: {invoice.client.siret}</Text>
          )}
          {invoice.client.address && (
            <>
              <Text>{invoice.client.address}</Text>
              <Text>
                {invoice.client.postal_code} {invoice.client.city}
              </Text>
            </>
          )}
        </View>

        {/* Tabla de Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la prestation</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Description</Text>
              <Text style={styles.col2}>Quantité</Text>
              <Text style={styles.col3}>Prix unitaire</Text>
              <Text style={styles.col4}>Total</Text>
            </View>

            {invoice.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{item.description}</Text>
                <Text style={styles.col2}>{item.quantity}</Text>
                <Text style={styles.col3}>{formatCurrency(item.unit_price)}</Text>
                <Text style={styles.col4}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Sous-total:</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>

          {invoice.discount_amount > 0 && (
            <View style={styles.totalRow}>
              <Text>
                Remise ({invoice.discount_percentage}%):
              </Text>
              <Text>-{formatCurrency(invoice.discount_amount)}</Text>
            </View>
          )}

          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.totalLabel}>Total TTC:</Text>
            <Text style={styles.totalLabel}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
        </View>

        {/* Menciones Legales */}
        <View style={styles.legalMentions}>
          <Text>TVA non applicable, article 293 B du CGI</Text>
          <Text>Entrepreneur individuel (EI)</Text>
          <Text>Prestation de services</Text>
          {invoice.payment_terms && (
            <Text style={{ marginTop: 5 }}>
              Conditions de paiement: {invoice.payment_terms}
            </Text>
          )}
          <Text style={{ marginTop: 5 }}>
            En cas de retard de paiement, application d'une pénalité égale au
            taux d'intérêt légal en vigueur, ainsi qu'une indemnité forfaitaire
            de 40€ pour frais de recouvrement.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            {userSettings.company_name} - SIRET: {userSettings.siret}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
```

---

## 5. Stores Zustand

### store/uiStore.ts
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      
      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
```

### store/timerStore.ts
```typescript
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface ActiveTimer {
  activityId: string;
  activityTitle: string;
  startTime: Date;
}

interface TimerState {
  activeTimer: ActiveTimer | null;
  
  startTimer: (activityId: string, activityTitle: string) => void;
  
  stopTimer: () => Promise<void>;
  
  clearTimer: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  activeTimer: null,

  startTimer: (activityId, activityTitle) => {
    set({
      activeTimer: {
        activityId,
        activityTitle,
        startTime: new Date(),
      },
    });
  },

  stopTimer: async () => {
    const { activeTimer } = get();
    if (!activeTimer) return;

    const endTime = new Date();
    
    // Crear time_entry en la base de datos
    const { error } = await supabase.from('time_entries').insert({
      activity_id: activeTimer.activityId,
      start_time: activeTimer.startTime.toISOString(),
      end_time: endTime.toISOString(),
    });

    if (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }

    // Limpiar timer
    set({ activeTimer: null });
  },

  clearTimer: () => {
    set({ activeTimer: null });
  },
}));
```

---

## 6. Validaciones Zod

### lib/validations.ts
```typescript
import { z } from 'zod';

// Validación SIRET (14 dígitos)
export const siretSchema = z
  .string()
  .regex(/^\d{14}$/, 'SIRET debe tener 14 dígitos')
  .optional()
  .or(z.literal(''));

// Schema Cliente
export const clientSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  siret: siretSchema,
  tva_intracommunautaire: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('FR'),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Schema Proyecto
export const projectSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  client_id: z.string().uuid('Cliente requerido'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Schema Actividad
export const activitySchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  description: z.string().optional(),
  client_id: z.string().uuid('Cliente requerido'),
  project_id: z.string().uuid('Proyecto requerido'),
  service_type: z.enum([
    'programacion',
    'consultoria',
    'diseno',
    'reunion',
    'soporte',
    'otro',
  ]),
  hourly_rate: z.number().min(0).optional(),
  estimated_hours: z.number().min(0).optional(),
  observations: z.string().optional(),
});

export type ActivityFormData = z.infer<typeof activitySchema>;

// Schema Tarifa
export const rateSchema = z.object({
  service_type: z.enum([
    'programacion',
    'consultoria',
    'diseno',
    'reunion',
    'soporte',
    'otro',
  ]),
  client_id: z.string().uuid().optional(),
  hourly_rate: z.number().min(0, 'Tarifa debe ser positiva'),
  description: z.string().optional(),
});

export type RateFormData = z.infer<typeof rateSchema>;

// Schema Time Entry Manual
export const timeEntrySchema = z.object({
  activity_id: z.string().uuid(),
  start_time: z.date(),
  end_time: z.date(),
  notes: z.string().optional(),
}).refine(
  (data) => data.end_time > data.start_time,
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['end_time'],
  }
);

export type TimeEntryFormData = z.infer<typeof timeEntrySchema>;

// Schema Factura
export const invoiceSchema = z.object({
  client_id: z.string().uuid('Cliente requerido'),
  invoice_date: z.date(),
  due_date: z.date().optional(),
  discount_percentage: z.number().min(0).max(100).default(0),
  discount_amount: z.number().min(0).default(0),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
```

---

## 7. Constantes

### lib/constants.ts
```typescript
export const SERVICE_TYPES = {
  programacion: 'Programación',
  consultoria: 'Consultoría',
  diseno: 'Diseño',
  reunion: 'Reunión',
  soporte: 'Soporte',
  otro: 'Otro',
} as const;

export const ACTIVITY_STATUSES = {
  por_validar: 'Por Validar',
  en_curso: 'En Curso',
  en_prueba: 'En Prueba',
  completada: 'Completada',
  por_facturar: 'Por Facturar',
  facturada: 'Facturada',
} as const;

export const INVOICE_STATUSES = {
  borrador: 'Borrador',
  en_espera_pago: 'En Espera de Pago',
  pagada: 'Pagada',
  anulada: 'Anulada',
} as const;

export const URSSAF_CONFIG = {
  TAUX_2025: 0.246, // 24.6%
  PLAFOND_CA: 77700, // €
  SEUIL_TVA: 37500, // €
  SEUIL_TVA_MAJORE: 41250, // €
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
  ],
} as const;
```

---

## 8. Layout Principal

### components/layout/AppLayout.tsx
```typescript
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

---

## 9. Deployment Script

### deploy.sh
```bash
#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "❌ Error: .env.production file not found"
  exit 1
fi

# Load environment variables
source .env.production

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building application..."
npm run build

echo "📚 Building Storybook..."
npm run build:storybook

echo "📄 Copying .htaccess..."
cp public/.htaccess dist/.htaccess

echo "🗜️  Compressing build..."
tar -czf dist.tar.gz dist/

echo "✅ Build complete!"
echo ""
echo "📤 Next steps:"
echo "1. Upload dist.tar.gz to your LWS server via FTP"
echo "2. Connect via SSH: ssh user@your-domain.com"
echo "3. Extract: tar -xzf dist.tar.gz"
echo "4. Move files: cp -r dist/* public_html/"
echo "5. Clean up: rm dist.tar.gz && rm -rf dist/"
echo ""
echo "🌐 Your app will be available at: ${VITE_APP_URL}"
echo "📖 Storybook will be available at: ${VITE_APP_URL}/storybook"
```

---

FIN DE EJEMPLOS DE CÓDIGO
