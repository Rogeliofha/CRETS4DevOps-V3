# Deployment Guide - CRETS4DevOps V2.5.8

Complete step-by-step guide for deploying CRETS4DevOps V2 extension to Azure DevOps.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Installation Steps](#installation-steps)
4. [Custom Fields Configuration](#custom-fields-configuration)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### System Requirements
- **Azure DevOps**: Azure DevOps 2019 or Services (cloud)
- **Browser**: Chrome, Edge, or Firefox (latest versions)
- **Storage**: 50MB free disk space
- **Network**: Stable internet connection

### User Permissions
- **Organization Administrator** access (required for extension installation)
- **Project Administrator** access (required for custom field configuration)
- **Collection Administrator** access (for Process Template modifications)

### Optional: Multi-Device Synchronization
To enable full multi-device sync, you'll need:
- **Process Template access**: For creating custom fields
- **Work Item tracking**: Configured in your project
- **Custom fields support**: Available in your organization

---

## Pre-Deployment Checklist

### Organization Level
- [ ] Azure DevOps organization created and accessible
- [ ] At least one project exists in the organization
- [ ] Organization administrator account available
- [ ] Network allows extension downloads from Microsoft
- [ ] Browser extensions/popups not blocked

### Project Level
- [ ] Work item tracking is configured
- [ ] Team members assigned to project
- [ ] Process template selected (Scrum, Agile, or custom)
- [ ] Custom process is enabled (for custom fields)

### Technical Verification
```powershell
# Test Azure DevOps connectivity
Test-NetConnection -ComputerName "dev.azure.com" -Port 443

# Verify TLS/SSL connectivity
$request = [System.Net.HttpWebRequest]::Create("https://dev.azure.com")
$request.GetResponse()
```

---

## Installation Steps

### Step 1: Download the Extension

1. **Locate the extension file**:
   - Filename: `rogeliofha.plugin-crets-v2-2.5.8.vsix`
   - Size: ~258 KB
   - Source: Project release folder

2. **Verify file integrity**:
   ```powershell
   # Check file size (should be ~258 KB)
   (Get-Item "rogeliofha.plugin-crets-v2-2.5.8.vsix").Length / 1KB
   
   # Verify file is not corrupted
   Add-Type -AssemblyName System.IO.Compression
   $zipTest = New-Object System.IO.Compression.ZipArchive((
     [System.IO.File]::OpenRead("path\to\vsix")), 
     [System.IO.Compression.ZipArchiveMode]::Read
   )
   Write-Host "File is valid VSIX"
   ```

### Step 2: Upload to Azure DevOps

1. **Navigate to Azure DevOps**:
   - Go to `https://dev.azure.com/{organization}`
   - Sign in with admin account
   - Navigate to **Organization Settings**

2. **Access Extensions**:
   - Click **Extensions** in left sidebar
   - Click **Browse Marketplace**
   - Search for "CRETS4DevOps" or "rogeliofha"

3. **Alternative: Upload Directly**:
   - In Extensions, click **Manage Extensions**
   - Click **Upload new extension**
   - Select `rogeliofha.plugin-crets-v2-2.5.8.vsix`
   - Click **Upload**
   - Confirm organization
   - Click **Install**

### Step 3: Verify Installation

1. **Check Extension Status**:
   - Go to **Extensions > Manage extensions**
   - Look for "CRETS4DevOps V2" in list
   - Status should show **Installed**
   - Verify version: **2.5.8**

2. **Browser Verification**:
   - Open any Work Item in your project
   - Refresh page (Ctrl+R)
   - Look for "Sustainability Requirements" tab/hub
   - Should load without errors

3. **Console Verification** (F12):
   - Press F12 to open Developer Tools
   - Go to **Console** tab
   - Check for `[HÍBRIDO]` messages
   - Should show no error messages starting with "[ERROR]"

---

## Custom Fields Configuration

### Why Configure Custom Fields?

**Without custom fields**: Extension works locally, requirements stored in browser only (no multi-device sync)  
**With custom fields**: Extension syncs to Azure DevOps, requirements available across devices

### Option 1: Automatic Configuration (Recommended)

If your Process Template supports it:

1. **Open Work Item**:
   - Navigate to any Work Item
   - Open Sustainability Requirements tab
   - Look for **"Configure Sync"** button

2. **Follow Setup Wizard**:
   - Click "Enable Multi-Device Sync"
   - Select Process Template
   - Click "Create Custom Fields"
   - Wait for confirmation

### Option 2: Manual Configuration

#### For Cloud (Azure DevOps Services)

1. **Access Organization Settings**:
   - Azure DevOps home → Organization Settings
   - Go to **Process** (left sidebar)

2. **Create Custom Fields**:

   **Field 1: SustainabilityRequirements**
   - Click **+ New Field**
   - Name: `SustainabilityRequirements`
   - Type: **Text (large)**
   - Max length: **4000** characters
   - Applies to: **All work item types**
   - Click **Save**

   **Field 2: SustainabilityLastModified**
   - Click **+ New Field**
   - Name: `SustainabilityLastModified`
   - Type: **DateTime**
   - Default: **(none)**
   - Applies to: **All work item types**
   - Click **Save**

   **Field 3: SustainabilityVersion**
   - Click **+ New Field**
   - Name: `SustainabilityVersion`
   - Type: **Text (small)**
   - Max length: **50** characters
   - Applies to: **All work item types**
   - Click **Save**

3. **Verify Fields Created**:
   - Go to any Work Item
   - Look for custom fields in form
   - Should show as: "Custom.SustainabilityRequirements", etc.

#### For On-Premises (TFS 2019)

1. **Access Process Template**:
   - Team Foundation Server Administration Console
   - Select Collection
   - Click **Process Template Manager**

2. **Export Process Template**:
   - Select your template
   - Click **Export**
   - Save to disk

3. **Edit XML**:
   - Extract XML files
   - Edit `WorkItemType.xml` for each work item type
   - Add custom field definitions (see Appendix A)
   - Re-package and upload

4. **Verification**:
   - Team Project Refresh
   - Verify fields appear in work items

---

## Post-Deployment Verification

### Verification Checklist

#### 1. Extension Loading
```
✓ Extension appears in Work Item form
✓ "Sustainability Requirements" tab visible
✓ No JavaScript console errors
✓ UI elements visible and responsive
```

#### 2. Local Functionality (No Sync)
```
✓ Can select requirements
✓ Requirements display in Work Item
✓ Can edit requirements inline
✓ Changes persist on refresh
✓ Requirements visible in same browser
```

#### 3. Multi-Device Sync (With Custom Fields)
```
✓ Custom fields configured in Process Template
✓ Custom fields visible in Work Item form
✓ Requirements save to Azure DevOps custom fields
✓ Console shows "[HÍBRIDO] Datos guardados en Azure DevOps"
✓ Requirements visible on different device
```

#### 4. Offline Functionality
```
✓ Close network (or use DevTools offline mode)
✓ Extension still loads requirements
✓ Changes save to localStorage
✓ Console shows "[HÍBRIDO] Guardado solo en localStorage"
✓ Changes sync when network restored
```

### Verification Scripts

**Check Extension Presence**:
```javascript
// Run in browser console (F12)
console.log("CRETS4DevOps loaded:", typeof window.CRETS !== 'undefined');
console.log("Hybrid storage available:", typeof window.HybridWorkItemStorage !== 'undefined');
```

**Check Sync Status**:
```javascript
// Run in browser console
if (window.HybridWorkItemStorage) {
  const storage = new window.HybridWorkItemStorage();
  storage.diagnoseSyncStatus().then(status => {
    console.table(status);
  });
}
```

**Check Custom Fields**:
```powershell
# Run in PowerShell (with Azure DevOps CLI)
az devops invoke --area wit --resource fields --route-parameters `
  --organization https://dev.azure.com/YourOrg | `
  Select-String "SustainabilityRequirements"
```

---

## Troubleshooting

### Common Issues & Solutions

#### Issue 1: Extension Not Appearing

**Symptoms**: 
- Sustainability Requirements tab not visible
- Extension shows in Manage Extensions but not in Work Item

**Solutions**:
1. **Force refresh**:
   ```powershell
   # Hard refresh in browser
   Ctrl + Shift + R  # Windows/Linux
   Cmd + Shift + R   # Mac
   ```

2. **Check browser cache**:
   - F12 → Application → Clear site data
   - Refresh page
   - Try different browser

3. **Verify installation**:
   - Extensions → Manage Extensions
   - Ensure "CRETS4DevOps V2" shows status "Installed"
   - Version should be 2.5.8

**Resolution**: If still not visible, uninstall and reinstall extension.

#### Issue 2: Requirements Disappear After Switching Devices

**Symptoms**:
- Apply requirements on PC A
- Switch to PC B
- Requirements not visible

**Root Cause**: Custom fields not configured or sync not working

**Solutions**:
1. **Verify custom fields exist**:
   ```
   Organization Settings → Process → Custom fields
   Check for: Custom.SustainabilityRequirements
   ```

2. **Check Azure DevOps permissions**:
   - Ensure user has "Edit work items" permission
   - Check Process Template has custom fields enabled

3. **Check browser localStorage**:
   - F12 → Application → localStorage
   - Look for key starting with "crets_"
   - Should contain requirement data

4. **Check sync status**:
   - F12 → Console
   - Look for `[HÍBRIDO]` messages
   - "Cargado desde Azure DevOps" = sync working
   - "Cargado solo desde localStorage" = sync not working

**Resolution**: Ensure custom fields are properly configured in Process Template.

#### Issue 3: Browser Console Errors

**Symptoms**:
- Red errors in F12 console
- Extension functionality limited or broken

**Common Errors & Fixes**:

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot read property of undefined" | Corrupted state | Clear localStorage |
| "401 Unauthorized" | Auth failure | Re-authenticate to Azure DevOps |
| "Failed to fetch" | Network issue | Check internet connection |
| "Quota exceeded" | Storage full | Clear localStorage, reduce requirement size |

**Debugging Steps**:
1. Open F12 Console
2. Look for `[ERROR]` prefix messages
3. Copy full error message
4. Search GitHub issues or troubleshooting guide
5. Try suggested resolution

#### Issue 4: Offline Mode Not Working

**Symptoms**:
- Disconnects from network
- Extension stops working
- Error loading requirements

**Solutions**:
1. **Enable localStorage**:
   - F12 → Application
   - Storage should show "localStorage"
   - Check not full (< 10MB available)

2. **Check offline support**:
   - F12 → Network
   - Disable network (Offline checkbox)
   - Refresh page
   - Extensions should still load from cache

3. **Clear corrupted cache**:
   ```javascript
   // F12 Console
   localStorage.clear();
   location.reload();
   ```

**Resolution**: Ensure requirements were saved to Azure DevOps before going offline.

---

## Rollback Procedures

### Uninstall Extension

1. **Via Azure DevOps**:
   - Organization Settings → Extensions
   - Find "CRETS4DevOps V2"
   - Click **...** → **Uninstall**
   - Confirm uninstall

2. **After Uninstall**:
   - Requirements disappear from Work Item UI
   - Data still stored in Azure DevOps custom fields
   - localStorage data remains in browser

### Rollback from V2.5.8 to V2.5.7

1. **Save current state**:
   - Export any critical requirements
   - Backup Work Items

2. **Uninstall V2.5.8**:
   - Organization Settings → Extensions
   - Uninstall "CRETS4DevOps V2"
   - Wait for confirmation

3. **Install V2.5.7**:
   - Extensions → Browse Marketplace
   - Search "CRETS4DevOps"
   - Select version 2.5.7
   - Click Install

4. **Restore data**:
   - Import previously saved requirements
   - Verify data integrity

### Recovery from Bad State

**If custom fields corrupted or data lost**:

1. **Backup current state**:
   ```powershell
   # Export work items with requirements
   az devops work-item list --organization YourOrg `
     --project YourProject `
     --query "[].fields.'Custom.SustainabilityRequirements'" > backup.json
   ```

2. **Uninstall extension**:
   - Remove all extension references

3. **Clean custom fields**:
   - Delete corrupted custom fields
   - Wait 5 minutes for cleanup

4. **Recreate custom fields**:
   - Create new custom fields with same names
   - Verify structure matches

5. **Restore data**:
   - Re-import backed up requirements
   - Verify integrity

---

## Performance Optimization

### After Deployment

1. **Monitor Extension Load Time**:
   - Open DevTools Network tab
   - Measure load time for extension resources
   - Should complete in < 2 seconds

2. **Check Storage Usage**:
   - F12 → Application → Storage
   - localStorage should use < 500KB initially
   - Will grow as requirements added

3. **Verify Sync Performance**:
   - Apply requirement on one device
   - Measure time to appear on another device
   - Should sync within 5-10 seconds

### Optimization Tips

- **Clear old localStorage**: `localStorage.clear()` if not synced to Azure
- **Limit requirement size**: Keep individual requirement descriptions < 500 chars
- **Archive old Work Items**: Reduces storage overhead
- **Monitor quota**: Ensure Process Template has sufficient custom field limits

---

## Appendix A: Custom Field XML (For TFS On-Premises)

If manually creating custom fields via Process Template XML:

```xml
<!-- Add to WorkItemType.xml -->
<Field name="SustainabilityRequirements" refname="Custom.SustainabilityRequirements" type="LongText">
  <Description>Sustainability requirements applied to this work item</Description>
  <EMPTY/>
</Field>

<Field name="SustainabilityLastModified" refname="Custom.SustainabilityLastModified" type="DateTime">
  <Description>Timestamp of last synchronization with CRETS</Description>
  <EMPTY/>
</Field>

<Field name="SustainabilityVersion" refname="Custom.SustainabilityVersion" type="Text">
  <Description>Version of CRETS that last modified these requirements</Description>
  <EMPTY/>
</Field>

<!-- Add fields to Work Item form -->
<Group Label="Sustainability">
  <Control Label="Requirements" Type="WorkItemClassificationControl" FieldName="Custom.SustainabilityRequirements" />
  <Control Label="Last Modified" Type="FieldControl" FieldName="Custom.SustainabilityLastModified" />
  <Control Label="CRETS Version" Type="FieldControl" FieldName="Custom.SustainabilityVersion" />
</Group>
```

---

## Support & Resources

- **Documentation**: See `docs/INDEX.md`
- **Troubleshooting**: `docs/troubleshooting.md`
- **GitHub Issues**: https://github.com/Rogeliofha/CRETS4DevOps-V3/issues
- **Release Notes**: `RELEASE_NOTES_V2.5.8.md`

---

**Last Updated**: November 23, 2025  
**Version**: V2.5.8  
**Status**: Verified deployment guide