const input = document.getElementById("storeInput");
const btn = document.getElementById("searchBtn");
const results = document.getElementById("results");

btn.onclick = findCodes;

function renderCodes(codes) {
  results.innerHTML = "";
  if (!codes.length) {
    results.innerHTML = "<p>No codes found.</p>";
    return;
  }

  codes.forEach(c => {
    const div = document.createElement("div");
    div.className = "code";
    div.innerHTML = `
      <div class="code-row">
        <strong>${c.code}</strong>
        <button class="copy-btn" data-code="${c.code}">Copy</button>
      </div>
      <span>${c.desc || ""}</span>
    `;
    results.appendChild(div);
  });

  // copy handlers
  results.querySelectorAll(".copy-btn").forEach(b => {
    b.addEventListener("click", async () => {
      const code = b.getAttribute("data-code");
      await navigator.clipboard.writeText(code);
      b.textContent = "Copied";
      setTimeout(() => (b.textContent = "Copy"), 900);
    });
  });
}

async function findCodes() {
  const store = input.value.trim();
  results.innerHTML = "";

  if (!store) {
    results.innerHTML = "<p>Please enter a store.</p>";
    return;
  }

  results.innerHTML = "<p>Searching…</p>";

  try {
    const r = await fetch(`http://localhost:3001/api/promos?store=${encodeURIComponent(store)}`);
    const data = await r.json();

    if (!r.ok) {
      results.innerHTML = `<p>Error: ${data.error || "Request failed"}</p>`;
      return;
    }

    renderCodes(data.codes || []);
  } catch (e) {
    results.innerHTML = "<p>Could not reach server. Is node server.js running?</p>";
  }
}
