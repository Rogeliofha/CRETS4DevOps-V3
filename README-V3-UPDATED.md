# CRETS4DevOps V3 - Extensión Avanzada para Azure DevOps

Esta es la **versión 3.0** de CRETS4DevOps, una extensión altamente avanzada para Azure DevOps que proporciona gestión completa de requisitos de sostenibilidad con **independencia total por Work Item** y **sistema de comunicación multi-estrategia**.

## 🌟 Novedades Revolucionarias en V3

### 🔥 **Funcionalidades Avanzadas Nuevas:**
- ✅ **Independencia Total por Work Item**: Cada Work Item tiene su propio storage aislado
- ✅ **Edición In-Place**: Modificación independiente de requisitos aplicados
- ✅ **Sistema de Comunicación Multi-Estrategia**: 6 métodos de comunicación simultáneos
- ✅ **WorkItemStorage Class**: Gestión automática de almacenamiento independiente  
- ✅ **Auto-Cleanup**: Limpieza automática de storage obsoleto
- ✅ **Tracking de Modificaciones**: Timestamps y referencias a requisitos originales
- ✅ **Múltiples Puntos de Integración**: Hub + Work Item Tab + Work Item Section

### 🏗️ **Arquitectura Dual:**
- **Hub Component** (`sustainability-requirements`): Gestión global del catálogo
- **WorkItem Component** (`workitem-requirements`): Vista específica por Work Item

### 💾 **Storage Avanzado:**
- **localStorage Global**: Catálogo compartido de requisitos
- **localStorage por Work Item**: Datos completamente independientes por Work Item ID
- **Comunicación Multi-Estrategia**: 6 métodos de sincronización entre componentes

## 📊 Novedades Específicas V3 vs V2

| Característica | V2 | V3 |
|----------------|----|----|
| **Arquitectura** | Single Component | Dual Component (Hub + WorkItem) |
| **Storage** | Global únicamente | Global + Independiente por Work Item |
| **Edición** | Solo catálogo global | In-place por Work Item + catálogo global |
| **Comunicación** | Básica (localStorage) | Multi-estrategia (6 métodos) |
| **Independencia** | No disponible | Aislamiento total por Work Item |
| **Integración Azure DevOps** | 1 punto | 3 puntos de integración |
| **Limpieza de datos** | Manual | Automática con cleanup inteligente |
| **Tracking** | No disponible | Timestamps y referencias completas |

## 🔧 Requisitos previos

- [Node.js](https://nodejs.org/) (versión 14 o posterior)
- [Visual Studio Code](https://code.visualstudio.com/)
- [tfx-cli](https://www.npmjs.com/package/tfx-cli) (instalado globalmente con `npm install -g tfx-cli`)
- Una organización de Azure DevOps para probar la extensión

## ⚙️ Configuración del proyecto

1. Clona este repositorio
2. Ejecuta `npm install` para instalar las dependencias
3. **Nuevo en V3**: La extensión se configurará automáticamente con storage independiente por Work Item

## 🚀 Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

**Nuevo en V3**: El servidor incluye tanto el Hub como los componentes de Work Item.

## 🔨 Construcción

Para construir la extensión:

```bash
npm run build
```

**V3 Multi-Entry Build**: Webpack ahora construye múltiples puntos de entrada optimizados.

## 📦 Empaquetado

Para crear el archivo `.vsix` de la extensión:

```bash
npm run package
```

El archivo de la extensión se generará en la carpeta `dist` con todos los componentes V3.

## 🌐 Publicación

Antes de publicar la extensión, asegúrate de modificar el campo `publisher` en el archivo `vss-extension.json` con tu ID de publicador de Marketplace.

Para publicar la extensión:

```bash
npm run publish
```

## 📁 Estructura del proyecto V3

### 🏗️ **Arquitectura Dual:**
- `src/`: Código fuente con componentes separados
  - `sustainability-requirements.html/tsx`: **Hub Component** - Gestión global del catálogo
  - `workitem-requirements.html/tsx`: **WorkItem Component** - Vista específica por Work Item
  - `sustainability_requirements.json`: Base de datos de requisitos
  - `*.css`: Estilos independientes por componente
- `docs/`: Documentación técnica completa V3
  - `technical-architecture.md`: Arquitectura avanzada V3
  - `data-storage-management.md`: Sistema de storage dual
  - `workitem-independence.md`: **NUEVO** - Sistema de independencia
  - `architecture-diagram.md`: Diagramas actualizados V3
  - `localStorage-guide.md`: Guía completa de localStorage
- `img/`: Imágenes y recursos
- `dist/`: Archivos generados multi-entry (no incluidos en el repositorio)
- `vss-extension.json`: Manifiesto con **múltiples puntos de integración**
- `webpack.config.js`: Configuración multi-entry V3
- `package.json`: Dependencias actualizadas V3
- `tsconfig.json`: Configuración de TypeScript

## 🚀 Características Revolucionarias V3

### ✅ **Independencia Total por Work Item**
- Cada Work Item tiene **storage completamente aislado**
- **WorkItemStorage Class** para gestión automática
- **Edición in-place** de requisitos aplicados sin afectar otros Work Items
- **Tracking completo** de modificaciones con timestamps

### ✅ **Sistema de Comunicación Multi-Estrategia**
- **6 métodos simultáneos** de comunicación entre componentes:
  1. 📦 localStorage Bridge (principal)
  2. 📤 PostMessage Broadcasting
  3. 🔔 Custom Events
  4. 🎯 DOM iframes Targeting
  5. 🔧 Azure DevOps SDK notifications
  6. 🔄 Auto-refresh Events

### ✅ **Gestión Avanzada de Datos**
- **localStorage Global**: Catálogo compartido de requisitos
- **localStorage por Work Item**: Datos independientes con claves únicas
- **Auto-cleanup**: Limpieza automática de datos obsoletos
- **Validación de integridad**: Verificación automática de aislamiento

### ✅ **Múltiples Puntos de Integración Azure DevOps**
- **Hub**: Gestión global en project-level
- **Work Item Tab**: Vista completa en Work Items
- **Work Item Section**: Vista compacta integrada

## 📈 Diferencias V3 vs V2 vs V1

| Aspecto | V1 | V2 | V3 |
|---------|----|----|-----|
| **Nombre** | Plugin CRETS | CRETS4DevOps V2 | CRETS4DevOps V3 |
| **Versión** | 1.12.8 | 2.0.0 | **3.0.0** |
| **Arquitectura** | Simple | Mejorada | **Dual Component** |
| **Storage** | Básico | localStorage global | **Global + Independiente** |
| **Work Item Independence** | No | No | **✅ Total** |
| **Comunicación** | Básica | Mejorada | **Multi-estrategia (6 métodos)** |
| **Edición in-place** | No | No | **✅ Sí** |
| **Auto-cleanup** | No | No | **✅ Inteligente** |
| **Integración Azure DevOps** | 1 punto | 1 punto | **3 puntos** |
| **Documentación** | Mínima | Completa | **Avanzada + Específica V3** |

## 📚 Documentación Técnica V3

La documentación técnica **completamente actualizada para V3** está disponible en la carpeta `docs/`:

### 📖 **Documentación Principal:**
- [**Arquitectura Técnica V3**](docs/technical-architecture.md) - Arquitectura avanzada con componentes duales
- [**Gestión de Almacenamiento V3**](docs/data-storage-management.md) - Sistema dual de storage y comunicación multi-estrategia
- [**Independencia por Work Item**](docs/workitem-independence.md) - **NUEVO** - Sistema completo de aislamiento
- [**Diagramas de Arquitectura V3**](docs/architecture-diagram.md) - Diagramas actualizados con flujos avanzados
- [**Guía de localStorage**](docs/localStorage-guide.md) - Guía detallada de almacenamiento

### 🔧 **Para Desarrolladores:**
- [**Arquitectura Interactiva**](docs/architecture-interactive.html) - Visualización interactiva en HTML
- **Código Fuente Documentado**: Comentarios detallados en TypeScript
- **Ejemplos de Implementación**: Casos de uso reales en la documentación

## 🎯 Cómo Usar V3

### **1. Como Usuario:**
1. **Hub Global**: Accede desde el menú principal de Azure DevOps para gestionar el catálogo
2. **Work Item Específico**: Los requisitos aparecen automáticamente en cada Work Item
3. **Edición Independiente**: Modifica requisitos específicos por Work Item sin afectar otros

### **2. Como Desarrollador:**
1. **Instalación**: Sigue las instrucciones de instalación estándar
2. **Personalización**: Modifica componentes específicos (Hub o WorkItem)
3. **Extensión**: Agrega nuevas funcionalidades usando las clases base

## 🔧 Personalización V3

Para personalizar la extensión V3:

### **Componentes:**
1. **Hub Component**: Modifica `src/sustainability-requirements.tsx` para el catálogo global
2. **WorkItem Component**: Modifica `src/workitem-requirements.tsx` para vista específica
3. **Storage**: Usa `WorkItemStorage` class para datos independientes
4. **Comunicación**: Extiende el sistema multi-estrategia según necesidad

### **Configuración:**
1. Actualiza `vss-extension.json` con tus datos de publicación
2. Configura múltiples puntos de integración según tu necesidad
3. Reemplaza las imágenes en `img/` con tu propio branding
4. Modifica `sustainability_requirements.json` para tu catálogo específico

## 🔄 Migración de V2 a V3

### ✅ **Compatibilidad Automática:**
- Los datos existentes de V2 se migran automáticamente
- No se pierden requisitos aplicados previamente
- La estructura del catálogo se mantiene

### 🔄 **Mejoras Automáticas:**
- **Storage independiente** se configura automáticamente
- **Limpieza de datos legacy** se ejecuta automáticamente
- **Nuevas funcionalidades** disponibles inmediatamente

## 📄 Licencia

MIT

## 📌 Versión

**CRETS4DevOps V3** - Versión 3.0.0

### 🏆 **Logros V3:**
- ✅ **Independencia total** entre Work Items
- ✅ **Comunicación robusta** con 6 estrategias de fallback
- ✅ **Edición in-place** sin conflictos
- ✅ **Performance optimizada** con storage específico
- ✅ **Documentación completa** de funcionalidades avanzadas

---

## 🚀 **¿Por qué elegir CRETS4DevOps V3?**

CRETS4DevOps V3 es la **extensión más avanzada** para gestión de requisitos de sostenibilidad en Azure DevOps, ofreciendo:

- 🎯 **Independencia total** entre Work Items
- 🔄 **Comunicación robusta** con múltiples estrategias de fallback
- ⚡ **Performance optimizada** con storage específico por contexto
- 🛠️ **Flexibilidad máxima** para edición sin conflictos
- 📚 **Documentación completa** para implementación y mantenimiento

**¡Transforma tu gestión de sostenibilidad en Azure DevOps con V3!**