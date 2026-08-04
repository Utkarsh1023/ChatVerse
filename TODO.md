# Notification System — Implementation Checklist

## Backend — New Notification Module
- [x] 1. `src/types/notification.ts` — notification type unions + interfaces
- [ ] 2. `src/models/Notification.ts` — structured schema + indexes (rewrite)
- [ ] 3. `src/services/notification.service.ts` — business logic (create/delete/mark/read/get/count)
- [ ] 4. `src/validators/notification.validator.ts` — express-validator chains
- [ ] 5. `src/controllers/notification.controller.ts` — thin REST controllers
- [ ] 6. `src/routes/notification.routes.ts` — 5 endpoints under `protect`
- [ ] 7. `src/socket/notification.socket.ts` — socket emit helpers
- [ ] 8. `src/app.ts` — mount `/api/notifications`

## Backend — Migrate existing shared helper
- [x] 9. `src/services/friend.service.ts` — new structured `createNotification`
- [x] 10. `src/controllers/friend.controller.ts` — new structured `createNotification`
- [ ] 11. `src/services/friends.service.ts` — remove local helper, import from notification.service, fix `getRecentActivity` + `removeFriend`
- [ ] 12. `src/services/connections.service.ts` — `followUser` → structured `follow`

## Backend — Auto-notification integration points
- [ ] 13. `src/controllers/post.controller.ts` — `toggleLike` → `like_post`
- [ ] 14. `src/controllers/comment.controller.ts` — `createComment` → `comment_post`
- [ ] 15. `src/controllers/story.controller.ts` — `story_like` / `story_reply` examples
- [ ] 16. `src/controllers/message.controller.ts` / `chat.controller.ts` — `message_reaction` / call examples

## Verification
- [ ] 17. `cd backend && npx tsc --noEmit` — no type errors
