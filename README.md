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

##  Novedades Específicas V3 vs V2

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

## Requisitos previos

- [Node.js](https://nodejs.org/) (versi�n 14 o posterior)
- [Visual Studio Code](https://code.visualstudio.com/)
- [tfx-cli](https://www.npmjs.com/package/tfx-cli) (instalado globalmente con `npm install -g tfx-cli`)
- Una organizaci�n de Azure DevOps para probar la extensi�n

## Configuraci�n del proyecto

1. Clona este repositorio
2. Ejecuta `npm install` para instalar las dependencias

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

## Construcci�n

Para construir la extensi�n:

```bash
npm run build
```

## Empaquetado

Para crear el archivo `.vsix` de la extensi�n:

```bash
npm run package
```

El archivo de la extensi�n se generar� en la carpeta `dist`.

## Publicaci�n

Antes de publicar la extensi�n, aseg�rate de modificar el campo `publisher` en el archivo `vss-extension.json` con tu ID de publicador de Marketplace.

Para publicar la extensi�n:

```bash
npm run publish
```

## Estructura del proyecto

- `src/`: C�digo fuente
  - `sustainability-requirements.html`: Plantilla HTML principal
  - `sustainability-requirements.tsx`: Componente React para gesti�n de requisitos
  - `sustainability_requirements.json`: Base de datos de requisitos
- `docs/`: Documentaci�n t�cnica completa
- `img/`: Im�genes y recursos
- `dist/`: Archivos generados (no incluidos en el repositorio)
- `vss-extension.json`: Manifiesto de la extensi�n
- `webpack.config.js`: Configuraci�n de Webpack
- `package.json`: Dependencias y scripts
- `tsconfig.json`: Configuraci�n de TypeScript

## Caracter�sticas principales

-  **Gesti�n de requisitos de sostenibilidad**: Interfaz completa para crear, editar y organizar requisitos
-  **Persistencia local**: Los datos se guardan autom�ticamente en localStorage
-  **Estructura jer�rquica**: Organizaci�n en �rbol de requisitos padre-hijo
-  **B�squeda avanzada**: Filtrado y b�squeda de requisitos en tiempo real
-  **Selecci�n m�ltiple**: Aplicaci�n de m�ltiples requisitos a Work Items
-  **Visualizaci�n clara**: Interfaz intuitiva y responsive

## Diferencias con V1

| Aspecto | V1 | V2 |
|---------|----|----|
| **Nombre** | Plugin CRETS | CRETS4DevOps V2 |
| **Versi�n** | 1.12.8 | 2.0.0 |
| **Funcionalidad** | B�sica | Avanzada |
| **Documentaci�n** | M�nima | Completa |
| **Arquitectura** | Simple | Profesional |

## Documentaci�n

La documentaci�n t�cnica completa est� disponible en la carpeta `docs/`:

- [Arquitectura del sistema](docs/architecture-diagram.md)
- [Gesti�n de almacenamiento](docs/data-storage-management.md)
- [Gu�a de localStorage](docs/localStorage-guide.md)
- [Documentaci�n t�cnica](docs/technical-architecture.md)

## Personalizaci�n

Para personalizar la extensi�n:

1. Modifica `src/sustainability-requirements.tsx` para cambiar la funcionalidad
2. Actualiza `vss-extension.json` con tus datos de publicaci�n
3. Reemplaza las im�genes en `img/` con tu propio logo
4. Modifica `sustainability_requirements.json` para agregar nuevos requisitos

## Licencia

MIT

## Versi�n

**CRETS4DevOps V2** - Versi�n 2.0.0
