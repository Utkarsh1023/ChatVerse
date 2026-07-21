# Chat Message Persistence Fix - ✅ COMPLETED

## Problem Analysis

**Why messages disappear on refresh:**

1. **`ChatWindow.tsx`** used a hardcoded `initialMessages` array and reset `messages` state to it on every `activePeerId` change.
2. **No REST GET endpoint** existed to fetch persisted messages from MongoDB for a conversation between two users.
3. **`SocketContext.tsx`** did **not** listen to the `receiveMessage` socket event, so real-time incoming messages from other users were never displayed in the UI.

**What already worked (no changes needed):**
- `Message` model ✅ already exists with sender, receiver, conversation, text, status fields
- `Conversation` model ✅ already exists with participants, lastMessage, unreadCount
- Socket `sendMessage` handler ✅ already persisted via `handleSendMessage` → `createMessage` service → MongoDB
- `message.service.ts` ✅ already has createMessage, updateMessageStatus
- `conversation.service.ts` ✅ already has getOrCreateConversation
- `message.controller.ts` ✅ already has handleSendMessage used by socket

## Changes Made

### ✅ Step 1: Backend — Created `chat.controller.ts` (`backend/src/controllers/chat.controller.ts`)
- `getMessages` controller:
  - Accepts `receiverId` from route params
  - Uses `getOrCreateConversation(senderId, receiverId)` to find/create conversation
  - Fetches all messages from MongoDB sorted by `createdAt: 1` (ascending)
  - Maps to frontend-friendly format with `id`, `senderId`, `receiverId`, `text`, `status`, `createdAt`, etc.
  - Returns `{ success, messages, conversationId }`

### ✅ Step 2: Backend — Created `chat.routes.ts` (`backend/src/routes/chat.routes.ts`)
- `GET /messages/:receiverId` → protected with `protect` middleware, calls `getMessages`

### ✅ Step 3: Backend — Registered chat routes in `app.ts`
- Imported `chatRoutes` and added `app.use("/api/chat", chatRoutes)`

### ✅ Step 4: Frontend — Created `chatApi.ts` (`frontend/src/api/chatApi.ts`)
- `export const getMessages = (receiverId: string) => API.get(\`/chat/messages/${receiverId}\`)`

### ✅ Step 5: Frontend — Updated `ChatWindow.tsx`
- **Removed** `initialMessages` hardcoded array ✅
- **Added** `loading` and `fetchError` states for UX feedback ✅
- **Added** `useEffect` to fetch messages from API on mount & when `activePeerId`/`user.id` changes ✅
- **Added** `useEffect` to listen for `receiveMessage` socket event via `useSocketContext()`:
  - Filters messages belonging to the current conversation only
  - Deduplicates against optimistic messages (checks `clientMessageId`)
  - Appends incoming messages to the UI in real-time
- **Kept** optimistic UI in `send` with:
  - `clientMessageId` for temporary identification
  - Rollback on error (`setMessages.filter`)
  - Server ID replacement on success (`res.messageId`)
- **Added** loading spinner, error state, and empty state to the messages area ✅

