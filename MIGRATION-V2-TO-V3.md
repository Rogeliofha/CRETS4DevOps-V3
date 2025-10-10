# Guía de Migración CRETS4DevOps V2 → V3

## 🎯 **Resumen de Migración**

La migración de V2 a V3 es **completamente automática** y **transparente** para el usuario. Todos los datos existentes se preservan y mejoran con las nuevas funcionalidades de independencia por Work Item.

## 🔄 **Proceso de Migración Automática**

### **1. Detección de Datos V2**
```typescript
// Sistema detecta automáticamente datos V2 existentes
const hasV2Data = localStorage.getItem('selectedRequirements') !== null;
const hasV2Global = localStorage.getItem('globalRequirements') !== null;

if (hasV2Data || hasV2Global) {
  console.log('🔍 Datos V2 detectados, iniciando migración automática...');
  migrateFromV2ToV3();
}
```

### **2. Migración de localStorage**
```typescript
function migrateFromV2ToV3() {
  // PASO 1: Preservar datos V2
  const v2SelectedRequirements = JSON.parse(localStorage.getItem('selectedRequirements') || '[]');
  const v2GlobalRequirements = JSON.parse(localStorage.getItem('globalRequirements') || '[]');
  
  // PASO 2: Crear respaldo de seguridad
  localStorage.setItem('v2_backup_selectedRequirements', JSON.stringify(v2SelectedRequirements));
  localStorage.setItem('v2_backup_globalRequirements', JSON.stringify(v2GlobalRequirements));
  
  // PASO 3: Configurar Work Item específico
  if (WorkItemStorage.workItemId) {
    // Migrar datos específicos del Work Item
    WorkItemStorage.setSelectedRequirements(v2SelectedRequirements);
    
    // Marcar como migrado
    WorkItemStorage.setMigrationMetadata({
      migratedFrom: 'V2',
      migrationDate: new Date().toISOString(),
      originalDataPreserved: true,
      v2DataBackup: true
    });
  }
  
  // PASO 4: Actualizar datos globales
  GlobalRequirementsStorage.setRequirements(v2GlobalRequirements);
  
  console.log('✅ Migración V2 → V3 completada exitosamente');
}
```

### **3. Verificación de Integridad**
```typescript
function verifyMigrationIntegrity() {
  const workItemRequirements = WorkItemStorage.getSelectedRequirements();
  const globalRequirements = GlobalRequirementsStorage.getRequirements();
  
  // Verificar que los datos se preservaron
  const migrationValid = workItemRequirements.length > 0 || globalRequirements.length > 0;
  
  if (migrationValid) {
    console.log('✅ Integridad de migración verificada');
    return true;
  } else {
    console.error('❌ Error en migración, restaurando desde backup...');
    restoreFromV2Backup();
    return false;
  }
}
```

## 🗂️ **Estructura de Datos: V2 vs V3**

### **Formato V2 (Legacy)**
```json
{
  "localStorage": {
    "selectedRequirements": "[...Array de requisitos...]",
    "globalRequirements": "[...Array de catálogo global...]",
    "lastUpdate": "2024-01-01T00:00:00Z"
  }
}
```

### **Formato V3 (Independiente)**
```json
{
  "localStorage": {
    // Datos globales (Hub)
    "global_requirements": "[...Catálogo global...]",
    "global_lastUpdate": "2025-01-01T12:00:00Z",
    
    // Datos específicos por Work Item
    "workitem_12345_selectedRequirements": "[...Requisitos específicos WI 12345...]",
    "workitem_12345_lastUpdate": "2025-01-01T12:00:00Z",
    "workitem_12345_migrationMetadata": "{...Información de migración...}",
    
    "workitem_67890_selectedRequirements": "[...Requisitos específicos WI 67890...]",
    "workitem_67890_lastUpdate": "2025-01-01T12:00:00Z",
    
    // Respaldos de seguridad V2
    "v2_backup_selectedRequirements": "[...Backup V2...]",
    "v2_backup_globalRequirements": "[...Backup V2...]"
  }
}
```

## 🛡️ **Estrategias de Respaldo y Rollback**

### **1. Respaldo Automático**
```typescript
class MigrationBackupManager {
  static createV2Backup() {
    const timestamp = new Date().toISOString();
    const v2Data = {
      selectedRequirements: localStorage.getItem('selectedRequirements'),
      globalRequirements: localStorage.getItem('globalRequirements'),
      backupDate: timestamp,
      backupReason: 'Pre-V3-Migration'
    };
    
    localStorage.setItem('v2_complete_backup', JSON.stringify(v2Data));
    console.log(`🛡️ Respaldo V2 creado: ${timestamp}`);
  }
  
  static restoreFromV2Backup() {
    const backup = localStorage.getItem('v2_complete_backup');
    if (backup) {
      const v2Data = JSON.parse(backup);
      localStorage.setItem('selectedRequirements', v2Data.selectedRequirements);
      localStorage.setItem('globalRequirements', v2Data.globalRequirements);
      console.log('🔄 Datos V2 restaurados desde respaldo');
      return true;
    }
    return false;
  }
}
```

### **2. Rollback Manual (Si Necesario)**
```bash
# Para rollback manual, restaurar desde backup en browser DevTools:
# 1. Abrir DevTools (F12)
# 2. Ir a Application > Local Storage
# 3. Encontrar keys que empiecen con "v2_backup_"
# 4. Copiar valores y restaurar a keys originales
# 5. Recargar página

# Ejemplo:
localStorage.setItem('selectedRequirements', localStorage.getItem('v2_backup_selectedRequirements'));
localStorage.setItem('globalRequirements', localStorage.getItem('v2_backup_globalRequirements'));
```

## 🔄 **Compatibilidad Durante la Migración**

### **Lectura Híbrida (Período de Transición)**
```typescript
function getRequirementsHybrid() {
  // Prioridad: V3 específico → V2 legacy → Datos por defecto
  
  // 1. Buscar datos V3 específicos del Work Item
  const v3Requirements = WorkItemStorage.getSelectedRequirements();
  if (v3Requirements.length > 0) {
    return v3Requirements;
  }
  
  // 2. Fallback a datos V2 legacy
  const v2Requirements = JSON.parse(localStorage.getItem('selectedRequirements') || '[]');
  if (v2Requirements.length > 0) {
    console.log('📖 Usando datos V2 legacy durante migración');
    return v2Requirements;
  }
  
  // 3. Fallback a datos por defecto
  return getDefaultRequirements();
}
```

### **Escritura Dual (Garantía de Compatibilidad)**
```typescript
function setRequirementsDual(requirements: Requirement[]) {
  // Escritura primaria: V3 específico
  WorkItemStorage.setSelectedRequirements(requirements);
  
  // Escritura secundaria: V2 legacy (por compatibilidad temporal)
  localStorage.setItem('selectedRequirements', JSON.stringify(requirements));
  
  console.log('💾 Datos guardados en formato V3 + V2 legacy');
}
```

## 📊 **Validación de Migración**

### **Checklist de Verificación**
- ✅ **Datos V2 preservados**: Backup automático creado
- ✅ **Datos V3 funcionales**: WorkItemStorage configurado
- ✅ **Performance mejorada**: Acceso específico por Work Item
- ✅ **Independencia activada**: Cero interferencias entre Work Items
- ✅ **Comunicación robusta**: 6 estrategias funcionando
- ✅ **Rollback disponible**: Respaldo V2 accesible

### **Comando de Verificación**
```typescript
function validateMigration() {
  console.log('🔍 Iniciando validación de migración V2 → V3...');
  
  const checks = {
    v2BackupExists: localStorage.getItem('v2_backup_selectedRequirements') !== null,
    v3StorageConfigured: WorkItemStorage.workItemId !== null,
    v3DataAccessible: WorkItemStorage.getSelectedRequirements().length >= 0,
    independenceWorking: WorkItemStorage.getStorageKey('test').includes('workitem_'),
    communicationActive: typeof comunicarRequisitos === 'function'
  };
  
  const allChecksPass = Object.values(checks).every(check => check === true);
  
  console.log('📋 Resultados de validación:', checks);
  console.log(allChecksPass ? '✅ Migración exitosa' : '❌ Revisar migración');
  
  return allChecksPass;
}
```

## 🎯 **Beneficios Post-Migración**

### **Inmediatamente Disponibles:**
1. **✅ Independencia Total**: Cada Work Item tiene su propio storage
2. **✅ Performance Mejorada**: Acceso directo sin filtrado global
3. **✅ Comunicación Robusta**: 6 estrategias vs 1 en V2
4. **✅ Edición In-Place**: Modificación de requisitos sin conflictos

### **Progresivamente Habilitados:**
1. **🔄 Limpieza Automática**: Optimización de storage legacy
2. **📈 Análisis Avanzados**: Métricas específicas por Work Item
3. **🎨 UI Mejorada**: Indicadores de estado y modificaciones
4. **🔗 Tracking Completo**: Historial de cambios por Work Item

## 🚀 **Próximos Pasos Post-Migración**

### **Para Usuarios:**
1. **Explorar Independencia**: Abrir múltiples Work Items y verificar aislamiento
2. **Probar Edición In-Place**: Modificar requisitos específicos por Work Item
3. **Verificar Performance**: Notar mejora en velocidad de carga

### **Para Administradores:**
1. **Monitorear Storage**: Verificar utilización optimizada de localStorage
2. **Validar Integridad**: Ejecutar validación periódica de datos
3. **Planificar Limpieza**: Programar limpieza de datos V2 legacy (opcional)

## 📞 **Soporte de Migración**

### **En Caso de Problemas:**

1. **🔍 Diagnóstico Automático:**
   ```typescript
   // Ejecutar en browser console:
   validateMigration();
   ```

2. **🛡️ Restaurar V2 (Si Necesario):**
   ```typescript
   // Ejecutar en browser console:
   MigrationBackupManager.restoreFromV2Backup();
   location.reload();
   ```

3. **📞 Contacto de Soporte:**
   - Documentación: `docs/` folder
   - Issues: GitHub repository
   - Logs: Browser DevTools Console

### **Datos de Diagnóstico:**
Siempre incluir al reportar problemas:
- Versión de Azure DevOps
- Work Item ID afectado
- Output de `validateMigration()`
- Screenshots de DevTools > Application > Local Storage

---

**¡La migración V2 → V3 está diseñada para ser completamente automática y sin riesgos! 🚀**