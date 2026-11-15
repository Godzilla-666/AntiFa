
const cities = {
    "Berlin": [52.5200, 13.4050],
    "Hamburg": [53.5511, 9.9937],
    "München": [48.1351, 11.5820],
    "Köln": [50.9375, 6.9603],
    "Frankfurt": [50.1109, 8.6821],
    "Stuttgart": [48.7758, 9.1829],
    "Düsseldorf": [51.2277, 6.7735],
    "Leipzig": [51.3397, 12.3731],
    "Dresden": [51.0504, 13.7373],
    "Bremen": [53.0793, 8.8017],
    "Flensburg": [54.7937, 9.4469],
    "Kiel": [54.3233, 10.1228],
    "Hannover": [52.3759, 9.7320],
    "Dortmund": [51.5136, 7.4653],
    "Nürnberg": [49.4521, 11.0767]
};

// Beispieldaten
const demos = [
    {
        name: "Demo in Berlin",
        city: "Berlin",
        lat: 52.5200,
        lon: 13.4050,
        date: "20. November 2026",
        description: "Beispielveranstaltung in Berlin."
    },
    {
        name: "Demo in Hamburg",
        city: "Hamburg",
        lat: 53.5511,
        lon: 9.9937,
        date: "22. November 2026",
        description: "Beispielveranstaltung in Hamburg."
    },
    {
        name: "Demo in München",
        city: "München",
        lat: 48.1351,
        lon: 11.5820,
        date: "25. November 2026",
        description: "Beispielveranstaltung in München."
    },
    {
        name: "Demo in Flensburg",
        city: "Flensburg",
        lat: 54.7937,
        lon: 9.4469,
        date: "28. November 2026",
        description: "Beispielveranstaltung in Flensburg."
    },
    {
        name: "Demo in Kiel",
        city: "Kiel",
        lat: 54.3233,
        lon: 10.1228,
        date: "30. November 2026",
        description: "Beispielveranstaltung in Kiel."
    }
];

// Entfernung zwischen zwei Koordinaten berechnen
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );
}

function searchDemos() {
    const city = document.getElementById("city").value;
    const radius = Number(
        document.getElementById("radius").value
    );

    const results = document.getElementById("results");

    if (!city) {
        results.innerHTML =
            "<p>Bitte wähle zuerst eine Stadt aus.</p>";
        return;
    }

    const [lat, lon] = cities[city];

    const found = demos.filter(demo => {
        const distance = getDistance(
            lat,
            lon,
            demo.lat,
            demo.lon
        );

        return distance <= radius;
    });

    if (found.length === 0) {
        results.innerHTML =
            "<p>Leider wurden in diesem Umkreis keine Demos gefunden.</p>";
        return;
    }

    results.innerHTML = `
        <h2 style="margin-bottom:20px">
            ${found.length} Demos gefunden
        </h2>
    `;

    found.forEach(demo => {
        const distance = getDistance(
            lat, lon, demo.lat, demo.lon
        );

        results.innerHTML += `
            <div class="demo-card">
                <h3>${demo.name}</h3>
                <p>📍 ${demo.city}</p>
                <p>📅 ${demo.date}</p>
                <p>📏 ${distance.toFixed(1)} km entfernt</p>
                <p>${demo.description}</p>
            </div>
        `;
    });
}
