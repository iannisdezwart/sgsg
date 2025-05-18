import { streets } from "./streets.js";
import { createWriteStream } from "fs";

const delay = 500

const scrape = async () => {
    const fileStream = createWriteStream("streets.jsonl");
    for (const street of streets) {
        const data = await scrapeStreet(street);
        fileStream.write(JSON.stringify(data) + "\n");
        console.log(`Scraped ${street}`);
        const progress = ((streets.indexOf(street) + 1) / streets.length) * 100;
        console.log(`Progress: ${progress.toFixed(2)}%`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    fileStream.end();
    console.log("Scraping completed.");
}

const scrapeStreet = async (street) => {
    const query = `
    [out:json];
    area["name"="Singapore"]->.searchArea;
    way["name"="${street}"](area.searchArea);
    (._;>;);
    out body;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
    });

    const json = await response.json();
    const nodes = {};

    json.elements.forEach(el => {
        if (el.type === "node") {
            nodes[el.id] = [el.lat, el.lon];
        }
    });

    const data = {
        street,
        latlngs: []
    };
    json.elements.forEach(el => {
        if (el.type === "way") {
            const latlngs = el.nodes.map(id => nodes[id]).filter(Boolean);
            data.latlngs.push(latlngs);
        }
    });
    return data;
}

scrape();