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

## Flujo de Datos

```
Usuario ──► Azure DevOps ──► Extension ──► React Frontend
   ▲                                              │
   │                                              ▼
   │                                    ┌─────────────────┐
   │                                    │ Estado de la App│
   │                                    │ - requirements  │
   │                                    │ - selectedReq   │
   │                                    │ - checkedReqs   │
   │                                    └─────────┬───────┘
   │                                              │
   │         ┌────────────────────────────────────▼
   │         │                                     
   │         ▼                                     
   │  ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
   │  │localStorage │◄────┤ Data Manager ├────►│ JSON Files  │
   │  │             │     │              │     │             │
   │  └─────────────┘     └──────────────┘     └─────────────┘
   │         │                                              
   │         ▼                                              
   │  ┌─────────────┐                                      
   │  │ Work Item   │                                      
   │  │ Updates     │                                      
   │  └─────────────┘                                      
   │         │                                              
   └─────────┘                                              
```

## Componentes Principales

### 1. SustainabilityRequirements (Componente Principal)
```
Responsabilidades:
├── Gestión del estado global de la aplicación
├── Coordinación entre componentes hijos
├── Manejo de la carga inicial de datos
├── Integración con Azure DevOps SDK
└── Persistencia de datos en localStorage
```

### 2. RequirementItem (Componente Recursivo)
```
Características:
├── Renderizado jerárquico de requisitos
├── Expansión/colapso de nodos hijos
├── Selección múltiple con checkboxes
├── Acciones de edición y eliminación
└── Auto-expansión cuando hay hijos seleccionados
```

### 3. RequirementEditForm & RequirementCreateForm
```
Funcionalidades:
├── Validación de códigos jerárquicos
├── Edición de campos: código, detalle, justificación
├── Selección automática de padres
├── Manejo de errores y validaciones
└── Guardado con persistencia automática
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
SustainabilityRequirements (Container)
├── Maneja lógica de negocio
├── Gestiona estado global
└── Orquesta componentes

RequirementItem (Presentational)
├── Recibe datos via props
├── Emite eventos al padre
└── UI pura sin side effects
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

## Estrategia de Persistencia

### Jerarquía de Fuentes de Datos:
```
1. localStorage (Prioridad Alta)
   ├── Datos modificados por el usuario
   ├── Selecciones actuales
   └── Configuraciones personalizadas

2. JSON Files (Prioridad Media)
   ├── Datos de requisitos base
   ├── Estructura jerárquica predefinida
   └── Metadatos de requisitos

3. Fallback Data (Prioridad Baja)
   ├── Datos hardcodeados en la aplicación
   ├── Estructura mínima para demostración
   └── Garantiza funcionamiento básico
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

### Pipeline de Build:
```
npm run build
    ├── TypeScript compilation
    ├── Webpack bundling
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
│   ├── sustainability-requirements.html
│   ├── sustainability-requirements.js
│   ├── sustainability-requirements.css
│   └── sustainability_requirements.json
├── img/
│   ├── logo.png
│   └── sustainability.png
└── vss-extension.json (manifest)
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

**Versión del Documento**: 1.0  
**Fecha de Actualización**: Agosto 2025  
**Autor**: Equipo CRETS4DevOps  
**Próxima Revisión**: Septiembre 2025
