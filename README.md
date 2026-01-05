# 🔍 Lost and Found Portal - DSA Project

A campus lost and found management system demonstrating practical implementation of **Linked Lists**, **Stacks**, and **Hash Tables**.

## 📋 Project Overview

This project implements a web-based lost and found portal for RVCE campus, showcasing core data structures:
- **Linked Lists**: Store and manage sequences of items
- **Stacks**: Track action history (add/update/delete operations)
- **Hash Tables**: Enable O(1) search by item name/category

## ✨ Features

- 🔐 **Authentication**: Firebase Auth with @rvce.edu.in email restriction
- 📸 **Image Upload**: Photos stored as compressed Base64 in Firestore (no extra storage needed)
- 🔔 **Notifications**: Claim requests notify item owners
- ✅ **Mark as Retrieved**: Owners can mark items as found and remove them
- 🔍 **Fast Search**: O(1) search using custom Hash Table

## 🏗️ Project Structure

```
Lost_FoundPortal/
├── backend/              # Backend components
│   ├── dsa_structures/   # Custom DSA implementations
│   │   ├── LinkedList.js # Linked list for item storage
│   │   ├── Stack.js      # Stack for action tracking
│   │   └── HashTable.js  # Hash table for fast search
│   └── dsa_structures_c/ # C reference implementations
├── frontend/             # HTML/CSS/JS interface
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript modules
│   │   ├── main.js       # Core application logic
│   │   ├── auth.js       # Authentication module
│   │   ├── image-upload.js # Base64 image handling
│   │   └── notifications.js # Claim notification system
│   └── index.html        # Main portal page
├── docs/                 # Documentation
└── README.md
```

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | HTML5, CSS3, JavaScript, Bootstrap 5 |
| Database | Firebase Firestore (NoSQL) |
| Auth | Firebase Authentication |
| Images | Base64 (stored in Firestore) |
| DSA | Custom JavaScript implementations |

## 📸 Image Storage

Images are stored as **Base64 strings** directly in Firestore documents:
- ✅ No Firebase Storage setup required
- ✅ Works within free Firestore quota
- ✅ Images auto-compressed to max 800px, 70% quality
- ⚠️ Max image size: 2MB before compression

## 📊 Time Complexity

| Operation | Data Structure | Complexity |
|-----------|---------------|------------|
| Search by name | Hash Table | O(1) |
| Add item | Linked List | O(1) |
| Undo action | Stack | O(1) |
| List all items | Linked List | O(n) |

## 🎯 Getting Started

### Prerequisites
- Modern web browser
- Firebase project (free tier works)

### Firebase Setup
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create Firestore database
4. Copy config to `firebase-config.js`

### Run Locally
1. Clone the repository
2. Open `frontend/index.html` in browser
3. Sign up with @rvce.edu.in email
4. Start reporting items!

## 🔄 User Flow

```
Report Item → Item Displayed → Someone Claims → Owner Notified → Mark as Retrieved → Item Removed
```

## 👥 Contributors

Rishi - DSA Project Developer

## 📄 License

Educational Project - Feel free to use for learning
