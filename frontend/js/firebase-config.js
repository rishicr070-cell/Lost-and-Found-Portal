/**
 * Firebase Configuration - Lost & Found Portal
 */

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAALYUIoqn14jmUnDZB0ORkpBsFrivzLlU",
    authDomain: "lostfoundportal-dsa.firebaseapp.com",
    projectId: "lostfoundportal-dsa",
    storageBucket: "lostfoundportal-dsa.firebasestorage.app",
    messagingSenderId: "1032918662830",
    appId: "1:1032918662830:web:d2a2fae6b1f656cc0eb73f",
    measurementId: "G-TZR77G82ZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ Firebase initialized successfully!");

// Export for use in other files
export {
    db,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp
};
