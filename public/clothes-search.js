const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const btn = document.getElementById("searchBtn");

let selectedFile = null;

input.addEventListener("change", e => {
  selectedFile = e.target.files[0];
  preview.innerHTML = `<img src="${URL.createObjectURL(selectedFile)}" />`;
});

btn.addEventListener("click", async () => {
  if (!selectedFile) return alert("Upload image");

  const formData = new FormData();
  formData.append("image", selectedFile);

  result.innerHTML = "Searching...";

  try {
    const res = await fetch("http://localhost:3001/api/photo-search", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const error = await res.json();
      result.innerHTML = `<p class="error">Error: ${error.error}</p>`;
      return;
    }

    const data = await res.json();
    renderResult(data);
  } catch (e) {
    console.error("Search error:", e);
    result.innerHTML = `<p class="error">Failed to connect to server. Make sure backend is running on http://localhost:3001</p>`;
  }
});

function renderResult(data) {
  if (!data.success || !data.results || data.results.length === 0) {
    result.innerHTML = `
      <div class="search-result">
        <h3>No matching items found</h3>
        <p>Description: ${data.imageDescription || "Could not analyze image"}</p>
      </div>
    `;
    return;
  }

  result.innerHTML = `
    <div class="search-result">
      <h3>Found ${data.count} matching items</h3>
      <p><small>Image: ${data.imageDescription || "analyzed"}</small></p>
      <ul class="clothing-results">
        ${data.results
          .map(
            item => `
          <li class="clothing-item">
            <h4>${item.name}</h4>
            <p><strong>Brand:</strong> ${item.brand}</p>
            <p><strong>Color:</strong> ${item.color} | <strong>Type:</strong> ${item.type}</p>
            <p><strong>Price:</strong> $${item.price}</p>
            <a href="${item.url}" target="_blank" class="btn btn-small">View Item</a>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `;
}
