import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBCiv22Z0SKWKba0r0_J3Sc_naAA_c1vcg",
    authDomain: "messenger-ali.firebaseapp.com",
    databaseURL: "https://messenger-ali-default-rtdb.firebaseio.com",
    projectId: "messenger-ali",
    storageBucket: "messenger-ali.firebasestorage.app",
    messagingSenderId: "596917405424",
    appId: "1:596917405424:web:6477e5fc4f764c5e02e435",
    measurementId: "G-8CPVD8WQNY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
