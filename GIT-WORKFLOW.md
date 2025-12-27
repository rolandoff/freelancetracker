# Git Workflow - Desarrollo con Branch Strategy

## 🌳 Estructura de Branches

### `main` (Producción)
- **Propósito**: Código en producción
- **Deploy**: Automático vía GitHub Actions
- **Protección**: Solo recibe merges desde `develop` vía Pull Request

### `develop` (Desarrollo)
- **Propósito**: Branch de desarrollo activo
- **Uso**: Todos los cambios nuevos se hacen aquí
- **Testing**: Probar cambios antes de mergear a `main`

---

## 🔄 Workflow Diario

### 1. Trabajar en Develop

```bash
# Asegúrate de estar en develop
git checkout develop

# Actualiza con los últimos cambios
git pull origin develop

# Haz tus cambios...
# ... edita archivos ...

# Commit
git add .
git commit -m "feat: nueva funcionalidad"

# Push a develop
git push origin develop
```

### 2. Cuando estés listo para producción

```bash
# Opción A: Merge directo (solo tú trabajando)
git checkout main
git pull origin main
git merge develop
git push origin main

# Opción B: Pull Request (recomendado)
# 1. Ve a GitHub: https://github.com/rolandoff/freelancetracker
# 2. Click "Pull requests" → "New pull request"
# 3. Base: main ← Compare: develop
# 4. Revisa cambios → "Create pull request"
# 5. Merge cuando esté listo
```

---

## 📋 Comandos Útiles

### Ver branch actual
```bash
git branch
```

### Cambiar de branch
```bash
git checkout main      # Ir a main
git checkout develop   # Ir a develop
```

### Ver estado
```bash
git status
```

### Ver diferencias entre branches
```bash
git diff main develop
```

### Actualizar develop desde main
```bash
git checkout develop
git merge main
git push origin develop
```

---

## 🚀 Deployment

### Develop (Sin deploy automático)
```bash
git push origin develop
# ⚠️ NO hace deploy automático
# Solo para desarrollo y testing
```

### Main (Deploy automático)
```bash
git push origin main
# ✅ GitHub Actions hace deploy automático a LWS
# Solo pushear cuando esté listo para producción
```

---

## 💡 Buenas Prácticas

### ✅ DO:
- Trabajar siempre en `develop` para nuevos features
- Hacer commits frecuentes con mensajes descriptivos
- Probar cambios localmente antes de pushear
- Mergear a `main` solo cuando esté todo testeado
- Usar Pull Requests para tener historial de cambios

### ❌ DON'T:
- No trabajes directamente en `main`
- No hagas `git push --force` en branches compartidos
- No commitees archivos con datos sensibles (`.env`)
- No merges a `main` con bugs conocidos

---

## 🔧 Setup Inicial (Ya hecho)

```bash
# Crear branch develop
git checkout -b develop

# Pushear a GitHub
git push -u origin develop
```

---

## 📝 Formato de Commits

Usa prefijos claros:

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: cambios de estilo/formato
refactor: refactorización de código
test: agregar/modificar tests
chore: mantenimiento/configuración
```

### Ejemplos:
```bash
git commit -m "feat: add drag handle icon to activity cards"
git commit -m "fix: mobile drag and drop not working"
git commit -m "docs: update deployment guide"
git commit -m "refactor: improve kanban column animations"
```

---

## 🎯 Flujo Completo de Desarrollo

```
1. Develop feature en `develop`
   ↓
2. Test localmente (npm run dev)
   ↓
3. Commit y push a `develop`
   ↓
4. Probar en staging (si aplica)
   ↓
5. Crear PR: develop → main
   ↓
6. Revisar cambios en GitHub
   ↓
7. Merge PR
   ↓
8. GitHub Actions deploy automático
   ↓
9. Verificar en producción
```

---

## 🆘 Troubleshooting

### "Your branch is behind"
```bash
git pull origin develop
# Resuelve conflictos si hay
git push origin develop
```

### Quiero descartar cambios locales
```bash
git checkout -- archivo.txt      # Descartar archivo específico
git reset --hard origin/develop  # Descartar TODOS los cambios
```

### Commitee en main por error
```bash
# Si no has pusheado aún
git reset --soft HEAD~1          # Deshace último commit
git checkout develop             # Cambia a develop
git add .
git commit -m "mensaje"          # Commitea en develop

# Si ya pusheaste, mejor crear PR inverso
```

### Quiero traer un commit de develop a main
```bash
git checkout main
git cherry-pick <commit-hash>
git push origin main
```

---

## 🔒 Protección de Branches (Opcional)

Puedes proteger `main` en GitHub:

1. GitHub → Settings → Branches
2. Add rule → `main`
3. ☑️ Require pull request reviews
4. ☑️ Require status checks to pass
5. Save

Esto previene pushes directos a `main`.

---

## 📊 Estado Actual

```
Branches:
├── main (producción) ← auto-deploy habilitado
└── develop (desarrollo) ← trabajo activo aquí

Workflow actual:
- Estás en: develop ✅
- Próximos cambios: develop
- Deploy a producción: merge a main
```

---

## 🎉 Beneficios

✅ **Código estable en main**: Siempre funcional  
✅ **Desarrollo libre en develop**: Experimenta sin miedo  
✅ **Historial limpio**: PRs documentan cambios  
✅ **Rollback fácil**: Volver a versión anterior de main  
✅ **Deploy controlado**: Solo cuando decidas mergear  

---

**Ahora todos los cambios se harán en `develop` y solo mergearemos a `main` cuando estén listos para producción.**
