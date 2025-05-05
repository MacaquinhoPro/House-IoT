import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCYVcUAhixWRoyWx6-h9RaUh4DhNkBPuNo",
    authDomain: "ticketing-dam.firebaseapp.com",
    projectId: "ticketing-dam",
    storageBucket: "ticketing-dam.firebasestorage.app",
    messagingSenderId: "932841118187",
    appId: "1:932841118187:web:11d14f2a925fb18da9a1ae",
    measurementId: "G-KNFJ8BGCK8"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };