// ------------------------------
// Quotes storage
// ------------------------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportQuotes");
const importFile = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");

// ------------------------------
// Save & Load
// ------------------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ------------------------------
// Populate Category Dropdown
// ------------------------------
function populateCategories() {
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const lastFilter = localStorage.getItem("lastCategoryFilter") || "all";
  categoryFilter.value = lastFilter;
}

// ------------------------------
// Show Random Quote
// ------------------------------
function showRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = categoryFilter.value;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available in this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `"${quote.text}" – (${quote.category})`;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ------------------------------
// Add New Quote
// ------------------------------
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both a quote and a category!");
    return;
  }

  quotes.push({ text: newQuoteText, category: newQuoteCategory });
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// ------------------------------
// Filter Quotes
// ------------------------------
function filterQuotes() {
  localStorage.setItem("lastCategoryFilter", categoryFilter.value);
  showRandomQuote();
}

// ------------------------------
// Create Add Quote Form
// ------------------------------
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// ------------------------------
// Export & Import JSON
// ------------------------------
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Must be an array of quotes.");
      }
    } catch {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ------------------------------
// Simulated Server Sync
// ------------------------------
async function fetchServerQuotes() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();

    // Convert server data to quote format
    const serverQuotes = serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: server data takes precedence
    const localSet = new Set(quotes.map(q => q.text));
    let conflictsResolved = 0;
    serverQuotes.forEach(sq => {
      if (!localSet.has(sq.text)) {
        quotes.push(sq);
        conflictsResolved++;
      }
    });

    if (conflictsResolved > 0) {
      saveQuotes();
      populateCategories();
      alert(`${conflictsResolved} new quote(s) synced from server.`);
    }

  } catch (err) {
    console.error("Server fetch failed:", err);
  }
}

// Periodically sync every 30 seconds
setInterval(fetchServerQuotes, 30000);

// ------------------------------
// Event Listeners
// ------------------------------
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportQuotes);
importFile.addEventListener("change", importFromJsonFile);
categoryFilter.addEventListener("change", filterQuotes);

// ------------------------------
// Init
// ------------------------------
createAddQuoteForm();
populateCategories();

const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  const parsedQuote = JSON.parse(lastQuote);
  quoteDisplay.innerHTML = `"${parsedQuote.text}" – (${parsedQuote.category})`;
} else {
  showRandomQuote();
}
