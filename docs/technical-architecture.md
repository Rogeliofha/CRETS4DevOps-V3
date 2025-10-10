# CRETS4DevOps - Documentación Técnica de Arquitectura

## Resumen Ejecutivo

CRETS4DevOps es una extensión de Azure DevOps desarrollada en React + TypeScript que permite la gestión de requisitos de sostenibilidad directamente dentro de los Work Items de Azure Boards.

## Arquitectura del Sistema

```
                    ┌─────────────────────────────────────────┐
                    │           👤 DevOps Team               │
                    │              (Usuario)                 │
                    └─────────────────┬───────────────────────┘
                                      │
                    ┌─────────────────┴───────────────────────┐
                    │        🌐 Azure DevOps Platform        │
                    │           (Hosting Layer)              │
                    └─────────────────┬───────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
    ┌───────▼────────┐       ┌───────▼───────┐       ┌─────────▼────────┐
    │  📋 Work Items │       │ 📱 CRETS4DevOps│       │  🔧 Azure DevOps │
    │ (Azure Boards) │◄──────┤   Extension    │◄──────┤      SDK         │
    └────────────────┘       └───────┬───────┘       └──────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │         ⚛️ React Frontend        │
                    │        (Presentation Layer)     │
                    └────────────────┬────────────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            │                        │                        │
    ┌───────▼───────┐       ┌───────▼───────┐       ┌────────▼───────┐
    │ 🧩 Components │       │  🎨 CSS Styles │       │ 📊 State Mgmt  │
    │ RequirementItem│       │   UI/UX Layer │       │  React Hooks   │
    │ EditForm       │       │               │       │                │
    │ CreateForm     │       │               │       │                │
    └────────────────┘       └───────────────┘       └────────┬───────┘
                                                              │
                             ┌────────────────────────────────▼┐
                             │        💾 Data Management        │
                             │       (Persistence Layer)       │
                             └────────────────┬────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
            ┌───────▼───────┐         ┌──────▼──────┐         ┌────────▼────────┐
            │ 📦 localStorage│         │ 📊 JSON Files│         │ 📋 Requirements │
            │ Browser Storage│         │ Static Data │         │    Database     │
            └────────────────┘         └─────────────┘         └─────────────────┘
```

## Flujo de Datos Avanzado (V3)

```
Usuario ──► Azure DevOps ──► Extension Hub ──► React Frontend
   ▲                                                   │
   │                                                   ▼
   │                                       ┌─────────────────┐
   │                                       │ Estado Global   │
   │                                       │ - requirements  │
   │                                       │ - selectedReq   │
   │                                       │ - checkedReqs   │
   │                                       └─────────┬───────┘
   │                                                 │
   │         ┌───────────────────────────────────────▼
   │         │                                        
   │         ▼                Sistema de Comunicación Multi-Estrategia
   │  ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
   │  │localStorage │◄────┤ Data Manager ├────►│ JSON Files  │
   │  │   Global    │     │              │     │             │
   │  └─────────────┘     └──────┬───────┘     └─────────────┘
   │         │                   │                          
   │         │                   ▼ Comunicación Multi-Estrategia
   │         │            ┌──────────────────┐                
   │         │            │ 1. localStorage  │                
   │         │            │ 2. postMessage   │                
   │         │            │ 3. CustomEvents  │                
   │         │            │ 4. DOM iframes   │                
   │         │            │ 5. Azure SDK     │                
   │         │            │ 6. Refresh Events│                
   │         │            └──────────────────┘                
   │         │                   │                          
   │         ▼                   ▼                          
   │  ┌─────────────┐     ┌──────────────┐                  
   │  │Work Item A  │     │Work Item B   │                  
   │  │Storage      │     │Storage       │                  
   │  │Independent  │     │Independent   │                  
   │  └─────────────┘     └──────────────┘                  
   │         │                   │                          
   │         ▼                   ▼                          
   │  ┌─────────────┐     ┌──────────────┐                  
   │  │Requirements │     │Requirements  │                  
   │  │Applied A    │     │Applied B     │                  
   │  └─────────────┘     └──────────────┘                  
   │         │                   │                          
   └─────────┴───────────────────┘                          
```

## Sistema de Independencia por Work Item

```
Work Item #12345 ──► WorkItemStorage.setWorkItemId('12345')
                            │
                            ▼
                   ┌─────────────────────┐
                   │ Storage Keys:       │
                   │ workitem_12345_*    │
                   └─────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
  ┌─────────────────┐ ┌──────────────┐ ┌────────────┐
  │selectedRequireme│ │removedRequire│ │modifiedData│
  │nts              │ │mentIds       │ │            │
  └─────────────────┘ └──────────────┘ └────────────┘

Work Item #67890 ──► Completamente independiente
                   ┌─────────────────────┐
                   │ Storage Keys:       │
                   │ workitem_67890_*    │
                   └─────────────────────┘
```

## Componentes Principales

### 1. SustainabilityRequirements (Componente Principal - Hub)
```
Responsabilidades:
├── Gestión del estado global de la aplicación
├── Coordinación entre componentes hijos
├── Manejo de la carga inicial de datos
├── Integración con Azure DevOps SDK
├── Persistencia de datos en localStorage
├── Sistema de comunicación multi-estrategia
└── Preparación de requisitos para Work Items
```

### 2. WorkItemRequirements (Componente de Work Item)
```
Características Avanzadas V3:
├── Storage independiente por Work Item ID
├── Edición in-place de requisitos aplicados
├── Tracking de modificaciones con timestamps
├── Referencias a requisitos originales del catálogo
├── Sistema de limpieza automática de storage
├── Auto-refresh entre ventanas/pestañas
└── Comunicación bidireccional con Hub
```

### 3. WorkItemStorage (Clase de Almacenamiento Independiente)
```
Funcionalidades Clave:
├── Aislamiento total por Work Item ID
├── Generación de claves únicas de storage
├── Gestión de requisitos seleccionados independientes
├── Tracking de requisitos eliminados por Work Item
├── Limpieza de datos legacy y duplicados
├── Debug y logging detallado de independencia
└── Migración automática de datos antiguos
```

### 4. RequirementItem (Componente Recursivo)
```
Características:
├── Renderizado jerárquico de requisitos
├── Expansión/colapso de nodos hijos
├── Selección múltiple con checkboxes
├── Acciones de edición y eliminación
├── Auto-expansión cuando hay hijos seleccionados
├── Soporte para edición independiente por Work Item
└── Estados visuales para requisitos modificados
```

### 5. RequirementEditForm & RequirementCreateForm
```
Funcionalidades:
├── Validación de códigos jerárquicos
├── Edición de campos: código, detalle, justificación
├── Selección automática de padres
├── Manejo de errores y validaciones
├── Guardado con persistencia automática
├── Tracking de modificaciones independientes
└── Preservación de referencias originales
```

## Stack Tecnológico Detallado

| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|-----------|
| **Frontend Framework** | React | 17.0.2 | Biblioteca de UI declarativa |
| **Type Safety** | TypeScript | 4.5.5 | Tipado estático para JavaScript |
| **Extension Platform** | Azure DevOps SDK | 3.1.0 | Integración nativa con DevOps |
| **Build System** | Webpack | 5.69.1 | Empaquetado y optimización |
| **Package Manager** | npm | - | Gestión de dependencias |
| **Styling** | CSS3 | - | Estilos puros sin frameworks |
| **Persistence** | localStorage | Native | Almacenamiento local del navegador |
| **Data Format** | JSON | - | Formato de intercambio de datos |

## Patrones de Diseño Implementados

### 1. Component Composition Pattern
```typescript
// Composición de componentes para máxima reutilización
<RequirementItem>
  <RequirementHeader />
  <RequirementActions />
  <RequirementChildren>
    <RequirementItem /> // Recursividad
  </RequirementChildren>
</RequirementItem>
```

### 2. Container/Presentational Pattern
```
SustainabilityRequirements (Container - Hub)
├── Maneja lógica de negocio global
├── Gestiona estado del catálogo
├── Sistema de comunicación multi-estrategia
└── Orquesta componentes

WorkItemRequirements (Container - Work Item Specific)
├── Maneja lógica específica del Work Item
├── Storage independiente por Work Item ID
├── Edición in-place de requisitos aplicados
└── Auto-refresh y sincronización

RequirementItem (Presentational)
├── Recibe datos via props
├── Emite eventos al padre
├── UI pura sin side effects
└── Soporte para estados modificados
```

### 3. Controlled Components Pattern
```typescript
// Todos los formularios son componentes controlados
const [formData, setFormData] = useState(initialState);

<input 
  value={formData.displayCode}
  onChange={(e) => setFormData({...formData, displayCode: e.target.value})}
/>
```

### 4. Independent Storage Pattern (Nuevo en V3)
```typescript
// Patrón de almacenamiento independiente por Work Item
class WorkItemStorage {
  static setWorkItemId(id: string) {
    this.workItemId = id;
  }
  
  static getStorageKey(key: string): string {
    return `workitem_${this.workItemId}_${key}`;
  }
  
  // Cada Work Item tiene almacenamiento completamente aislado
}
```

### 5. Multi-Strategy Communication Pattern (Nuevo en V3)
```typescript
// Patrón de comunicación con múltiples estrategias de fallback
const saveSelectedRequirements = () => {
  // Estrategia 1: localStorage como puente principal
  localStorage.setItem(pendingKey, JSON.stringify(newSelectedReqs));
  
  // Estrategia 2: Broadcast a windows/frames
  window.top.postMessage(broadcastMessage, '*');
  window.parent.postMessage(broadcastMessage, '*');
  
  // Estrategia 3: Custom Events
  window.dispatchEvent(new CustomEvent('requirements.available'));
  
  // Estrategia 4: DOM iframes targeting
  document.querySelectorAll('iframe[src*="workItems"]').forEach(iframe => {
    iframe.contentWindow.postMessage(broadcastMessage, '*');
  });
  
  // Estrategia 5: Azure DevOps SDK
  if (SDK.notifyLoadSucceeded) SDK.notifyLoadSucceeded();
  
  // Estrategia 6: Refresh events
  window.dispatchEvent(new CustomEvent('crets.refresh'));
};
```

### 6. Modification Tracking Pattern (Nuevo en V3)
```typescript
// Patrón para trackear modificaciones independientes
interface Requirement {
  // Campos originales...
  _isModified?: boolean;
  _modifiedDate?: string;
  _originalRequirement?: Requirement; // Referencia al original
}

// Tracking automático de cambios
const trackModification = (requirement: Requirement) => ({
  ...requirement,
  _isModified: true,
  _modifiedDate: new Date().toISOString(),
  _originalRequirement: originalCatalogRequirement
});
```

## Estrategia de Persistencia Avanzada (V3)

### Jerarquía de Fuentes de Datos:
```
1. localStorage Global (Prioridad Alta - Hub)
   ├── Catálogo completo de requisitos
   ├── Datos modificados por el usuario
   ├── Configuraciones globales
   └── Cache del JSON externo

2. localStorage por Work Item (Prioridad Alta - Específico)
   ├── workitem_{ID}_selectedRequirements
   ├── workitem_{ID}_removedRequirementIds  
   ├── workitem_{ID}_modifiedData
   └── Independencia total entre Work Items

3. JSON Files (Prioridad Media)
   ├── Datos de requisitos base
   ├── Estructura jerárquica predefinida
   └── Metadatos de requisitos

4. Fallback Data (Prioridad Baja)
   ├── Datos hardcodeados en la aplicación
   ├── Estructura mínima para demostración
   └── Garantiza funcionamiento básico
```

### Sistema de Comunicación Multi-Estrategia:
```
Hub (sustainability-requirements) ────► Work Items (workitem-requirements)
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Estrategia 1│ │ Estrategia 2│ │ Estrategia 3│
│localStorage │ │postMessage  │ │CustomEvents │
│   Bridge    │ │Broadcasting │ │  Dispatch   │
└─────────────┘ └─────────────┘ └─────────────┘
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Estrategia 4│ │ Estrategia 5│ │ Estrategia 6│
│DOM iframes  │ │Azure DevOps │ │Refresh Event│
│ Targeting   │ │  SDK Notify │ │  Auto-sync  │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Limpieza Automática de Storage:
```typescript
// Sistema automático de limpieza implementado
WorkItemStorage.cleanupStorage() {
  // 1. Eliminar datos legacy sin Work Item ID
  // 2. Consolidar duplicados por Work Item
  // 3. Limpiar referencias huérfanas
  // 4. Optimizar espacio de almacenamiento
  // 5. Migrar formatos antiguos
}
```

## Seguridad y Validaciones

### Validaciones de Entrada:
- **Códigos jerárquicos**: Patrón regex `/^[A-Za-z]+\.\d+(\.\d+)*\.?$/`
- **Unicidad**: Verificación de duplicados en tiempo real
- **Integridad referencial**: Validación de relaciones padre-hijo
- **Sanitización**: Escape de caracteres especiales en inputs

### Manejo de Errores:
```
├── Try-catch en operaciones asíncronas
├── Validación de datos antes de procesamiento
├── Fallback graceful cuando fallan las fuentes de datos
├── Logging detallado para debugging
└── UI feedback para errores de usuario
```

## Métricas y Performance

### Optimizaciones Implementadas:
- **React.memo**: Prevención de re-renders innecesarios
- **useMemo**: Memoización de cálculos costosos
- **Lazy loading**: Carga diferida de componentes grandes
- **Debounced search**: Búsqueda optimizada con retraso
- **Virtual scrolling**: Para listas grandes de requisitos

### Indicadores de Performance:
```
├── Time to Interactive (TTI): < 2 segundos
├── First Contentful Paint (FCP): < 1 segundo
├── Bundle size optimizado: < 500KB
├── Memory usage estable: < 50MB
└── CPU usage bajo: < 10% en idle
```

## Deployment y Distribución

### Puntos de Integración en Azure DevOps:
```json
// Múltiples puntos de integración implementados
{
  "contributions": [
    {
      "id": "sustainability-requirements-tab",
      "type": "ms.vss-web.hub",
      "description": "Hub principal para gestión de catálogo",
      "targets": ["ms.vss-web.project-hub-groups-collection"],
      "properties": {
        "name": "CRETS4DevOps V2",
        "uri": "dist/sustainability-requirements.html",
        "icon": "img/sustainability.png",
        "order": 100
      }
    },
    {
      "id": "sustainability-requirements-workitem-tab", 
      "type": "ms.vss-work-web.work-item-form-page",
      "description": "Pestaña en Work Items (Modo Completo)",
      "targets": ["ms.vss-work-web.work-item-form"],
      "properties": {
        "name": "CRETS4DevOps V2",
        "uri": "dist/sustainability-requirements.html"
      }
    },
    {
      "id": "sustainability-requirements-workitem-section",
      "type": "ms.vss-work-web.work-item-form-group", 
      "description": "Sección en Work Items (Modo Compacto)",
      "targets": ["ms.vss-work-web.work-item-form"],
      "properties": {
        "name": "Sustainability Requirements",
        "uri": "dist/workitem-requirements.html",
        "height": 500,
        "width": 950
      }
    }
  ]
}
```

### Pipeline de Build:
```
npm run build
    ├── TypeScript compilation
    ├── Webpack bundling (multi-entry)
    │   ├── sustainability-requirements.js (Hub)
    │   ├── workitem-requirements.js (Work Item específico)
    │   └── hola-mundo.js (Demo)
    ├── CSS optimization
    ├── Asset copying
    └── VSIX package creation

npm run package
    ├── Clean previous builds
    ├── Copy JSON resources
    ├── TFX extension packaging
    └── Output to /dist folder
```

### Estructura de Distribución:
```
rogeliofha.plugin-crets-X.X.X.vsix
├── dist/
│   ├── sustainability-requirements.html (Hub)
│   ├── sustainability-requirements.js
│   ├── workitem-requirements.html (Work Item específico)
│   ├── workitem-requirements.js
│   ├── sustainability-requirements.css
│   ├── workitem-requirements.css
│   └── sustainability_requirements.json
├── img/
│   ├── logo.png
│   └── sustainability.png
└── vss-extension.json (manifest con múltiples contribuciones)
```

## Roadmap y Extensibilidad

### Futuras Mejoras:
1. **Backend Integration**: API REST para sincronización
2. **Real-time Collaboration**: WebSockets para edición simultánea
3. **Advanced Analytics**: Métricas de uso y compliance
4. **AI Suggestions**: Recomendaciones automáticas de requisitos
5. **Mobile Support**: PWA para dispositivos móviles

### Arquitectura Extensible:
```
Plugin System
├── Custom requirement validators
├── External data source connectors
├── Custom UI themes
├── Integration adapters
└── Reporting modules
```

---

**Versión del Documento**: 2.0  
**Fecha de Actualización**: Octubre 2025  
**Autor**: Equipo CRETS4DevOps  
**Próxima Revisión**: Noviembre 2025  
**Cambios V2.0**: Documentación completa de funcionalidades V3 - Storage independiente por Work Item, sistema de comunicación multi-estrategia, edición in-place, y múltiples puntos de integración
