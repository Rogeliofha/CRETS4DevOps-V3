# Solución al Problema de Sincronización Multi-Dispositivo v2.5.16

## 🎯 Problema Reportado

Los requisitos de sostenibilidad **NO se muestran** cuando:
1. ✅ Se cambia de computadora
2. ✅ Se cambia de navegador web

## 🔍 Causa Raíz Identificada

El problema tiene **DOS causas principales**:

### Causa #1: Código No Esperaba el Guardado
**Archivo**: `workitem-requirements.tsx` línea ~1484
- El código llamaba a `HybridWorkItemStorage.setSelectedRequirements()` pero **NO esperaba** (`await`) a que terminara
- Resultado: La UI se actualizaba ANTES de que se guardara en Azure DevOps

### Causa #2: Campos Personalizados Faltantes
**Azure DevOps Process Template** requiere configuración:
- Los campos personalizados **Custom.SustainabilityRequirements**, **Custom.SustainabilityLastModified** y **Custom.SustainabilityVersion** probablemente **NO existen** en tu proceso de Azure DevOps
- Sin estos campos, los datos solo se guardan en `localStorage` (navegador específico)

## ✅ Soluciones Implementadas en v2.5.16

### 1. Corrección del Código Asíncrono
**Antes (INCORRECTO)**:
```typescript
HybridWorkItemStorage.setSelectedRequirements(combinedReqs)
  .then(() => {
    console.log('✅ Requisitos guardados');
  })
  .catch(err => {
    // Fallback
  });
```

**Después (CORRECTO)**:
```typescript
await HybridWorkItemStorage.setSelectedRequirements(combinedReqs);
await HybridWorkItemStorage.diagnoseSyncStatus();
setRequirements(combinedReqs); // Actualizar UI DESPUÉS de guardar
```

### 2. Función de Diagnóstico Agregada
Nuevo botón en la UI: **"🔍 Check Sync Status"**

Este botón te mostrará:
- ☁️ Estado de Azure DevOps (si tiene datos sincronizados)
- 💾 Estado de localStorage (datos locales)
- 📱 Disponibilidad multi-dispositivo
- 📋 Instrucciones de configuración si faltan campos

### 3. Validación Post-Guardado
Después de aplicar requisitos, el sistema ahora:
1. Guarda en Azure DevOps
2. Ejecuta diagnóstico automático
3. Verifica si se guardó correctamente
4. Muestra mensaje apropiado al usuario

## 📋 Instrucciones de Uso y Diagnóstico

### Paso 1: Instalar la Nueva Versión
```powershell
# Desinstalar versión anterior en Azure DevOps
# Instalar: dist\rogeliofha.plugin-crets-v2-2.5.16.vsix
```

### Paso 2: Probar y Diagnosticar
1. Abre un Work Item existente
2. Aplica requisitos de sostenibilidad desde el hub
3. Observa el mensaje que aparece:
   - ✅ **"Synchronized with Azure DevOps"** = Funciona multi-dispositivo
   - ⚠️ **"Only saved locally"** = Falta configuración

### Paso 3: Usar el Botón de Diagnóstico
1. En la sección de requisitos del Work Item, busca el botón **"🔍 Check Sync Status"**
2. Haz clic en el botón
3. Lee el reporte de diagnóstico:
   - ☁️ **Azure DevOps: ✅ ACTIVE** = Todo bien
   - ☁️ **Azure DevOps: ❌ NO DATA** = Faltan campos personalizados

### Paso 4: Verificar en Console del Navegador
Abre las herramientas de desarrollo (F12) y revisa la consola:

**Si ves esto - BIEN**:
```
☁️ [HÍBRIDO] Datos guardados en Azure DevOps para Work Item 123:
  requirementsCount: 5
  multiDeviceSync: ✅ Disponible en todos los dispositivos
```

**Si ves esto - PROBLEMA**:
```
⚠️ [HÍBRIDO] No se pudo guardar en Azure DevOps: Error: ...
💡 Esto puede indicar que faltan campos personalizados
```

## 🔧 Configuración de Campos Personalizados en Azure DevOps

Si el diagnóstico muestra **"❌ NO DATA"** en Azure DevOps, necesitas configurar los campos:

### Opción A: Desde la Web UI de Azure DevOps

1. Ve a **Organization Settings** → **Process**
2. Selecciona tu proceso (ej: "Agile", "Scrum", "CMMI")
3. Edita el tipo de Work Item (ej: "User Story", "Task", "Bug")
4. Agrega los siguientes **Custom Fields**:

#### Campo 1: Custom.SustainabilityRequirements
- **Name**: `SustainabilityRequirements`
- **Type**: `Text (multiple lines)` o `Long Text`
- **Reference Name**: `Custom.SustainabilityRequirements`
- **Max Length**: `4000` caracteres
- **Description**: `Stores sustainability requirements data in JSON format`

#### Campo 2: Custom.SustainabilityLastModified
- **Name**: `SustainabilityLastModified`
- **Type**: `Date Time`
- **Reference Name**: `Custom.SustainabilityLastModified`
- **Description**: `Last modification timestamp for sustainability requirements`

#### Campo 3: Custom.SustainabilityVersion
- **Name**: `SustainabilityVersion`
- **Type**: `Text (single line)`
- **Reference Name**: `Custom.SustainabilityVersion`
- **Max Length**: `50` caracteres
- **Description**: `Version of CRETS4DevOps that modified the requirements`

### Opción B: Usando Process Template XML (Avanzado)

Si usas un proceso heredado o exportado, edita el XML:

```xml
<FIELD name="Sustainability Requirements" refname="Custom.SustainabilityRequirements" type="HTML">
  <HELPTEXT>Sustainability requirements data</HELPTEXT>
</FIELD>

<FIELD name="Sustainability Last Modified" refname="Custom.SustainabilityLastModified" type="DateTime">
  <HELPTEXT>Last modification timestamp</HELPTEXT>
</FIELD>

<FIELD name="Sustainability Version" refname="Custom.SustainabilityVersion" type="String">
  <HELPTEXT>CRETS4DevOps version</HELPTEXT>
</FIELD>
```

## 🧪 Prueba Final Multi-Dispositivo

Después de configurar los campos:

### Test 1: Mismo Navegador
1. Abre Work Item #123
2. Aplica 3 requisitos de sostenibilidad
3. Verifica que aparezca: **"🌐 Synchronized with Azure DevOps"**
4. Cierra y vuelve a abrir el Work Item
5. ✅ Los 3 requisitos deben aparecer

### Test 2: Otro Navegador (Misma PC)
1. Abre el mismo Work Item #123 en Chrome/Firefox/Edge diferente
2. ✅ Los 3 requisitos deben aparecer automáticamente

### Test 3: Otra Computadora
1. Desde otra computadora, abre Work Item #123
2. ✅ Los 3 requisitos deben aparecer

### Test 4: Dispositivo Móvil
1. Abre Azure DevOps desde móvil
2. Navega al Work Item #123
3. ✅ Los datos deben estar en el campo personalizado

## 📊 Logs de Diagnóstico

El sistema ahora genera logs detallados en cada operación:

### Al Aplicar Requisitos
```
📦 Combining existing requirements (0) with new ones from hub
💾 Guardando en sistema híbrido (Azure DevOps + localStorage)...
☁️ [HÍBRIDO] Datos guardados en Azure DevOps para Work Item 123
✅ 3 new requirements applied and saved (total: 3)
🔍 [HÍBRIDO] DIAGNÓSTICO DE SINCRONIZACIÓN
```

### Al Cargar Requisitos
```
🔄 Cargando requisitos híbridos para work item: 123
☁️ [HÍBRIDO] Datos cargados desde Azure DevOps para Work Item 123
📦 Carga híbrida completada: 3 requisitos
```

## ⚠️ Troubleshooting

### Problema: Los requisitos no se sincronizan
**Síntoma**: Botón de diagnóstico muestra "❌ NO DATA" en Azure DevOps
**Solución**: Configura los campos personalizados (ver sección anterior)

### Problema: Error al guardar en Azure DevOps
**Síntoma**: Console muestra "⚠️ No se pudo guardar en Azure DevOps"
**Causas posibles**:
1. Campos personalizados no configurados
2. Permisos insuficientes en el proyecto
3. Work Item en modo solo lectura
4. Network/connection issues

**Solución**:
1. Verifica que los campos existan en el Process Template
2. Verifica permisos del usuario en el proyecto
3. Intenta editar y guardar el Work Item manualmente

### Problema: Datos desincronizados
**Síntoma**: Diagnóstico muestra diferente cantidad en localStorage vs Azure DevOps
**Solución**: El sistema automáticamente prioriza Azure DevOps. Refresca el Work Item.

## 📚 Documentación Adicional

- **Arquitectura**: `docs/hybrid-storage-system.md`
- **Configuración**: `docs/CONFIGURATION.md`
- **Changelog**: `CHANGELOG_v2.5.16.md` (próximo)

## 🆘 Soporte

Si después de seguir estos pasos el problema persiste:

1. Ejecuta el botón **"🔍 Check Sync Status"**
2. Copia el reporte completo
3. Abre la consola del navegador (F12)
4. Copia todos los logs que empiecen con `[HÍBRIDO]`
5. Proporciona esta información para análisis adicional

---

**Versión**: 2.5.16  
**Fecha**: Enero 2026  
**Archivo**: `rogeliofha.plugin-crets-v2-2.5.16.vsix`
