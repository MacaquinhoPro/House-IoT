import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDT-jK5UX51DG9H7-L7TkjPIZxAEmtl0Gw",
  authDomain: "iot2-8c12b.firebaseapp.com",
  databaseURL: "https://iot2-8c12b-default-rtdb.firebaseio.com",
  projectId: "iot2-8c12b",
  storageBucket: "iot2-8c12b.firebasestorage.app",
  messagingSenderId: "223273984250",
  appId: "1:223273984250:web:c7d761d006a69586fd6943",
  measurementId: "G-MY84Z15HL6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };