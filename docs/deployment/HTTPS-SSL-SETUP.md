# HTTPS/SSL Setup for LWS Hosting

## 🔒 Habilitar HTTPS en tu Subdominio

---

## ✅ Método Automático: Let's Encrypt (Recomendado)

LWS ofrece SSL **GRATIS** con Let's Encrypt. Es automático y se renueva solo.

### Paso 1: Acceder al Panel LWS

1. Inicia sesión en: https://panel.lws.fr
2. Ve a **Domaines** (Dominios)
3. Busca tu dominio principal o subdominio

### Paso 2: Activar SSL/HTTPS

#### Opción A: Panel SSL (Recomendado)
1. Ve a **SSL/TLS** en el menú
2. Busca tu subdominio: `freelancetracker.rolandoff.com`
3. Click en **Activer SSL gratuit** (Activar SSL gratis)
4. Selecciona **Let's Encrypt**
5. Click en **Installer** o **Activer**

#### Opción B: AutoSSL
1. Busca **AutoSSL** en el panel
2. Marca tu subdominio
3. Click en **Ejecutar AutoSSL**

### Paso 3: Esperar Activación

- ⏱️ **Tiempo**: 5-30 minutos
- 📧 Recibirás un email cuando esté listo
- ✅ El certificado se renueva automáticamente cada 90 días

---

## 🔄 Forzar Redirección HTTP → HTTPS

Una vez SSL activado, actualiza tu `.htaccess` para forzar HTTPS.

### Ya incluido en `.htaccess.example`:

```apache
# Redirect HTTP to HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

Si no lo tienes, agrégalo al inicio de tu `.htaccess` en el servidor.

---

## 📋 Verificación Post-Activación

### 1. Verificar que SSL está activo

Visita tu sitio:
```
https://freelancetracker.rolandoff.com
```

Debes ver:
- ✅ Candado verde en la barra de direcciones
- ✅ "Conexión segura"
- ✅ Certificado válido

### 2. Verificar redirección HTTP → HTTPS

Intenta acceder por HTTP:
```
http://freelancetracker.rolandoff.com
```

Debe redirigir automáticamente a:
```
https://freelancetracker.rolandoff.com
```

### 3. Verificar certificado

Click en el candado → "Certificado" → Verifica:
- **Emisor**: Let's Encrypt Authority
- **Válido hasta**: ~90 días desde hoy
- **Dominio**: freelancetracker.rolandoff.com

---

## 🔧 Actualizar Configuraciones

### 1. Supabase Site URL (IMPORTANTE)

Ve a Supabase Dashboard:
1. **Authentication** → **URL Configuration**
2. **Site URL**: 
   ```
   https://freelancetracker.rolandoff.com
   ```
   (con HTTPS, no HTTP)

3. **Redirect URLs**:
   ```
   https://freelancetracker.rolandoff.com/**
   http://localhost:3001/**
   ```

### 2. Verificar Environment Variables

Tu `.env.production` debe tener HTTPS:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
```
(Supabase ya usa HTTPS por defecto)

---

## 🆘 Troubleshooting

### "SSL not available yet"
**Causa**: Certificado aún en proceso  
**Solución**: 
- Espera 30 minutos más
- Verifica que el DNS del subdominio apunte correctamente
- Contacta soporte LWS si pasa de 1 hora

### "Mixed content" warnings
**Causa**: Recursos (imágenes, scripts) cargados vía HTTP  
**Solución**:
- Verifica que todas las URLs externas usen HTTPS
- Supabase ya usa HTTPS
- Assets locales se cargan relativos (automático)

### "Too many redirects"
**Causa**: Conflicto en reglas de redirección  
**Solución**:
```apache
# En .htaccess, asegúrate de que sea así:
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Certificado "Not trusted" o "Invalid"
**Causa**: Certificado no instalado correctamente  
**Solución**:
1. Panel LWS → SSL/TLS
2. Desactiva y reactiva el certificado
3. Espera 10 minutos
4. Si persiste, contacta soporte LWS

### Algunos navegadores muestran "Not secure"
**Causa**: Caché del navegador  
**Solución**:
- Hard refresh: `Cmd + Shift + R` (Mac) o `Ctrl + Shift + R` (Windows)
- Limpia caché del navegador
- Prueba en modo incógnito

---

## 📱 Verificar en Móvil

Después de activar HTTPS:
1. Limpia caché del navegador móvil
2. Visita `https://freelancetracker.rolandoff.com`
3. Verifica el candado en la barra de direcciones
4. Prueba registro/login (emails usarán HTTPS)

---

## 🔐 Seguridad Adicional

### Headers de Seguridad (Ya incluidos en `.htaccess`)

```apache
# Security Headers
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains" env=HTTPS
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set X-Frame-Options "SAMEORIGIN"
Header set Referrer-Policy "strict-origin-when-cross-origin"
```

Estos headers:
- **HSTS**: Fuerza HTTPS por 1 año
- **X-Content-Type-Options**: Previene MIME sniffing
- **X-XSS-Protection**: Protección contra XSS
- **X-Frame-Options**: Previene clickjacking
- **Referrer-Policy**: Controla información de referrer

---

## 📊 Checklist Completo

- [ ] SSL activado en panel LWS
- [ ] Certificado Let's Encrypt instalado
- [ ] HTTPS funciona: `https://freelancetracker.rolandoff.com`
- [ ] HTTP redirige a HTTPS automáticamente
- [ ] Candado verde visible en navegador
- [ ] Supabase Site URL actualizado a HTTPS
- [ ] Supabase Redirect URLs incluyen HTTPS
- [ ] Sin warnings de "mixed content"
- [ ] Funciona en móvil con HTTPS
- [ ] Registro/login funciona con HTTPS
- [ ] Emails de verificación usan HTTPS

---

## 🎯 Beneficios de HTTPS

✅ **SEO**: Google favorece sitios HTTPS  
✅ **Seguridad**: Datos encriptados en tránsito  
✅ **Confianza**: Candado verde genera confianza  
✅ **PWA**: Requisito para Progressive Web Apps  
✅ **APIs modernas**: Muchas APIs requieren HTTPS  
✅ **Cookies seguras**: Mejor manejo de sesiones  

---

## 💰 Costo

**GRATIS** con Let's Encrypt en LWS:
- ✅ Certificado SSL gratuito
- ✅ Renovación automática
- ✅ Soporte para subdominios
- ✅ Sin costo adicional mensual

---

## 📞 Soporte LWS

Si tienes problemas:
- **Email**: support@lws.fr
- **Teléfono**: Disponible en panel LWS
- **Chat**: Panel LWS → Icono de chat
- **Tickets**: Panel LWS → Soporte

---

## ⏱️ Timeline Esperado

1. **Activar SSL en panel**: 2 minutos
2. **Emisión de certificado**: 5-30 minutos
3. **Propagación DNS**: 0-30 minutos (si es nuevo subdominio)
4. **Actualizar .htaccess**: 1 minuto
5. **Actualizar Supabase**: 2 minutos
6. **Verificar todo funciona**: 5 minutos

**Total**: ~15-60 minutos

---

## 🚀 Pasos Resumidos

1. Panel LWS → SSL/TLS → Activar Let's Encrypt
2. Esperar email de confirmación (5-30 min)
3. Verificar HTTPS funciona
4. Actualizar Supabase Site URL a HTTPS
5. `.htaccess` ya tiene redirección (si usaste el ejemplo)
6. ✅ Listo

---

**Tu sitio estará completamente seguro con HTTPS una vez completados estos pasos.**
