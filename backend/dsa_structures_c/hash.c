/**
 * HASH.C - Complete Hash Table Implementation
 * No header file needed - everything is here!
 * 
 * Hash table with chaining for O(1) search
 * Compile: gcc -o hash.exe hash.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define HASH_TABLE_SIZE 50

// ============================================================================
// STRUCTURES
// ============================================================================

/**
 * Item structure
 */
typedef struct Item {
    int id;
    char name[100];
    char category[50];
    char type[10];
} Item;

/**
 * Hash table entry (for chaining)
 */
typedef struct HashEntry {
    char key[100];
    Item value;
    struct HashEntry* next;
} HashEntry;

/**
 * Hash table structure
 */
typedef struct HashTable {
    HashEntry** buckets;
    int size;
    int count;
} HashTable;

// ============================================================================
// FUNCTIONS
// ============================================================================

unsigned int hash(const char* key, int tableSize) {
    unsigned int hashValue = 0;
    for (int i = 0; key[i] != '\0'; i++) {
        hashValue = (hashValue + tolower(key[i]) * (i + 1)) % tableSize;
    }
    return hashValue;
}

HashTable* createHashTable(int size) {
    HashTable* table = (HashTable*)malloc(sizeof(HashTable));
    table->buckets = (HashEntry**)calloc(size, sizeof(HashEntry*));
    table->size = size;
    table->count = 0;
    return table;
}

void insertHash(HashTable* table, const char* key, Item value) {
    unsigned int index = hash(key, table->size);
    
    // Check if key exists
    HashEntry* current = table->buckets[index];
    while (current != NULL) {
        if (strcmp(current->key, key) == 0) {
            current->value = value;
            return;
        }
        current = current->next;
    }
    
    // Create new entry
    HashEntry* newEntry = (HashEntry*)malloc(sizeof(HashEntry));
    strncpy(newEntry->key, key, sizeof(newEntry->key) - 1);
    newEntry->value = value;
    newEntry->next = table->buckets[index];
    
    table->buckets[index] = newEntry;
    table->count++;
}

Item* searchHash(HashTable* table, const char* key) {
    unsigned int index = hash(key, table->size);
    HashEntry* current = table->buckets[index];
    
    while (current != NULL) {
        if (strcmp(current->key, key) == 0) {
            return &(current->value);
        }
        current = current->next;
    }
    return NULL;
}

int deleteHash(HashTable* table, const char* key) {
    unsigned int index = hash(key, table->size);
    HashEntry* current = table->buckets[index];
    HashEntry* prev = NULL;
    
    while (current != NULL) {
        if (strcmp(current->key, key) == 0) {
            if (prev == NULL) {
                table->buckets[index] = current->next;
            } else {
                prev->next = current->next;
            }
            free(current);
            table->count--;
            return 1;
        }
        prev = current;
        current = current->next;
    }
    return 0;
}

void displayHashTable(HashTable* table) {
    printf("\n=== Hash Table (Count: %d/%d) ===\n", table->count, table->size);
    for (int i = 0; i < table->size; i++) {
        if (table->buckets[i] != NULL) {
            printf("Bucket[%d]: ", i);
            HashEntry* current = table->buckets[i];
            while (current != NULL) {
                printf("(%s: %s) -> ", current->key, current->value.name);
                current = current->next;
            }
            printf("NULL\n");
        }
    }
    printf("================================\n\n");
}

void freeHashTable(HashTable* table) {
    for (int i = 0; i < table->size; i++) {
        HashEntry* current = table->buckets[i];
        while (current != NULL) {
            HashEntry* temp = current;
            current = current->next;
            free(temp);
        }
    }
    free(table->buckets);
    free(table);
}

// ============================================================================
// HELPER FUNCTION
// ============================================================================

Item createItem(int id, const char* name, const char* category, const char* type) {
    Item item;
    item.id = id;
    strncpy(item.name, name, sizeof(item.name) - 1);
    strncpy(item.category, category, sizeof(item.category) - 1);
    strncpy(item.type, type, sizeof(item.type) - 1);
    return item;
}

// ============================================================================
// MAIN - EXAMPLE USAGE
// ============================================================================

int main() {
    printf("\n=== Hash Table Example ===\n\n");
    
    HashTable* table = createHashTable(HASH_TABLE_SIZE);
    
    Item item1 = createItem(1, "iPhone 13", "Electronics", "lost");
    Item item2 = createItem(2, "Student ID", "Documents", "lost");
    Item item3 = createItem(3, "Keys", "Keys", "found");
    
    insertHash(table, "iphone", item1);
    insertHash(table, "electronics", item1);
    insertHash(table, "student id", item2);
    insertHash(table, "keys", item3);
    
    printf("✓ Inserted 4 key-value pairs\n");
    displayHashTable(table);
    
    Item* found = searchHash(table, "iphone");
    if (found != NULL) {
        printf("✓ Found: %s\n\n", found->name);
    }
    
    deleteHash(table, "keys");
    printf("✓ Deleted 'keys'\n");
    displayHashTable(table);
    
    freeHashTable(table);
    
    printf("✅ Hash Table example complete!\n\n");
    
    return 0;
}
