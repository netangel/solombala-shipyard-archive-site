// Search functionality using Fuse.js
// Loads the Zola fuse_json index once and binds every [data-search-input] /
// [data-search-results] pair on the page (header field + /search page field).

class ZolaSearch {
  constructor(options = {}) {
    this.searchIndexUrl = options.searchIndexUrl || "/search_index.ru.json";
    this.fuseOptions = {
      keys: [
        { name: "title", weight: 0.5 },
        { name: "body", weight: 0.2 },
        { name: "taxonomies", weight: 0.3 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
      ...options.fuseOptions,
    };
    this.fuse = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    const response = await fetch(this.searchIndexUrl);
    if (!response.ok) {
      throw new Error(`Failed to load search index: ${response.status}`);
    }
    const searchIndex = await response.json();
    this.fuse = new Fuse(searchIndex, this.fuseOptions);
    this.initialized = true;
  }

  search(query) {
    if (!this.initialized || !this.fuse) return [];
    if (!query || query.trim().length === 0) return [];
    return this.fuse.search(query);
  }
}

let searchInstance = null;

document.addEventListener("DOMContentLoaded", async () => {
  const inputs = Array.from(document.querySelectorAll("[data-search-input]"));
  if (inputs.length === 0) return;

  try {
    searchInstance = new ZolaSearch();
    await searchInstance.init();
  } catch (error) {
    console.error("Failed to initialize search:", error);
    inputs.forEach((input) => {
      input.placeholder = "поиск недоступен";
      input.disabled = true;
    });
    return;
  }

  inputs.forEach((input) => {
    const results =
      input.parentElement.querySelector("[data-search-results]") ||
      document.querySelector("[data-search-results]");
    if (!results) return;

    let timer;
    input.addEventListener("input", (e) => {
      clearTimeout(timer);
      const query = e.target.value.trim();
      if (query.length === 0) {
        results.innerHTML = "";
        results.classList.add("hidden");
        return;
      }
      timer = setTimeout(() => render(results, query), 250);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        results.classList.add("hidden");
        input.blur();
      }
    });

    input.addEventListener("focus", () => {
      if (input.value.trim().length > 0 && results.innerHTML) {
        results.classList.remove("hidden");
      }
    });

    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.classList.add("hidden");
      }
    });
  });
});

function render(container, query) {
  const hits = searchInstance.search(query);

  if (hits.length === 0) {
    container.innerHTML = `<div class="result result--empty">Ничего не найдено по запросу «${escapeHtml(query)}»</div>`;
    container.classList.remove("hidden");
    return;
  }

  container.innerHTML = hits
    .slice(0, 50)
    .map((hit) => {
      const item = hit.item;
      const url = item.url || item.permalink || item.path || "#";
      const title = item.title || "Без названия";
      const excerpt = getExcerpt(item.body || item.content || "", query);
      return `
        <a href="${url}" class="result">
          <p class="result__title">${highlightMatch(escapeHtml(title), query)}</p>
          ${excerpt ? `<p class="result__body">${excerpt}</p>` : ""}
        </a>
      `;
    })
    .join("");

  container.classList.remove("hidden");
}

function getExcerpt(text, query, maxLength = 150) {
  if (!text) return "";

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    return (
      escapeHtml(text.substring(0, maxLength)) +
      (text.length > maxLength ? "…" : "")
    );
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + query.length + 100);
  let excerpt = text.substring(start, end);
  if (start > 0) excerpt = "…" + excerpt;
  if (end < text.length) excerpt = excerpt + "…";

  return highlightMatch(escapeHtml(excerpt), query);
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
