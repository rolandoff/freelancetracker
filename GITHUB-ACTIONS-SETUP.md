# GitHub Actions - Auto-Deploy Setup

## 🚀 Automated Deployment to LWS

Este workflow automáticamente hace build y deploy a LWS cada vez que haces merge/push a `main`.

---

## 📋 ¿Qué hace el workflow?

1. **Trigger**: Se activa automáticamente en push a `main`
2. **Build**: Ejecuta `npm ci` + `npm run build`
3. **Deploy**: Sube archivos de `dist/` a LWS via FTP
4. **Notificación**: Confirma deployment exitoso

---

## 🔐 Configurar GitHub Secrets (REQUERIDO)

### Paso 1: Ve a tu repositorio en GitHub

```
https://github.com/rolandoff/freelancetracker
```

### Paso 2: Settings → Secrets and variables → Actions

1. Click en **Settings** (en el repo)
2. En el menú lateral: **Secrets and variables** → **Actions**
3. Click en **New repository secret**

### Paso 3: Agrega estos 5 secrets

#### 1. `FTP_SERVER`
```
Nombre: FTP_SERVER
Valor: ftp.rolandoff.com (o tu servidor LWS)
```

**¿Dónde encontrarlo?**
- Panel LWS → FTP → Información de conexión
- O el email de bienvenida de LWS

#### 2. `FTP_USERNAME`
```
Nombre: FTP_USERNAME
Valor: tu_usuario_ftp
```

**¿Dónde encontrarlo?**
- Panel LWS → FTP → Usuario
- Generalmente es tu nombre de usuario principal

#### 3. `FTP_PASSWORD`
```
Nombre: FTP_PASSWORD
Valor: tu_contraseña_ftp
```

⚠️ **IMPORTANTE**: Usa la contraseña FTP, no la del panel LWS

#### 4. `VITE_SUPABASE_URL`
```
Nombre: VITE_SUPABASE_URL
Valor: https://tu-proyecto.supabase.co
```

**¿Dónde encontrarlo?**
- Supabase Dashboard → Settings → API
- Copia "Project URL"

#### 5. `VITE_SUPABASE_ANON_KEY`
```
Nombre: VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**¿Dónde encontrarlo?**
- Supabase Dashboard → Settings → API
- Copia "anon public" key

---

## ✅ Verificar Configuración

Después de agregar los secrets:

### Secrets configurados:
```
✓ FTP_SERVER
✓ FTP_USERNAME  
✓ FTP_PASSWORD
✓ VITE_SUPABASE_URL
✓ VITE_SUPABASE_ANON_KEY
```

---

## 🧪 Probar el Workflow

### Método 1: Push a main (automático)
```bash
git add .
git commit -m "test: trigger auto-deploy"
git push origin main
```

### Método 2: Manual trigger
1. Ve a: `https://github.com/rolandoff/freelancetracker/actions`
2. Click en workflow "Deploy to LWS"
3. Click en "Run workflow" → "Run workflow"

---

## 📊 Ver el Progreso

### Monitorear deployment:
1. Ve a: `https://github.com/rolandoff/freelancetracker/actions`
2. Verás el workflow corriendo en tiempo real
3. Puedes expandir cada paso para ver logs

### Estados posibles:
- 🟡 **In progress**: Ejecutando
- ✅ **Success**: Deployment exitoso
- ❌ **Failed**: Hubo un error (revisa logs)

---

## 🔍 Troubleshooting

### Error: "FTP connection failed"
**Causa**: Credenciales incorrectas o servidor incorrecto  
**Solución**:
1. Verifica `FTP_SERVER` (sin `ftp://`, solo el dominio)
2. Verifica `FTP_USERNAME` y `FTP_PASSWORD`
3. Prueba conexión FTP manualmente con FileZilla

### Error: "Authentication failed"
**Causa**: Contraseña FTP incorrecta  
**Solución**:
1. Ve a Panel LWS → FTP
2. Resetea la contraseña FTP
3. Actualiza el secret `FTP_PASSWORD` en GitHub

### Error: "Directory not found"
**Causa**: Ruta de servidor incorrecta  
**Solución**:
1. Verifica que la carpeta `/public_html/freelancetracker/` existe
2. Si tu estructura es diferente, edita `server-dir` en `.github/workflows/deploy.yml`

### Error: "Build failed"
**Causa**: Variables de entorno faltantes  
**Solución**:
1. Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están configurados
2. Asegúrate de no tener typos en los nombres de los secrets

### Build exitoso pero sitio no funciona
**Causa**: Variables de entorno incorrectas  
**Solución**:
1. Ve a Actions → Último workflow → Build step
2. NO deberías ver las claves en los logs (están ocultas)
3. Verifica que los valores en GitHub Secrets son correctos

---

## 📝 Estructura del Workflow

```yaml
Trigger: Push a main
↓
Checkout código
↓
Setup Node.js 20
↓
Install dependencies (npm ci)
↓
Build production (con env vars de Supabase)
↓
Deploy vía FTP a /public_html/freelancetracker/
↓
✅ Notificación de éxito
```

---

## ⚙️ Configuración Avanzada

### Cambiar el directorio de destino

Edita `.github/workflows/deploy.yml`:
```yaml
server-dir: /public_html/otra-carpeta/
```

### Deploy solo en tags

Cambia el trigger:
```yaml
on:
  push:
    tags:
      - 'v*'
```

### Agregar notificación Slack/Discord

Agrega un step al final:
```yaml
- name: Notify Discord
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
```

### Excluir archivos adicionales del deploy

Edita la sección `exclude`:
```yaml
exclude: |
  **/.git*
  **/node_modules/**
  .htaccess
  **/*.map
  **/*.md
```

---

## 🎯 Beneficios

✅ **Automatización total**: No más uploads manuales  
✅ **Consistencia**: Siempre el mismo proceso de build  
✅ **Historial**: Ver todos los deploys en Actions  
✅ **Rollback fácil**: Volver a un commit anterior y redeploy  
✅ **Variables seguras**: Secrets no expuestos en código  

---

## 🔒 Seguridad

⚠️ **IMPORTANTE**:
- ✅ Los secrets están encriptados en GitHub
- ✅ No aparecen en logs (se muestran como `***`)
- ✅ Solo accesibles por workflows del repo
- ❌ NUNCA hardcodees contraseñas en el código
- ❌ NUNCA commitees `.env.production`

---

## 📞 Siguiente Deploy

Una vez configurado, tu workflow será:

```bash
# Desarrolla localmente
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# GitHub Actions hace el resto automáticamente:
# - Build
# - Deploy a LWS
# - Tu sitio se actualiza en ~2-3 minutos
```

🎉 **¡Deploy automático configurado!**

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- [Secrets en GitHub](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
