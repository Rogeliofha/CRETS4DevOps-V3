# Configuration Guide - CRETS4DevOps V2.5.8

Comprehensive configuration reference for CRETS4DevOps extension.

## Table of Contents

1. [Custom Fields Setup](#custom-fields-setup)
2. [Process Template Configuration](#process-template-configuration)
3. [Advanced Settings](#advanced-settings)
4. [Backup Strategies](#backup-strategies)
5. [Performance Tuning](#performance-tuning)

---

## Custom Fields Setup

### Why Custom Fields?

Custom fields enable **multi-device synchronization**:
- Without: Requirements stored in browser only (no sync)
- With: Requirements stored in Azure DevOps (synced across devices)

### Required Custom Fields

CRETS4DevOps requires three custom fields:

#### 1. SustainabilityRequirements
- **Purpose**: Store the actual requirement data
- **Type**: Text (large) / Long Text
- **Max Length**: 4000 characters
- **Required**: Yes (for multi-device sync)
- **Reference Name**: `Custom.SustainabilityRequirements`

#### 2. SustainabilityLastModified
- **Purpose**: Track when requirements were last updated
- **Type**: DateTime
- **Required**: No (optional, for diagnostics)
- **Reference Name**: `Custom.SustainabilityLastModified`

#### 3. SustainabilityVersion
- **Purpose**: Track which version of CRETS modified the data
- **Type**: Text (small)
- **Max Length**: 50 characters
- **Required**: No (optional, for version tracking)
- **Reference Name**: `Custom.SustainabilityVersion`

### Creating Custom Fields - Azure DevOps Services (Cloud)

#### Method 1: Using Web Interface

1. **Navigate to Process Settings**:
   - Go to Azure DevOps organization: `https://dev.azure.com/{organization}`
   - Click **Organization Settings** (bottom left)
   - Click **Process** (left sidebar)

2. **Create First Field - SustainabilityRequirements**:
   - Click **+ New Field**
   - **Name**: `SustainabilityRequirements`
   - **Type**: `Text (large)` or `Long Text`
   - **Description**: "Sustainability requirements for this work item"
   - **Maximum length**: 4000
   - **Default value**: (leave empty)
   - Click **Save**
   - Wait for confirmation

3. **Create Second Field - SustainabilityLastModified**:
   - Click **+ New Field**
   - **Name**: `SustainabilityLastModified`
   - **Type**: `DateTime`
   - **Description**: "Last modification timestamp for requirements"
   - Click **Save**

4. **Create Third Field - SustainabilityVersion**:
   - Click **+ New Field**
   - **Name**: `SustainabilityVersion`
   - **Type**: `Text (small)`
   - **Description**: "CRETS version that last modified requirements"
   - **Maximum length**: 50
   - Click **Save**

5. **Verify Fields Created**:
   - Go to **Organization Settings → Process → Custom fields**
   - Search for "Sustainability"
   - Should see all three fields listed
   - Status: **Active**

#### Method 2: Using CLI

```powershell
# Requires Azure DevOps CLI installed
# https://github.com/microsoft/azure-devops-cli-extension

# Login to organization
az devops configure --defaults organization=https://dev.azure.com/YourOrg

# Create SustainabilityRequirements field
az devops invoke --area wit --resource fields --http-method POST `
  --body @- <<'EOF'
{
  "name": "SustainabilityRequirements",
  "type": "LongText",
  "description": "Sustainability requirements for this work item",
  "properties": {
    "maximumLength": 4000
  }
}
EOF

# Create SustainabilityLastModified field
az devops invoke --area wit --resource fields --http-method POST `
  --body @- <<'EOF'
{
  "name": "SustainabilityLastModified",
  "type": "DateTime",
  "description": "Last modification timestamp for requirements"
}
EOF

# Create SustainabilityVersion field
az devops invoke --area wit --resource fields --http-method POST `
  --body @- <<'EOF'
{
  "name": "SustainabilityVersion",
  "type": "Text",
  "description": "CRETS version that last modified requirements",
  "properties": {
    "maximumLength": 50
  }
}
EOF
```

### Creating Custom Fields - TFS On-Premises

#### XML Configuration

Edit your Process Template XML:

```xml
<!-- In WorkItemType.xml -->
<FIELDS>
  <!-- Existing fields... -->
  
  <!-- Add these custom fields -->
  <Field name="SustainabilityRequirements" refname="Custom.SustainabilityRequirements" type="LongText" reportable="dimension">
    <Description>Sustainability requirements applied to this work item</Description>
    <HELPTEXT>Contains the serialized sustainability requirements selected for this work item</HELPTEXT>
    <EMPTY/>
  </Field>

  <Field name="SustainabilityLastModified" refname="Custom.SustainabilityLastModified" type="DateTime" reportable="dimension">
    <Description>Timestamp of last synchronization with CRETS extension</Description>
    <HELPTEXT>Automatically updated when requirements are modified</HELPTEXT>
    <EMPTY/>
  </Field>

  <Field name="SustainabilityVersion" refname="Custom.SustainabilityVersion" type="Text" reportable="dimension">
    <Description>Version of CRETS extension that last modified these requirements</Description>
    <HELPTEXT>Used for compatibility tracking and diagnostics</HELPTEXT>
    <EMPTY/>
  </Field>
</FIELDS>

<!-- Add to form layout -->
<FORM>
  <Layout>
    <!-- Existing groups... -->
    
    <!-- Add Sustainability group -->
    <Group Label="Sustainability">
      <Control Label="Requirements" Type="FieldControl" FieldName="Custom.SustainabilityRequirements" />
      <Control Label="Last Modified" Type="FieldControl" FieldName="Custom.SustainabilityLastModified" />
      <Control Label="CRETS Version" Type="FieldControl" FieldName="Custom.SustainabilityVersion" />
    </Group>
  </Layout>
</FORM>
```

#### TFS Upload Process

1. **Export Current Process Template**:
   - Team Foundation Server Admin Console
   - Select Collection → Process Template Manager
   - Select your template → Export
   - Save to local folder

2. **Modify XML Files**:
   - Extract downloaded XML
   - Edit WorkItemType.xml (for each type)
   - Add custom field definitions (see above)
   - Add form controls

3. **Re-Upload Template**:
   - In Process Template Manager
   - Delete old template version
   - Upload modified template
   - Click Upload

4. **Refresh Projects**:
   - Project Collection Settings
   - Process Template Refresh
   - Select affected projects
   - Click Refresh

---

## Process Template Configuration

### Adding Fields to Work Item Form

Once custom fields are created, add them to the work item form.

#### Azure DevOps Services

1. **Navigate to Work Item Type**:
   - Organization Settings → Process
   - Select your process (e.g., "Scrum", "Agile")
   - Select Work Item Type (e.g., "User Story", "Task")

2. **Add Custom Field to Form**:
   - In the Work Item Type configuration
   - Click **+ New field**
   - Or drag existing field to form
   - Choose "Custom.SustainabilityRequirements"
   - Set as **Optional** or **Required**
   - Click **Save**

3. **Verify in Work Item**:
   - Open any Work Item of that type
   - Should see "Sustainability Requirements" field
   - Should be editable

### Field Visibility Options

| Setting | Effect | Recommended |
|---------|--------|-------------|
| **Required** | User must fill field | ❌ No (use optional) |
| **Optional** | Field visible but optional | ✅ Yes |
| **Not on form** | Hidden from form | ❌ No (won't see data) |

**Recommendation**: Set as **Optional** - CRETS fills automatically

---

## Advanced Settings

### Browser localStorage Configuration

#### Enable Verbose Logging

```javascript
// F12 Console
localStorage.setItem('CRETS_DEBUG', 'true');
localStorage.setItem('CRETS_LOG_LEVEL', 'verbose');
location.reload();

// Now check console for detailed [HÍBRIDO] messages
```

#### Force Offline Mode

```javascript
// F12 Console - useful for testing
localStorage.setItem('CRETS_FORCE_OFFLINE', 'true');
location.reload();

// To disable offline mode:
localStorage.removeItem('CRETS_FORCE_OFFLINE');
```

#### Clear All Cache

```javascript
// F12 Console - WARNING: Data loss if not synced!
if (confirm('Clear all CRETS cache? (Check sync status first!)')) {
  Object.keys(localStorage)
    .filter(key => key.startsWith('crets_'))
    .forEach(key => localStorage.removeItem(key));
  console.log('Cache cleared');
  location.reload();
}
```

### Sync Behavior Configuration

#### Auto-Sync Settings

CRETS automatically syncs changes:
- **To Azure DevOps**: Immediately when saved
- **From Azure DevOps**: On page load / tab focus
- **Interval**: Check for updates every 30 seconds

These settings are hardcoded (not configurable in V2.5.8).

#### Fallback Strategy

When Azure DevOps unavailable:
1. Try to read from Azure DevOps custom fields
2. Fallback to localStorage cache
3. Display data with offline indicator
4. Queue updates for later sync

---

## Backup Strategies

### Automatic Backups

CRETS provides automatic backup in two locations:

#### Backup Location 1: Azure DevOps Custom Fields
- **Where**: Cloud (Azure DevOps)
- **Reliability**: ⭐⭐⭐⭐⭐ (Highly reliable)
- **Access**: Organization admins can view
- **Retention**: Indefinite (part of work item)

#### Backup Location 2: localStorage
- **Where**: Browser (local device)
- **Reliability**: ⭐⭐⭐ (Device-specific)
- **Access**: User can browse in DevTools
- **Retention**: Until browser cache cleared

### Manual Backups

#### Export Requirements to File

```javascript
// F12 Console
function exportCRETSData() {
  const data = {};
  for (let key in localStorage) {
    if (key.startsWith('crets_')) {
      data[key] = localStorage[key];
    }
  }
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `crets-backup-${Date.now()}.json`;
  a.click();
  console.log('Backup exported to file');
}

// Call function
exportCRETSData();
```

#### Import Requirements from File

```javascript
// F12 Console
async function importCRETSData(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // Restore to localStorage
  for (let key in data) {
    localStorage.setItem(key, data[key]);
  }
  
  console.log('Backup imported, reloading...');
  location.reload();
}

// Usage: 
// 1. In F12 console, click on file input
// 2. Select backup file
// 3. Call: importCRETSData(document.querySelector('input[type=file]').files[0])
```

#### Export Work Items with Requirements

```powershell
# PowerShell - Requires Azure DevOps CLI
az devops configure --defaults organization=https://dev.azure.com/YourOrg `
  project=YourProject

# Query work items with requirements
az devops work-item list --query "[?fields.'Custom.SustainabilityRequirements'!=null]" `
  --output json > work-items-with-requirements.json

# Show summary
$items = Get-Content work-items-with-requirements.json | ConvertFrom-Json
Write-Host "Found $($items.count) work items with requirements"
```

### Backup Schedule

**Recommended Backup Frequency**:
- **Automatic**: Continuous (via Azure DevOps)
- **Manual**: Weekly (export to file)
- **Archive**: Monthly (long-term storage)

---

## Performance Tuning

### Optimization Settings

#### Clear Expired Cache

```javascript
// F12 Console - Clean up old entries
function cleanupExpiredCache(daysOld = 30) {
  const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  let removed = 0;
  
  for (let key in localStorage) {
    if (key.startsWith('crets_')) {
      const value = localStorage[key];
      try {
        const data = JSON.parse(value);
        if (data.timestamp && data.timestamp < cutoffTime) {
          localStorage.removeItem(key);
          removed++;
        }
      } catch (e) {
        // Skip non-JSON items
      }
    }
  }
  
  console.log(`Removed ${removed} expired cache entries`);
}

// Run monthly
cleanupExpiredCache(30);
```

#### Monitor Cache Size

```javascript
// F12 Console - Check storage usage
function getCacheSize() {
  let total = 0;
  const details = {};
  
  for (let key in localStorage) {
    if (key.startsWith('crets_')) {
      const size = localStorage[key].length;
      total += size;
      details[key] = `${(size / 1024).toFixed(2)} KB`;
    }
  }
  
  console.log(`Total cache size: ${(total / 1024 / 1024).toFixed(2)} MB`);
  console.table(details);
}

getCacheSize();
```

#### Optimize for Large Deployments

For organizations with 1000+ work items:

1. **Archive Old Work Items**:
   - Remove completed/obsolete work items
   - Reduces cache overhead

2. **Limit Cached Items**:
   ```javascript
   // Only cache last 100 accessed items
   localStorage.setItem('CRETS_CACHE_LIMIT', '100');
   ```

3. **Enable Selective Sync**:
   - Only sync active projects
   - Reduces network traffic

4. **Use Separate Process Templates**:
   - Large projects in separate templates
   - Reduces field list size

---

## Troubleshooting Configuration

### Verify Configuration

```javascript
// F12 Console - Check all settings
function checkConfiguration() {
  const config = {
    customFieldsSupported: !!window.HybridWorkItemStorage,
    debugMode: localStorage.getItem('CRETS_DEBUG') === 'true',
    offlineMode: localStorage.getItem('CRETS_FORCE_OFFLINE') === 'true',
    cacheSize: Object.keys(localStorage)
      .filter(k => k.startsWith('crets_'))
      .length,
    localStorageAvailable: !!localStorage
  };
  
  console.table(config);
  return config;
}

checkConfiguration();
```

### Reset to Defaults

```javascript
// F12 Console - Clear all CRETS settings
localStorage.removeItem('CRETS_DEBUG');
localStorage.removeItem('CRETS_LOG_LEVEL');
localStorage.removeItem('CRETS_FORCE_OFFLINE');
localStorage.removeItem('CRETS_CACHE_LIMIT');

// Then reload
location.reload();
```

---

## Best Practices

### ✅ Do's

- ✅ Keep custom field descriptions clear
- ✅ Set fields as **Optional** (not Required)
- ✅ Backup requirements weekly
- ✅ Monitor cache size regularly
- ✅ Use stable Azure DevOps URLs
- ✅ Test on separate project first

### ❌ Don'ts

- ❌ Mark custom fields as Required
- ❌ Delete custom fields after use
- ❌ Modify field names after creation
- ❌ Store large files (> 4000 chars) in SustainabilityRequirements
- ❌ Share localStorage across security zones
- ❌ Force offline mode in production

---

## Support

- **Deployment Guide**: See `deployment-guide.md`
- **Troubleshooting**: See `troubleshooting.md`
- **Issues**: https://github.com/Rogeliofha/CRETS4DevOps-V3/issues

---

**Version**: V2.5.8  
**Last Updated**: November 23, 2025  
**Status**: Complete configuration reference