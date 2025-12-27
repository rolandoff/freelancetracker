# Déploiement sur LWS - Guide Complet

## 📦 Fichiers à Uploader

Après avoir exécuté `npm run build`, tous les fichiers nécessaires sont dans le dossier **`dist/`**.

### Contenu du dossier `dist/`:
```
dist/
├── index.html              # Page principale
├── assets/
│   ├── index-XXXXXX.css   # Styles compilés
│   └── index-XXXXXX.js    # JavaScript compilé
```

## 🚀 Instructions de Déploiement LWS

### Étape 1: Préparer les fichiers
```bash
# Le build est déjà fait, vérifiez le contenu:
ls -la dist/
```

### Étape 2: Connexion FTP/SFTP à LWS

**Méthode A - FileZilla (Recommandé)**
1. Téléchargez FileZilla: https://filezilla-project.org/
2. Connectez-vous avec vos identifiants LWS:
   - Hôte: `ftp.votre-domaine.com` ou l'IP fournie par LWS
   - Utilisateur: Votre username LWS
   - Mot de passe: Votre password LWS
   - Port: 21 (FTP) ou 22 (SFTP)

**Méthode B - Ligne de commande**
```bash
# Via SFTP (plus sécurisé)
sftp username@votre-domaine.com

# Une fois connecté:
cd public_html  # ou www ou httpdocs selon LWS
put -r dist/*   # Upload tous les fichiers
```

### Étape 3: Structure sur le serveur LWS

Uploadez le **CONTENU** du dossier `dist/` vers:
```
public_html/              ← Racine de votre site
├── index.html           ← Upload ICI
├── assets/              ← Upload ce dossier ICI
│   ├── index-XXXXX.css
│   └── index-XXXXX.js
```

⚠️ **ATTENTION**: N'uploadez PAS le dossier `dist/` lui-même, seulement son contenu!

## 🔧 Configuration Requise

### Variables d'Environnement
Votre application utilise Supabase. Vous devez configurer:

#### Créer `.env.production` (localement avant build):
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_publique_supabase
```

#### Rebuild avec ces variables:
```bash
npm run build
```

Les variables seront compilées dans le JavaScript.

### Structure Finale sur LWS
```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
└── .htaccess (optionnel, voir ci-dessous)
```

## 🌐 Configuration .htaccess (Optionnel mais Recommandé)

Créez un fichier `.htaccess` dans `public_html/` pour gérer les routes SPA:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

## 📝 Checklist de Déploiement

- [ ] `npm run build` exécuté avec succès
- [ ] Variables d'environnement configurées dans `.env.production`
- [ ] Connexion FTP/SFTP à LWS établie
- [ ] Contenu de `dist/` uploadé vers `public_html/`
- [ ] Fichier `.htaccess` créé (optionnel)
- [ ] Test du site: `http://votre-domaine.com`
- [ ] Vérifier la console navigateur pour erreurs

## 🐛 Troubleshooting

### Page blanche après déploiement
**Cause**: Chemins incorrects ou variables d'environnement manquantes
**Solution**:
1. Ouvrir DevTools (F12) → Console
2. Vérifier les erreurs
3. Vérifier que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont définies
4. Rebuild: `npm run build`
5. Re-upload

### Erreurs 404 sur les routes
**Cause**: `.htaccess` manquant ou mal configuré
**Solution**: Créer le fichier `.htaccess` comme indiqué ci-dessus

### Erreurs Supabase
**Cause**: Variables d'environnement non compilées
**Solution**:
1. Créer `.env.production` avec vos clés Supabase
2. Rebuild: `npm run build`
3. Re-upload les nouveaux fichiers

### CSS ne charge pas
**Cause**: Chemin incorrect ou cache
**Solution**:
1. Vérifier que le dossier `assets/` est bien uploadé
2. Clear cache navigateur (Cmd+Shift+R)
3. Vérifier les permissions des fichiers sur le serveur (644 pour fichiers, 755 pour dossiers)

## 🔐 Sécurité

⚠️ **IMPORTANT**:
- Ne JAMAIS uploader `.env` ou `.env.production` sur le serveur
- Les clés sont compilées dans le JS (c'est normal pour une SPA)
- Utilisez les RLS (Row Level Security) de Supabase
- Configurez les domaines autorisés dans Supabase Dashboard

## 📊 Performance

Le build actuel fait **2.56 MB** (793 KB gzippé). Pour améliorer:

```bash
# Analyser les chunks
npm run build -- --analyze

# Code splitting futur
# TODO: Utiliser dynamic import() pour réduire la taille
```

## 🎯 Commandes Rapides

```bash
# Build production
npm run build

# Upload via rsync (si SFTP configuré)
rsync -avz --delete dist/ username@server:/public_html/

# Ou via SCP
scp -r dist/* username@server:/public_html/
```

## 📞 Support LWS

Si problèmes d'upload ou de configuration serveur:
- Support LWS: https://aide.lws.fr/
- Vérifiez vos limites PHP/MySQL
- Assurez-vous que mod_rewrite est activé
