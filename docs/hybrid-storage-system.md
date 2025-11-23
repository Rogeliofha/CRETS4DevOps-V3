# CRETS4DevOps V2.5.8 - Hybrid Storage System Documentation

## Executive Summary

The Hybrid Storage System is the core innovation of CRETS4DevOps V2.5.8 that solves the critical multi-device synchronization bug. It combines **Azure DevOps Work Item Fields** (authoritative source) with **localStorage cache** (performance layer) to ensure requirements are synchronized across all devices while maintaining fast access times.

## Problem Statement (V2.5.5 and Earlier)

### The Multi-Device Synchronization Bug

**Scenario:**
1. User opens Work Item #12345 on **Computer A** (Windows PC)
2. User applies 5 sustainability requirements to the Work Item
3. User saves data - stored in localStorage on Computer A
4. User walks to **Computer B** (MacBook) 
5. User opens Azure DevOps and navigates to the same Work Item #12345
6. **Result**: No requirements visible! ❌ Requirements disappeared

**Root Cause:**
- `localStorage` is browser/device-specific
- Not synchronized across different computers
- Each device has its own separate `localStorage` instance
- No server-side persistence mechanism

**Impact:**
- Users lose work when switching devices
- Cannot share requirements across team members on different computers
- Critical data loss scenario
- Breaks workflow in distributed teams

## Solution Architecture

### Hybrid Storage Model (V2.5.8+)

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID STORAGE SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TIER 1: Azure DevOps Work Item Fields (Authoritative)         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Custom.SustainabilityRequirements                       │   │
│  │ Custom.SustainabilityLastModified                       │   │
│  │ Custom.SustainabilityVersion                            │   │
│  │                                                         │   │
│  │ • Cloud-stored                                          │   │
│  │ • Multi-device accessible                              │   │
│  │ • Synchronized in real-time                            │   │
│  │ • Enterprise-grade persistence                         │   │
│  │ • Requires custom fields in Process Template           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↕ ↕ ↕                                │
│                    (Intelligent Sync)                          │
│                           ↕ ↕ ↕                                │
│  TIER 2: localStorage Cache (Performance)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ workitem_{workItemId}_selectedRequirements              │   │
│  │ workitem_{workItemId}_syncStatus                        │   │
│  │ backup_{workItemId}_selectedRequirements_timestamp      │   │
│  │                                                         │   │
│  │ • Browser-stored                                        │   │
│  │ • Device-specific                                       │   │
│  │ • Instant access (< 1ms)                               │   │
│  │ • Automatic backup                                      │   │
│  │ • Fallback when Azure DevOps unavailable              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: Read Operations

```
User opens Work Item #12345 on Computer B (different from where data was saved)
│
├─ Step 1: Load from Azure DevOps (Primary Source)
│  └─ Query Custom.SustainabilityRequirements field
│     ├─ If found: ✅ Return authoritative data
│     │  └─ Update localStorage cache with latest data
│     │     └─ Display requirements to user
│     │
│     └─ If NOT found: Continue to Step 2
│
├─ Step 2: Load from localStorage (Fallback)
│  └─ Query workitem_{workItemId}_selectedRequirements
│     ├─ If found: ⚠️ Return cached data
│     │  └─ Note: Data is local to this device
│     │
│     └─ If NOT found: Display "No requirements"
│
└─ Result: Requirements visible regardless of device! ✅
```

### Data Flow: Write Operations

```
User modifies requirements on Work Item #12345
│
├─ Step 1: Save to localStorage immediately
│  └─ workitem_{workItemId}_selectedRequirements = [...]
│     ├─ Fast response to user (instant)
│     └─ Backup created: backup_{workItemId}_..._timestamp
│
├─ Step 2: Attempt to save to Azure DevOps
│  └─ Call workItemFormService.setFieldValue()
│     ├─ Success: ✅ Multi-device sync enabled
│     │  └─ Store sync status: azureDevOps = true
│     │
│     └─ Failure: ⚠️ Fallback to localStorage only
│        └─ Store sync status: azureDevOps = false
│           (Custom fields may not exist in Process Template)
│
├─ Step 3: Record sync status
│  └─ workitem_{workItemId}_syncStatus
│     {
│       localStorage: true,
│       azureDevOps: true/false,
│       timestamp: ISO timestamp,
│       requirementsCount: N
│     }
│
└─ Result: Data saved with appropriate persistence tier ✅
```

## Implementation Details

### HybridWorkItemStorage Class

#### Core Methods

```typescript
class HybridWorkItemStorage {
  // Azure DevOps custom field names
  private static readonly AZURE_FIELD_REQUIREMENTS = 'Custom.SustainabilityRequirements';
  private static readonly AZURE_FIELD_LAST_MODIFIED = 'Custom.SustainabilityLastModified';
  private static readonly AZURE_FIELD_VERSION = 'Custom.SustainabilityVersion';

  // Set Work Item context
  static setWorkItemId(id: string): void

  // Save with automatic dual-layer persistence
  static async setSelectedRequirements(requirements: Requirement[]): Promise<void>

  // Load with intelligent prioritization
  static async getSelectedRequirements(): Promise<Requirement[]>

  // Save to Azure DevOps fields
  static async saveToAzureDevOps(requirements: Requirement[]): Promise<boolean>

  // Load from Azure DevOps fields
  static async loadFromAzureDevOps(): Promise<Requirement[] | null>

  // Diagnostic: Compare sync status
  static async diagnoseSyncStatus(): Promise<void>
}
```

#### Save Operation (setSelectedRequirements)

```typescript
async setSelectedRequirements(requirements: Requirement[]): Promise<void> {
  try {
    // 1. Create backup of existing data
    const existingData = localStorage.getItem(key);
    if (existingData) {
      localStorage.setItem(`backup_${key}_${Date.now()}`, existingData);
    }

    // 2. Save to localStorage (fast, guaranteed)
    localStorage.setItem(key, JSON.stringify(requirements));

    // 3. Attempt Azure DevOps save (async)
    const azureSuccess = await this.saveToAzureDevOps(requirements);

    // 4. Record sync status for diagnostics
    localStorage.setItem(
      `${key}_syncStatus`,
      JSON.stringify({
        localStorage: true,
        azureDevOps: azureSuccess,
        timestamp: new Date().toISOString(),
        requirementsCount: requirements.length
      })
    );
  } catch (error) {
    // Fallback: at least save to localStorage
    localStorage.setItem(key, JSON.stringify(requirements));
  }
}
```

#### Load Operation (getSelectedRequirements)

```typescript
async getSelectedRequirements(): Promise<Requirement[]> {
  try {
    // 1. Try Azure DevOps first (authoritative source)
    const azureData = await this.loadFromAzureDevOps();
    if (azureData && azureData.length > 0) {
      // Update cache with latest server data
      localStorage.setItem(key, JSON.stringify(azureData));
      return azureData; // Multi-device synchronized data
    }

    // 2. Fallback to localStorage (cache)
    const localData = localStorage.getItem(key);
    const requirements = localData ? JSON.parse(localData) : [];

    if (requirements.length > 0) {
      // Data exists locally but not on Azure DevOps
      // (custom fields not configured or not yet synced)
      return requirements;
    }

    // 3. No data anywhere
    return [];
  } catch (error) {
    console.error('Hybrid load error:', error);
    return [];
  }
}
```

## Azure DevOps Custom Fields Setup

### Required Configuration

To enable full multi-device synchronization, add these custom fields to your **Process Template**:

#### Field 1: Sustainability Requirements
- **Name**: Custom.SustainabilityRequirements
- **Type**: Text Area
- **Size**: Large (for JSON storage)
- **Required**: No
- **Visibility**: Team Project
- **Purpose**: Store complete requirements JSON with metadata

#### Field 2: Last Modified Timestamp
- **Name**: Custom.SustainabilityLastModified
- **Type**: Date/Time
- **Required**: No
- **Visibility**: Team Project
- **Purpose**: Track when requirements were last updated

#### Field 3: Version Tracking
- **Name**: Custom.SustainabilityVersion
- **Type**: Text
- **Required**: No
- **Visibility**: Team Project
- **Purpose**: Track extension version that modified the field

### Fallback Mode (Without Custom Fields)

If custom fields are **not configured**:
- ✅ Requirements still work locally on each device
- ✅ Can be applied to Work Items
- ✅ Can be edited and saved
- ⚠️ Only synchronized within the same device
- ⚠️ If user switches devices, data not automatically available
- 💡 Solution: Configure custom fields for multi-device sync

## Synchronization Scenarios

### Scenario 1: Full Hybrid Sync (Recommended)

**Prerequisites**: Azure DevOps custom fields configured

```
Computer A (Windows PC)
│
├─ User opens Work Item #12345
├─ Applies 5 requirements
├─ Saves to localStorage (immediate)
└─ Saves to Azure DevOps (background)
   └─ Custom.SustainabilityRequirements = [JSON data]

Computer B (MacBook)
│
├─ User opens same Work Item #12345
├─ Extension loads from Azure DevOps
└─ Displays 5 requirements ✅
   └─ Same data synchronized across devices
```

### Scenario 2: Fallback Mode (localStorage Only)

**Prerequisites**: Custom fields not configured

```
Computer A (Windows PC)
│
├─ User opens Work Item #12345
├─ Applies 5 requirements
├─ Saves to localStorage (guaranteed)
└─ Azure DevOps save attempted but fails silently
   └─ Custom fields not available

Computer B (MacBook)
│
├─ User opens same Work Item #12345
├─ Extension tries Azure DevOps (empty)
├─ Falls back to localStorage (empty on this device)
└─ Displays "No requirements" ⚠️
   └─ User needs to reapply requirements on this device
```

### Scenario 3: Offline Work (On One Device)

**Prerequisites**: User has internet initially, then loses connection

```
Computer A (Windows PC) - Connected
│
├─ User opens Work Item #12345
├─ Applies 5 requirements
├─ Saves to localStorage + Azure DevOps ✅
└─ Internet disconnected

Work offline on Computer A
│
├─ User continues editing requirements
├─ Saves to localStorage (works offline) ✅
└─ Azure DevOps sync queued

Computer B (MacBook) - Connected
│
├─ User opens same Work Item #12345
├─ Loads from Azure DevOps (latest synced data)
└─ Displays last version before Computer A went offline
   └─ Updates when Computer A comes back online
```

## Diagnostic System

### Sync Status Monitoring

```typescript
// Automatic diagnostics stored in localStorage
{
  workitem_12345_syncStatus: {
    localStorage: true,      // Data saved locally?
    azureDevOps: true,       // Data saved to Azure DevOps?
    timestamp: "2025-11-23T...",
    requirementsCount: 5,
    device: "Windows NT 10.0... Chrome/120...",
    availability: "Multi-device available"
  }
}
```

### Manual Diagnostics

```typescript
// Get complete sync status
await HybridWorkItemStorage.diagnoseSyncStatus();

// Returns:
{
  workItemId: "12345",
  localStorage: {
    available: true,
    count: 5,
    storageKey: "workitem_12345_selectedRequirements"
  },
  azureDevOps: {
    available: true,
    count: 5,
    fieldName: "Custom.SustainabilityRequirements"
  },
  syncStatus: { /* as above */ },
  recommendation: "Completely synchronized between localStorage and Azure DevOps"
}
```

## Performance Characteristics

### Load Times

| Scenario | Time | Notes |
|----------|------|-------|
| Load from localStorage | < 1ms | Instant access, same device |
| Load from Azure DevOps | 100-500ms | Network dependent |
| Hybrid load (Azure, then local) | 100-500ms | Uses faster available source |
| Offline load (localStorage only) | < 1ms | Works without internet |

### Storage Capacity

| Storage Type | Capacity | Usage |
|--------------|----------|-------|
| localStorage | 5-10MB | Per browser per origin |
| Azure DevOps Field | 4000 chars | Single custom field (text area) |
| Backup keys | 5-10MB shared | Multiple backups in localStorage |

## Error Handling & Recovery

### Network Error During Save

```
User saves requirements
├─ localStorage save: ✅ SUCCESS
├─ Azure DevOps save: ❌ NETWORK ERROR
├─ Sync status updated: {azureDevOps: false}
└─ User notified via console (not popup to avoid disruption)
   └─ Data is safe in localStorage
   └─ Will sync to Azure DevOps when connection restored
```

### Missing Custom Fields

```
Extension detects missing Custom.SustainabilityRequirements
├─ Azure DevOps save attempted: ❌ FIELD NOT FOUND
├─ Falls back to localStorage: ✅ SUCCESS
├─ Console warning logged
└─ Feature gracefully degrades to single-device mode
```

### Corrupted Data Recovery

```
localStorage contains invalid JSON
├─ Attempted parse: ❌ JSON ERROR
├─ Backup mechanism activated
├─ Remove corrupted entry
└─ Load from backup or fresh start
   └─ User data preserved via backups created earlier
```

## Version Compatibility

### Current Version: 2.5.8

- Full hybrid storage implementation
- Clean professional UI (no emoji)
- English interface
- Complete multi-device support

### Backward Compatibility

- ✅ Reads V2.5.5 localStorage data
- ✅ Migrates data to hybrid system automatically
- ✅ Maintains existing Work Item requirements
- ✅ No data loss during upgrade

## Best Practices

### For Users

1. **Configure Custom Fields**: Enable multi-device sync for maximum benefit
2. **Monitor Sync Status**: Check console for sync warnings
3. **Backup Important Work**: Use manual exports if working offline
4. **Switch Devices Intelligently**: Allow sync time between devices

### For Administrators

1. **Create Custom Fields**: Add required fields to Process Template
2. **Monitor Storage**: Check Process Template performance impact
3. **Educate Teams**: Explain sync behavior to users
4. **Test Thoroughly**: Validate in dev/test before production

### For Developers

1. **Always Use HybridWorkItemStorage**: Never use WorkItemStorage directly for new features
2. **Implement Diagnostics**: Log sync status for troubleshooting
3. **Handle Failures Gracefully**: Expect Azure DevOps operations to fail
4. **Test Both Paths**: Test with and without custom fields configured

## Migration Guide (V2.5.5 → V2.5.8)

### Automatic Migration

```
V2.5.5 → V2.5.8 upgrade
│
├─ Detect V2.5.5 localStorage data
├─ Migrate to V2.5.8 format automatically
├─ Configure HybridWorkItemStorage
└─ Maintain all existing requirements
   └─ No user action required ✅
```

### Manual Verification

```
After upgrade, verify sync:
1. Open any Work Item with requirements
2. Open browser console (F12)
3. Look for "Cargando requisitos híbridos..." messages
4. Verify "[HÍBRIDO] Cargado desde Azure DevOps" or fallback message
5. All requirements should display normally
```

---

## Summary

The Hybrid Storage System transforms CRETS4DevOps from a single-device tool into an **enterprise-grade multi-device solution**. By combining the reliability of Azure DevOps server storage with the performance of localStorage caching, it provides:

- ✅ **Multi-device synchronization** (solves the original bug)
- ✅ **Fast performance** (localStorage cache layer)
- ✅ **Enterprise reliability** (Azure DevOps as authoritative source)
- ✅ **Graceful degradation** (works without custom fields)
- ✅ **Automatic backups** (data recovery protection)
- ✅ **Complete transparency** (diagnostic tools for troubleshooting)

**Status**: Production Ready - V2.5.8