# CRETS4DevOps - Gestión de Almacenamiento de Datos

## Resumen Ejecutivo

El proyecto CRETS4DevOps implementa una **estrategia de almacenamiento multi-capa** que combina `localStorage` del navegador con archivos JSON estáticos, proporcionando persistencia local robusta y flexibilidad de datos.

## Arquitectura de Almacenamiento

### Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTRATEGIA DE DATOS                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────▼──────────────┐
                    │     CARGA INICIAL        │
                    │    loadRequirements()    │
                    └───────────┬──────────────┘
                                │
                ┌───────────────▼────────────────┐
                │        PASO 1: PRIORIDAD       │
                │       localStorage Check       │
                └───────────────┬────────────────┘
                                │
                    ¿Datos en localStorage?
                                │
                ┌───────────────▼────────────────┐
                │             SÍ                 │
                │  └─► Cargar y usar datos       │
                │      └─► TERMINAR ✓            │
                └────────────────────────────────┘
                                │
                                │ NO
                                ▼
                ┌───────────────────────────────────┐
                │        PASO 2: FALLBACK           │
                │      Datos Hardcodeados           │
                │  └─► Usar fullSampleData          │
                │  └─► Guardar en localStorage      │
                └───────────────┬───────────────────┘
                                │
                                ▼
                ┌───────────────────────────────────┐
                │        PASO 3: OPCIONAL           │
                │      Archivo JSON Externo         │
                │  └─► Intentar fetch JSON          │
                │  └─► Si existe, reemplazar datos  │
                │  └─► Actualizar localStorage      │
                └───────────────────────────────────┘
```

## Componentes del Sistema de Almacenamiento

### 1. **localStorage (Almacenamiento Principal)**

#### Características:
- **Persistencia**: Los datos persisten entre sesiones del navegador
- **Capacidad**: ~5-10MB por dominio (según navegador)
- **Velocidad**: Acceso inmediato, operaciones síncronas
- **Alcance**: Por dominio y protocolo (Azure DevOps extension)

#### Claves utilizadas:
```typescript
// Clave principal para todos los requisitos
'sustainabilityRequirements': Requirement[]

// Clave para requisitos seleccionados por el usuario
'selectedRequirements': Requirement[]
```

#### Operaciones implementadas:

**LECTURA (Load):**
```typescript
const savedRequirements = localStorage.getItem('sustainabilityRequirements');
if (savedRequirements) {
  const parsedRequirements = JSON.parse(savedRequirements);
  if (Array.isArray(parsedRequirements) && parsedRequirements.length > 0) {
    console.log('Datos cargados desde localStorage:', parsedRequirements.length, 'requisitos');
    loadedRequirements = parsedRequirements;
    setRequirements(loadedRequirements);
    return; // Uso inmediato si existe
  }
}
```

**ESCRITURA (Save):**
```typescript
// Al editar requisitos
localStorage.setItem('sustainabilityRequirements', JSON.stringify(updatedRequirements));

// Al crear nuevos requisitos
localStorage.setItem('sustainabilityRequirements', JSON.stringify(updatedRequirements));

// Al guardar selecciones del usuario
localStorage.setItem('selectedRequirements', JSON.stringify(allReqs));
```

**MANEJO DE ERRORES:**
```typescript
try {
  localStorage.setItem('sustainabilityRequirements', JSON.stringify(data));
  console.log('Datos guardados exitosamente');
} catch (e) {
  console.warn('Error guardando en localStorage:', e);
  // Posibles causas: espacio insuficiente, modo privado, permisos
}
```

### 2. **JSON Files (Almacenamiento Secundario)**

#### Archivos de datos:
```
/src/sustainability_requirements.json  - Datos fuente originales
/dist/sustainability_requirements.json - Datos distribuidos en build
```

#### Proceso de carga asíncrona:
```typescript
try {
  const response = await fetch('./sustainability_requirements.json');
  if (response.ok) {
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      console.log('Datos cargados del archivo:', data.length, 'requisitos');
      setRequirements(data);
      
      // Actualizar localStorage con datos del archivo
      localStorage.setItem('sustainabilityRequirements', JSON.stringify(data));
    }
  }
} catch (e) {
  console.warn('No se pudo cargar el archivo JSON, usando datos de muestra', e);
}
```

#### Ventajas del JSON externo:
- ✅ **Datos iniciales**: Proporciona estructura base predefinida
- ✅ **Versionado**: Puede actualizarse independientemente del código
- ✅ **Distribución**: Se incluye en el paquete VSIX
- ✅ **Respaldo**: Fallback si localStorage está corrupto

### 3. **Datos Hardcodeados (Fallback Final)**

#### Estructura de datos por defecto:
```typescript
const fullSampleData: Requirement[] = [
  {
    "id": "Mod.1",
    "displayCode": "Mod.1.",
    "parentId": "Mod",
    "children": ["Mod.1.1", "Mod.1.2", "Mod.1.3", "Mod.1.4"],
    "level": 2,
    "attrs": {
      "Id": "Mod.1.",
      "detail": "Compatibilidad y Conectividad",
      "Justification": "Los sistemas interoperables reducen..."
    },
    "_meta": {
      "source_file": "Requisitos de sostenibilidad.csv",
      "identifier_column": "Id"
    },
    "hasParentInDataset": false
  }
  // ... más requisitos
];
```

## Estrategia de Persistencia Detallada

### Jerarquía de Fuentes (Orden de Prioridad):

```
1. PRIORIDAD ALTA: localStorage
   ├── ✅ Datos modificados por el usuario
   ├── ✅ Persistencia entre sesiones
   ├── ✅ Acceso inmediato (síncrono)
   └── ✅ Refleja el estado actual real

2. PRIORIDAD MEDIA: Archivo JSON
   ├── ⚡ Datos estructurados predefinidos
   ├── ⚡ Carga asíncrona en background
   ├── ⚡ Actualización opcional de localStorage
   └── ⚡ Respaldo confiable

3. PRIORIDAD BAJA: Datos Hardcodeados
   ├── 🔄 Garantiza funcionamiento básico
   ├── 🔄 No requiere red ni archivos
   ├── 🔄 Inmediatamente disponible
   └── 🔄 Datos de demostración
```

### Ciclo de Vida de los Datos:

**1. INICIALIZACIÓN (App Startup):**
```typescript
React.useEffect(() => {
  const loadRequirements = async () => {
    setLoading(true);
    
    // Paso 1: Verificar localStorage primero
    const savedData = localStorage.getItem('sustainabilityRequirements');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setRequirements(parsed);
      return; // Usar y terminar
    }
    
    // Paso 2: Usar datos por defecto
    setRequirements(fullSampleData);
    localStorage.setItem('sustainabilityRequirements', JSON.stringify(fullSampleData));
    
    // Paso 3: Intentar cargar JSON en background
    fetch('./sustainability_requirements.json')
      .then(response => response.json())
      .then(data => {
        setRequirements(data);
        localStorage.setItem('sustainabilityRequirements', JSON.stringify(data));
      })
      .catch(console.warn);
  };
  
  loadRequirements();
}, []);
```

**2. OPERACIONES CRUD:**

**CREATE (Crear Requisito):**
```typescript
const handleCreateRequirement = (newReq: Requirement) => {
  // 1. Actualizar estado de React
  const updatedRequirements = [...requirements, newReq];
  setRequirements(updatedRequirements);
  
  // 2. Persistir inmediatamente en localStorage
  localStorage.setItem('sustainabilityRequirements', JSON.stringify(updatedRequirements));
  
  // 3. Actualizar relaciones padre-hijo
  if (newReq.parentId) {
    const parentIndex = updatedRequirements.findIndex(req => req.id === newReq.parentId);
    if (parentIndex >= 0) {
      updatedRequirements[parentIndex].children.push(newReq.id);
      localStorage.setItem('sustainabilityRequirements', JSON.stringify(updatedRequirements));
    }
  }
};
```

**UPDATE (Editar Requisito):**
```typescript
const handleSaveRequirement = (updatedReq: Requirement) => {
  // 1. Actualizar en memoria
  const updatedRequirements = requirements.map(req => 
    req.id === updatedReq.id ? updatedReq : req
  );
  setRequirements(updatedRequirements);
  
  // 2. Persistir cambios
  try {
    localStorage.setItem('sustainabilityRequirements', JSON.stringify(updatedRequirements));
    console.log('Updated requirements saved to localStorage');
  } catch (error) {
    console.error('Error saving updated requirements to localStorage:', error);
  }
};
```

**DELETE (Eliminar Requisito):**
```typescript
const handleDeleteRequirement = (reqToDelete: Requirement) => {
  if (window.confirm(`Are you sure you want to delete requirement ${reqToDelete.displayCode}?`)) {
    // 1. Calcular IDs a eliminar (incluyendo hijos)
    const idsToDelete = [reqToDelete.id, ...getChildrenIds(reqToDelete.id, requirements)];
    
    // 2. Filtrar elementos
    const updatedRequirements = requirements.filter(req => !idsToDelete.includes(req.id));
    
    // 3. Actualizar referencias en padres
    updatedRequirements.forEach(req => {
      if (req.children.includes(reqToDelete.id)) {
        req.children = req.children.filter(id => id !== reqToDelete.id);
      }
    });
    
    // 4. Persistir cambios
    setRequirements(updatedRequirements);
    localStorage.setItem('sustainabilityRequirements', JSON.stringify(updatedRequirements));
  }
};
```

**3. SELECCIONES DE USUARIO:**
```typescript
const saveSelectedRequirements = () => {
  try {
    // 1. Obtener selecciones previas
    const savedReqsString = localStorage.getItem('selectedRequirements');
    let existingReqs: Requirement[] = [];
    
    if (savedReqsString) {
      existingReqs = JSON.parse(savedReqsString);
    }
    
    // 2. Procesar nuevas selecciones
    const newSelectedReqs: Requirement[] = [];
    checkedRequirements.forEach(reqId => {
      const req = requirements.find(r => r.id === reqId);
      if (req && !newSelectedReqs.some(r => r.id === req.id)) {
        newSelectedReqs.push(req);
      }
    });
    
    // 3. Combinar sin duplicados
    const allReqIds = new Set([...existingReqs.map(req => req.id), ...newSelectedReqs.map(req => req.id)]);
    const allReqs = Array.from(allReqIds).map(id => {
      return existingReqs.find(req => req.id === id) || newSelectedReqs.find(req => req.id === id)!;
    });
    
    // 4. Guardar resultado final
    localStorage.setItem('selectedRequirements', JSON.stringify(allReqs));
    
    // 5. Notificar cambios para sincronización entre ventanas
    window.dispatchEvent(new Event('storage'));
    
  } catch (e) {
    console.error('Error guardando requisitos:', e);
  }
};
```

## Ventajas del Sistema Implementado

### ✅ **Robustez**
- **Triple Fallback**: localStorage → JSON → Hardcoded
- **Manejo de errores**: Try-catch en todas las operaciones
- **Validación de datos**: Verificación de tipos y estructura

### ✅ **Performance**
- **Carga inmediata**: localStorage es síncrono y rápido
- **Background loading**: JSON se carga sin bloquear UI
- **Operaciones eficientes**: Escritura inmediata en localStorage

### ✅ **Flexibilidad**
- **Datos dinámicos**: Usuarios pueden crear/editar/eliminar
- **Persistencia automática**: Cada cambio se guarda automáticamente
- **Sincronización**: Eventos de storage para múltiples ventanas

### ✅ **Escalabilidad**
- **Estructura jerárquica**: Soporte para relaciones padre-hijo
- **Búsqueda eficiente**: Filtrado en memoria
- **Extensibilidad**: Fácil agregar nuevos campos

## Limitaciones y Consideraciones

### ⚠️ **Limitaciones de localStorage**
- **Capacidad**: ~5-10MB por dominio
- **Tipo de datos**: Solo strings (requiere JSON.stringify/parse)
- **Navegador específico**: No sincroniza entre dispositivos
- **Modo privado**: Puede estar deshabilitado

### ⚠️ **Manejo de Errores**
```typescript
// Espacio insuficiente
catch (e) {
  if (e.name === 'QuotaExceededError') {
    console.error('localStorage lleno, limpiando datos antiguos');
    localStorage.clear();
  }
}

// Datos corruptos
try {
  JSON.parse(savedData);
} catch (e) {
  console.warn('Datos corruptos en localStorage, usando defaults');
  localStorage.removeItem('sustainabilityRequirements');
}
```

### ⚠️ **Consideraciones de Seguridad**
- Los datos en localStorage son **persistentes** pero **no encriptados**
- Accesibles desde JavaScript del mismo dominio
- No contienen información sensible (solo requisitos de sostenibilidad)

## Futuras Mejoras Recomendadas

### 🚀 **Corto Plazo**
1. **Compresión de datos**: Implementar compresión para datos grandes
2. **Versionado**: Sistema de versiones para migración de datos
3. **Backup automático**: Exportación automática de datos

### 🚀 **Mediano Plazo**
1. **IndexedDB**: Migrar a IndexedDB para mayor capacidad
2. **Service Worker**: Cache inteligente para datos
3. **Sincronización**: API backend para sync entre dispositivos

### 🚀 **Largo Plazo**
1. **Database integration**: Conexión con SQL Server/CosmosDB
2. **Real-time sync**: WebSockets para colaboración
3. **Offline-first**: PWA con sincronización diferida

---

**Conclusión**: El sistema actual de `localStorage + JSON` proporciona una solución robusta, eficiente y escalable para la gestión de datos en CRETS4DevOps, con excelente experiencia de usuario y manejo inteligente de fallbacks.
