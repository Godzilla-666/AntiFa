
const ELECTIONS_URL = "./wahlen.json";

const search = document.querySelector("#election-search");
const results = document.querySelector("#election-results");
const statusText = document.querySelector("#election-status");
const updated = document.querySelector("#election-updated");

let elections = [];

async function loadElections() {
  try {
    const response = await fetch(
      `${ELECTIONS_URL}?t=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Wahldaten konnten nicht geladen werden.");
    }

    const data = await response.json();
    elections = Array.isArray(data.elections) ? data.elections : [];

    updated.textContent = data.lastUpdated
      ? new Date(data.lastUpdated).toLocaleString("de-DE")
      : "Nicht bekannt";

    renderElections();
  } catch (error) {
    statusText.textContent =
      "Die Wahldaten sind momentan nicht verfügbar.";
    console.error(error);
  }
}

function renderElections() {
  const query = search.value.toLowerCase().trim();
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = elections
    .filter(election => {
      const text = [
        election.title,
        election.region,
        election.type,
        election.dateLabel
      ].join(" ").toLowerCase();

      const notPast =
        !election.dateISO || election.dateISO >= today;

      return text.includes(query) && notPast;
    })
    .sort((a, b) => {
      if (!a.dateISO) return 1;
      if (!b.dateISO) return -1;
      return a.dateISO.localeCompare(b.dateISO);
    });

  results.replaceChildren();

  if (upcoming.length === 0) {
    statusText.textContent = "Keine passenden Wahltermine gefunden.";
    return;
  }

  statusText.textContent =
    `${upcoming.length} Wahltermine gefunden.`;

  upcoming.forEach(election => {
    const card = document.createElement("article");
    card.className = "election-card";

    const title = document.createElement("h2");
    title.textContent = election.title;

    const region = document.createElement("p");
    region.textContent = `Gebiet: ${election.region}`;

    const date = document.createElement("p");
    date.textContent = `Termin: ${election.dateLabel}`;

    const type = document.createElement("p");
    type.textContent = `Art: ${election.type}`;

    const link = document.createElement("a");
    link.href = election.source;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Offizielle Quelle öffnen";

    card.append(title, region, date, type, link);
    results.appendChild(card);
  });
}

search.addEventListener("input", renderElections);

loadElections();
