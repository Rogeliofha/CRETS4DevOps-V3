# Quick Start Guide - CRETS4DevOps V2.5.8

Get up and running with CRETS4DevOps in 5 minutes.

## 5-Minute Setup

### Step 1: Installation (2 minutes)
1. Go to Azure DevOps organization settings
2. Click **Extensions** → **Browse Marketplace**
3. Search for **"CRETS4DevOps"**
4. Click **Get it free** → **Install**
5. Refresh your browser

### Step 2: Access the Extension (1 minute)
1. Open any **Work Item** in your project
2. Look for the **"Sustainability Requirements"** tab
3. If not visible, press **Refresh** (F5)
4. You're ready to go! ✅

### Step 3: Apply Your First Requirement (2 minutes)
1. Click **"Sustainability Requirements"** tab
2. You'll see available requirement categories
3. **Select** requirements you want to apply
4. Click **"Apply"** or **"Save"**
5. Requirements now visible in this Work Item ✅

---

## Basic Usage

### Applying Requirements

```
1. Open Work Item
2. Go to "Sustainability Requirements" tab
3. Browse requirement categories:
   • Economic Sustainability
   • Environmental Sustainability
   • Social Sustainability
4. Check boxes to select requirements
5. Click "Apply" button
6. Done! ✅
```

### Editing Requirements

```
1. Click on a requirement to edit
2. Modify the description
3. Click "Save" button
4. Changes saved automatically ✅
```

### Removing Requirements

```
1. Find requirement in list
2. Click "Remove" or "X" button
3. Click "Confirm"
4. Requirement removed ✅
```

### Checking Sync Status

Press **F12** (open Developer Tools) and look at Console:
- `[HÍBRIDO] Datos guardados en Azure DevOps` = ✅ Synced to cloud
- `[HÍBRIDO] Guardado solo en localStorage` = ⚠️ Local only (not synced yet)

---

## Common Questions

### Q: Where are my requirements saved?
**A**: Two places for safety:
- **Cloud**: Azure DevOps (if synced)
- **Browser**: localStorage (automatic backup)

Both locations keep your data safe!

### Q: Will my requirements sync to my other computer?
**A**: 
- **YES** (V2.5.6+) if custom fields are configured
- **NO** (V2.5.5 or earlier) - upgrade to V2.5.8

Just log in on your other computer and open the Work Item!

### Q: Can I edit requirements offline?
**A**: 
- **YES** - Works without internet
- Changes save locally and sync when back online

### Q: How do I clear or reset requirements?
**A**:
1. Click requirement in list
2. Click "Remove" button
3. Confirm deletion
4. Done!

---

## Verification Checklist

After installation, verify everything works:

- [ ] Extension appears in Work Item tab
- [ ] Can see requirement categories
- [ ] Can select requirements
- [ ] Can save requirements
- [ ] Requirements visible after refresh
- [ ] F12 console shows `[HÍBRIDO]` messages

**All checked?** You're ready! ✅

---

## Next Steps

### For Power Users
- See **[User Guide](./user-guide.md)** for advanced features
- See **[Troubleshooting](./troubleshooting.md)** if issues arise

### For Administrators
- See **[Deployment Guide](./deployment-guide.md)** for setup
- See **[Configuration Guide](./configuration.md)** for custom fields

### For Developers
- See **[Technical Architecture](./technical-architecture.md)**
- See **[Hybrid Storage System](./hybrid-storage-system.md)**

---

## Performance Tips

1. **Fast loading**: Requirements load in < 2 seconds
2. **Offline support**: Works without internet connection
3. **Multi-device**: Syncs across computers automatically
4. **No data loss**: Saved in two places (cloud + browser)

---

## Troubleshooting Quick Fixes

### Extension not showing?
- Hard refresh: `Ctrl + Shift + R`
- Clear cache: F12 → Application → Clear Storage
- Restart browser

### Requirements disappeared?
- Refresh page: F5
- Check sync status: F12 → Console (look for `[HÍBRIDO]`)
- Verify internet connection

### Can't save changes?
- Check internet connection
- Try refreshing page
- Verify permissions (must have "Edit work items")

---

## Support

- **Full Guide**: See `docs/INDEX.md` for complete documentation
- **Issues**: Visit https://github.com/Rogeliofha/CRETS4DevOps-V3/issues
- **Help**: See `troubleshooting.md` for problem solving

---

**Version**: V2.5.8  
**Last Updated**: November 23, 2025  
**Ready to use!** ✅