# 🔥 FORCE CACHE CLEAR - FIX NON-WORKING LINKS

## The Problem
Your browser/PWA has cached old JavaScript code. Even though the links are fixed on the server, your device is still running the old code.

## ✅ CONFIRMED WORKING (Server-Side)
All these links have been tested and ARE working:
- ✅ Super Likes "GET MORE" → `/store`
- ✅ Pulse³ "GET MORE" → `/store`
- ✅ Auras "EXPLORE" → `/store?tab=skins`
- ✅ Bottom nav tabs (all 5 tabs)

## 🔧 Solutions (Try in Order)

### Solution 1: Hard Refresh (Try First)
**iPhone Safari:**
1. Open the app in Safari
2. Tap the refresh button and HOLD IT
3. Select "Request Desktop Website"
4. Then refresh again
5. Switch back to mobile view

**Android Chrome:**
1. Open Chrome menu (3 dots)
2. Settings → Privacy and Security
3. Clear browsing data
4. Select "Cached images and files"
5. Clear data
6. Close browser completely
7. Reopen app

**Desktop:**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

### Solution 2: Clear Service Worker (More Aggressive)
**Chrome/Edge:**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Service Workers" in left sidebar
4. Click "Unregister" next to merge-dating worker
5. Close DevTools
6. Hard refresh the page

**Safari:**
1. Safari → Preferences → Privacy
2. Click "Manage Website Data"
3. Search for your app URL
4. Remove all data
5. Close and reopen Safari

### Solution 3: Reinstall PWA (If Installed on Home Screen)
1. Delete the app from your home screen
2. Open browser (Safari/Chrome)
3. Visit the app URL
4. Install fresh copy to home screen

### Solution 4: Clear All Browser Data (Nuclear Option)
**iPhone:**
1. Settings → Safari
2. Scroll down to "Clear History and Website Data"
3. Confirm
4. Reopen app

**Android:**
1. Settings → Apps → Chrome
2. Storage → Clear Storage
3. Confirm
4. Reopen app

---

## 🧪 How to Test If Cache is Cleared

After clearing cache, test each link:

1. **Go to Profile page**
2. **Tap "Super Likes" GET MORE button**
   - Should navigate to Store page
3. **Go back to Profile**
4. **Tap "Auras" EXPLORE button**
   - Should navigate to Store > Skins tab
5. **Tap bottom nav tabs**
   - Each should navigate to correct page

If ANY of these still don't work after trying all solutions above, there's a different issue.

---

## 💡 Why This Happens

PWAs (Progressive Web Apps) cache everything for offline use. This is normally good, but when code is updated, the cache needs to be cleared to see changes.

The service worker cache has been updated from `v1` to `v2-profile-fix`, which should auto-clear on next load, but aggressive caching might prevent this.

---

## ✅ Verification Checklist

After clearing cache, you should see:
- [ ] Bottom navigation bar fully visible on Profile page
- [ ] Super Likes "GET MORE" button navigates to Store
- [ ] Pulse³ "GET MORE" button navigates to Store
- [ ] Auras "EXPLORE" button navigates to Store Skins tab
- [ ] All bottom nav tabs (Explore, Trending, Connections, Messages) work from Profile

If all checked ✅, the cache is cleared and everything is working!
