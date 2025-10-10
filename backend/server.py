@@
 @api_router.get("/matches/{match_id}/coinflip-status")
 async def matches_coinflip_status(match_id: str, user: User = Depends(get_current_user)):
     ev = await db.coinflip_events.find_one({"match_id": match_id}, sort=[("created_at", -1)])
     if not ev:
         return {"set": False}
     return {"set": True, "first": ev.get("user_first_id"), "second": ev.get("user_second_id"), "created_at": ev.get("created_at")}
+
+# -------------------------------------
+# Minimal Matches API for testing coinflip
+# -------------------------------------
+def pick_partner_fields(u: dict) -> dict:
+    return {
+        "id": u.get("id"),
+        "first_name": u.get("first_name") or (u.get("name") or "Partner").split(" ")[0],
+        "last_name": u.get("last_name") or "",
+        "zodiac_sign": u.get("zodiac_sign") or "Gemini",
+        "birth_date": u.get("birth_date") or "1995-01-01",
+        "photos": u.get("photos") or [],
+        "current_location": u.get("current_location") or {"city": "Unknown"},
+        "compatibility_score": u.get("compatibility_score") or 82,
+    }
+
+@api_router.get("/matches")
+async def list_matches(user: User = Depends(get_current_user)):
+    # Return matches where the current user is either user1 or user2
+    cur = db.matches.find({"$or": [{"user1_id": user.id}, {"user2_id": user.id}]})
+    docs = await cur.to_list(length=None)
+    # Ensure embedded user objects exist for frontend convenience
+    out = []
+    for m in docs:
+        u1 = await db.users.find_one({"id": m.get("user1_id")})
+        u2 = await db.users.find_one({"id": m.get("user2_id")})
+        m["user1"] = pick_partner_fields(u1 or {})
+        m["user2"] = pick_partner_fields(u2 or {})
+        out.append(m)
+    return out
+
+class CreateTestMatchBody(BaseModel):
+    partner_email: Optional[str] = None
+    compatibility_score: Optional[float] = 85.0
+
+@api_router.post("/matches/test-create")
+async def create_test_match(body: CreateTestMatchBody, user: User = Depends(get_current_user)):
+    # Ensure a partner user exists (default partner)
+    email = (body.partner_email or "partner@asign.com").lower()
+    partner = await db.users.find_one({"email": email})
+    if not partner:
+        partner_model = User(email=email, first_name="Partner", last_name="User", zodiac_sign="Libra")
+        await db.users.insert_one(partner_model.dict())
+        partner = partner_model.dict()
+    # Create match doc
+    mid = str(uuid.uuid4())
+    match_doc = {
+        "id": mid,
+        "user1_id": user.id,
+        "user2_id": partner.get("id"),
+        "matched_at": now_utc().isoformat(),
+        "compatibility_score": float(body.compatibility_score or 85.0),
+    }
+    await db.matches.insert_one(match_doc)
+    return {"success": True, "match_id": mid}
+
+@api_router.get("/matches/{match_id}/messages")
+async def get_match_messages(match_id: str, user: User = Depends(get_current_user)):
+    # Minimal: return empty list if none
+    msgs = await db.messages.find({"match_id": match_id}).to_list(length=None)
+    return msgs or []