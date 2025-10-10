# CRETS4DevOps V3 - Versión 2.2.0

## 🌱 Azure DevOps Extension for Independent Sustainability Requirements Management

### ✨ **Funcionalidades Principales**

#### 🆕 **Novedad en V3 (2.2.0): Refresco Automático**
- **🔄 Refresco Automático:** Los requisitos se actualizan automáticamente sin necesidad de recargar la página
- **📱 Botones Manuales:** Para casos donde el refresco automático no funcione
- **🎯 Feedback Visual:** Alerts informativos del estado de sincronización
- **🧪 Debug Avanzado:** Consola detallada para troubleshooting

#### 🔐 **Independencia Total (Desde V2.1.x)**
- **💾 Storage Independiente:** Cada Work Item tiene su propio storage completamente aislado
- **🆔 IDs Reales:** Uso de Azure DevOps Work Item IDs reales (no fake IDs)
- **🔄 Soporte Universal:** Compatible con todos los tipos de Work Items:
  - ✅ Product Backlog Item (PBI)
  - ✅ Epic, Feature, Bug, Task, Test Case, User Story
  - ✅ Tipos personalizados de Work Items

#### 🆕 **Soporte para Work Items Nuevos (V2.1.9+)**
- **🆕 Detección Automática:** Reconoce Work Items nuevos vs existentes
- **⏱️ IDs Temporales:** Para Work Items no guardados aún
- **🔄 Transición Automática:** A IDs permanentes al guardar

### 📋 **Cómo Usar**

1. **Desde el Hub CRETS4DevOps:**
   - Navega a la pestaña "Sustainability Requirements"
   - Selecciona los requisitos deseados
   - Haz clic en "Aplicar Requisitos"

2. **En Work Items:**
   - Abre cualquier Work Item (PBI, Epic, Feature, etc.)
   - Ve a la pestaña "Sustainability Requirements"
   - Los requisitos aplicados aparecen **automáticamente**
   - Si no aparecen, usa el botón "🔄 Refrescar Ahora"

3. **Independencia Garantizada:**
   - Cada Work Item mantiene sus propios requisitos
   - Sin interferencia entre diferentes Work Items
   - Funciona en Work Items nuevos y existentes

### 🔧 **Características Técnicas**

- **Azure DevOps SDK v3.1.0** completamente integrado
- **React 17 + TypeScript** para interfaz moderna
- **Sistema de comunicación multi-canal:**
  - localStorage con watchers
  - postMessage para cross-frame communication
  - Custom Events para refresco automático
  - SDK notifications

### 📦 **Instalación**

1. Descarga el archivo `rogeliofha.plugin-crets-v2-2.2.0.vsix`
2. En Azure DevOps, ve a Organization Settings > Extensions
3. Sube e instala la extensión
4. ¡Listo para usar!

### 🏗️ **Estructura del Proyecto**

```
CRETS4DevOps-V3/
├── src/
│   ├── sustainability-requirements.tsx     # Hub principal
│   ├── workitem-requirements.tsx          # Sección en Work Items
│   ├── sustainability_requirements.json   # Base de datos de requisitos
│   └── *.css                             # Estilos
├── dist/                                  # Archivos compilados
├── docs/                                  # Documentación técnica
└── vss-extension.json                    # Manifiesto de la extensión
```

### 📈 **Historial de Versiones**

- **v2.2.0 (V3):** Refresco automático y comunicación mejorada
- **v2.1.9:** Soporte completo para Work Items nuevos
- **v2.1.8:** IDs reales de Azure DevOps y compatibilidad universal
- **v2.1.7:** Independencia total entre Work Items
- **v2.0.x:** Versiones iniciales con funcionalidad básica

### 🚀 **Desarrollo**

```bash
# Instalar dependencias
npm install

# Compilar
npm run build

# Empaquetar extensión
npm run package

# Desarrollo
npm run dev
```

### 📝 **Contribuciones**

Este proyecto es parte de la investigación en requisitos de sostenibilidad para DevOps. Las contribuciones son bienvenidas.

### 📄 **Licencia**

Proyecto de investigación académica - Universidad/Institución correspondiente.

---

**Desarrollado por:** Rogelio Fernando Hernandez Alarcon  
**Repositorio:** https://github.com/Rogeliofha/CRETS4DevOps-V3  
**Versión Actual:** 2.2.0 (Octubre 2025)