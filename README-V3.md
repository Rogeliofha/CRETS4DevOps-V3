# CRETS4DevOps V3 - Extensión Avanzada para Azure DevOps

Esta es la **versión 3.0** de CRETS4DevOps, una extensión avanzada para Azure DevOps que proporciona gestión independiente de requisitos de sostenibilidad por Work Item.

## 🚀 Novedades en V3 (Versión actual: 2.1.2)

### ✨ Funcionalidades Principales
- ✅ **Independencia completa entre Work Items**: Cada work item tiene sus propios requisitos de sostenibilidad
- ✅ **Sistema de storage aislado**: Almacenamiento independiente por Work Item ID
- ✅ **Comunicación robusta**: Sistema multi-canal (localStorage, postMessage, CustomEvent)
- ✅ **Confirmación de usuario**: Modal de confirmación antes de aplicar requisitos
- ✅ **Prevención de duplicados**: Verificación automática antes de agregar requisitos
- ✅ **Detección robusta de Work Item ID**: Múltiples métodos de detección
- ✅ **Sin bucles infinitos**: Inicialización optimizada y estable

### 🔧 Mejoras Técnicas
- **WorkItemStorage Class**: Sistema de storage independiente por work item
- **Event-driven Communication**: Comunicación entre hub principal y work items
- **Multi-channel Messaging**: localStorage bridge + postMessage + CustomEvent
- **Optimized Initialization**: Flag de inicialización para evitar re-ejecuciones
- **Error Handling**: Manejo robusto de errores en todos los canales

## 📋 Historial de Versiones

### v2.0.0 - Base V2
- Funcionalidad básica de requisitos de sostenibilidad
- Storage global compartido entre work items

### v2.1.0 - Independencia entre Work Items
- ✅ **NEW**: Sistema de storage independiente por Work Item
- ✅ **NEW**: Requisitos independientes entre work items 
- ✅ **NEW**: Sistema de comunicación por eventos

### v2.1.1 - Bug Fixes
- ✅ **FIXED**: Bucle infinito en la inicialización
- ✅ **IMPROVED**: Detección robusta de Work Item ID
- ✅ **IMPROVED**: ID fijo para desarrollo

### v2.1.2 - Comunicación Mejorada (VERSIÓN ESTABLE)
- ✅ **FIXED**: Comunicación hub↔work items
- ✅ **NEW**: Sistema multi-canal de comunicación
- ✅ **NEW**: Verificación automática de requisitos pendientes
- ✅ **IMPROVED**: Cleanup automático de claves temporales

## 🎯 Características Principales

### 🔒 **Independencia entre Work Items**
- Cada work item mantiene sus propios requisitos de sostenibilidad
- Los cambios en un work item no afectan otros work items
- Nuevos work items empiezan sin requisitos previos

### 🔄 **Funcionalidades Conservadas**
- **Remove**: Eliminar requisitos individualmente por work item
- **Import**: Aplicar requisitos desde el hub principal con confirmación
- **Jerarquía**: Visualización jerárquica padre-hijo de requisitos
- **Temas**: Soporte para modo claro/oscuro

### 🌐 **Comunicación Robusta**
- **localStorage Bridge**: Para persistencia entre sesiones
- **postMessage API**: Para comunicación entre iframes
- **CustomEvent**: Para contextos que comparten window
- **Auto-verificación**: Chequeo automático al cargar work items

## 📦 Instalación y Uso

### Requisitos Previos
- [Node.js](https://nodejs.org/) (versión 14 o posterior)
- [Visual Studio Code](https://code.visualstudio.com/)
- [tfx-cli](https://www.npmjs.com/package/tfx-cli) (instalado globalmente)
- Organización de Azure DevOps

### Configuración
1. Clona este repositorio
2. Ejecuta `npm install` para instalar dependencias

### Desarrollo
```bash
npm run dev       # Servidor de desarrollo
npm run build     # Construir extensión
npm run package   # Crear archivo .vsix
npm run publish   # Publicar a Marketplace
```

### Paquete Generado
📦 **rogeliofha.plugin-crets-v2-2.1.2.vsix**

## 🏗️ Estructura del Proyecto

```
CRETS4DevOps-V3/
├── src/
│   ├── workitem-requirements.tsx       # Componente de Work Item (independiente)
│   ├── sustainability-requirements.tsx # Hub principal
│   ├── workitem-requirements.css       # Estilos de Work Item
│   ├── child-requirements.css          # Estilos jerárquicos
│   └── sustainability_requirements.json # Base de datos de requisitos
├── docs/                               # Documentación técnica
├── img/                                # Recursos e imágenes
├── dist/                               # Archivos compilados
├── vss-extension.json                  # Manifiesto de extensión
├── package.json                        # Dependencias y scripts
├── tsconfig.json                       # Configuración TypeScript
└── webpack.config.js                   # Configuración Webpack
```

## 🔧 Uso de la Extensión

### En el Hub Principal (CRETS4DevOps V2)
1. Seleccionar requisitos de sostenibilidad necesarios
2. Hacer clic en "Apply Selected to Work Items"
3. Los requisitos quedan disponibles para aplicar a work items

### En Work Items
1. Los work items detectan automáticamente requisitos disponibles
2. Se muestra modal de confirmación al usuario
3. Al aceptar, los requisitos se aplican de manera independiente
4. Cada work item mantiene su propio conjunto de requisitos

### Gestión de Requisitos por Work Item
- **Ver requisitos**: Lista jerárquica con detalles
- **Remover requisitos**: Botón ✕ para eliminar individualmente
- **Independencia**: Los cambios no afectan otros work items

## 🔄 Migración desde Versiones Anteriores

### Desde V1 (Plugin CRETS)
- Funcionalidad completamente rediseñada
- Requiere reinstalación completa
- Storage migra automáticamente

### Desde V2.0.0
- Migración automática del storage
- Los requisitos existentes se mantienen
- Nueva funcionalidad de independencia

## 🧪 Testing y Validación

### Escenarios de Prueba
1. **Independencia**: Verificar que work items no comparten requisitos
2. **Comunicación**: Probar importación desde hub a work items
3. **Persistencia**: Verificar que requisitos se mantienen entre sesiones
4. **Performance**: Confirmar que no hay bucles infinitos

### Logs de Debug
La extensión incluye logs detallados en consola para debugging:
- Inicialización de Work Item Storage
- Detección de Work Item ID
- Comunicación entre componentes
- Aplicación/remoción de requisitos

## 🔒 Seguridad y Privacidad

- **Almacenamiento local**: Los datos se guardan en localStorage del navegador
- **Claves específicas**: Cada work item usa claves únicas (`workitem_${id}_*`)
- **Cleanup automático**: Limpieza de claves temporales tras uso
- **Sin datos remotos**: No se envían datos a servidores externos

## 📄 Licencia

MIT License

## 👥 Contribuciones

Para contribuir al proyecto:
1. Fork del repositorio
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

Para reportar bugs o solicitar features:
- Crear issue en GitHub
- Incluir logs de consola
- Especificar versión de Azure DevOps
- Describir pasos para reproducir

---

**CRETS4DevOps V3** - Versión estable 2.1.2 ✅
*Gestión independiente de requisitos de sostenibilidad por Work Item*