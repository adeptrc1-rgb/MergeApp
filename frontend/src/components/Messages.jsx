@@
   const [conversations, setConversations] = useState([]);
   const [loading, setLoading] = useState(true);
   const [coinflipMap, setCoinflipMap] = useState({}); // matchId -> {set, first, second}
   const [coinflipToast, setCoinflipToast] = useState(null);
+  const [creating, setCreating] = useState(false);
@@
       setConversations(conversationsWithMessages);
@@
       setCoinflipMap(updatedMap);
     } catch (error) {
       console.error('Error loading conversations:', error);
     }
     setLoading(false);
   };
+
+  const createTestMatch = async () => {
+    try {
+      setCreating(true);
+      const res = await axios.post(`${API}/api/matches/test-create`, { compatibility_score: 88 });
+      if (res.data && res.data.match_id) {
+        await loadConversations();
+        setCoinflipToast('✨ A new alignment has arrived. The cosmos will choose who starts.');
+        setTimeout(() => setCoinflipToast(null), 4000);
+      }
+    } catch (e) {
+      alert('Unable to create match');
+    } finally {
+      setCreating(false);
+    }
+  };
@@
           <h2 className="text-4xl font-light text-white">Messages</h2>
           {coinflipToast && (
             <div className="mt-3 bg-white/5 border border-white/10 text-white/80 rounded-xl px-4 py-2 inline-flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-purple-300" />
               <span className="text-sm">{coinflipToast}</span>
             </div>
           )}
+          <div className="mt-3">
+            <button onClick={createTestMatch} disabled={creating} className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/80 hover:bg-white/15 text-sm">
+              {creating ? 'Creating…' : 'Create Test Match (Dev)'}
+            </button>
+          </div>
         </div>
       </div>