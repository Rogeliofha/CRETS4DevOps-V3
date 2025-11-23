# Troubleshooting Guide - CRETS4DevOps V2.5.8

Comprehensive diagnostic and problem-solving guide for CRETS4DevOps extension.

## Quick Diagnostics

### Enable Diagnostic Mode
Open browser console (F12) and run:
```javascript
// Enable verbose logging
localStorage.setItem('CRETS_DEBUG', 'true');
location.reload();
```

Then check console for `[HÍBRIDO]` messages showing sync status.

---

## Issue Categories

1. [Extension Loading Issues](#extension-loading-issues)
2. [Data Synchronization Problems](#data-synchronization-problems)
3. [Storage & Offline Issues](#storage--offline-issues)
4. [Multi-Device Sync Issues](#multi-device-sync-issues)
5. [Browser Compatibility](#browser-compatibility)
6. [Performance Issues](#performance-issues)
7. [Azure DevOps Integration](#azure-devops-integration)

---

## Extension Loading Issues

### Problem: Extension Doesn't Appear in Work Item

**Symptoms**:
- Sustainability Requirements tab missing
- No UI visible in Work Item
- No errors in console

**Quick Diagnostics**:
```javascript
// F12 Console
console.log("Extension loaded:", !!document.querySelector('[class*="crets"]'));
console.log("React available:", !!window.React);
```

**Troubleshooting Steps**:

1. **Step 1: Force Hard Refresh**
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```
   - Hard refresh bypasses browser cache
   - Waits 30 seconds

2. **Step 2: Clear Browser Cache**
   - F12 → Application → Storage
   - Click "Clear site data"
   - Close browser completely
   - Reopen and visit Azure DevOps

3. **Step 3: Try Different Browser**
   - Try Chrome, Edge, Firefox
   - If works in different browser → cache issue
   - If fails in all browsers → installation issue

4. **Step 4: Verify Extension Installation**
   - Azure DevOps → Organization Settings
   - Extensions → Manage extensions
   - Search "CRETS4DevOps"
   - Check: Status = "Installed", Version = "2.5.8"

5. **Step 5: Check Browser Developer Tools**
   - F12 → Console
   - Look for error messages (red text)
   - Look for warnings (yellow text)
   - Note any messages and refer to [Console Error Reference](#console-error-reference)

**Solution**: 
- If verified installed → Hard refresh browser
- If not installed → Reinstall from Extensions marketplace
- If errors → See [Console Error Reference](#console-error-reference)

---

### Problem: Console Error on Load

**Symptoms**:
- Red error in F12 console
- Extension may or may not load
- Specific error message displayed

**Referencing Error**: Jump to [Console Error Reference](#console-error-reference)

---

### Problem: White Blank Space (UI Not Rendering)

**Symptoms**:
- Extension loads but shows blank/white area
- No error messages in console
- No requirements visible

**Troubleshooting**:

1. **Check React Rendering**:
   ```javascript
   // F12 Console
   console.log("React version:", React.version);
   console.log("ReactDOM mounted:", !!ReactDOM._root);
   ```

2. **Inspect DOM**:
   - F12 → Elements tab
   - Right-click blank area
   - Select "Inspect element"
   - Look for `<div id="crets-root">`

3. **Check for JavaScript Errors**:
   - F12 → Console
   - Scroll up for any errors
   - Note error message exactly

4. **Try Incognito Mode**:
   - Open Azure DevOps in Incognito window
   - No extensions or cache interference
   - If works → Browser profile corrupted
   - If fails → Deeper issue

**Solution**:
- Clear cache and restart (Step 2 above)
- Try different browser
- If issue persists → Check [Browser Compatibility](#browser-compatibility)

---

## Data Synchronization Problems

### Problem: Requirements Disappear After Switching Devices

**Symptoms** (Classic V2.5.5 Bug):
- Apply requirements on PC A → Work properly
- Switch to PC B → Requirements gone
- Only happens with different computer

**Root Cause** (V2.5.5):
- localStorage is device/browser specific
- Not automatically synced across machines
- No backup in cloud

**Verification** (V2.5.6+ Should Not Occur):
```javascript
// F12 Console
// This should NOT happen in V2.5.6+
localStorage.clear(); // Never run this unless lost data
```

**Troubleshooting** (If Still Occurring):

1. **Verify Version**:
   - Organization Settings → Extensions
   - Check version is 2.5.8 (not older)
   - If older → Upgrade to V2.5.8

2. **Check Custom Fields Configured**:
   - Organization Settings → Process → Custom fields
   - Look for: `Custom.SustainabilityRequirements`
   - If missing → Configure as per [Deployment Guide](./deployment-guide.md)

3. **Verify Sync Actually Working**:
   ```javascript
   // F12 Console on PC A
   const storage = new window.HybridWorkItemStorage();
   storage.diagnoseSyncStatus().then(status => {
     console.table(status);
   });
   ```
   - Look for "Azure DevOps sync status: SUCCESS"
   - If "FALLBACK_MODE" → Custom fields not working

4. **Check Network Connectivity**:
   - F12 → Network tab
   - Apply requirement
   - Look for XHR request to "dev.azure.com"
   - Should see `200` (success) or `201` (created) status
   - If `401` or `403` → Auth issue
   - If `404` → Custom field not found

5. **On PC B, Force Reload**:
   - Navigate to Work Item
   - F12 → Network tab clear
   - Press F5 (refresh)
   - Watch for XHR requests loading from Azure DevOps
   - Requirements should appear

**Solution**:
- V2.5.6+: Configure custom fields in Process Template
- Ensure network connectivity works
- Verify authentication to Azure DevOps
- If still failing → See [Azure DevOps Integration](#azure-devops-integration)

---

### Problem: Changes Not Syncing to Azure DevOps

**Symptoms**:
- Edit requirement locally
- Change doesn't appear on other device
- Console shows localStorage saves only

**Diagnostics**:
```javascript
// F12 Console
const storage = new window.HybridWorkItemStorage();
storage.diagnoseSyncStatus().then(status => {
  console.log("Sync Status:");
  console.table(status);
  // Look for "syncStatus": "FALLBACK_MODE"
});
```

**Troubleshooting**:

1. **Check Network Request**:
   - F12 → Network tab
   - Apply/edit requirement
   - Look for XHR POST request
   - URL should contain "work-item-updates"
   - If no request → Sync not attempted

2. **Verify Permissions**:
   - Ensure user has "Edit work items" permission
   - Organization Settings → Permissions
   - Check if user is member of project

3. **Check Custom Field Mapping**:
   ```
   Organization Settings → Process
   Work item type → Custom fields
   Verify: Custom.SustainabilityRequirements exists
   Verify: Visible on form (if needed)
   ```

4. **Monitor Console for Errors**:
   - Apply requirement
   - Watch F12 Console
   - Look for error messages
   - Note exact error text

5. **Test with Simple Data**:
   - Try adding single character `X`
   - See if syncs
   - If yes → Data size issue
   - If no → Sync configuration issue

**Solution**:
- Verify custom fields exist and are correct type
- Ensure user permissions allow editing
- Check network requests are being sent
- If network request fails → See [Azure DevOps Integration](#azure-devops-integration)

---

## Storage & Offline Issues

### Problem: "Quota exceeded" Error

**Symptoms**:
- Error when saving requirement
- Message: "QuotaExceededError" or "Quota exceeded"
- Especially on devices with many requirements

**Cause**:
- Browser localStorage has ~5-10MB limit per site
- Too many requirements or large descriptions stored
- Not synced to cloud so taking local space

**Troubleshooting**:

1. **Check Current Storage Usage**:
   ```javascript
   // F12 Console
   function getStorageSize() {
     let total = 0;
     for (let key in localStorage) {
       if (localStorage.hasOwnProperty(key)) {
         total += localStorage[key].length + key.length;
       }
     }
     return (total / 1024).toFixed(2) + ' KB';
   }
   console.log("Storage used:", getStorageSize());
   ```

2. **Identify Large Items**:
   ```javascript
   // Find largest stored items
   const sizes = [];
   for (let key in localStorage) {
     if (localStorage.hasOwnProperty(key) && key.startsWith('crets_')) {
       const size = localStorage[key].length;
       sizes.push({key: key, sizeKB: (size/1024).toFixed(2)});
     }
   }
   console.table(sizes.sort((a,b) => b.sizeKB - a.sizeKB));
   ```

3. **Clean Up Old Data**:
   ```javascript
   // Remove old cached requirements (careful!)
   const keysToRemove = [];
   for (let key in localStorage) {
     if (key.startsWith('crets_old_') || key.startsWith('crets_archive_')) {
       keysToRemove.push(key);
     }
   }
   keysToRemove.forEach(key => localStorage.removeItem(key));
   console.log("Cleaned up", keysToRemove.length, "old items");
   ```

4. **Emergency: Clear Cache** (Data Loss Risk):
   ```javascript
   // WARNING: This will clear ALL cached requirements
   // Only do if:
   // 1. Multi-device sync is working (data safe in Azure)
   // 2. No important local-only edits pending
   if (confirm('Clear all CRETS cache? (Will lose local edits)')) {
     for (let key in localStorage) {
       if (key.startsWith('crets_')) {
         localStorage.removeItem(key);
       }
     }
     location.reload();
   }
   ```

**Solutions**:
- Sync frequently to Azure DevOps (reduces local cache)
- Reduce requirement description length
- Archive old completed work items
- Clear cache when safe (after sync confirmed)

---

### Problem: Offline Mode Not Working

**Symptoms**:
- Internet disconnected
- Extension stops working
- Error loading requirements
- No fallback to cache

**Troubleshooting**:

1. **Verify localStorage Is Enabled**:
   - F12 → Application tab
   - Left sidebar under "Storage"
   - Look for "Local Storage"
   - If missing → Disabled in browser settings

2. **Check Storage Has Cached Data**:
   ```javascript
   // F12 Console
   const cached = Object.keys(localStorage).filter(k => k.startsWith('crets_'));
   console.log("Cached items:", cached.length);
   if (cached.length === 0) {
     console.warn("No cached data! Load requirements while online first.");
   }
   ```

3. **Test Offline Mode**:
   - F12 → Network tab
   - Check "Offline" checkbox (top left)
   - Refresh page
   - Extension should load from cache
   - Requirements should be visible (but read-only)

4. **Check for Network Errors**:
   - F12 → Network tab (Offline mode)
   - Look for red requests (failed)
   - Should show as "(failed)" status
   - This is OK - fallback to cache

5. **Force Offline Mode Manually**:
   ```javascript
   // Simulate offline
   localStorage.setItem('CRETS_FORCE_OFFLINE', 'true');
   location.reload();
   // Remove this after testing
   localStorage.removeItem('CRETS_FORCE_OFFLINE');
   ```

**Solutions**:
- Load requirements while online first
- localStorage must be enabled
- Check network connectivity restored
- If still failing → Clear cache and reload

---

### Problem: Cached Data Seems Corrupted

**Symptoms**:
- Requirements showing duplicates or corrupted text
- Strange characters or encoding issues
- Inconsistent data across refreshes

**Troubleshooting**:

1. **Export Current Data** (For reference):
   ```javascript
   // Save current state before clearing
   const backup = {};
   for (let key in localStorage) {
     if (key.startsWith('crets_')) {
       backup[key] = localStorage[key];
     }
   }
   console.log(JSON.stringify(backup));
   // Copy output and save to file
   ```

2. **Verify Data Integrity**:
   ```javascript
   // Check if JSON is valid
   for (let key in localStorage) {
     if (key.startsWith('crets_')) {
       try {
         JSON.parse(localStorage[key]);
         console.log(key + ": OK");
       } catch (e) {
         console.warn(key + ": CORRUPTED - " + e.message);
       }
     }
   }
   ```

3. **Clear Corrupted Items**:
   ```javascript
   // Remove only corrupted items (safe)
   for (let key in localStorage) {
     if (key.startsWith('crets_')) {
       try {
         JSON.parse(localStorage[key]);
       } catch (e) {
         console.log("Removing corrupted:", key);
         localStorage.removeItem(key);
       }
     }
   }
   location.reload();
   ```

**Solutions**:
- Clear corrupted cache items
- Reload data from Azure DevOps
- If corruption persists → Full cache clear (see above)

---

## Multi-Device Sync Issues

### Problem: Sync Works on PC A but Not PC B

**Symptoms**:
- Changes sync FROM PC A to PC B ✅
- Changes from PC B don't reach PC A ❌
- One-way sync only

**Troubleshooting**:

1. **Verify Both PCs Have Custom Fields**:
   - On both PCs, check:
   - Organization Settings → Process → Custom fields
   - Look for: `Custom.SustainabilityRequirements`
   - Should be identical on both

2. **Check Permissions on PC B**:
   - Different user account?
   - Verify has "Edit work items" permission
   - Verify can manually edit work items

3. **Monitor Sync on PC B**:
   ```javascript
   // F12 Console on PC B
   const storage = new window.HybridWorkItemStorage();
   storage.diagnoseSyncStatus().then(status => {
     console.table(status);
     // Check "syncWriteStatus" and "lastSyncTime"
   });
   ```

4. **Watch Network Requests**:
   - F12 → Network tab
   - Edit requirement on PC B
   - Look for XHR POST request
   - If no request → Sync not attempted
   - If request fails → See error code

5. **Check Browser Differences**:
   - PC A: Chrome version X?
   - PC B: Firefox version Y?
   - Different browsers can have issues
   - Try same browser on both

**Solutions**:
- Verify permissions identical on both PCs
- Use same browser on both machines
- Check custom fields are fully synced
- If permission issue → Admin configures fields

---

### Problem: Sync Conflicts When Editing Simultaneously

**Symptoms**:
- Both PCs edit requirement at same time
- Data appears corrupted or mixed
- Unclear which version is correct

**How Conflicts Handled**:
- CRETS uses "last write wins" strategy
- Timestamp-based resolution
- Azure DevOps value is authoritative

**Troubleshooting**:

1. **Check Conflict Resolution**:
   ```javascript
   // F12 Console
   const storage = new window.HybridWorkItemStorage();
   storage.diagnoseSyncStatus().then(status => {
     console.log("Last sync time:", status.lastSyncTime);
     console.log("Last modified:", status.lastModified);
     console.log("Version:", status.version);
   });
   ```

2. **Verify Azure DevOps Value is Correct**:
   - Open Work Item in browser on THIRD device
   - Check custom field value
   - This is "source of truth"

3. **Sync Manually**:
   ```javascript
   // Force refresh from Azure DevOps
   const storage = new window.HybridWorkItemStorage();
   storage.loadFromAzureDevOps().then(() => {
     console.log("Reloaded from Azure DevOps");
     location.reload();
   });
   ```

**Solutions**:
- Azure DevOps value is always correct
- Refresh page to see latest from cloud
- Avoid simultaneous edits on same requirement
- Implement team workflow for editing

---

## Browser Compatibility

### Supported Browsers

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | Latest 2 | ✅ Fully Supported | Recommended |
| Edge | Latest 2 | ✅ Fully Supported | Recommended |
| Firefox | Latest 2 | ✅ Fully Supported | Compatible |
| Safari | Latest 2 | ⚠️ Limited | localStorage may be limited |
| IE 11 | Any | ❌ Not Supported | Too old, use Chrome/Edge |

### Problem: Works in Chrome but Not Firefox

**Troubleshooting**:

1. **Check Add-ons/Extensions**:
   - Firefox menu → Add-ons
   - Disable ad blockers
   - Disable privacy extensions
   - Reload Azure DevOps

2. **Clear Firefox Cache**:
   - Firefox menu → Settings → Privacy
   - Click "Clear Data"
   - Select "Cookies and Site Data"
   - Click Clear
   - Reload

3. **Check CORS Headers**:
   - F12 → Network tab
   - Look for failed requests
   - Check response headers
   - If CORS error → Browser security issue

4. **Try Private/Incognito Window**:
   - Open Azure DevOps in Private window
   - No add-ons, clean state
   - If works → Add-on conflict

**Solution**:
- Disable browser extensions
- Clear browser cache
- Try alternate browser
- If still failing → See [Azure DevOps Integration](#azure-devops-integration)

---

## Performance Issues

### Problem: Extension Loads Slowly

**Symptoms**:
- Takes > 5 seconds to load
- Work Item form becomes unresponsive
- Freezes temporarily

**Troubleshooting**:

1. **Measure Load Time**:
   - F12 → Performance tab
   - Clear recordings
   - Reload page
   - Stop recording
   - Look for long tasks
   - Check duration (should be < 2 seconds)

2. **Check Network Tab**:
   - F12 → Network tab
   - Reload page
   - Look for slow requests
   - Sort by "Time" column
   - Identify bottleneck requests

3. **Check Local Storage Size**:
   - See [Storage Issues](#problem-quota-exceeded-error) above
   - Large cache slows loading
   - Clear old data

4. **Monitor CPU Usage**:
   - F12 → Performance
   - Run profile
   - Check for high CPU tasks
   - Look for heavy JavaScript processing

**Solutions**:
- Clear old cached data
- Reduce number of cached requirements
- Verify network connection is fast
- Try different device/browser

---

### Problem: Editing Is Slow or Laggy

**Symptoms**:
- Typing requirement description is slow
- Delays between key press and character appearing
- UI feels unresponsive

**Troubleshooting**:

1. **Check Browser Performance**:
   - Close other browser tabs
   - Restart browser
   - Check if other sites are slow
   - If slow everywhere → Browser issue

2. **Check Device Resources**:
   - Monitor CPU usage (Task Manager)
   - Monitor RAM usage
   - Close background apps
   - Restart device if needed

3. **Check Network Latency**:
   - F12 → Network tab
   - Look at request times
   - Should be < 100ms
   - If > 1000ms → Network issue

4. **Profile JavaScript Execution**:
   - F12 → Performance tab
   - Start recording
   - Edit requirement
   - Stop recording
   - Look for long tasks

**Solutions**:
- Close unnecessary browser tabs/apps
- Check internet speed
- Restart browser
- Use faster device if available

---

## Azure DevOps Integration

### Problem: 401 Unauthorized Error

**Symptoms**:
- "401 Unauthorized" in network requests
- Can't save requirements
- Error mentions authentication

**Cause**:
- Authentication token expired
- Not logged in to Azure DevOps
- Session timeout

**Troubleshooting**:

1. **Re-authenticate**:
   - Close Azure DevOps tab
   - Clear browser cookies
   - Reopen Azure DevOps
   - Log in again

2. **Check Session**:
   - F12 → Application → Cookies
   - Look for cookie named "vsts"
   - Should be present and valid
   - If missing → Not authenticated

3. **Try Private Window**:
   - Open Azure DevOps in Private/Incognito window
   - Log in
   - Navigate to Work Item
   - Try to save requirement
   - If works → Cookie issue

**Solution**:
- Re-authenticate to Azure DevOps
- Clear browser cookies
- Try private window to isolate issue

---

### Problem: 403 Forbidden Error

**Symptoms**:
- "403 Forbidden" in network requests
- Can read but not write requirements
- Permission-related error

**Cause**:
- Insufficient permissions
- Not member of project
- Custom field not visible to user

**Troubleshooting**:

1. **Verify Project Membership**:
   - Organization Settings → Projects
   - Click your project
   - Look for your username
   - Should be listed as member

2. **Check Work Item Permissions**:
   - Organization Settings → Permissions
   - Search for your user
   - Verify "Edit work items" is enabled
   - Verify "Create work items" is enabled

3. **Check Custom Field Visibility**:
   - Organization Settings → Process
   - Select your process
   - Select Work Item type
   - Check if custom fields are visible
   - May need to add to form

4. **Test as Different User**:
   - Log out
   - Log in as different user with admin rights
   - Try to save requirement
   - If works → Permission issue with first user
   - If fails → Custom field issue

**Solution**:
- Admin adds user to project
- Admin enables necessary permissions
- Admin ensures custom fields visible in form

---

### Problem: Custom Field Not Found

**Symptoms**:
- "Field not found" error
- Requirements not syncing to Azure DevOps
- Fallback to localStorage only

**Cause**:
- Custom field not created
- Custom field named incorrectly
- Custom field not deployed to work item type

**Troubleshooting**:

1. **Verify Field Exists**:
   ```
   Organization Settings → Process → Custom fields
   Search for: "SustainabilityRequirements"
   Should appear in list
   ```

2. **Check Field Name Exactly**:
   - Field name must be exactly: `SustainabilityRequirements`
   - System name will be: `Custom.SustainabilityRequirements`
   - Case sensitive!

3. **Verify Field on Work Item Type**:
   - Organization Settings → Process
   - Select your process
   - Select Work Item type (User Story, Bug, Task, etc.)
   - Click on field name
   - Check if "Required", "Optional", or "Not on form"

4. **Verify Field Type**:
   - Field type must be "Text (large)" or "Long Text"
   - Not "Text (small)" or "Single line"
   - Check in Custom fields list

**Solution**:
- Create custom fields if missing (see [Deployment Guide](./deployment-guide.md))
- Verify field names are correct
- Add fields to Work Item form if needed

---

## Console Error Reference

Common error messages and solutions:

### "Cannot read property 'xxx' of undefined"
**Cause**: Object doesn't exist or is null  
**Solution**: Refresh page, clear cache, restart browser

### "QuotaExceededError"
**Cause**: localStorage full  
**Solution**: Clear old data (see [Storage Issues](#storage--offline-issues))

### "Failed to fetch"
**Cause**: Network error or CORS issue  
**Solution**: Check internet connection, refresh page

### "401 Unauthorized"
**Cause**: Authentication expired  
**Solution**: Re-authenticate to Azure DevOps

### "404 Not Found"
**Cause**: Custom field or API endpoint doesn't exist  
**Solution**: Verify custom fields configured

### "Invalid JSON"
**Cause**: Corrupted stored data  
**Solution**: Clear corrupted items from localStorage

---

## Getting Help

### Before Contacting Support

1. **Collect Diagnostics**:
   ```javascript
   // F12 Console - save output
   const storage = new window.HybridWorkItemStorage();
   storage.diagnoseSyncStatus().then(status => {
     console.log(JSON.stringify(status, null, 2));
   });
   ```

2. **Save Console Logs**:
   - F12 → Console
   - Select all text (Ctrl+A)
   - Copy to file
   - Include with support request

3. **Describe Steps to Reproduce**:
   - Exactly what were you doing?
   - What went wrong?
   - What did you expect?

### Contact Information
- **GitHub Issues**: https://github.com/Rogeliofha/CRETS4DevOps-V3/issues
- **Documentation**: See `docs/INDEX.md`
- **Release Notes**: `RELEASE_NOTES_V2.5.8.md`

---

**Last Updated**: November 23, 2025  
**Version**: V2.5.8  
**Status**: Comprehensive troubleshooting guide