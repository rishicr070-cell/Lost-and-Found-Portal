# 🔍 Lost and Found Portal - DSA Project

A campus lost and found management system demonstrating practical implementation of **Linked Lists**, **Stacks**, and **Hash Tables**.

## 📋 Project Overview

This project implements a web-based lost and found portal for campus use, showcasing core data structures:
- **Linked Lists**: Store and manage sequences of lost/found items
- **Stacks**: Track action history (add/update/delete operations)
- **Hash Tables**: Enable O(1) search by item name/category

## 🏗️ Project Structure

```
Lost_FoundPortal/
├── backend/              # PHP/Node.js backend logic
├── dsa_structures/       # Custom DSA implementations
│   ├── LinkedList.js     # Linked list for item storage
│   ├── Stack.js          # Stack for action tracking
│   └── HashTable.js      # Hash table for fast search
├── frontend/             # HTML/CSS/JS interface
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   ├── images/           # Images and assets
│   └── index.html        # Main page
├── database/             # SQL schema and migrations
├── docs/                 # Documentation and reports
└── README.md
```

## 🚀 Development Phases

### Phase 1: Requirement Analysis & Design ✅ (Current Phase)
- [ ] Define user requirements and pain points
- [ ] Design database schema (users, lost_items, found_items)
- [ ] Map DSA structures to features
- [ ] Create UI wireframes

### Phase 2: DSA Implementation & Backend
- [ ] Implement LinkedList class
- [ ] Implement Stack class
- [ ] Implement HashTable with chaining
- [ ] Integrate with backend API

### Phase 3: Frontend Development
- [ ] Build responsive UI with Bootstrap
- [ ] Create report forms
- [ ] Implement search interface
- [ ] Build admin dashboard

### Phase 4: Testing & Deployment
- [ ] Test core workflows
- [ ] Verify time complexities
- [ ] Performance testing
- [ ] Create deployment guide

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap
- **Backend**: PHP/Node.js (choose one)
- **Database**: MySQL
- **DSA**: Custom JavaScript implementations

## 📊 Time Complexity Goals

| Operation | Data Structure | Target Complexity |
|-----------|---------------|-------------------|
| Search by name | Hash Table | O(1) |
| Add item | Linked List | O(1) |
| Undo action | Stack | O(1) |
| List all items | Linked List | O(n) |

## 🎯 Getting Started

### Prerequisites
- Node.js or PHP installed
- MySQL installed
- Basic knowledge of HTML/CSS/JavaScript

### Installation Steps
1. Clone the repository
2. Set up MySQL database (see `database/schema.sql`)
3. Install dependencies
4. Configure database connection
5. Run the application

## 📝 Next Steps

1. Start with DSA structure implementation
2. Design and create database schema
3. Build basic frontend pages
4. Connect frontend to backend APIs

## 👥 Contributors

Rishi - DSA Project Developer

## 📄 License

Educational Project - Feel free to use for learning
