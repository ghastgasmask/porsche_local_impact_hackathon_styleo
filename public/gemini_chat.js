const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("input");
const clearBtn = document.getElementById("clearBtn");

function addMsg(text, who) {
  const wrap = document.createElement("div");
  wrap.className = "msg " + who;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = who === "user" ? "You" : "Gemini";

  wrap.appendChild(bubble);
  wrap.appendChild(meta);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
  return wrap;
}

// autosize textarea
function resize() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 140) + "px";
}
input.addEventListener("input", resize);
resize();

// Enter sends (Shift+Enter newline)
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

clearBtn.addEventListener("click", () => {
  chat.innerHTML = "";
  addMsg("Hi — send a message and I’ll reply.", "ai");
});

addMsg("Hi — send a message and I’ll reply.", "ai");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addMsg(text, "user");
  input.value = "";
  resize();

  const typing = addMsg("Typing…", "ai");

  try {
    const r = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await r.json();
    typing.querySelector(".bubble").textContent = data.reply || "No reply.";
  } catch (err) {
    typing.querySelector(".bubble").textContent =
      "Could not reach server. Make sure `node server.js` is running on port 3001.";
  }
});
