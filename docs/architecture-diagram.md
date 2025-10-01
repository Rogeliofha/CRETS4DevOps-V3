# CRETS4DevOps - Diagrama de Arquitectura

## Arquitectura del Sistema

```mermaid
graph TB
    User[👤 DevOps Team<br/>Usuario] --> AzureDevOps[🌐 Azure DevOps<br/>Platform]
    
    AzureDevOps --> WorkItems[📋 Work Items<br/>Azure Boards]
    AzureDevOps --> Extension[📱 Browser Extension<br/>CRETS4DevOps]
    
    Extension --> Frontend[⚛️ React Frontend<br/>TypeScript]
    Extension --> SDK[🔧 Azure DevOps SDK<br/>Integration Layer]
    
    Frontend --> Components[🧩 React Components<br/>RequirementItem, Forms]
    Frontend --> Styling[🎨 CSS Styling<br/>UI/UX Layer]
    
    SDK --> DataLayer[💾 Data Management<br/>Persistence Layer]
    
    DataLayer --> LocalStorage[📦 localStorage<br/>Browser Storage]
    DataLayer --> JSONFiles[📊 JSON Files<br/>Requirements Data]
    
    LocalStorage --> Requirements[📋 Sustainability<br/>Requirements]
    JSONFiles --> Requirements
    
    Requirements --> WorkItems
    
    style User fill:#e1f5fe
    style AzureDevOps fill:#f3e5f5
    style Extension fill:#e8f5e8
    style Frontend fill:#fff3e0
    style DataLayer fill:#fce4ec
```

## Flujo de Datos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant AD as Azure DevOps
    participant C as CRETS4DevOps
    participant LS as localStorage
    participant WI as Work Item
    
    U->>AD: Abre Work Item
    AD->>C: Carga Extension
    C->>LS: Lee requisitos guardados
    LS->>C: Retorna datos
    C->>U: Muestra interfaz
    U->>C: Selecciona requisitos
    C->>LS: Guarda selección
    C->>WI: Aplica requisitos
    WI->>AD: Actualiza Work Item
    AD->>U: Confirma cambios
```

## Componentes Tecnológicos

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Frontend | React + TypeScript | Interfaz de usuario |
| Extension Platform | Azure DevOps SDK | Integración nativa |
| Persistencia | localStorage + JSON | Almacenamiento de datos |
| Styling | CSS3 | Presentación visual |
| Build System | Webpack + npm | Empaquetado y distribución |

## Instrucciones de Uso

1. **Para visualizar en GitHub**: Este diagrama se renderiza automáticamente en archivos .md
2. **Para herramientas online**: Copiar el código Mermaid a [mermaid.live](https://mermaid.live)
3. **Para VS Code**: Instalar la extensión "Mermaid Preview"
