# 🔵 FACEBOOK LOGIN INTEGRATION - SETUP GUIDE

## ✅ Implementation Complete!

Facebook OAuth login has been integrated into your Merge dating app. Follow these steps to activate it:

---

## 📋 STEP 1: Create Facebook App

1. Go to https://developers.facebook.com/apps/
2. Click **"Create App"**
3. Select **"Consumer"** as app type
4. Name your app: **"Merge Dating App"**
5. Click **"Create App"**

---

## 🔑 STEP 2: Get Your API Keys

1. In Facebook App Dashboard, go to **Settings → Basic**
2. Copy your **App ID** and **App Secret**
3. Save them securely!

---

## ⚙️ STEP 3: Configure Your App

### **Add Redirect URIs:**
1. Go to **Products → Facebook Login → Settings**
2. Add these URLs to **"Valid OAuth Redirect URIs"**:
   ```
   http://localhost:3000
   https://merge-elite-app.preview.emergentagent.com
   ```

### **Add App Domains:**
1. Go to **Settings → Basic**
2. In **"App Domains"**, add:
   ```
   localhost
   merge-datingapp.preview.emergentagent.com
   ```

### **Enable Settings:**
1. Go to **Facebook Login → Settings**
2. Enable **"Client OAuth Login"**
3. Enable **"Web OAuth Login"**

---

## 🔧 STEP 4: Add API Keys to Your App

### **Frontend (.env):**
Open `/app/frontend/.env` and replace:
```
REACT_APP_FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID_HERE
```

With your actual App ID:
```
REACT_APP_FACEBOOK_APP_ID=1234567890123456
```

### **Backend (.env):**
Open `/app/backend/.env` and replace:
```
FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID_HERE
FACEBOOK_APP_SECRET=YOUR_FACEBOOK_APP_SECRET_HERE
```

With your actual credentials:
```
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=your_app_secret_here_keep_this_secret
```

---

## 🚀 STEP 5: Restart Your App

```bash
# Restart backend
sudo supervisorctl restart backend

# Restart frontend
sudo supervisorctl restart frontend
```

---

## ✅ STEP 6: Test Facebook Login

1. Open your app: `http://localhost:3000`
2. You'll see the login page with:
   - **"Continue with Facebook"** button (blue, Facebook branded)
   - **"Test Login"** button (for quick testing)
3. Click **"Continue with Facebook"**
4. Authorize the app when Facebook prompts you
5. You'll be logged in and redirected to `/home`!

---

## 🎯 What Happens Behind the Scenes:

1. **User clicks Facebook button** → Opens Facebook OAuth dialog
2. **User authorizes** → Facebook returns access token to frontend
3. **Frontend sends token** → POST to `/api/auth/facebook/login`
4. **Backend verifies token** → Calls Facebook Graph API
5. **Backend gets user data** → Creates/updates user in MongoDB
6. **Backend creates session** → Sets secure cookie
7. **User redirected to app** → Logged in!

---

## 📊 User Data Captured from Facebook:

```javascript
{
  facebook_id: "123456789",
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
  photos: ["https://facebook.com/profile_pic.jpg"],
  // Plus all default Merge app fields
}
```

---

## 🔒 Security Features:

✅ **Facebook token verified server-side** (never trust client)
✅ **Session cookies** (HttpOnly, Secure in production)
✅ **User data validation** (Pydantic models)
✅ **CORS configured** (only your domains allowed)
✅ **Secure password hashing** (if adding password login later)

---

## 🐛 Troubleshooting:

**"App ID not configured" warning on login page:**
- You need to add your Facebook App ID to `/app/frontend/.env`
- Make sure to restart frontend after changing .env

**"Invalid Facebook token" error:**
- Check that your App Secret is correct in `/app/backend/.env`
- Verify your app is not in "Development Mode" restrictions
- Check Facebook App Dashboard for any errors

**CORS errors:**
- Verify your domain is in "App Domains" in Facebook settings
- Check redirect URIs match exactly

**User not logged in after clicking Facebook:**
- Check browser console for errors
- Verify backend endpoint is working: `curl http://localhost:8000/api/auth/health`
- Check that cookies are being set (browser DevTools → Application → Cookies)

---

## 📝 Files Modified:

✅ `/app/backend/server.py` - Added Facebook login endpoint
✅ `/app/backend/.env` - Added Facebook credentials placeholders
✅ `/app/frontend/.env` - Added Facebook App ID placeholder
✅ `/app/frontend/src/components/FacebookLoginButton.jsx` - New component
✅ `/app/frontend/src/components/SimpleLogin.jsx` - Added Facebook button

---

## 🎉 Next Steps:

1. **Get Facebook App ID and Secret** (follow Step 1-2 above)
2. **Add them to .env files** (Step 4)
3. **Restart services** (Step 5)
4. **Test login** (Step 6)
5. **Deploy to production** (use HTTPS redirect URIs)

---

**Status:** ✅ Facebook Login Integration Complete - Ready for API Keys!
