# Guía de Migración - CRETS4DevOps V3

## 🎯 **Objetivo de la Migración**

Crear un repositorio independiente **CRETS4DevOps-V3** para mantener la versión estable (2.1.2) como base para futuros desarrollos, sin afectar proyectos existentes.

## 📋 **Plan de Migración**

### **Fase 1: Preparación del Respaldo**
- ✅ Versión estable identificada: **2.1.2**
- ✅ Funcionalidades validadas: Importación de requisitos funcionando
- ✅ Documentación actualizada: README-V3.md y CHANGELOG.md

### **Fase 2: Creación del Nuevo Repositorio**
1. **Crear repositorio en GitHub**: `CRETS4DevOps-V3`
2. **Configurar como repositorio principal** para futuras funcionalidades
3. **Mantener CRETS4DevOps-V2** como legacy/archive

### **Fase 3: Estructura del Nuevo Repositorio**

```
CRETS4DevOps-V3/
├── README.md                           # Documentación principal (V3)
├── CHANGELOG.md                        # Historial completo de cambios
├── MIGRATION.md                        # Esta guía de migración
├── package.json                        # v2.1.2 como punto de partida
├── vss-extension.json                  # Configuración de extensión
├── src/
│   ├── workitem-requirements.tsx      # ✅ Versión estable con comunicación multi-canal
│   ├── sustainability-requirements.tsx # ✅ Hub principal con sistema de eventos
│   ├── *.css                          # Estilos actualizados
│   └── sustainability_requirements.json # Base de datos de requisitos
├── docs/                               # Documentación técnica existente
├── img/                                # Recursos e imágenes
├── dist/                               # Build artifacts (.gitignore)
├── node_modules/                       # Dependencias (.gitignore)
└── .github/                            # GitHub workflows y templates
    ├── workflows/
    │   ├── build.yml                   # CI/CD para builds automáticos
    │   └── release.yml                 # Release automation
    └── ISSUE_TEMPLATE/
        ├── bug_report.md
        └── feature_request.md
```

## 🏷️ **Sistema de Versionado para V3**

### **Estrategia de Tags**
```bash
# Versión base estable
git tag -a v2.1.2-stable -m "Versión estable base - Comunicación multi-canal funcionando"

# Futuras versiones
v2.2.0    # Minor: Nuevas funcionalidades
v2.2.1    # Patch: Bug fixes
v3.0.0    # Major: Breaking changes o arquitectura nueva
```

### **Branches Strategy**
```
main              # Código estable, solo merges desde develop
develop           # Desarrollo activo, features integradas
feature/*         # Ramas para nuevas funcionalidades
hotfix/*          # Fixes urgentes desde main
release/*         # Preparación de releases
```

## 📦 **Assets a Migrar**

### **Archivos Esenciales**
- ✅ **package.json** (v2.1.2)
- ✅ **vss-extension.json** (v2.1.2)
- ✅ **src/workitem-requirements.tsx** (comunicación multi-canal)
- ✅ **src/sustainability-requirements.tsx** (eventos mejorados)
- ✅ **src/sustainability_requirements.json** (base de datos)
- ✅ **webpack.config.js** (configuración build)
- ✅ **tsconfig.json** (configuración TypeScript)

### **Documentación**
- ✅ **README-V3.md** → **README.md** (documentación principal)
- ✅ **CHANGELOG.md** (historial completo)
- ✅ **docs/** (documentación técnica existente)

### **Recursos**
- ✅ **img/** (logos e imágenes)
- ✅ **CSS files** (estilos actuales)

### **Configuración**
- ✅ **.gitignore** (actualizado para V3)
- ✅ **.vscode/** (configuración VS Code)

## 🚀 **Comandos de Migración**

### **1. Crear Nuevo Repositorio Local**
```bash
# Crear directorio para V3
mkdir CRETS4DevOps-V3
cd CRETS4DevOps-V3

# Inicializar git
git init
git config user.name "CRETS4DevOps"
git config user.email "crets4devops@example.com"
```

### **2. Copiar Archivos Esenciales**
```bash
# Copiar estructura desde V2 (adaptar paths según sea necesario)
cp -r ../CRETS4DevOps-V2/src ./
cp -r ../CRETS4DevOps-V2/docs ./
cp -r ../CRETS4DevOps-V2/img ./
cp ../CRETS4DevOps-V2/package.json ./
cp ../CRETS4DevOps-V2/vss-extension.json ./
cp ../CRETS4DevOps-V2/webpack.config.js ./
cp ../CRETS4DevOps-V2/tsconfig.json ./
cp ../CRETS4DevOps-V2/.gitignore ./

# Copiar documentación nueva
cp ../CRETS4DevOps-V2/README-V3.md ./README.md
cp ../CRETS4DevOps-V2/CHANGELOG.md ./
```

### **3. Configurar Repositorio**
```bash
# Crear .gitignore optimizado
echo "node_modules/" > .gitignore
echo "dist/" >> .gitignore
echo "*.vsix" >> .gitignore
echo ".env" >> .gitignore

# Primer commit con versión estable
git add .
git commit -m "🎉 Initial commit - CRETS4DevOps V3 base estable v2.1.2

✅ Funcionalidades estables:
- Independencia completa entre Work Items
- Sistema de comunicación multi-canal
- Importación de requisitos funcionando
- Sin bucles infinitos

📦 Base para futuras funcionalidades"

# Crear tag de versión estable
git tag -a v2.1.2-stable -m "Versión estable base - Comunicación multi-canal funcionando"
```

### **4. Conectar con GitHub**
```bash
# Agregar origin (después de crear repo en GitHub)
git remote add origin https://github.com/[tu-usuario]/CRETS4DevOps-V3.git

# Push inicial
git branch -M main
git push -u origin main
git push origin --tags
```

## 🔄 **Beneficios de la Migración**

### **🔒 Protección de Proyectos Existentes**
- CRETS4DevOps-V2 se mantiene intacto
- No hay riesgo de afectar otros proyectos
- Historial completo preservado

### **🚀 Base Sólida para Desarrollo**
- Versión 2.1.2 completamente funcional como punto de partida
- Comunicación entre componentes funcionando correctamente
- Sistema de storage independiente estable

### **📈 Escalabilidad Futura**
- Repositorio limpio para nuevas funcionalidades
- Versionado semántico bien estructurado
- CI/CD desde cero con mejores prácticas

### **📚 Documentación Mejorada**
- README actualizado con todas las funcionalidades actuales
- CHANGELOG detallado desde el inicio
- Guías técnicas actualizadas

## 🧪 **Validación Post-Migración**

### **Checklist de Validación**
- [ ] Build exitoso: `npm run build`
- [ ] Package generado: `npm run package`
- [ ] Funcionalidades core funcionando:
  - [ ] Independencia entre work items
  - [ ] Importación de requisitos desde hub
  - [ ] Sistema de comunicación multi-canal
  - [ ] Remove individual por work item
- [ ] Documentación accesible y actualizada
- [ ] Tags de versión correctos

### **Tests Funcionales**
1. **Test de Independencia**: Verificar que 2 work items diferentes mantienen requisitos separados
2. **Test de Comunicación**: Aplicar requisitos desde hub y confirmar recepción en work item
3. **Test de Persistencia**: Refrescar work item y verificar que requisitos se mantienen
4. **Test de Performance**: Confirmar que no hay bucles infinitos

## 📞 **Contacto y Soporte**

Para dudas sobre la migración:
- Crear issue en el nuevo repositorio CRETS4DevOps-V3
- Incluir contexto de la migración desde V2
- Especificar ambiente y configuración

---

**CRETS4DevOps V3** - Base estable para el futuro 🚀  
*Migración desde V2 - Versión estable 2.1.2*