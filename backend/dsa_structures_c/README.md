# 🔧 C DSA Structures - Separate Files (No Headers!)

**Three separate files, no .h files needed!**

## 📁 Files

| File | Description | Compile |
|------|-------------|---------|
| `stack.c` | Stack implementation | `gcc -o stack.exe stack.c` |
| `linkedlist.c` | Linked list implementation | `gcc -o linkedlist.exe linkedlist.c` |
| `hash.c` | Hash table implementation | `gcc -o hash.exe hash.c` |

---

## 🚀 Quick Start

### **Compile Each File:**

```bash
# Compile stack
gcc -o stack.exe stack.c

# Compile linked list
gcc -o linkedlist.exe linkedlist.c

# Compile hash table
gcc -o hash.exe hash.c
```

### **Run Examples:**

```bash
.\stack.exe
.\linkedlist.exe
.\hash.exe
```

---

## 📊 What's Inside Each File

### **1. stack.c**
- Fixed-size array (100 elements)
- Operations: `pushStack()`, `popStack()`, `peekStack()`
- No malloc needed!
- Time Complexity: O(1) for all operations

### **2. linkedlist.c**
- Dynamic linked list
- Operations: `append()`, `prepend()`, `search()`, `deleteItem()`
- Time Complexity: O(1) for append, O(n) for search

### **3. hash.c**
- Hash table with chaining
- Operations: `insertHash()`, `searchHash()`, `deleteHash()`
- Time Complexity: O(1) average for all operations

---

## 💡 Why No Header Files?

**Each .c file is self-contained:**
- ✅ All structures defined inside
- ✅ All functions defined inside
- ✅ Example `main()` included
- ✅ No need for separate .h files
- ✅ Simple to compile and run

---

## 🎯 Perfect For:

- ✅ Learning C programming
- ✅ Academic submissions
- ✅ Quick testing
- ✅ Code demonstrations
- ✅ Understanding DSA

---

## 📝 Example Usage

Each file has a working example in its `main()` function. Just compile and run!

```c
// From stack.c
Stack stack;
initStack(&stack);
Action action = {"ADD_ITEM", 1, "iPhone"};
pushStack(&stack, action);
displayStack(&stack);
```

---

## ✨ Features

- ✅ **No header files** - Everything in one .c file
- ✅ **Self-contained** - Each file runs independently
- ✅ **Working examples** - See it in action
- ✅ **Well commented** - Understand every line
- ✅ **Simple compilation** - One command per file

---

**Simple, clean, and easy to understand!** 🚀
