const streetName = document.getElementById("street-name");
const numStreets = document.getElementById("num-streets");
const statBad = document.getElementById("stat-bad");
const statOk = document.getElementById("stat-ok");
const statGood = document.getElementById("stat-good");
const bottomBar = document.getElementById("bottom-bar");
const result = document.getElementById("result");
const topBar = document.getElementById("top-bar");

const map = L.map("map", {
    doubleClickZoom: false,
    attributionControl: false,
});

const defaultView = {
    center: [1.3521, 103.8198],
    zoom: 12
}

const topBarControl = L.Control.extend({
    options: { position: "topleft" },
    onAdd: () => topBar,
});
map.addControl(new topBarControl());
const corners = map._controlCorners['topleft'];
corners.insertBefore(topBar, corners.firstChild);

const homeControl = L.Control.extend({
    options: { position: "topleft" },
    onAdd: function () {
        const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        const button = L.DomUtil.create("a", "", container);
        button.innerHTML = "⌂";
        button.style.fontSize = "24px";
        button.title = "Default view";
        button.href = "#";
        L.DomEvent.on(button, "click", L.DomEvent.stop)
            .on(button, "click", () => map.setView(defaultView.center, defaultView.zoom));
        return container;
    }
});
map.addControl(new homeControl());

const bottomBarControl = L.Control.extend({
    options: { position: "bottomleft" },
    onAdd: () => bottomBar,
});
map.addControl(new bottomBarControl());

const correctThreshold = 50; // in meters
const seqRepeatThreshold = 7;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

function getHistory() {
    let history = localStorage.getItem("history");
    let seq = localStorage.getItem("seq");
    if (!history) {
        history = JSON.stringify(streets.map(street => ({
            street,
            score: 0,
            lastGuessSeq: -9999,
        })));
        localStorage.setItem("history", history);
    }
    if (!seq) {
        seq = "0";
        localStorage.setItem("seq", "0");
    }
    return [JSON.parse(history), parseInt(seq)];
}

let polylines = [];
let chosenStreet;

filter.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        initGuess();
    }
})

function determineStreet(history, seq) {
    if (filter.value !== "") {
        console.log(new RegExp(filter.value, "i"));
        history = history.filter(s => new RegExp(filter.value, "i").test(s.street.street));
    }

    numStreets.textContent = `#streets: ${history.length}`;
    const bad = history.filter(s => s.score < 1).length;
    const badP = Math.round(bad / history.length * 100);
    statBad.innerHTML = `B:${bad}[${badP}%]`;

    const ok = history.filter(s => [1, 2].includes(s.score)).length;
    const okP = Math.round(ok / history.length * 100, 1);
    statOk.innerHTML = `O:${ok}[${okP}%]`;

    const good = history.filter(s => s.score > 2).length;
    const goodP = Math.round(good / history.length * 100);
    statGood.innerHTML = `G:${good}[${goodP}%]`;

    history.sort((a, b) => {
        const seqDeltaA = seq - a.lastGuessSeq;
        const seqDeltaB = seq - b.lastGuessSeq;
        if (seqDeltaA < seqRepeatThreshold && seqDeltaB >= seqRepeatThreshold) {
            return 1;
        } else if (seqDeltaA >= seqRepeatThreshold && seqDeltaB < seqRepeatThreshold) {
            return -1;
        }

        if (a.score === b.score) {
            return a.street < b.street ? -1 : 1;
        }
        return a.score - b.score;
    });
    return streets.find(s => s.street === history[0].street.street);
}

function initGuess() {
    map.setView(defaultView.center, defaultView.zoom);

    polylines.forEach(polyline => {
        map.removeLayer(polyline);
    });
    polylines = [];

    const [history, seq] = getHistory();
    chosenStreet = determineStreet(history, seq);
    console.log("Chosen street", chosenStreet);
    streetName.textContent = chosenStreet.street;
}

let userMarker;

map.on("click", function (e) {
    if (e.originalEvent.target.closest("#top-bar")) {
        return;
    }

    if (mode !== "guessing") {
        return;
    }

    if (userMarker) {
        map.removeLayer(userMarker);
    }

    userMarker = L.marker(e.latlng, { interactive: false }).addTo(map);
});

let mode = "guessing";

function guess() {
    for (const latlngs of chosenStreet.latlngs) {
        polylines.push(L.polyline(latlngs, { color: "blue", weight: 5 }).addTo(map));
    }
    const streetBoundingBox = L.latLngBounds(chosenStreet.latlngs.map(latlng => latlng[0]));
    const userLatLng = userMarker.getLatLng();
    const boundingBox = streetBoundingBox.extend(userLatLng);
    map.flyToBounds(boundingBox, { padding: [50, 50] });
    let dist = Infinity;
    for (let i = 0; i < chosenStreet.latlngs.length; i++) {
        for (let j = 1; j < chosenStreet.latlngs[i].length; j++) {
            const point1 = L.latLng(chosenStreet.latlngs[i][j - 1]);
            const point2 = L.latLng(chosenStreet.latlngs[i][j]);
            const closest = L.GeometryUtil.closestOnSegment(map, userLatLng, point1, point2);
            const distance = userLatLng.distanceTo(closest);
            if (distance < dist) {
                dist = distance;
            }
        }
    }
    const distanceInKm = (dist / 1000).toFixed(2);
    const distanceInM = Math.round(dist);
    const { isSuccess, oldScore, newScore } = saveScore(distanceInM, chosenStreet.street);
    const distanceInKmText = distanceInKm > 1 ? `${distanceInKm} km` : `${distanceInM} m`;
    result.textContent = `You guessed ${distanceInKmText} away from ${chosenStreet.street} ${isSuccess ? "✅" : "❌"}. `
        + `New score for this street is ${newScore} (old: ${oldScore}).`;
}

function saveScore(distance, street) {
    const isSuccess = distance < correctThreshold;
    const [history, seq] = getHistory();
    const index = history.findIndex(s => s.street.street === street);
    let oldScore;
    let newScore;
    if (index !== -1) {
        oldScore = history[index].score;
        newScore = Math.min(Math.max(history[index].score + (isSuccess ? 1 : -1), -3), 5);
        history[index].score = newScore;
        history[index].lastGuessSeq = seq;
    } else {
        console.error("Street not found in history", street, history);
    }
    localStorage.setItem("history", JSON.stringify(history));
    localStorage.setItem("seq", (seq + 1).toString());
    return { isSuccess, oldScore, newScore };
}

map.on("dblclick", function (e) {
    if (mode !== "guessing") {
        return;
    }

    map.setView(e.latlng, map.getMaxZoom() - 1);
});

addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
        if (!userMarker) {
            return;
        }
        if (mode === "guessing") {
            guess();
            mode = "guessed";
        } else {
            map.removeLayer(userMarker);
            userMarker = undefined;
            initGuess();
            result.textContent = "";
            mode = "guessing";
        }
    }
})

initGuess();