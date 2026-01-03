/**
 * LINKEDLIST.C - Complete Linked List Implementation
 * No header file needed - everything is here!
 * 
 * Linked list for storing Lost & Found items
 * Compile: gcc -o linkedlist.exe linkedlist.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// ============================================================================
// STRUCTURES
// ============================================================================

/**
 * Item structure for Lost & Found items
 */
typedef struct Item {
    int id;
    char name[100];
    char category[50];
    char description[500];
    char date[20];
    char location[200];
    char color[50];
    char contact[100];
    char type[10];  // "lost" or "found"
} Item;

/**
 * Node structure
 */
typedef struct Node {
    Item data;
    struct Node* next;
} Node;

/**
 * Linked List structure
 */
typedef struct LinkedList {
    Node* head;
    Node* tail;
    int size;
} LinkedList;

// ============================================================================
// FUNCTIONS
// ============================================================================

LinkedList* createLinkedList() {
    LinkedList* list = (LinkedList*)malloc(sizeof(LinkedList));
    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
    return list;
}

void append(LinkedList* list, Item item) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->data = item;
    newNode->next = NULL;
    
    if (list->head == NULL) {
        list->head = newNode;
        list->tail = newNode;
    } else {
        list->tail->next = newNode;
        list->tail = newNode;
    }
    list->size++;
}

void prepend(LinkedList* list, Item item) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->data = item;
    newNode->next = list->head;
    
    if (list->head == NULL) {
        list->tail = newNode;
    }
    list->head = newNode;
    list->size++;
}

Item* search(LinkedList* list, int itemId) {
    Node* current = list->head;
    while (current != NULL) {
        if (current->data.id == itemId) {
            return &(current->data);
        }
        current = current->next;
    }
    return NULL;
}

int deleteItem(LinkedList* list, int itemId) {
    if (list->head == NULL) return 0;
    
    if (list->head->data.id == itemId) {
        Node* temp = list->head;
        list->head = list->head->next;
        if (list->head == NULL) list->tail = NULL;
        free(temp);
        list->size--;
        return 1;
    }
    
    Node* current = list->head;
    while (current->next != NULL) {
        if (current->next->data.id == itemId) {
            Node* temp = current->next;
            current->next = current->next->next;
            if (current->next == NULL) list->tail = current;
            free(temp);
            list->size--;
            return 1;
        }
        current = current->next;
    }
    return 0;
}

int getSize(LinkedList* list) {
    return list->size;
}

void displayList(LinkedList* list) {
    printf("\n=== Linked List (Size: %d) ===\n", list->size);
    Node* current = list->head;
    int index = 0;
    while (current != NULL) {
        printf("[%d] %s (ID:%d, Type:%s)\n", 
               index++, current->data.name, current->data.id, current->data.type);
        current = current->next;
    }
    printf("===========================\n\n");
}

void freeLinkedList(LinkedList* list) {
    Node* current = list->head;
    while (current != NULL) {
        Node* temp = current;
        current = current->next;
        free(temp);
    }
    free(list);
}

// ============================================================================
// HELPER FUNCTION
// ============================================================================

Item createItem(int id, const char* name, const char* category, const char* type) {
    Item item;
    item.id = id;
    strncpy(item.name, name, sizeof(item.name) - 1);
    strncpy(item.category, category, sizeof(item.category) - 1);
    strncpy(item.description, "Sample description", sizeof(item.description) - 1);
    strncpy(item.date, "2025-01-15", sizeof(item.date) - 1);
    strncpy(item.location, "Library", sizeof(item.location) - 1);
    strncpy(item.color, "Black", sizeof(item.color) - 1);
    strncpy(item.contact, "test@campus.edu", sizeof(item.contact) - 1);
    strncpy(item.type, type, sizeof(item.type) - 1);
    return item;
}

// ============================================================================
// MAIN - EXAMPLE USAGE
// ============================================================================

int main() {
    printf("\n=== Linked List Example ===\n\n");
    
    LinkedList* list = createLinkedList();
    
    append(list, createItem(1, "iPhone 13", "Electronics", "lost"));
    append(list, createItem(2, "Student ID", "Documents", "lost"));
    append(list, createItem(3, "Keys", "Keys", "found"));
    
    printf("✓ Added 3 items\n");
    displayList(list);
    
    Item* found = search(list, 2);
    if (found != NULL) {
        printf("✓ Found item: %s\n\n", found->name);
    }
    
    deleteItem(list, 2);
    printf("✓ Deleted item ID 2\n");
    displayList(list);
    
    freeLinkedList(list);
    
    printf("✅ Linked List example complete!\n\n");
    
    return 0;
}
