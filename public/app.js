import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const $email = document.getElementById("email");
const $password = document.getElementById("password");
const $status = document.getElementById("status");
const $error = document.getElementById("error");

function showError(e) {
  // i dont know what this does?
  $error.textContent = e?.code ? `${e.code}\n${e.message}` : String(e);
}

function clearError() {
  $error.textContent = "";
}

document.getElementById("signup").addEventListener("click", async () => {
  clearError();
  try {
    const email = $email.value.trim();
    const password = $password.value;

    if (!email || !password) throw new Error("Enter email + password.");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Signed up:", cred.user.uid);
  } catch (e) {
    showError(e);
  }
});

document.getElementById("login").addEventListener("click", async () => {
  clearError();
  try {
    const email = $email.value.trim();
    const password = $password.value;

    if (!email || !password) throw new Error("Enter email + password.");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in:", cred.user.uid);
  } catch (e) {
    showError(e);
  }

document.getElementById("login").addEventListener("click", async () => {
  clearError();
  try {
    const email = $email.value.trim();
    const password = $password.value;

    if (!email || !password) throw new Error("Enter email + password.");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in:", cred.user.uid);

    // redirect lol
    window.location.href = "dashboard.html";
  } catch (e) {
    showError(e);
  }
});

});

document.getElementById("logout").addEventListener("click", async () => {
  clearError();
  try {
    await signOut(auth);
  } catch (e) {
    showError(e);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    $status.textContent = `Logged in as ${user.email} (uid: ${user.uid})`;

    // if you are on the login page
    if (location.pathname.endsWith("/index.html") || location.pathname.endsWith("/")) {
      window.location.href = "dashboard.html";
    }
  } else {
    $status.textContent = "Not logged in";
  }
});
