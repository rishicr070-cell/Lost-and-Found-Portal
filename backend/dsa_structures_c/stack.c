/**
 * STACK.C - Complete Stack Implementation
 * No header file needed - everything is here!
 * 
 * Simple array-based stack for Lost & Found Portal
 * Compile: gcc -o stack.exe stack.c
 */

#include <stdio.h>
#include <string.h>

#define MAX_STACK_SIZE 100

// ============================================================================
// STRUCTURES
// ============================================================================

/**
 * Action structure for tracking operations
 */
typedef struct Action {
    char type[50];          // Action type (e.g., "ADD_LOST_ITEM", "SEARCH")
    int itemId;             // Related item ID
    char itemName[100];     // Item name
} Action;

/**
 * Stack structure using fixed-size array
 */
typedef struct Stack {
    Action items[MAX_STACK_SIZE];
    int top;
} Stack;

// ============================================================================
// FUNCTIONS
// ============================================================================

void initStack(Stack* stack) {
    stack->top = -1;
}

int pushStack(Stack* stack, Action action) {
    if (stack->top == MAX_STACK_SIZE - 1) {
        printf("Error: Stack is full!\n");
        return 0;
    }
    stack->items[++stack->top] = action;
    return 1;
}

Action popStack(Stack* stack) {
    Action empty = {"", 0, ""};
    if (stack->top == -1) {
        printf("Error: Stack is empty!\n");
        return empty;
    }
    return stack->items[stack->top--];
}

Action peekStack(Stack* stack) {
    Action empty = {"", 0, ""};
    if (stack->top == -1) {
        return empty;
    }
    return stack->items[stack->top];
}

int isStackEmpty(Stack* stack) {
    return (stack->top == -1);
}

int isStackFull(Stack* stack) {
    return (stack->top == MAX_STACK_SIZE - 1);
}

int stackSize(Stack* stack) {
    return stack->top + 1;
}

void displayStack(Stack* stack) {
    if (stack->top == -1) {
        printf("\n=== Stack is Empty ===\n\n");
        return;
    }
    
    printf("\n=== Stack (Size: %d/%d) ===\n", stackSize(stack), MAX_STACK_SIZE);
    printf("Top -> ");
    
    for (int i = stack->top; i >= 0; i--) {
        printf("[%s (ID:%d)] ", stack->items[i].type, stack->items[i].itemId);
        if (i > 0) printf("-> ");
    }
    
    printf("\n========================\n\n");
}

// ============================================================================
// MAIN - EXAMPLE USAGE
// ============================================================================

int main() {
    printf("\n=== Stack Example ===\n\n");
    
    Stack stack;
    initStack(&stack);
    
    Action a1 = {"ADD_LOST_ITEM", 1, "iPhone"};
    Action a2 = {"SEARCH", 0, "Query"};
    Action a3 = {"VIEW_ITEM", 5, "Backpack"};
    
    pushStack(&stack, a1);
    pushStack(&stack, a2);
    pushStack(&stack, a3);
    
    printf("✓ Pushed 3 actions\n");
    displayStack(&stack);
    
    Action popped = popStack(&stack);
    printf("✓ Popped: %s\n", popped.type);
    
    displayStack(&stack);
    
    printf("✅ Stack example complete!\n\n");
    
    return 0;
}
