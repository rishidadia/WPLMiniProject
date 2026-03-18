//Profile section

const form = document.getElementById("profileForm");
const preview = document.getElementById("preview");

const displayName = document.getElementById("displayName");
const displayLocation = document.getElementById("displayLocation");

let profileData = {};
let selectedSports = [];

/* SPORTS SELECTOR */
const options = document.querySelectorAll(".sports-options span");
const selectedContainer = document.getElementById("selectedSports");

options.forEach(option => {
    option.addEventListener("click", () => {
        const sport = option.innerText;

        if (!selectedSports.includes(sport)) {
            selectedSports.push(sport);
            renderSports();
        }
    });
});

function renderSports() {
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

/* RENDER THE DATA */
window.onload = () => {
    const saved = localStorage.getItem("profile");

    if (saved) {
        profileData = JSON.parse(saved);

        document.getElementById("name").value = profileData.name || "";
        document.getElementById("age").value = profileData.age || "";
        document.getElementById("college").value = profileData.college || "";
        document.getElementById("location").value = profileData.location || "";
        document.getElementById("stats").value = profileData.stats || "";

        displayName.innerText = profileData.name || "Your Name";
        displayLocation.innerText = profileData.location || "Location";

        if (profileData.image) {
            preview.src = profileData.image;
        }

        if (profileData.sports) {
            selectedSports = profileData.sports;
            renderSports();
        }
    }
};


document.getElementById("profilePic").addEventListener("change", function () {
    const file = this.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        preview.src = reader.result;
    };

    if (file) reader.readAsDataURL(file);
});


form.addEventListener("submit", (e) => {
    e.preventDefault();

    profileData = {
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        college: document.getElementById("college").value,
        location: document.getElementById("location").value,
        sports: selectedSports,
        stats: document.getElementById("stats").value,
        image: preview.src || ""
    };

    localStorage.setItem("profile", JSON.stringify(profileData));
    location.reload();
});

/* RESET */
document.getElementById("clearBtn").addEventListener("click", () => {
    localStorage.removeItem("profile");
    location.reload();
});
const cardSports = document.getElementById("cardSports");

function updateCard(data) {
    displayName.innerText = data.name || "Your Name";
    displayLocation.innerText = data.location || "Location";

    // sports tags
    cardSports.innerHTML = "";
    (data.sports || []).forEach(s => {
        const tag = document.createElement("span");
        tag.innerText = s;
        cardSports.appendChild(tag);
    });
}