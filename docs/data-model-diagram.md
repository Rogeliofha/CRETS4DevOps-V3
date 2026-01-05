# CRETS4DevOps - Modelo de Datos Visual

## Arquitectura del Modelo de Datos NoSQL

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      🌐 CRETS4DevOps Data Model                              │
│                     (Azure DevOps + NoSQL Storage)                           │
└──────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │  Azure DevOps   │
                              │   Project       │
                              │  (Cloud-based)  │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
            ┌───────▼────────┐  ┌──────▼──────┐  ┌───────▼────────┐
            │  Work Items    │  │   Teams     │  │  Repositories  │
            │  (PBI, Bug,    │  │  (Members)  │  │   (Version     │
            │   Epic, Task)  │  │             │  │    Control)    │
            └────────┬───────┘  └─────────────┘  └────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
    ┌───▼──────────────────┐  ┌────▼─────────────────┐
    │   WORK ITEM          │  │ SUSTAINABILITY DATA  │
    │   (Primary Entity)   │  │   (Extension Data)   │
    └────────┬─────────────┘  └────┬──────────────────┘
             │                      │
             │ 1:N                  │
    ┌────────▼─────────────────────▼─────────┐
    │    WorkItemStorage Entity               │
    ├─────────────────────────────────────────┤
    │                                         │
    │  📋 CORE FIELDS                         │
    │  • _id: "67890-12345"                   │
    │  • workItemId: "67890"                  │
    │  • projectId: "project-xyz"             │
    │  • workItemType: "PBI"                  │
    │  • title: string                        │
    │  • createdAt: DateTime                  │
    │  • updatedAt: DateTime                  │
    │                                         │
    │  👤 OWNERSHIP                           │
    │  • createdBy: "user@contoso.com"        │
    │  • lastModifiedBy: "user@contoso.com"   │
    │                                         │
    └────────────────────────────────────────┘
             │
             ├─────────────────────────────────────┐
             │                                     │
        ┌────▼──────────────────┐  ┌──────────────▼─────────┐
        │ REQUIREMENTS ARRAY    │  │ SYNC METADATA          │
        │ (1:N Relationship)    │  │ (Multi-Device Control) │
        └────┬──────────────────┘  └──────────────┬─────────┘
             │                                    │
    ┌────────▼─────────────────────┐  ┌──────────▼──────────────┐
    │ Requirement Object           │  │ SyncMetadata Object     │
    ├──────────────────────────────┤  ├───────────────────────┐
    │ • id: "req-001"              │  │ • lastSyncedAt:       │
    │ • name: "Energy Efficiency"  │  │   "2024-11-30T15:30Z" │
    │ • description: string        │  │ • syncStatus:         │
    │ • category: "environmental"  │  │   "synced|pending"    │
    │ • priority: "high|medium"    │  │ • sourceDevice:       │
    │ • appliedAt: DateTime        │  │   "Windows-PC-12345"  │
    │ • appliedBy: string          │  │ • deviceFingerprint:  │
    │ • status: "active|removed"   │  │   "abc123def456"      │
    │                              │  │ • syncVersion: "2.5.12"│
    └──────────────────────────────┘  └───────────────────────┘
             │                                    │
             └────────────────┬───────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ CHANGE HISTORY     │
                    │ (Audit Trail)      │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────────────┐
                    │ HistoryEntry Object       │
                    ├──────────────────────────┤
                    │ • timestamp: DateTime     │
                    │ • action: "added|removed" │
                    │ • requirementId: string   │
                    │ • changedBy: string       │
                    │ • device: string          │
                    └───────────────────────────┘
```

---

## 📊 Relaciones de Datos (Entity Relationship Diagram)

```
┌──────────────────────┐
│    PROJECT           │
├──────────────────────┤
│ _id (PK)             │
│ projectId            │
│ projectName          │
│ organization         │
│ createdAt            │
│ settings             │
│ customFields[]       │
└────────┬─────────────┘
         │ 1:N
         │
    ┌────▼──────────────────┐
    │   WORK ITEM           │
    ├───────────────────────┤
    │ _id (PK)              │ ◄─── Composite: workItemId + timestamp
    │ workItemId (FK)       │
    │ projectId (FK)        │
    │ workItemType          │
    │ title                 │
    │ createdAt             │
    │ updatedAt             │
    │ createdBy             │
    │ lastModifiedBy        │
    │                       │
    │ ▼ EMBEDDED ARRAYS     │
    │ sustainabilityReqs[]  │ ◄─── 1:N (Embedded)
    │ syncMetadata          │ ◄─── 1:1 (Embedded)
    │ changeHistory[]       │ ◄─── 1:N (Embedded)
    │ independenceFlags     │ ◄─── 1:1 (Embedded)
    └───────────────────────┘
         │
         ├─────────────────────┐
         │                     │
    ┌────▼────────────────┐  ┌─▼──────────────────┐
    │ SYNC LOGS           │  │ BACKUPS            │
    ├─────────────────────┤  ├───────────────────┤
    │ _id (PK)            │  │ _id (PK)          │
    │ timestamp           │  │ workItemId (FK)   │
    │ workItemId (FK)     │  │ timestamp         │
    │ action              │  │ device            │
    │ status              │  │ data (JSON)       │
    │ device              │  │ expiresAt (TTL)   │
    │ requirementsCount   │  │ backupType        │
    │ syncDuration        │  └───────────────────┘
    │ details             │
    │ errors[]            │
    └─────────────────────┘
```

---

## 🔄 Flujo de Datos en Lectura

```
┌─────────────────────────────────────────────────────────────────┐
│  Usuario abre Work Item #67890 en DISPOSITIVO B                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  Obtener WorkItemId │
        │  from Azure DevOps  │
        └──────────┬──────────┘
                   │
        ┌──────────▼────────────────────────────┐
        │ TIER 1: Buscar en Azure DevOps        │
        │ Custom.SustainabilityRequirements     │
        └──────────┬─────────────┬──────────────┘
                   │             │
          Encontrado│             │No encontrado
                   │             │
           ┌───────▼──┐    ┌─────▼──────────────┐
           │ ✅ Usar  │    │ TIER 2: localStorage│
           │ Data     │    │ workitem_67890_... │
           │ Nube     │    └─────┬──────────────┘
           └───┬──────┘          │
               │        ┌────────▼──────┐
               │        │ Si encontrado │
               │        │ ✅ Usar cache │
               │        └────┬──────────┘
               │             │
      ┌────────▼─────────────▼────────┐
      │  ACTUALIZAR localStorage con  │
      │  datos más recientes de Nube  │
      └────────┬─────────────────────┘
               │
      ┌────────▼──────────────────┐
      │  MOSTRAR REQUIREMENTS     │
      │  al Usuario en Browser    │
      └───────────────────────────┘
```

---

## 💾 Flujo de Datos en Escritura

```
┌──────────────────────────────────────────────────────┐
│  Usuario modifica Requisitos en Work Item #67890     │
└─────────────────┬────────────────────────────────────┘
                  │
       ┌──────────▼──────────┐
       │ PASO 1: Guardar en  │
       │ localStorage        │ (< 1ms)
       │ Inmediata           │
       └──────────┬──────────┘
                  │
       ┌──────────▼───────────────────────┐
       │ PASO 2: Crear Backup automático  │
       │ backup_{workItemId}_timestamp    │
       └──────────┬───────────────────────┘
                  │
       ┌──────────▼──────────────────────┐
       │ PASO 3: Registrar en Change     │
       │ History (Audit Trail)           │
       └──────────┬──────────────────────┘
                  │
       ┌──────────▼──────────────────────┐
       │ PASO 4: Sincronizar a Nube     │
       │ Azure DevOps + Cosmos DB        │ (100-500ms)
       │ (Asincrónico)                   │
       └──────────┬──────────────────────┘
                  │
       ┌──────────▼──────────────────────┐
       │ PASO 5: Registrar Sync Log      │
       │ Timestamp, status, device       │
       └──────────┬──────────────────────┘
                  │
       ┌──────────▼──────────────────────┐
       │ PASO 6: Notificar a otros       │
       │ Dispositivos (PostMessage)      │
       │ Refresh automático si están     │
       │ usando el mismo Work Item       │
       └────────────────────────────────┘
```

---

## 🏗️ Estructura de Colecciones MongoDB

```
DATABASE: crets4devops
│
├── Collections:
│
├─ 📋 workItems
│  ├─ Index: { workItemId: 1 }
│  ├─ Index: { projectId: 1 }
│  ├─ Index: { syncMetadata.lastSyncedAt: -1 }
│  └─ Documents: 10,000+ (escalable)
│
├─ 🔧 projects
│  ├─ Index: { projectId: 1 }
│  └─ Documents: 100+ (1 por proyecto)
│
├─ 📝 syncLogs
│  ├─ Index: { device: 1, timestamp: -1 }
│  ├─ Index: { workItemId: 1, timestamp: -1 }
│  └─ Documents: 1,000,000+ (histórico)
│
├─ 💾 backups
│  ├─ Index: { expiresAt: 1 } (TTL)
│  ├─ Index: { workItemId: 1, timestamp: -1 }
│  └─ Documents: 50,000+ (con auto-purge)
│
└─ 👤 users
   ├─ Index: { email: 1 }
   ├─ Index: { organizationId: 1 }
   └─ Documents: 10,000+ (team members)
```

---

## 📈 Escalabilidad de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                CRECIMIENTO DE DATOS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Escenario: 100 usuarios × 50 proyectos × 1000 Work Items │
│                                                             │
│  📊 Estadísticas de Almacenamiento:                         │
│                                                             │
│  workItems Collection:                                      │
│  └─ 50,000 documentos × 2KB promedio = 100 MB              │
│                                                             │
│  syncLogs Collection:                                       │
│  └─ 5 sincs/día × 100 usuarios × 365 días = 182,500 docs   │
│     × 500 bytes = 91 MB                                     │
│                                                             │
│  backups Collection:                                        │
│  └─ 1 backup/día × 50,000 items × 30 días = 1.5M docs      │
│     × 1.5KB = 2.25 GB (con TTL auto-cleanup)               │
│                                                             │
│  💾 TOTAL ESTIMADO: ~2.5 GB                                 │
│     (Sin comprimir, muy manejable)                          │
│                                                             │
│  📈 Proyección (5 años):                                    │
│  └─ 12.5 GB (con archivado anual)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Seguridad y Aislamiento de Datos

```
┌──────────────────────────────────────────────────────────────┐
│              NIVELES DE AISLAMIENTO                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  NIVEL 1: Por Organización (Azure)                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Contoso Inc.        │  Fabrikam Inc.               │     │
│  │ project-A, project-B │ project-C, project-D         │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  NIVEL 2: Por Proyecto (dentro de Org)                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Contoso Inc.                                        │     │
│  │ ├─ Project A: [WI-1, WI-2, WI-3]                  │     │
│  │ └─ Project B: [WI-4, WI-5, WI-6]                  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  NIVEL 3: Por Work Item (Completa Independencia)            │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Project A                                           │     │
│  │ ├─ WI-1 {req1, req2, req3}                         │     │
│  │ ├─ WI-2 {req4, req5}                               │     │
│  │ └─ WI-3 {} (sin requisitos)                        │     │
│  │                                                    │     │
│  │ localStorage: selectedReqs_1, selectedReqs_2,      │     │
│  │               selectedReqs_3 (Completamente       │     │
│  │               separados)                           │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  NIVEL 4: Por Dispositivo (Multi-Device Sync)               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ WI-1                                                │     │
│  │ ├─ Windows PC (syncStatus: synced)                 │     │
│  │ ├─ MacBook (syncStatus: synced)                    │     │
│  │ └─ iPad (syncStatus: pending)                      │     │
│  │                                                    │     │
│  │ Cada dispositivo tiene su próprio localStorage     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida de un Requisito

```
┌─────────────────────────────────────────────────────────────┐
│         CICLO DE VIDA: Sustainability Requirement           │
└─────────────────────────────────────────────────────────────┘

  1️⃣  CREADO EN SISTEMA
      ├─ Admin define: "Energy Efficiency" (req-001)
      ├─ Se almacena en: sustainabilityRequirements collection
      └─ Estado: "available"

              │
              ▼

  2️⃣  SELECCIONADO POR USUARIO
      ├─ Usuario ve lista de requisitos
      ├─ Checkbox: ✓ Energy Efficiency
      └─ Estado: "selected"

              │
              ▼

  3️⃣  APLICADO A WORK ITEM
      ├─ User abre Work Item #67890
      ├─ Click "Aceptar" → PASO 1
      └─ Estado: "pending"

              │
              ▼

  4️⃣  GUARDADO LOCALMENTE
      ├─ localStorage.setItem("selectedReqs_67890", JSON)
      ├─ Backup automático creado
      └─ Estado: "applied_locally"

              │
              ▼

  5️⃣  SINCRONIZADO A NUBE
      ├─ Enviar a Azure DevOps Custom Field
      ├─ Guardar en Cosmos DB
      ├─ Registrar en syncLog
      └─ Estado: "synced"

              │
              ▼

  6️⃣  DISPONIBLE EN OTROS DEVICES
      ├─ Usuario abre en MacBook
      ├─ Pull desde Cosmos DB
      ├─ Mostrar en UI
      └─ Estado: "multi_device_ready"

              │
              ▼

  7️⃣  MODIFICADO (OPCIONAL)
      ├─ User edita requisito (ej: cambiar prioridad)
      ├─ Se registra en changeHistory
      ├─ Re-sincronizar
      └─ Estado: "modified"

              │
              ▼

  8️⃣  REMOVIDO (OPCIONAL)
      ├─ User hace click "Remover"
      ├─ Se marca como "removed" (soft delete)
      ├─ Cambio registrado en audit trail
      ├─ Sincronizar cambio
      └─ Estado: "removed"

              │
              ▼

  9️⃣  ARCHIVADO (DESPUÉS DE 30 DÍAS)
      ├─ Si status = "removed" por 30+ días
      ├─ Mover a backup/archive
      ├─ Mantener audit trail
      └─ Estado: "archived"
```

---

## 📋 Resumen Comparativo: Almacenamiento

```
┌────────────────────────────────────────────────────────────────┐
│            NIVELES DE ALMACENAMIENTO EN CRETS4DevOps          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  NIVEL 1: Browser localStorage (Dispositivo Local)            │
│  ├─ Velocidad: < 1ms                                          │
│  ├─ Capacidad: ~5-10 MB por dominio                           │
│  ├─ Persistencia: Hasta que usuario limpie cookies/cache      │
│  ├─ Sincronización: N/A (local solo)                          │
│  └─ Uso: Caché rápida, backup local                           │
│                                                                │
│  NIVEL 2: Azure DevOps Custom Fields (Cloud - Autoridad)      │
│  ├─ Velocidad: 100-500ms                                      │
│  ├─ Capacidad: Ilimitada (en Microsoft Cloud)                 │
│  ├─ Persistencia: Permanente (mientras exista WI)             │
│  ├─ Sincronización: Multi-dispositivo automática              │
│  └─ Uso: Fuente de verdad (Single Source of Truth)            │
│                                                                │
│  NIVEL 3: Cosmos DB / MongoDB (Cloud - Histórico)             │
│  ├─ Velocidad: 50-200ms                                       │
│  ├─ Capacidad: Escalable (petabytes)                          │
│  ├─ Persistencia: Permanente (con backups geo-replicados)     │
│  ├─ Sincronización: Bidireccional con Azure DevOps            │
│  └─ Uso: Historial completo, analytics, auditoría             │
│                                                                │
│  NIVEL 4: Backup automático (Cloud - Recuperación)            │
│  ├─ Velocidad: Asincrónico (background)                       │
│  ├─ Capacidad: Escalable                                      │
│  ├─ Persistencia: 30 días (configurable) con TTL auto-delete  │
│  ├─ Sincronización: Punto en tiempo (point-in-time recovery)  │
│  └─ Uso: Recuperación ante desastres, versioning              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

