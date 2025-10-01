# CRETS4DevOps V2 - Extensión Avanzada para Azure DevOps

Esta es la **versión 2.0** de CRETS4DevOps, una extensión mejorada para Azure DevOps que proporciona gestión avanzada de requisitos de sostenibilidad en Work Items.

##  Novedades en V2

-  Interfaz de usuario mejorada
-  Funcionalidades extendidas de gestión de requisitos  
-  Mejor organización jerárquica de datos
-  Performance optimizada
-  Documentación técnica completa

## Requisitos previos

- [Node.js](https://nodejs.org/) (versión 14 o posterior)
- [Visual Studio Code](https://code.visualstudio.com/)
- [tfx-cli](https://www.npmjs.com/package/tfx-cli) (instalado globalmente con `npm install -g tfx-cli`)
- Una organización de Azure DevOps para probar la extensión

## Configuración del proyecto

1. Clona este repositorio
2. Ejecuta `npm install` para instalar las dependencias

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

## Construcción

Para construir la extensión:

```bash
npm run build
```

## Empaquetado

Para crear el archivo `.vsix` de la extensión:

```bash
npm run package
```

El archivo de la extensión se generará en la carpeta `dist`.

## Publicación

Antes de publicar la extensión, asegúrate de modificar el campo `publisher` en el archivo `vss-extension.json` con tu ID de publicador de Marketplace.

Para publicar la extensión:

```bash
npm run publish
```

## Estructura del proyecto

- `src/`: Código fuente
  - `sustainability-requirements.html`: Plantilla HTML principal
  - `sustainability-requirements.tsx`: Componente React para gestión de requisitos
  - `sustainability_requirements.json`: Base de datos de requisitos
- `docs/`: Documentación técnica completa
- `img/`: Imágenes y recursos
- `dist/`: Archivos generados (no incluidos en el repositorio)
- `vss-extension.json`: Manifiesto de la extensión
- `webpack.config.js`: Configuración de Webpack
- `package.json`: Dependencias y scripts
- `tsconfig.json`: Configuración de TypeScript

## Características principales

-  **Gestión de requisitos de sostenibilidad**: Interfaz completa para crear, editar y organizar requisitos
-  **Persistencia local**: Los datos se guardan automáticamente en localStorage
-  **Estructura jerárquica**: Organización en árbol de requisitos padre-hijo
-  **Búsqueda avanzada**: Filtrado y búsqueda de requisitos en tiempo real
-  **Selección múltiple**: Aplicación de múltiples requisitos a Work Items
-  **Visualización clara**: Interfaz intuitiva y responsive

## Diferencias con V1

| Aspecto | V1 | V2 |
|---------|----|----|
| **Nombre** | Plugin CRETS | CRETS4DevOps V2 |
| **Versión** | 1.12.8 | 2.0.0 |
| **Funcionalidad** | Básica | Avanzada |
| **Documentación** | Mínima | Completa |
| **Arquitectura** | Simple | Profesional |

## Documentación

La documentación técnica completa está disponible en la carpeta `docs/`:

- [Arquitectura del sistema](docs/architecture-diagram.md)
- [Gestión de almacenamiento](docs/data-storage-management.md)
- [Guía de localStorage](docs/localStorage-guide.md)
- [Documentación técnica](docs/technical-architecture.md)

## Personalización

Para personalizar la extensión:

1. Modifica `src/sustainability-requirements.tsx` para cambiar la funcionalidad
2. Actualiza `vss-extension.json` con tus datos de publicación
3. Reemplaza las imágenes en `img/` con tu propio logo
4. Modifica `sustainability_requirements.json` para agregar nuevos requisitos

## Licencia

MIT

## Versión

**CRETS4DevOps V2** - Versión 2.0.0
