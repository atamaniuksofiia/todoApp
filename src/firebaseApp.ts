// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJPB2gFZZACMFTZqP1pXRt-IbHaYPL4rg",
  authDomain: "todo-app-a2851.firebaseapp.com",
  projectId: "todo-app-a2851",
  storageBucket: "todo-app-a2851.firebasestorage.app",
  messagingSenderId: "778710013560",
  appId: "1:778710013560:web:8c0c36c0d3917281fb3f8d",
  measurementId: "G-LDTDRWL121"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);