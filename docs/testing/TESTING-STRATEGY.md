# Testing Strategy - Freelancer Time Tracker

## Objetivo

Prevenir bugs como los encontrados en el módulo de facturas mediante una estrategia de testing comprehensiva en 3 niveles:

1. **Unit Tests** - Lógica de negocio y hooks
2. **Integration Tests** - Flujos de datos completos
3. **E2E Tests** - Experiencia de usuario end-to-end

---

## Bugs Detectados y Cómo Prevenirlos

### Bug 1: Query de Actividades No Mostraba Resultados

**Problema:**
- La query usaba `.eq('project.client_id', clientId)` - sintaxis incorrecta
- Necesitaba dos queries: proyectos primero, luego actividades

**Test que lo habría detectado:**
```typescript
// src/features/invoices/hooks/useInvoices.test.ts
it('should fetch projects for client and then activities', async () => {
  // Verifica que:
  // 1. Se llama a supabase.from('projects') con client_id
  // 2. Se llama a supabase.from('activities') con project_ids
  // 3. Devuelve actividades correctamente
})
```

**Lección:** Testear hooks que hacen queries complejas con joins o múltiples tablas.

---

### Bug 2: Filtro de Status Incorrecto

**Problema:**
- Solo buscaba status 'completada'
- Debía buscar ['completada', 'por_facturar']

**Test que lo habría detectado:**
```typescript
it('should include both completada and por_facturar status activities', async () => {
  // Verifica que el filtro .in('status', [...]) incluye ambos estados
  expect(mockActivitiesIn1).toHaveBeenCalledWith('status', ['completada', 'por_facturar'])
})
```

**Lección:** Testear filters y condiciones de queries explícitamente.

---

### Bug 3: Projects Table No Mostraba Cliente

**Problema:**
- Query usaba `.select('*, clients(*)')` 
- Código accedía `project.client.name`
- Mismatch: `clients` vs `client`

**Test que lo habría detectado:**
```typescript
// src/pages/Projects.test.tsx
it('should display client name in projects table', async () => {
  const mockProjects = [{
    id: '1',
    name: 'Website',
    client: { name: 'Test Client' }  // Nota: client singular
  }]
  
  render(<Projects />)
  
  expect(screen.getByText('Test Client')).toBeInTheDocument()
})
```

**Lección:** Testear rendering de componentes con datos joined de Supabase.

---

### Bug 4: React Query Cache Bloqueando Ejecución

**Problema:**
- Hook no se ejecutaba por cache de React Query
- `enabled: !!clientId` no era suficiente

**Test que lo habría detectado:**
```typescript
it('should refetch when clientId changes', async () => {
  const { rerender } = renderHook(
    ({ clientId }) => useInvoiceableActivities(clientId),
    { initialProps: { clientId: 'client-1' }, wrapper }
  )
  
  // Change client
  rerender({ clientId: 'client-2' })
  
  // Verify query executes again
  await waitFor(() => {
    expect(mockQueryFn).toHaveBeenCalledTimes(2)
  })
})
```

**Lección:** Testear que hooks re-ejecutan queries cuando cambian dependencias.

---

## Estrategia de Testing por Nivel

### 1. Unit Tests (Vitest + React Testing Library)

**Qué testear:**
- ✅ Hooks individuales (useInvoices, useClients, etc.)
- ✅ Funciones utilities (formatCurrency, validation)
- ✅ Componentes aislados con props mock

**Ejemplo - Hook Test:**
```typescript
describe('useInvoiceableActivities', () => {
  it('should return empty array when clientId is null')
  it('should fetch projects for client and then activities')
  it('should include both completada and por_facturar status')
  it('should handle projects query error')
})
```

**Ejemplo - Component Test:**
```typescript
describe('InvoiceCreatePage', () => {
  it('should render client selector')
  it('should load activities when client selected')
  it('should validate required fields')
  it('should calculate totals correctly')
})
```

**Ejecutar:**
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

---

### 2. Integration Tests (Vitest con MSW)

**Qué testear:**
- ✅ Flujos completos de datos (select client → load activities → create invoice)
- ✅ Interacción entre múltiples hooks
- ✅ Side effects y mutations

**Ejemplo:**
```typescript
describe('Invoice Creation Flow', () => {
  it('should create invoice with selected activities', async () => {
    // Setup MSW handlers para Supabase
    server.use(
      rest.get('/rest/v1/projects*', (req, res, ctx) => {
        return res(ctx.json([{ id: '1', client_id: 'client-1' }]))
      }),
      rest.get('/rest/v1/activities*', (req, res, ctx) => {
        return res(ctx.json([{ id: 'act-1', status: 'por_facturar' }]))
      })
    )
    
    render(<InvoiceCreatePage />)
    
    // Select client
    await userEvent.selectOptions(screen.getByRole('combobox'), 'client-1')
    
    // Wait for activities
    await waitFor(() => {
      expect(screen.getByText(/test activity/i)).toBeInTheDocument()
    })
    
    // Select activity
    await userEvent.click(screen.getByRole('checkbox'))
    
    // Submit
    await userEvent.click(screen.getByText(/créer/i))
    
    // Verify redirect and success
    expect(mockNavigate).toHaveBeenCalledWith('/invoices')
  })
})
```

---

### 3. E2E Tests (Playwright)

**Qué testear:**
- ✅ Flujos de usuario completos
- ✅ Navegación entre páginas
- ✅ Validación de datos persistidos
- ✅ Experiencia real con Supabase

**Archivo:** `e2e/invoice-creation.spec.ts`

**Tests críticos:**
```typescript
test('should validate that activities belong to selected client')
test('should only show activities with correct status')
test('should create invoice successfully')
test('should handle no available activities gracefully')
```

**Ejecutar:**
```bash
npm run test:e2e          # All E2E tests
npm run test:e2e:ui       # Interactive UI mode
npm run test:e2e:debug    # Debug mode
```

---

## Checklist Pre-Commit

Antes de hacer commit de features nuevas, verificar:

- [ ] **Unit tests** para nuevos hooks y utilities
- [ ] **Component tests** para nuevas páginas/componentes
- [ ] **Integration test** si el feature involucra múltiples queries
- [ ] **E2E test** si es un flujo de usuario crítico
- [ ] **Coverage** no debe bajar del 80%
- [ ] Todos los tests pasan: `npm run test`

---

## Cobertura Actual

**Unit Tests:** 222 passing
- ✅ Utilities (validation, format, helpers)
- ✅ Hooks (useAuth, useActivities, useRates, useTimeEntries)
- ✅ Components (KanbanBoard, ActivityForm, TimeEntriesList)

**Integration Tests:** 0 (to be added)
- ⚠️ Invoice creation flow
- ⚠️ Activity status transitions
- ⚠️ Project-client relationships

**E2E Tests:** 3 files created, scenarios written
- ✅ Auth flow spec (7 tests)
- ✅ Clients spec (9 tests)
- ✅ Invoices spec (11 tests)
- ⚠️ Tests require Supabase connection to run

---

## Próximos Pasos

1. **Agregar MSW (Mock Service Worker)** para integration tests
2. **Completar tests de useInvoices hook**
3. **Agregar tests de Projects.tsx** para verificar client relationship
4. **Setup Supabase test database** para E2E tests
5. **Integrar tests en CI/CD** (GitHub Actions)

---

## Conclusión

Los bugs que encontramos hoy se habrían detectado con:

1. ✅ **Unit test** del hook `useInvoiceableActivities` verificando:
   - Query a proyectos primero
   - Filtro de status correcto
   - Manejo de clientId null

2. ✅ **Component test** de `Projects.tsx` verificando:
   - Client name rendering
   - Supabase join syntax

3. ✅ **E2E test** del flujo completo verificando:
   - Activities load cuando se selecciona cliente
   - Only activities del cliente correcto aparecen

**Lección Principal:** Testear las queries de Supabase explícitamente, especialmente joins y filters complejos.
