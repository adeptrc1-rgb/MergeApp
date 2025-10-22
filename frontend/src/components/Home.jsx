import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNav from './BottomNav';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;
axios.defaults.withCredentials = true;

export default function Home() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/users/potential-matches`);
        setMatches(Array.isArray(res.data) ? res.data : (res.data.matches || []));
      } catch (e) {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">Loading…</div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <div className="p-4 border-b border-white/10"> <h2 className="text-2xl font-light">Home</h2> </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {matches.length === 0 ? (
          <div className="text-white/60">No matches yet.</div>
        ) : (
          matches.map((m) => (
            <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xl font-light">{m.first_name} {m.last_name}</div>
              <div className="text-white/60 text-sm">{m.zodiac_sign} • {m.compatibility_score}%</div>
            </div>
          ))
        )}
      </div>
      <BottomNav currentTab="home" navigate={navigate} />
    </div>
  );
}
