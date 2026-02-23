// firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// не помню что это

const firebaseConfig = {
  apiKey: "",
  authDomain: "porsche-devibed.firebaseapp.com",
  projectId: "porsche-devibed",
  storageBucket: "porsche-devibed.firebasestorage.app",
  messagingSenderId: "242686724908",
  appId: "1:242686724908:web:22872ea253cff70a26ba89",
  measurementId: "G-PR71NNNENV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
