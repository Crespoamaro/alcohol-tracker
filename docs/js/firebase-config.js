import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2fslsOJw6tyoqEtutADzCiSwNiqQhW7g",
  authDomain: "alcohol-tracker-83ddc.firebaseapp.com",
  projectId: "alcohol-tracker-83ddc",
  storageBucket: "alcohol-tracker-83ddc.firebasestorage.app",
  messagingSenderId: "1084139489082",
  appId: "1:1084139489082:web:28fe0d28f205b9122c3203",
  measurementId: "G-WHM9M65YQF"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); 
export const db = getFirestore(app); 