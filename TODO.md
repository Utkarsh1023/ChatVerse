# Task: Professional Post-Action Friend Request Notification Experience

## Backend
- [x] Add `status` field (`"pending" | "accepted" | "declined"`) to `Notification` model
- [x] Add `status` to `PopulatedNotification` type
- [x] Add `updateNotificationStatus` service to update the pending friend-request notification and emit `notification:updated`
- [x] Add `emitNotificationUpdated` socket helper (emits `notification:updated`)
- [x] Update `friend.controller.ts` accept/reject to update notification status + emit `friend:accepted` / `friend:declined`
- [x] Update `friends.controller.ts` accept/reject for consistency
- [x] Verify backend compiles (no TypeScript errors)

## Frontend
- [x] Add `notification:updated`, `friend:accepted`, `friend:declined` to `socketTypes.ts`
- [x] Rewrite `NotificationItem.tsx`:
  - Render based on `status` (pending → Accept/Decline buttons; accepted → green success message; declined → gray message)
  - Loading spinner during request, disabled buttons, framer-motion fade in/out animations
- [x] Rewrite `NotificationsList.tsx`:
  - Add `notification:updated` listener that updates only the affected notification
  - `onRequestAction` now updates status locally instead of removing the notification
  - Pass `status` to `NotificationItem`
- [x] Verify frontend builds successfully (vite build)
