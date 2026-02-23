import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // not logged in means back to index, НО Я УДАЛИЛ ЭТО ВЕЗДЕ ВРОДЕ БЫ
    window.location.href = "index.html";
    return;
  }

  // show email
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});
