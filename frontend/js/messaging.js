/**
 * In-App Messaging Module
 * Real-time chat between users about lost/found items
 */

class MessagingManager {
    constructor() {
        this.currentUser = null;
        this.activeConversation = null;
        this.unreadCount = 0;
        this.listeners = [];
    }

    /**
     * Initialize messaging for current user
     */
    async init(user) {
        this.currentUser = user;
        await this.loadUnreadCount();
        this.listenForNewMessages();
        console.log('✅ Messaging initialized for:', user.email);
    }

    /**
     * Start a conversation about an item
     */
    async startConversation(itemId, itemName, otherUserEmail) {
        if (!this.currentUser) {
            console.error('No user logged in');
            return null;
        }

        try {
            // Check if conversation already exists
            const existingConv = await this.findConversation(itemId, otherUserEmail);
            if (existingConv) {
                return existingConv.id;
            }

            // Create new conversation
            const conversationData = {
                participants: [this.currentUser.email, otherUserEmail].sort(),
                itemId: itemId,
                itemName: itemName,
                lastMessage: '',
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
                unreadCount: {
                    [this.currentUser.email]: 0,
                    [otherUserEmail]: 0
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection('conversations').add(conversationData);
            console.log('✅ Conversation created:', docRef.id);
            return docRef.id;

        } catch (error) {
            console.error('Error starting conversation:', error);
            return null;
        }
    }

    /**
     * Find existing conversation
     */
    async findConversation(itemId, otherUserEmail) {
        try {
            const participants = [this.currentUser.email, otherUserEmail].sort();
            const snapshot = await db.collection('conversations')
                .where('itemId', '==', itemId)
                .where('participants', '==', participants)
                .limit(1)
                .get();

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error finding conversation:', error);
            return null;
        }
    }

    /**
     * Send a message
     */
    async sendMessage(conversationId, text) {
        if (!this.currentUser || !text.trim()) return;

        try {
            const messageData = {
                senderId: this.currentUser.email,
                text: text.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            };

            // Add message to subcollection
            await db.collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .add(messageData);

            // Update conversation metadata
            const otherUser = await this.getOtherParticipant(conversationId);
            await db.collection('conversations').doc(conversationId).update({
                lastMessage: text.trim(),
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
                [`unreadCount.${otherUser}`]: firebase.firestore.FieldValue.increment(1)
            });

            console.log('✅ Message sent');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    /**
     * Load messages for a conversation
     */
    listenToMessages(conversationId, callback) {
        const unsubscribe = db.collection('conversations')
            .doc(conversationId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot((snapshot) => {
                const messages = [];
                snapshot.forEach(doc => {
                    messages.push({ id: doc.id, ...doc.data() });
                });
                callback(messages);
            });

        this.listeners.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Mark messages as read
     */
    async markAsRead(conversationId) {
        if (!this.currentUser) return;

        try {
            await db.collection('conversations').doc(conversationId).update({
                [`unreadCount.${this.currentUser.email}`]: 0
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    /**
     * Get all conversations for current user
     */
    async getConversations() {
        if (!this.currentUser) return [];

        try {
            const snapshot = await db.collection('conversations')
                .where('participants', 'array-contains', this.currentUser.email)
                .orderBy('lastMessageTime', 'desc')
                .get();

            const conversations = [];
            snapshot.forEach(doc => {
                conversations.push({ id: doc.id, ...doc.data() });
            });

            return conversations;
        } catch (error) {
            console.error('Error loading conversations:', error);
            return [];
        }
    }

    /**
     * Get other participant in conversation
     */
    async getOtherParticipant(conversationId) {
        try {
            const doc = await db.collection('conversations').doc(conversationId).get();
            if (!doc.exists) return null;

            const participants = doc.data().participants;
            return participants.find(p => p !== this.currentUser.email);
        } catch (error) {
            console.error('Error getting other participant:', error);
            return null;
        }
    }

    /**
     * Load unread message count
     */
    async loadUnreadCount() {
        if (!this.currentUser) return;

        try {
            const snapshot = await db.collection('conversations')
                .where('participants', 'array-contains', this.currentUser.email)
                .get();

            let total = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                total += data.unreadCount?.[this.currentUser.email] || 0;
            });

            this.unreadCount = total;
            this.updateUnreadBadge();
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    }

    /**
     * Listen for new messages
     */
    listenForNewMessages() {
        if (!this.currentUser) return;

        const unsubscribe = db.collection('conversations')
            .where('participants', 'array-contains', this.currentUser.email)
            .onSnapshot(() => {
                this.loadUnreadCount();
            });

        this.listeners.push(unsubscribe);
    }

    /**
     * Update unread badge in UI
     */
    updateUnreadBadge() {
        const badge = document.getElementById('messagesBadge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount;
                badge.classList.remove('d-none');
            } else {
                badge.classList.add('d-none');
            }
        }
    }

    /**
     * Get user initials for avatar
     */
    getUserInitials(email) {
        const name = email.split('@')[0];
        return name.substring(0, 2).toUpperCase();
    }

    /**
     * Clean up listeners
     */
    cleanup() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
    }
}

// Initialize messaging manager
const messagingManager = new MessagingManager();

// Make globally accessible
window.messagingManager = messagingManager;

console.log('✓ Messaging module loaded');
