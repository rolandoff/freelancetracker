# Configuración de Supabase para Producción

## 🚨 PROBLEMA: Emails apuntan a localhost

Cuando un usuario se registra, Supabase envía un email de verificación pero el link apunta a `http://localhost:3001` en vez de tu dominio de producción.

---

## ✅ SOLUCIÓN: Configurar URLs en Supabase Dashboard

### Paso 1: Acceder a Configuración de Authentication

1. Ve a tu proyecto en: https://app.supabase.com
2. Selecciona tu proyecto `freelancetracker`
3. Ve a **Authentication** (en el menú lateral)
4. Click en **URL Configuration** (o **Settings**)

### Paso 2: Configurar Site URL

En la sección **Site URL**:

```
Site URL: https://freelancetracker.tu-dominio.com
```

⚠️ **IMPORTANTE**: Reemplaza `tu-dominio.com` con tu dominio real

**¿Qué hace esto?**
- Todos los links en emails apuntarán a esta URL
- La confirmación de email redirige aquí
- El reset de contraseña redirige aquí

### Paso 3: Configurar Redirect URLs (Allowlist)

En la sección **Redirect URLs** (o **Additional Redirect URLs**), agrega:

```
https://freelancetracker.tu-dominio.com/**
http://localhost:3001/**
```

El primero es para producción, el segundo para desarrollo local.

**¿Por qué el `/**`?**
- Permite cualquier ruta en tu dominio
- Necesario para rutas como `/dashboard`, `/invoices`, etc.

### Paso 4: Guardar Cambios

Click en **Save** o **Update**

---

## 🔍 Verificar Configuración Actual

En **Authentication > URL Configuration**, verás:

| Campo | Valor Actual | Valor Correcto |
|-------|-------------|----------------|
| Site URL | `http://localhost:3001` ❌ | `https://freelancetracker.tu-dominio.com` ✅ |
| Redirect URLs | Solo localhost ❌ | Producción + localhost ✅ |

---

## 📧 Tipos de Emails Afectados

Esta configuración afecta a:

1. **Confirmación de registro** (el que tienes ahora)
2. **Reset de contraseña**
3. **Cambio de email**
4. **Magic links** (si los usas)

---

## 🧪 Probar Después de Configurar

### Test 1: Registro nuevo
1. Ve a tu sitio de producción
2. Registra un usuario nuevo con un email real
3. Revisa el email recibido
4. El link debe ser: `https://freelancetracker.tu-dominio.com/...`
5. Click en el link → Debe llevar a tu sitio, no localhost

### Test 2: Reset de contraseña
1. En login, click "Mot de passe oublié?"
2. Ingresa email y solicita reset
3. El email debe tener link a producción
4. Click debe llevar a tu sitio

---

## ⚠️ IMPORTANTE: Environment Variables

Asegúrate de que en tu `.env.production` tengas:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_key
```

Y que hayas hecho `npm run build` con este archivo presente.

---

## 🔐 Configuración de Seguridad Adicional

### Disable Email Confirmations (No Recomendado)

Si quieres probar sin confirmación de email (solo para testing):

1. Authentication > Settings
2. **Enable email confirmations**: OFF

⚠️ **NO hagas esto en producción real**

### Enable Sign Ups

Asegúrate de que esté habilitado:

1. Authentication > Settings
2. **Enable sign ups**: ON ✅

---

## 📋 Checklist Completa

- [ ] Site URL configurada con dominio de producción
- [ ] Redirect URLs incluye dominio de producción con `/**`
- [ ] Redirect URLs incluye localhost para desarrollo
- [ ] `.env.production` tiene las claves correctas
- [ ] Build de producción hecho: `npm run build`
- [ ] Archivos subidos a LWS
- [ ] Test de registro con email real
- [ ] Email recibido con link correcto
- [ ] Link lleva a sitio de producción, no localhost

---

## 🆘 Troubleshooting

### Email sigue apuntando a localhost
**Causa**: Cambios no guardados o caché
**Solución**:
1. Verifica que guardaste en Supabase Dashboard
2. Espera 1-2 minutos (propagación)
3. Intenta con un email diferente (nuevo registro)
4. Verifica en Supabase Logs (Authentication > Logs)

### Link dice "Invalid or expired"
**Causa**: Token expiró o URL mal configurada
**Solución**:
1. Los tokens expiran en 24-48h
2. Registra un usuario nuevo
3. Usa el email inmediatamente
4. Verifica que Redirect URLs incluya la ruta exacta

### Redirect loop
**Causa**: Redirect URLs no incluye todas las rutas necesarias
**Solución**:
1. Usa el wildcard `/**` en Redirect URLs
2. Ejemplo: `https://freelancetracker.domain.com/**`

### "Email not confirmed" después de click
**Causa**: Configuración de confirmación
**Solución**:
1. Verifica que "Enable email confirmations" esté ON
2. El email debe procesarse correctamente
3. Revisa Supabase Authentication > Users para ver status

---

## 📸 Capturas de Referencia

Tu configuración debe verse así:

```
Authentication > URL Configuration

Site URL:
┌─────────────────────────────────────────────────┐
│ https://freelancetracker.tu-dominio.com         │
└─────────────────────────────────────────────────┘

Redirect URLs:
┌─────────────────────────────────────────────────┐
│ https://freelancetracker.tu-dominio.com/**      │
│ http://localhost:3001/**                        │
└─────────────────────────────────────────────────┘

Additional Configuration:
☑ Enable sign ups
☑ Enable email confirmations
```

---

## 🎯 Resumen Rápido

1. Supabase Dashboard → Authentication → URL Configuration
2. Site URL = `https://tu-subdominio.dominio.com`
3. Redirect URLs = Agrega producción + localhost
4. Save
5. Registra usuario nuevo para probar
6. Email debe tener link a producción ✅
