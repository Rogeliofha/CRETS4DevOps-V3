# CRETS4DevOps V2 - Extensi�n Avanzada para Azure DevOps

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
