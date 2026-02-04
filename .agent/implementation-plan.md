# Implementation Plan: Map Integration, Dark Mode & In-App Messaging

## Feature 1: Map Integration with Leaflet.js
**Goal**: Allow users to pin exact locations on a campus map

### Tasks:
1. ✅ Add Leaflet.js CDN to index.html
2. ✅ Create map component with RVCE campus coordinates
3. ✅ Add location picker to "Report Item" forms
4. ✅ Display location pins on item cards
5. ✅ Create map modal for viewing item locations

### Files to Modify:
- `frontend/index.html` - Add Leaflet CDN and map modals
- `frontend/css/style.css` - Add map styling
- `frontend/js/map-integration.js` - NEW: Map functionality
- `frontend/js/main.js` - Integrate map with item submission

---

## Feature 2: Dark Mode & UI Polish
**Goal**: System-aware dark mode with smooth transitions

### Tasks:
1. ✅ Add dark mode CSS variables
2. ✅ Create theme toggle button in navbar
3. ✅ Implement localStorage persistence
4. ✅ Add confetti animation for successful claims
5. ✅ Add micro-interactions (hover effects, transitions)

### Files to Modify:
- `frontend/css/style.css` - Add dark mode variables and styles
- `frontend/js/theme-manager.js` - NEW: Dark mode logic
- `frontend/index.html` - Add theme toggle button

---

## Feature 3: Direct In-App Messaging
**Goal**: Allow users to chat without exposing emails

### Tasks:
1. ✅ Create messaging UI (chat modal)
2. ✅ Set up Firestore conversations collection
3. ✅ Implement real-time message listener
4. ✅ Add "Message" button to item cards
5. ✅ Create conversation list view
6. ✅ Add notification badge for unread messages

### Files to Modify:
- `frontend/index.html` - Add messaging modal and UI
- `frontend/js/messaging.js` - NEW: Chat functionality
- `frontend/css/style.css` - Add chat styling
- `frontend/js/main.js` - Integrate messaging buttons

---

## Firebase Collections Schema

### `conversations` Collection:
```javascript
{
  id: "auto-generated",
  participants: ["user1@rvce.edu.in", "user2@rvce.edu.in"],
  itemId: "item-id-reference",
  itemName: "Item Name",
  lastMessage: "Last message text",
  lastMessageTime: Timestamp,
  unreadCount: { "user1@rvce.edu.in": 0, "user2@rvce.edu.in": 2 },
  createdAt: Timestamp
}
```

### `messages` Subcollection (under conversations):
```javascript
{
  id: "auto-generated",
  senderId: "sender@rvce.edu.in",
  text: "Message content",
  timestamp: Timestamp,
  read: false
}
```

---

## Implementation Order:
1. **Dark Mode** (Quick win, improves UX immediately)
2. **Map Integration** (Medium complexity, high value)
3. **In-App Messaging** (Most complex, requires backend setup)
