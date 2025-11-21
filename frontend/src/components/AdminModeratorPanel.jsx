import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;

/**
 * Extremely simple internal moderator tool for marking users photo-verified.
 *
 * This is not linked from the main nav – you can mount it on a hidden route
 * (e.g., /admin/moderator) and protect access via knowledge of the URL +
 * backend ADMIN_API_KEY header.
 */
export default function AdminModeratorPanel() {
  const [userId, setUserId] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (isVerified) => {
    if (!userId || !adminKey) {
      setStatus({ type: 'error', message: 'User ID and Admin Secret are required.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const response = await axios.post(
        `${API}/admin/users/photo-verification`,
        { user_id: userId, is_verified: isVerified },
        {
          headers: {
            'X-Admin-Secret': adminKey,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      setStatus({ type: 'success', message: `User ${response.data.user_id} verification set to ${response.data.is_photo_verified}` });
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Request failed';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-700 rounded-2xl p-6 shadow-xl">
        <h1 className="text-xl font-semibold mb-1">Moderator: Photo Verification</h1>
        <p className="text-xs text-zinc-400 mb-6">
          Internal tool for marking users as photo verified. Requires the backend ADMIN_API_KEY
          via the X-Admin-Secret header.
        </p>

        <label className="block text-xs text-zinc-300 mb-1">User ID</label>
        <input
          className="w-full mb-4 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm outline-none focus:border-indigo-500"
          placeholder="paste user id here"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <label className="block text-xs text-zinc-300 mb-1">Admin Secret (X-Admin-Secret)</label>
        <input
          type="password"
          className="w-full mb-4 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm outline-none focus:border-indigo-500"
          placeholder="admin key"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
        />

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleVerify(true)}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Mark Verified'}
          </button>
          <button
            type="button"
            onClick={() => handleVerify(false)}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Revoke'}
          </button>
        </div>

        {status && (
          <div
            className={`text-xs px-3 py-2 rounded-lg border ${
              status.type === 'success'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10'
                : 'border-red-500 text-red-300 bg-red-500/10'
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
