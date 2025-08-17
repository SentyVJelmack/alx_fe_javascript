// ------------------------------
// Fetch quotes from server
// ------------------------------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();

    const serverQuotes = serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));

    return serverQuotes;
  } catch (err) {
    console.error("Server fetch failed:", err);
    return [];
  }
}

// ------------------------------
// Sync local quotes with server
// ------------------------------
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

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
}

// Periodically sync every 30 seconds
setInterval(syncQuotes, 30000);
