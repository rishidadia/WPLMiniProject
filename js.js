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

async function renderProfileMatches() {
    const container = document.getElementById("profileMatchesList");
    if (!container) return;
    
    container.innerHTML = "Loading matches...";
    
    try {
        const res = await fetch("api/get_matches.php");
        const data = await res.json();
        
        container.innerHTML = "";
        
        if (data.status !== "success" || !data.matches || data.matches.length === 0) {
            container.innerHTML = "<p>No matches played yet.</p>";
            return;
        }

        data.matches.forEach(match => {
            const card = document.createElement("div");
            card.className = "profile-match-card";
            const outcomeClass = match.outcome === "Won" ? "win" : "loss";
            card.innerHTML = `
                <strong>${match.sport}</strong>
                <p>Outcome: <span class="${outcomeClass}">${match.outcome}</span></p>
                <p>Date: ${match.date}</p>
                <p>${match.notes}</p>
            `;
            container.appendChild(card);
        });
    } catch(err) {
        container.innerHTML = "<p>Error loading matches.</p>";
    }
}

window.onload = async () => {
    try {
        const res = await fetch("api/get_profile.php");
        const data = await res.json();
        
        if (data.status === "success" && data.profile) {
            profileData = data.profile;
            
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
    } catch(err) {
        console.error("Error loading profile", err);
    }

    renderMatches();
    if(document.getElementById("profileMatchesList")) {
        renderProfileMatches();
    }
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
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        profileData = {
            name: document.getElementById("name").value,
            age: document.getElementById("age").value,
            college: document.getElementById("college").value,
            location: document.getElementById("location").value,
            sports: selectedSports,
            stats: document.getElementById("stats") ? document.getElementById("stats").value : "",
            image: preview && preview.src && !preview.src.endsWith(location.host+"/") && !preview.src.endsWith(location.host) ? preview.src : "" 
        };

        try {
            const res = await fetch("api/save_profile.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileData)
            });
            const data = await res.json();
            if (data.status === "success") {
                alert("Profile saved successfully!");
                location.reload();
            } else {
                alert("Error saving profile: " + data.message);
            }
        } catch(err) {
            alert("Network error.");
            console.error(err);
        }
    });
}

const clearBtn = document.getElementById("clearBtn");
if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
         const emptyProfile = {
            name: "", age: null, college: "", location: "", sports: [], stats: "", image: ""
        };
        try {
            const res = await fetch("api/save_profile.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emptyProfile)
            });
            const data = await res.json();
            if (data.status === "success") {
                location.reload();
            }
        } catch(err) {
            console.error(err);
        }
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
    matchForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const sport = document.getElementById("matchSport").value;
        const outcome = document.querySelector('input[name="matchOutcome"]:checked').value;
        const notes = document.getElementById("matchNotes").value;

        const newMatch = { sport, outcome, notes };

        try {
            const res = await fetch("api/save_match.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMatch)
            });
            const data = await res.json();
            if (data.status === "success") {
                matchForm.reset();
                renderMatches();
            } else {
                alert("Failed to save match: " + data.message);
            }
        } catch(err) {
             console.error("Network error saving match", err);
        }
    });

    if (resetMatchesBtn) {
        resetMatchesBtn.addEventListener("click", () => {
            alert("Resetting matches via API is not implemented in this demo.");
        });
    }
}

async function renderMatches() {
    if (!matchesList) return;

    matchesList.innerHTML = "Loading...";
    try {
        const res = await fetch("api/get_matches.php");
        const data = await res.json();

        matchesList.innerHTML = "";
        
        if (data.status !== "success" || !data.matches || data.matches.length === 0) {
            matchesList.innerHTML = "<p>No matches recorded yet.</p>";
            return;
        }

        data.matches.forEach(match => {
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
    } catch(err) {
        matchesList.innerHTML = "<p>Error loading matches.</p>";
        console.error(err);
    }
}
