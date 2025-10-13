# CRETS4DevOps V2 - Extensión Avanzada para Azure DevOps

Esta es la **versión 2.5.2** de CRETS4DevOps, un## Diferencias con V1 Completamente Implementada## Licencia

MIT

## Versión Actual

**CRETS4DevOps V2** - Versión **2.5.2** (UI Cleanup Release)

### Historial de Versiones:
- **v2.5.2**: Limpieza de UI profesional, bundle optimizado a 247KB
- **v2.5.1**: Traducción completa de diálogos a inglés
- **v2.5.0**: Traducción del hub principal
- **v2.4.0**: Interfaz profesional completamente en inglés
- **v2.3.0**: Sistema de edición en línea completo
- **v2.2.0**: Sistema de auto-actualización multi-canal
- **v2.1.x**: Implementación de independencia total entre Work Items

### Documentación para Tesis:
La carpeta `docs/` contiene documentación técnica completa adecuada para investigación académica y escritura de tesis, incluyendo diagramas interactivos de arquitectura y análisis técnico profundo.pecto | V1 | V2.5.2 (Actual) |
|---------|----|----|
| **Nombre** | Plugin CRETS | CRETS4DevOps V2 |
| **Versión** | 1.12.8 | **2.5.2** |
| **Independencia** | ❌ Sin aislamiento | ✅ Aislamiento total por Work Item |
| **Edición** | ❌ Solo selección | ✅ Edición completa en línea |
| **Auto-refresh** | ❌ Manual | ✅ Sincronización automática |
| **Idioma** | 🇪🇸 Español | 🇺🇸 Inglés profesional |
| **Arquitectura** | Básica | ✅ Empresarial con patrones avanzados |
| **Bundle** | ~300KB+ | ✅ 247KB optimizado |
| **UI/UX** | Técnica | ✅ Profesional limpia |

## 🏗️ Arquitectura Técnica Avanzada

### Componentes Principales:
- **WorkItemStorage**: Motor de independencia con claves basadas en IDs reales
- **RequirementItem**: Componente recursivo con edición en línea
- **Multi-channel Communication**: Sistema de eventos para auto-refresh
- **Professional English Interface**: Estándares internacionalesón sofisticada para Azure DevOps que proporciona gestión avanzada de requisitos de sostenibilidad con independencia completa entre Work Items, edición en línea, y auto-actualización en tiempo real.

## 🚀 Funcionalidades Avanzadas V2.5.x

- ✅ **Independencia Total**: Cada Work Item mantiene sus propios requisitos de forma aislada
- ✅ **Edición En Línea**: Modificación directa de requisitos con funcionalidad guardar/restaurar
- ✅ **Auto-actualización**: Sincronización en tiempo real entre diferentes vistas
- ✅ **Interfaz Profesional**: Completamente en inglés con estándares internacionales
- ✅ **Sistema Multi-canal**: Comunicación avanzada entre componentes
- ✅ **UI Limpia**: Sin información técnica, enfoque en funcionalidad core
- ✅ **Bundle Optimizado**: Tamaño reducido a 247KB

## 🆕 Evolución desde V1

| Aspecto | V1 | V2.5.2 |
|---------|----|----|
| **Independencia** | ❌ Compartida | ✅ Aislamiento total |
| **Edición** | ❌ Solo lectura | ✅ En línea con respaldo |
| **Idioma** | 🇪🇸 Español | 🇺🇸 Inglés profesional |
| **Auto-refresh** | ❌ Manual | ✅ Tiempo real |
| **Bundle** | ~300KB+ | 247KB optimizado |
| **Arquitectura** | Básica | Empresarial avanzada |Ops V2 - Extensi�n Avanzada para Azure DevOps

Esta es la **versi�n 2.0** de CRETS4DevOps, una extensi�n mejorada para Azure DevOps que proporciona gesti�n avanzada de requisitos de sostenibilidad en Work Items.

##  Novedades en V2

-  Interfaz de usuario mejorada
-  Funcionalidades extendidas de gesti�n de requisitos  
-  Mejor organizaci�n jer�rquica de datos
-  Performance optimizada
-  Documentaci�n t�cnica completa

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
