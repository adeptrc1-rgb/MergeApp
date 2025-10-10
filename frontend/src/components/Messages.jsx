@@
 import { MessageCircle, Sparkles, Users, Home, Star, Send } from 'lucide-react';
@@
   const [conversations, setConversations] = useState([]);
   const [loading, setLoading] = useState(true);
+  const [coinflipMap, setCoinflipMap] = useState({}); // matchId -> {set, first, second}
+  const [coinflipToast, setCoinflipToast] = useState(null);
@@
   const loadConversations = async () => {
@@
       setConversations(conversationsWithMessages);
+
+      // Fetch coinflip status for each match; if none set and no messages yet, trigger coinflip
+      const updatedMap = { };
+      for (const c of conversationsWithMessages) {
+        try {
+          const st = await axios.get(`${API}/api/matches/${c.id}/coinflip-status`);
+          if (st.data && st.data.set) {
+            updatedMap[c.id] = st.data;
+          } else {
+            // if no messages yet, auto trigger coinflip once
+            if (!c.lastMessage || c.lastMessage === 'Start the conversation!') {
+              const res = await axios.post(`${API}/api/matches/${c.id}/coinflip`);
+              if (res.data) {
+                updatedMap[c.id] = { set: true, first: res.data.first, second: res.data.second };
+                // show a one-time banner toast
+                const youStart = res.data.first === user.id;
+                setCoinflipToast(youStart ? 'The stars chose you to begin this connection.' : 'Your match will open the conversation first — the cosmos has spoken.');
+                // hide after few seconds
+                setTimeout(() => setCoinflipToast(null), 4000);
+              }
+            }
+          }
+        } catch (e) {
+          // ignore per-conversation failures
+        }
+      }
+      setCoinflipMap(updatedMap);
@@
   return (
     <div className="h-screen bg-black flex flex-col overflow-hidden">
       {/* Header */}
@@
         <div className="max-w-4xl mx-auto px-6 py-4">
           <div className="flex items-center justify-between mb-6">
             <img src="/asign-logo.png" alt="A Sign" className="h-10" />
             <button className="text-white/60 hover:text-white">
               <Sparkles className="w-6 h-6" />
             </button>
           </div>
           <h2 className="text-4xl font-light text-white">Messages</h2>
+          {coinflipToast && (
+            <div className="mt-3 bg-white/5 border border-white/10 text-white/80 rounded-xl px-4 py-2 inline-flex items-center gap-2">
+              <Sparkles className="w-4 h-4 text-purple-300" />
+              <span className="text-sm">{coinflipToast}</span>
+            </div>
+          )}
         </div>
       </div>
@@
               {conversations.map((conversation) => {
                 const age = calculateAge(conversation.user.birth_date);
+                const cf = coinflipMap[conversation.id];
+                const youStart = cf?.set ? (cf.first === user.id) : null;
                 
                 return (
                   <div
                     key={conversation.id}
                     onClick={() => openChat(conversation.id)}
                     className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                   >
@@
                         <h3 className="text-lg font-light text-white">
                           {conversation.user.first_name}, {age}
                         </h3>
-                        <Star className="w-4 h-4 text-purple-400" />
-                        <span className="text-sm text-white/60">{conversation.user.zodiac_sign}</span>
+                        <span className="text-sm text-white/60">{conversation.user.zodiac_sign}</span>
+                        {youStart !== null && (
+                          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${youStart ? 'border-green-400/40 text-green-300' : 'border-white/20 text-white/60'}`}>
+                            {youStart ? 'You start' : 'They start'}
+                          </span>
+                        )}
                       </div>
                       <p className="text-sm text-white/60 truncate">
                         {conversation.lastMessage}
                       </p>
                     </div>
@@