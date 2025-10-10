@@
 class CoinFlipEvent(BaseModel):
@@
     note: str = "The cosmos flipped a coin to choose who messages first."
 
-@api_router.post("/matches/coinflip")
-async def matches_coinflip(match_id: str, user: User = Depends(get_current_user)):
+@api_router.post("/matches/{match_id}/coinflip")
+async def matches_coinflip(match_id: str, user: User = Depends(get_current_user)):
@@
     await db.notifications.insert_one({"id": str(uuid.uuid4()), "user_id": second, "type": "cosmic_coin", "message": "Your match will open the conversation first — the cosmos has spoken.", "created_at": now_utc().isoformat()})
     return {"match_id": match_id, "first": first, "second": second}
+
+@api_router.get("/matches/{match_id}/coinflip-status")
+async def matches_coinflip_status(match_id: str, user: User = Depends(get_current_user)):
+    ev = await db.coinflip_events.find_one({"match_id": match_id}, sort=[("created_at", -1)])
+    if not ev:
+        return {"set": False}
+    return {"set": True, "first": ev.get("user_first_id"), "second": ev.get("user_second_id"), "created_at": ev.get("created_at")}