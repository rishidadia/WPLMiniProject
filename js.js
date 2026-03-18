const form = document.getElementById("profileForm");
const preview = document.getElementById("preview");

const displayName = document.getElementById("displayName");
const displayLocation = document.getElementById("displayLocation");

let profileData = {};
let selectedSports = [];

const options = document.querySelectorAll(".sports-options span");
const selectedContainer = document.getElementById("selectedSports");

if (options.length > 0) {
    options.forEach(option => {
        option.addEventListener("click", () => {
            const sport = option.innerText;

            if (!selectedSports.includes(sport)) {
                selectedSports.push(sport);
                renderSports();
            }
        });
    });
}

function renderSports() {
    if (!selectedContainer) return;
    selectedContainer.innerHTML = "";

    selectedSports.forEach(sport => {
        const tag = document.createElement("span");
        tag.innerText = sport;

        tag.addEventListener("click", () => {
            selectedSports = selectedSports.filter(s => s !== sport);
            renderSports();
        });

        selectedContainer.appendChild(tag);
    });
}

window.onload = () => {
    const saved = localStorage.getItem("profile");

    if (saved) {
        profileData = JSON.parse(saved);

        const nameEl = document.getElementById("name");
        const ageEl = document.getElementById("age");
        const collegeEl = document.getElementById("college");
        const locationEl = document.getElementById("location");
        const statsEl = document.getElementById("stats");

        if (nameEl) nameEl.value = profileData.name || "";
        if (ageEl) ageEl.value = profileData.age || "";
        if (collegeEl) collegeEl.value = profileData.college || "";
        if (locationEl) locationEl.value = profileData.location || "";
        if (statsEl) statsEl.value = profileData.stats || "";

        if (displayName) displayName.innerText = profileData.name || "Your Name";
        if (displayLocation) displayLocation.innerText = profileData.location || "Location";

        if (profileData.image && preview) {
            preview.src = profileData.image;
        }

        if (profileData.sports) {
            selectedSports = profileData.sports;
            renderSports();
        }
    }

    renderMatches();
};

const profilePicEl = document.getElementById("profilePic");
if (profilePicEl) {
    profilePicEl.addEventListener("change", function () {
        const file = this.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            if (preview) preview.src = reader.result;
        };

        if (file) reader.readAsDataURL(file);
    });
}

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        profileData = {
            name: document.getElementById("name").value,
            age: document.getElementById("age").value,
            college: document.getElementById("college").value,
            location: document.getElementById("location").value,
            sports: selectedSports,
            stats: document.getElementById("stats").value,
            image: preview ? preview.src : ""
        };

        localStorage.setItem("profile", JSON.stringify(profileData));
        location.reload();
    });
}

const clearBtn = document.getElementById("clearBtn");
if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        localStorage.removeItem("profile");
        location.reload();
    });
}

const cardSports = document.getElementById("cardSports");

function updateCard(data) {
    if (displayName) displayName.innerText = data.name || "Your Name";
    if (displayLocation) displayLocation.innerText = data.location || "Location";

    if (cardSports) {
        cardSports.innerHTML = "";
        (data.sports || []).forEach(s => {
            const tag = document.createElement("span");
            tag.innerText = s;
            cardSports.appendChild(tag);
        });
    }
}

const matchForm = document.getElementById("matchForm");
const matchesList = document.getElementById("matchesList");
const resetMatchesBtn = document.getElementById("resetMatchesBtn");

if (matchForm) {
    matchForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const sport = document.getElementById("matchSport").value;
        const outcome = document.querySelector('input[name="matchOutcome"]:checked').value;
        const notes = document.getElementById("matchNotes").value;

        const newMatch = {
            id: Date.now(),
            sport,
            outcome,
            notes,
            date: new Date().toLocaleDateString()
        };

        const savedMatches = JSON.parse(localStorage.getItem("matches")) || [];
        savedMatches.push(newMatch);
        localStorage.setItem("matches", JSON.stringify(savedMatches));

        matchForm.reset();
        renderMatches();
    });

    if (resetMatchesBtn) {
        resetMatchesBtn.addEventListener("click", () => {
            localStorage.removeItem("matches");
            renderMatches();
        });
    }
}

function renderMatches() {
    if (!matchesList) return;

    matchesList.innerHTML = "";
    const savedMatches = JSON.parse(localStorage.getItem("matches")) || [];

    if (savedMatches.length === 0) {
        matchesList.innerHTML = "<p>No matches recorded yet.</p>";
        return;
    }
    savedMatches.forEach(match => {
        const card = document.createElement("div");
        card.className = "match-card";

        const outcomeClass = match.outcome === "Won" ? "win" : "loss";

        card.innerHTML = `
            <h3>${match.sport}</h3>
            <p>Outcome: <span class="${outcomeClass}">${match.outcome}</span></p>
            <p>Date: ${match.date}</p>
            <p>Notes: ${match.notes}</p>
        `;
        matchesList.appendChild(card);
    });
}
