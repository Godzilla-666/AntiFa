
"use strict";

// -----------------------------------------
// ANTI FA – Veranstaltungssuche
// -----------------------------------------

// Erst nach Prüfung der API-Dokumentation eintragen.
const API_URL = "";

let allEvents = [];

const elements = {
  city: document.getElementById("city"),
  date: document.getElementById("date"),
  keyword: document.getElementById("keyword"),
  search: document.getElementById("searchButton"),
  reset: document.getElementById("resetButton"),
  list: document.getElementById("eventList"),
  count: document.getElementById("resultCount"),
  notice: document.getElementById("notice")
};

// Daten aus einer API in ein einheitliches Format bringen.
function normalizeEvent(item) {
  return {
    title: item.title || item.name || "Veranstaltung",
    city: item.city || item.locality || item.region || "Nicht angegeben",
    date: item.start_date || item.date || item.datetime || "",
    description:
      item.description ||
      item.full_text ||
      item.summary ||
      "Keine Beschreibung veröffentlicht.",
    source: item.source_url || item.base_url || item.url || ""
  };
}

// Öffentliche Veranstaltungsdaten laden.
async function loadEvents() {
  if (!API_URL) {
    showNotice(
      "Die Oberfläche ist bereit. Für echte Live-Daten muss noch " +
      "der bestätigte API-Endpunkt und dessen Datenformat eingetragen werden."
    );
    elements.count.textContent = "API noch nicht verbunden";
    renderEvents([]);
    return;
  }

  try {
    elements.notice.textContent = "Daten werden geladen …";

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const data = await response.json();

    // Unterstützt sowohl ein Array als auch gängige API-Container.
    const items = Array.isArray(data)
      ? data
      : data.results || data.events || data.data || [];

    allEvents = items.map(normalizeEvent);

    showNotice(
      "Daten erfolgreich geladen. Bitte prüfe Termine und Angaben immer bei der Originalquelle."
    );

    applyFilters();

  } catch (error) {
    console.error("Fehler beim Laden:", error);

    showNotice(
      "Die Datenquelle ist momentan nicht erreichbar. " +
      "Bitte versuche es später erneut."
    );

    elements.count.textContent = "Keine Live-Verbindung";
    renderEvents([]);
  }
}

// Meldungen anzeigen.
function showNotice(message) {
  elements.notice.textContent = message;
}

// Datum lesbar darstellen.
function formatDate(value) {
  if (!value) return "Kein Datum angegeben";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

// HTML sicher als Text ausgeben.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// Suchfilter anwenden.
function applyFilters() {
  const city = elements.city.value.trim().toLocaleLowerCase("de");
  const keyword = elements.keyword.value.trim().toLocaleLowerCase("de");
  const date = elements.date.value;

  const filtered = allEvents.filter(event => {
    const cityMatch =
      !city || event.city.toLocaleLowerCase("de").includes(city);

    const text = (
      event.title + " " + event.description + " " + event.city
    ).toLocaleLowerCase("de");

    const keywordMatch = !keyword || text.includes(keyword);

    const eventDate = event.date
      ? new Date(event.date)
      : null;

    const dateMatch =
      !date ||
      (eventDate &&
        !Number.isNaN(eventDate.getTime()) &&
        eventDate >= new Date(date + "T00:00:00"));

    return cityMatch && keywordMatch && dateMatch;
  });

  renderEvents(filtered);
}

// Veranstaltungskarten anzeigen.
function renderEvents(events) {
  elements.count.textContent = events.length + " Ergebnisse";
  elements.list.replaceChildren();

  if (!events.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = allEvents.length
      ? "Keine passenden Einträge gefunden. Ändere deine Filter."
      : "Aktuell sind keine Daten geladen.";
    elements.list.appendChild(empty);
    return;
  }

  events.forEach(event => {
    const card = document.createElement("article");
    card.className = "event-card";

    const title = document.createElement("h3");
    title.textContent = event.title;

    const meta = document.createElement("div");
    meta.className = "event-meta";
    meta.textContent =
      "📍 " + event.city + " · 📅 " + formatDate(event.date);

    const description = document.createElement("p");
    description.className = "event-description";
    description.textContent = event.description;

    card.append(title, meta, description);

    if (event.source) {
      try {
        const url = new URL(event.source);

        if (url.protocol === "https:" || url.protocol === "http:") {
          const link = document.createElement("a");
          link.className = "source-link";
          link.href = url.href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "Originalquelle öffnen →";
          card.appendChild(link);
        }
      } catch {
        // Ungültige Quellenlinks nicht anzeigen.
      }
    }

    elements.list.appendChild(card);
  });
}

// Filter zurücksetzen.
elements.reset.addEventListener("click", () => {
  elements.city.value = "";
  elements.date.value = "";
  elements.keyword.value = "";
  applyFilters();
});

// Suchen.
elements.search.addEventListener("click", applyFilters);

elements.city.addEventListener("keydown", event => {
  if (event.key === "Enter") applyFilters();
});

elements.keyword.addEventListener("keydown", event => {
  if (event.key === "Enter") applyFilters();
});

// Start.
loadEvents();
