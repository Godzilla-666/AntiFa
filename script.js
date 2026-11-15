
const EVENTS_URL = "./events.json";

const searchInput = document.querySelector("#search");
const dateInput = document.querySelector("#date");
const resultsContainer = document.querySelector("#results");
const updatedLabel = document.querySelector("#last-updated");

let events = [];

async function loadEvents() {
  try {
    const response = await fetch(
      `${EVENTS_URL}?t=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Eventdaten konnten nicht geladen werden.");
    }

    const data = await response.json();

    events = Array.isArray(data.events) ? data.events : [];

    if (updatedLabel) {
      updatedLabel.textContent = data.lastUpdated
        ? new Date(data.lastUpdated).toLocaleString("de-DE")
        : "Unbekannt";
    }

    renderEvents();
  } catch (error) {
    resultsContainer.textContent =
      "Veranstaltungsdaten sind momentan nicht verfügbar.";
    console.error(error);
  }
}

function renderEvents() {
  if (!resultsContainer) return;

  const query = (searchInput?.value || "").toLowerCase().trim();
  const selectedDate = dateInput?.value || "";

  const filtered = events.filter(event => {
    const searchableText = [
      event.title,
      event.city,
      event.category,
      event.description
    ].join(" ").toLowerCase();

    const matchesQuery = searchableText.includes(query);
    const matchesDate =
      !selectedDate || event.date === selectedDate;

    return matchesQuery && matchesDate;
  });

  resultsContainer.replaceChildren();

  if (filtered.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Keine passenden Veranstaltungen gefunden.";
    resultsContainer.appendChild(message);
    return;
  }

  filtered.forEach(event => {
    const card = document.createElement("article");
    card.className = "event-card";

    const title = document.createElement("h2");
    title.textContent = event.title || "Veranstaltung";

    const city = document.createElement("p");
    city.textContent = `Stadt: ${event.city || "Unbekannt"}`;

    const date = document.createElement("p");
    date.textContent = `Datum: ${event.date || "Unbekannt"}`;

    const category = document.createElement("p");
    category.textContent = `Kategorie: ${event.category || "Sonstiges"}`;

    const description = document.createElement("p");
    description.textContent = event.description || "";

    card.append(title, city, date, category, description);

    if (event.source) {
      try {
        const url = new URL(event.source);

        if (url.protocol === "https:") {
          const link = document.createElement("a");
          link.href = url.href;
          link.textContent = "Quelle öffnen";
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          card.appendChild(link);
        }
      } catch {
        // Ungültige Quellenlinks werden nicht angezeigt.
      }
    }

    resultsContainer.appendChild(card);
  });
}

searchInput?.addEventListener("input", renderEvents);
dateInput?.addEventListener("change", renderEvents);

loadEvents();
