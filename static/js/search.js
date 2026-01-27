// Search functionality using Fuse.js
// This script loads the search index and provides search functionality for Russian content

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

    try {
      const response = await fetch(this.searchIndexUrl);
      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.status}`);
      }
      const searchIndex = await response.json();

      // Debug: Log first item to see structure
      if (searchIndex.length > 0) {
        console.log("Search index sample item:", searchIndex[0]);
      }

      // Initialize Fuse with the search index
      this.fuse = new Fuse(searchIndex, this.fuseOptions);
      this.initialized = true;
      console.log(
        "Search index loaded successfully with",
        searchIndex.length,
        "items",
      );
    } catch (error) {
      console.error("Error loading search index:", error);
      throw error;
    }
  }

  search(query) {
    if (!this.initialized || !this.fuse) {
      console.error("Search not initialized");
      return [];
    }

    if (!query || query.trim().length === 0) {
      return [];
    }

    return this.fuse.search(query);
  }
}

// Global search instance
let searchInstance = null;

// Initialize search when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  if (!searchInput || !searchResults) {
    return; // Search elements not present on this page
  }

  try {
    // Initialize search
    searchInstance = new ZolaSearch();
    await searchInstance.init();

    // Handle search input
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length === 0) {
        searchResults.innerHTML = "";
        searchResults.classList.add("hidden");
        return;
      }

      // Debounce search
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 300);
    });

    // Handle click outside to close results
    document.addEventListener("click", (e) => {
      if (
        !searchInput.contains(e.target) &&
        !searchResults.contains(e.target)
      ) {
        searchResults.classList.add("hidden");
      }
    });

    // Show results when clicking on search input
    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim().length > 0 && searchResults.innerHTML) {
        searchResults.classList.remove("hidden");
      }
    });
  } catch (error) {
    console.error("Failed to initialize search:", error);
    searchInput.placeholder = "Поиск недоступен";
    searchInput.disabled = true;
  }
});

function performSearch(query) {
  const searchResults = document.getElementById("search-results");

  if (!searchInstance) {
    return;
  }

  const results = searchInstance.search(query);

  if (results.length === 0) {
    searchResults.innerHTML = `
            <div class="p-4 text-gray-500 text-center">
                Ничего не найдено по запросу "${escapeHtml(query)}"
            </div>
        `;
    searchResults.classList.remove("hidden");
    return;
  }

  // Limit to top 10 results
  const topResults = results.slice(0, 50);

  const resultHtml = topResults
    .map((result) => {
      const item = result.item;
      // Zola's Fuse.js format uses 'path' or 'permalink' field
      const url = item.permalink || item.path || "#";
      const title = item.title || "Без названия";
      const body = item.body || item.content || "";
      const excerpt = getExcerpt(body, query);

      return `
            <a href="${url}" class="block p-4 hover:bg-gray-50 border-b border-gray-200 transition-colors">
                <h3 class="font-semibold text-gray-900 mb-1">${highlightMatch(title, query)}</h3>
                ${excerpt ? `<p class="text-sm text-gray-600">${excerpt}</p>` : ""}
            </a>
        `;
    })
    .join("");

  searchResults.innerHTML = resultHtml;
  searchResults.classList.remove("hidden");
}

function getExcerpt(text, query, maxLength = 150) {
  if (!text) return "";

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return (
      escapeHtml(text.substring(0, maxLength)) +
      (text.length > maxLength ? "..." : "")
    );
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + query.length + 100);

  let excerpt = text.substring(start, end);
  if (start > 0) excerpt = "..." + excerpt;
  if (end < text.length) excerpt = excerpt + "...";

  return highlightMatch(escapeHtml(excerpt), query);
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
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
