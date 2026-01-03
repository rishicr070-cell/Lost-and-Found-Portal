/**
 * Custom Hash Table Implementation with Chaining for Fast Search
 * 
 * Use Cases:
 * - Fast O(1) search for items by name
 * - Fast O(1) search by category
 * - Quick item lookups by various keys
 * 
 * Collision Resolution: Chaining (using arrays)
 * 
 * Time Complexities:
 * - Insert: O(1) average case
 * - Search: O(1) average case
 * - Delete: O(1) average case
 */
class HashTable {
    constructor(size = 50) {
        this.size = size;
        this.table = new Array(size);
        this.count = 0;
        
        // Initialize each bucket as an empty array for chaining
        for (let i = 0; i < size; i++) {
            this.table[i] = [];
        }
    }

    /**
     * Hash function to convert key to index
     * Uses simple string hashing algorithm
     * Time Complexity: O(k) where k is key length
     */
    hash(key) {
        let hash = 0;
        const str = String(key).toLowerCase(); // Case-insensitive
        
        for (let i = 0; i < str.length; i++) {
            hash = (hash + str.charCodeAt(i) * (i + 1)) % this.size;
        }
        
        return hash;
    }

    /**
     * Insert a key-value pair
     * Time Complexity: O(1) average case
     * 
     * @param {string} key - Search key (e.g., item name, category)
     * @param {Object} value - Item data
     */
    insert(key, value) {
        const index = this.hash(key);
        const bucket = this.table[index];
        
        // Check if key already exists and update
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i].key === key) {
                bucket[i].value = value;
                return this;
            }
        }
        
        // Add new entry
        bucket.push({ key, value });
        this.count++;
        
        // Check load factor and resize if needed
        if (this.count / this.size > 0.75) {
            this.resize();
        }
        
        return this;
    }

    /**
     * Search for a value by key
     * Time Complexity: O(1) average case
     */
    search(key) {
        const index = this.hash(key);
        const bucket = this.table[index];
        
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i].key === key) {
                return bucket[i].value;
            }
        }
        
        return null;
    }

    /**
     * Delete a key-value pair
     * Time Complexity: O(1) average case
     */
    delete(key) {
        const index = this.hash(key);
        const bucket = this.table[index];
        
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i].key === key) {
                bucket.splice(i, 1);
                this.count--;
                return true;
            }
        }
        
        return false;
    }

    /**
     * Search by partial key match (useful for fuzzy search)
     * Time Complexity: O(n) - iterates through all entries
     */
    searchPartial(partialKey) {
        const results = [];
        const searchTerm = partialKey.toLowerCase();
        
        for (let i = 0; i < this.size; i++) {
            const bucket = this.table[i];
            for (let j = 0; j < bucket.length; j++) {
                const key = bucket[j].key.toLowerCase();
                if (key.includes(searchTerm)) {
                    results.push(bucket[j].value);
                }
            }
        }
        
        return results;
    }

    /**
     * Get all values in the hash table
     * Time Complexity: O(n)
     */
    getAllValues() {
        const values = [];
        
        for (let i = 0; i < this.size; i++) {
            const bucket = this.table[i];
            for (let j = 0; j < bucket.length; j++) {
                values.push(bucket[j].value);
            }
        }
        
        return values;
    }

    /**
     * Get all keys in the hash table
     * Time Complexity: O(n)
     */
    getAllKeys() {
        const keys = [];
        
        for (let i = 0; i < this.size; i++) {
            const bucket = this.table[i];
            for (let j = 0; j < bucket.length; j++) {
                keys.push(bucket[j].key);
            }
        }
        
        return keys;
    }

    /**
     * Check if hash table contains a key
     * Time Complexity: O(1) average case
     */
    has(key) {
        return this.search(key) !== null;
    }

    /**
     * Resize hash table when load factor is high
     * Time Complexity: O(n)
     */
    resize() {
        const oldTable = this.table;
        this.size = this.size * 2;
        this.table = new Array(this.size);
        this.count = 0;
        
        // Initialize new buckets
        for (let i = 0; i < this.size; i++) {
            this.table[i] = [];
        }
        
        // Rehash all entries
        for (let i = 0; i < oldTable.length; i++) {
            const bucket = oldTable[i];
            for (let j = 0; j < bucket.length; j++) {
                this.insert(bucket[j].key, bucket[j].value);
            }
        }
    }

    /**
     * Get current load factor
     */
    getLoadFactor() {
        return this.count / this.size;
    }

    /**
     * Get statistics about the hash table
     */
    getStats() {
        let maxChainLength = 0;
        let emptyBuckets = 0;
        
        for (let i = 0; i < this.size; i++) {
            const bucketLength = this.table[i].length;
            if (bucketLength === 0) emptyBuckets++;
            if (bucketLength > maxChainLength) {
                maxChainLength = bucketLength;
            }
        }
        
        return {
            size: this.size,
            count: this.count,
            loadFactor: this.getLoadFactor(),
            maxChainLength,
            emptyBuckets,
            efficiency: ((this.size - emptyBuckets) / this.size * 100).toFixed(2) + '%'
        };
    }

    /**
     * Display hash table contents (for debugging)
     */
    display() {
        console.log('Hash Table Contents:');
        for (let i = 0; i < this.size; i++) {
            if (this.table[i].length > 0) {
                console.log(`Bucket ${i}:`, this.table[i]);
            }
        }
        console.log('Stats:', this.getStats());
    }

    /**
     * Clear the hash table
     */
    clear() {
        this.table = new Array(this.size);
        for (let i = 0; i < this.size; i++) {
            this.table[i] = [];
        }
        this.count = 0;
        return this;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HashTable };
}
