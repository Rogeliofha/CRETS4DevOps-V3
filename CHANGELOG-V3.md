# CHANGELOG - CRETS4DevOps V3

## [2.2.0] - 2025-09-30 🔄 **REFRESCO AUTOMÁTICO**

### 🆕 Nuevas Funcionalidades
- **Refresco Automático:** Los requisitos se actualizan automáticamente en Work Items sin recargar página
- **Storage Watcher:** Listener avanzado que detecta cambios específicos del Work Item actual
- **Custom Events:** Sistema de eventos `crets.refresh` para comunicación Hub↔Work Items
- **Botones de Refresco Manual:** Para casos donde el automático no funcione
- **Feedback Visual Mejorado:** Alerts informativos del estado de sincronización

### 🛠️ Mejoras Técnicas
- Debounce para evitar múltiples refrescos innecesarios
- Sistema de comunicación con 6 estrategias diferentes
- Debug logging mejorado para troubleshooting
- Manejo robusto de errores en sincronización

### 🔧 Correcciones
- ✅ **RESUELTO:** Ya no es necesario refrescar la página después de aplicar requisitos
- ✅ **RESUELTO:** Sincronización inmediata entre Hub y Work Items
- ✅ **RESUELTO:** Detección precisa de cambios por Work Item específico

---

## [2.1.9] - 2025-09-30 🆕 **SOPORTE WORK ITEMS NUEVOS**

### 🆕 Nuevas Funcionalidades
- **Detección de Work Items Nuevos:** Usando `workItemFormService.isNew()`
- **IDs Temporales:** Para Work Items no guardados aún (`new_{timestamp}_{random}`)
- **Transición Automática:** A IDs permanentes cuando se guarda el Work Item
- **UI Especial:** Indicadores visuales `[NUEVO]` para Work Items sin guardar
- **Avisos Informativos:** Sección especial para Work Items nuevos

### 🛠️ Mejoras
- Compatibilidad completa con creación de Product Backlog Items
- Manejo robusto de Work Items en estado temporal
- Recomendaciones claras para el usuario

### 🔧 Correcciones
- ✅ **RESUELTO:** Extension funciona al crear nuevos Product Backlog Items
- ✅ **RESUELTO:** No más errores con Work Items ID=0

---

## [2.1.8] - 2025-09-30 🔐 **IDS REALES & COMPATIBILIDAD UNIVERSAL**

### 🆕 Nuevas Funcionalidades
- **IDs Reales de Azure DevOps:** Uso de `workItemFormService.getId()` 
- **Compatibilidad Universal:** Soporte para todos los tipos de Work Items:
  - Product Backlog Item (PBI)
  - Epic, Feature, Bug, Task, Test Case, User Story
  - Tipos personalizados
- **Detección Automática de Tipos:** Identificación del tipo de Work Item actual

### 🛠️ Mejoras Técnicas
- Eliminación completa de fake IDs
- Storage keys basadas en IDs reales: `workitem_{REAL_ID}_selectedRequirements`
- Mejor debugging e información del sistema

### 🔧 Correcciones
- ✅ **RESUELTO:** Independencia real entre Work Items
- ✅ **RESUELTO:** Sin compartir requisitos entre diferentes Work Items
- ✅ **RESUELTO:** Storage completamente aislado por Work Item

---

## [2.1.7] - 2025-09-30 💾 **INDEPENDENCIA TOTAL**

### 🆕 Nuevas Funcionalidades
- **Storage Independiente:** Cada Work Item tiene su propio storage aislado
- **Sistema de Comunicación Multi-canal:** localStorage + postMessage + CustomEvent
- **Verificación de Independencia:** Botones de testing para validar aislamiento
- **Debug Tools:** Herramientas integradas para troubleshooting

### 🛠️ Mejoras
- Prevención de memory leaks con cleanup functions
- Manejo robusto de eventos de comunicación
- Timeouts y validaciones para datos pendientes

### 🔧 Correcciones
- ✅ **RESUELTO:** Work Items ya no comparten requisitos
- ✅ **RESUELVO:** Cada Work Item mantiene su propia lista independiente

---

## [2.0.x] - Versiones Anteriores

### Funcionalidades Base
- Importación de requisitos de sostenibilidad
- Interfaz básica para Work Items
- Sistema de comunicación inicial Hub↔Work Items

### Problemas Conocidos (RESUELTOS en V3)
- ❌ Work Items compartían requisitos (RESUELTO en 2.1.7+)
- ❌ Uso de fake IDs (RESUELTO en 2.1.8+)
- ❌ No funcionaba con Work Items nuevos (RESUELTO en 2.1.9+)
- ❌ Requería refresco manual de página (RESUELTO en 2.2.0+)

---

## 🎯 **Roadmap Futuro**

### Posibles Mejoras
- [ ] Integración con Azure DevOps Work Item Templates
- [ ] Export/Import de configuraciones de requisitos
- [ ] Dashboard de métricas de sostenibilidad
- [ ] Integración con Azure DevOps Analytics
- [ ] Soporte para Work Item Queries personalizadas

---

**Nota:** CRETS4DevOps V3 representa una evolución completa del proyecto original, con independencia total, compatibilidad universal y refresco automático.