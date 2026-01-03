/**
 * Custom Stack Implementation for Action History Tracking
 * 
 * Use Cases:
 * - Track user actions (add, update, delete items)
 * - Implement undo functionality
 * - Maintain operation history
 * 
 * Time Complexities:
 * - Push: O(1)
 * - Pop: O(1)
 * - Peek: O(1)
 * - isEmpty: O(1)
 */
class Stack {
    constructor(maxSize = 100) {
        this.items = [];
        this.maxSize = maxSize;
    }

    /**
     * Add an action to the stack
     * Time Complexity: O(1)
     * 
     * @param {Object} action - Action object with type and data
     * Example: { type: 'ADD', data: itemData, timestamp: Date.now() }
     */
    push(action) {
        if (this.items.length >= this.maxSize) {
            // Remove oldest action if stack is full
            this.items.shift();
        }

        const actionWithTimestamp = {
            ...action,
            timestamp: action.timestamp || Date.now()
        };

        this.items.push(actionWithTimestamp);
        return this;
    }

    /**
     * Remove and return the most recent action
     * Time Complexity: O(1)
     */
    pop() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.pop();
    }

    /**
     * View the most recent action without removing it
     * Time Complexity: O(1)
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[this.items.length - 1];
    }

    /**
     * Check if stack is empty
     * Time Complexity: O(1)
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Get the current size of the stack
     * Time Complexity: O(1)
     */
    size() {
        return this.items.length;
    }

    /**
     * Clear all actions from the stack
     * Time Complexity: O(1)
     */
    clear() {
        this.items = [];
        return this;
    }

    /**
     * Get all actions (for history display)
     * Time Complexity: O(n)
     */
    getHistory() {
        return [...this.items];
    }

    /**
     * Get last N actions
     * Time Complexity: O(n)
     */
    getLastN(n) {
        const startIndex = Math.max(0, this.items.length - n);
        return this.items.slice(startIndex);
    }

    /**
     * Undo the last action and return it
     * Time Complexity: O(1)
     */
    undo() {
        const lastAction = this.pop();
        if (lastAction) {
            console.log(`Undoing action: ${lastAction.type}`);
            return lastAction;
        }
        return null;
    }

    /**
     * Display stack contents (for debugging)
     */
    display() {
        console.log('Stack Contents:', this.items);
        return this.items;
    }
}

/**
 * Action Types for Lost & Found Portal
 */
const ActionTypes = {
    ADD_LOST_ITEM: 'ADD_LOST_ITEM',
    ADD_FOUND_ITEM: 'ADD_FOUND_ITEM',
    UPDATE_ITEM: 'UPDATE_ITEM',
    DELETE_ITEM: 'DELETE_ITEM',
    CLAIM_ITEM: 'CLAIM_ITEM',
    MATCH_ITEMS: 'MATCH_ITEMS',
    CLAIM_INITIATED: 'CLAIM_INITIATED',
    CLAIM_APPROVED: 'CLAIM_APPROVED',
    CLAIM_REJECTED: 'CLAIM_REJECTED',
    ITEM_CLAIMED: 'ITEM_CLAIMED'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Stack, ActionTypes };
}
