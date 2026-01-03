/**
 * Node class for Linked List
 */
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

/**
 * Custom Linked List Implementation for Lost & Found Items
 * 
 * Use Cases:
 * - Store lost items in chronological order
 * - Store found items in chronological order
 * - Maintain item history
 * 
 * Time Complexities:
 * - Insert at head: O(1)
 * - Insert at tail: O(1) with tail pointer
 * - Search: O(n)
 * - Delete: O(n)
 */
class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /**
     * Add item to the end of the list (most recent item)
     * Time Complexity: O(1)
     */
    append(data) {
        const newNode = new Node(data);
        
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        
        this.size++;
        return this;
    }

    /**
     * Add item to the beginning of the list
     * Time Complexity: O(1)
     */
    prepend(data) {
        const newNode = new Node(data);
        
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head = newNode;
        }
        
        this.size++;
        return this;
    }

    /**
     * Search for an item by ID
     * Time Complexity: O(n)
     */
    search(itemId) {
        let current = this.head;
        
        while (current) {
            if (current.data.id === itemId) {
                return current.data;
            }
            current = current.next;
        }
        
        return null;
    }

    /**
     * Delete an item by ID
     * Time Complexity: O(n)
     */
    delete(itemId) {
        if (!this.head) return false;

        // If head needs to be deleted
        if (this.head.data.id === itemId) {
            this.head = this.head.next;
            if (!this.head) this.tail = null;
            this.size--;
            return true;
        }

        let current = this.head;
        while (current.next) {
            if (current.next.data.id === itemId) {
                current.next = current.next.next;
                if (!current.next) this.tail = current;
                this.size--;
                return true;
            }
            current = current.next;
        }

        return false;
    }

    /**
     * Get all items as an array
     * Time Complexity: O(n)
     */
    toArray() {
        const result = [];
        let current = this.head;
        
        while (current) {
            result.push(current.data);
            current = current.next;
        }
        
        return result;
    }

    /**
     * Get the size of the list
     * Time Complexity: O(1)
     */
    getSize() {
        return this.size;
    }

    /**
     * Display all items (for debugging)
     */
    display() {
        const items = this.toArray();
        console.log('Linked List Items:', items);
        return items;
    }

    /**
     * Check if list is empty
     */
    isEmpty() {
        return this.size === 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LinkedList, Node };
}
