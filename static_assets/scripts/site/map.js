function deg2rad(deg) {
	return (deg * Math.PI) / 180;
}

const extractKMZInfo = async (kmlText, kmz) => {
	const parser = new DOMParser();
	const parsedText = parser.parseFromString(kmlText, "text/xml");
	const maps = [];
	for (go of parsedText.getElementsByTagName("GroundOverlay")) {
		try {
			const latLonboxElNodes = go.getElementsByTagName("LatLonBox");
			const latLonQuadElNodes = go.getElementsByTagName("gx:LatLonQuad");
			const filePath = go.getElementsByTagName("href")[0].innerHTML;
			let imageDataURI;
			if (filePath.startsWith("http")) {
				imageDataURI = filePath;
			} else {
				const fileU8 = await kmz.file(filePath).async("uint8array");
				const filename = kmz.file(filePath).name;
				const extension = filename.toLowerCase().split(".").pop();
				let mime = "";
				if (extension === "jpg") {
					mime = "image/jpeg";
				} else if (["png", "gif", "jpeg", "webp", "avif"].includes(extension)) {
					mime = `image/${extension}`;
				}
				imageDataURI = `data:${mime};base64,${btoa(
					[].reduce.call(fileU8, (p, c) => p + String.fromCharCode(c), ""),
				)}`;
			}
			let bounds;
			for (let i = 0; i < latLonboxElNodes.length; i++) {
				const latLonboxEl = latLonboxElNodes[i];
				bounds = computeBoundsFromLatLonBox(
					Number.parseFloat(
						latLonboxEl.getElementsByTagName("north")[0].innerHTML,
					),
					Number.parseFloat(
						latLonboxEl.getElementsByTagName("east")[0].innerHTML,
					),
					Number.parseFloat(
						latLonboxEl.getElementsByTagName("south")[0].innerHTML,
					),
					Number.parseFloat(
						latLonboxEl.getElementsByTagName("west")[0].innerHTML,
					),
					Number.parseFloat(
						latLonboxEl.getElementsByTagName("rotation")[0]
							? latLonboxEl.getElementsByTagName("rotation")[0].innerHTML
							: 0,
					),
				);
				maps.push({ imageDataURI, bounds });
			}
			for (let i = 0; i < latLonQuadElNodes.length; i++) {
				const latLonQuadEl = latLonQuadElNodes[i];
				let [sw, se, ne, nw] = latLonQuadEl
					.getElementsByTagName("coordinates")[0]
					.innerHTML.trim()
					.split(" ");
				nw = nw.split(",");
				ne = ne.split(",");
				se = se.split(",");
				sw = sw.split(",");
				bounds = [
					[Number.parseFloat(nw[1]), Number.parseFloat(nw[0])],
					[Number.parseFloat(ne[1]), Number.parseFloat(ne[0])],
					[Number.parseFloat(se[1]), Number.parseFloat(se[0])],
					[Number.parseFloat(sw[1]), Number.parseFloat(sw[0])],
				];
				maps.push({ imageDataURI, bounds });
			}
		} catch (e) {
			alert("Error parsing your KMZ file!");
			return;
		}
	}
	return maps;
};

function computeBoundsFromLatLonBox(n, e, s, w, rot) {
	const a = (e + w) / 2;
	const b = (n + s) / 2;
	const squish = Math.cos(deg2rad(b));
	const x = (squish * (e - w)) / 2;
	const y = (n - s) / 2;

	const ne = [
		b + x * Math.sin(deg2rad(rot)) + y * Math.cos(deg2rad(rot)),
		a + (x * Math.cos(deg2rad(rot)) - y * Math.sin(deg2rad(rot))) / squish,
	];
	const nw = [
		b - x * Math.sin(deg2rad(rot)) + y * Math.cos(deg2rad(rot)),
		a - (x * Math.cos(deg2rad(rot)) + y * Math.sin(deg2rad(rot))) / squish,
	];
	const sw = [
		b - x * Math.sin(deg2rad(rot)) - y * Math.cos(deg2rad(rot)),
		a - (x * Math.cos(deg2rad(rot)) - y * Math.sin(deg2rad(rot))) / squish,
	];
	const se = [
		b + x * Math.sin(deg2rad(rot)) - y * Math.cos(deg2rad(rot)),
		a + (x * Math.cos(deg2rad(rot)) + y * Math.sin(deg2rad(rot))) / squish,
	];
	return [nw, ne, se, sw];
}

// Geo file uploader
L.Control.GeoFileUploader = L.Control.extend({
	onAdd: (map) => {
		const onKmzLoaded = async (file) => {
			const zip = await JSZip.loadAsync(file);
			if (
				Object.keys(zip.files)
					.map((x) => x.toUpperCase())
					.includes("DOC.KML")
			) {
				const kmlDocFilename = Object.keys(zip.files).find(
					(x) => x.toUpperCase() === "DOC.KML",
				);
				const kml = await zip.file(kmlDocFilename).async("string");
				const maps = await extractKMZInfo(kml, zip);
				if (maps) {
					for (const data of maps) {
						const rmap = L.imageTransform(data.imageDataURI, data.bounds);
						map.addLayer(rmap);
					}
				}
			} else {
				alert("Error parsing your KMZ file!");
			}
		};

		const control = L.DomUtil.create(
			"div",
			"leaflet-control leaflet-bar leaflet-geo-file-uploader",
		);
		const fileUploader = L.DomUtil.create("input");
		fileUploader.type = "file";
		fileUploader.style.display = "none";
		fileUploader.addEventListener("change", async function () {
			for (const file of this.files) {
				const extension = file.name.split(".").pop().toLowerCase();
				if (extension === "kmz") {
					await onKmzLoaded(file);
				} else if (extension === "gpx") {
					const reader = new FileReader();
					reader.addEventListener("load", (event) => {
						const parser = new gpxParser();
						parser.parse(event.target.result);
						for (const track of parser.tracks) {
							const latlons = track.points.map((pt) => [pt.lat, pt.lon]);
							L.polyline(latlons).addTo(map);
						}
					});
					reader.readAsText(file);
				} else if (["geojson", "json"].includes(extension)) {
					const reader = new FileReader();
					reader.addEventListener("load", (event) => {
						const data = JSON.parse(event.target.result);
						L.geoJson.css(data).addTo(map);
					});
					reader.readAsText(file);
				}
			}
		});

		const button = L.DomUtil.create("a");
		button.href = "#";
		button.title = "Load GeoJSON, GPX or KMZ file";
		button.innerHTML = '<i class="fa-solid fa-file-arrow-up"></i>';
		button.addEventListener("click", (e) => {
			e.preventDefault();
			fileUploader.click();
		});

		control.appendChild(button);

		L.DomEvent.on(control, "mousewheel", L.DomEvent.stopPropagation);
		L.DomEvent.on(control, "touchstart", L.DomEvent.stopPropagation);

		return control;
	},
});

L.control.geoFileUploader = (opts) => new L.Control.GeoFileUploader(opts);

function getDistance(polyline) {
	// Calculating the distance of the polyline
	let tempLatLng = null;
	let totalDistance = 0.0;
	if (!polyline?.getLatLngs) return 0;
	polyline?.getLatLngs().forEach((latlng, i) => {
		if (tempLatLng == null) {
			tempLatLng = latlng;
			return;
		}
		totalDistance += tempLatLng.distanceTo(latlng);
		tempLatLng = latlng;
	});
	return totalDistance;
}

(() => {
	const map = L.map("map", { tap: false }).setView([0, 0], 2);
	// geocoder (map search)
	const geocoder = L.Control.geocoder({
		defaultMarkGeocode: false,
	});
	geocoder.on("markgeocode", (e) => {
		map.fitBounds(e.geocode.bbox);
	});
	geocoder.addTo(map);

	// maps layer
	const baseLayers = getBaseLayers();
	const defaultLayer = baseLayers["Open Street Map"];
	map.addLayer(defaultLayer);
	const controlLayers = L.control.layers(baseLayers);
	map.addControl(controlLayers);
	if (L.Browser.touch && L.Browser.mobile) {
		map.on("baselayerchange", (e) => {
			controlLayers.collapse();
		});
	}

	// GPS location
	L.control.locate().addTo(map);

	// Draw on map
	const drawnItems = new L.FeatureGroup();
	map.addLayer(drawnItems);
	const drawControl = new L.Control.Draw({
		draw: {
			polyline: {
				metric: true,
				feet: false,
				showLength: true,
			},
			polygon: false,
			rectangle: false,
			circle: false,
			marker: false,
			circlemarker: false,
		},
		edit: {
			featureGroup: drawnItems,
		},
	});
	map.addControl(drawControl);

	map.on(L.Draw.Event.CREATED, (e) => {
		drawnItems.clearLayers();
		drawnItems.addLayer(e.layer);
		if (e.layerType === "polyline") {
			e.layer.bindPopup(`${getDistance(e.layer).toFixed(2)} meters`);
			e.layer.openPopup();
		}
	});
	map.on("draw:edited", (e) => {
		e.layers.eachLayer((layer) => {
			layer.bindPopup(`${getDistance(layer).toFixed(2)} meters`);
			layer.openPopup();
		});
	});

	// fileUploader
	const geoFileControl = L.control.geoFileUploader({ position: "topleft" });
	map.addControl(geoFileControl);

	// hash param load features
	const hashParams = new URLSearchParams(window.location.search.slice(1));
	if (hashParams.has("geojson")) {
		try {
			fetch(hashParams.get("geojson"), {
				method: "GET",
				credentials: "include",
				mode: "cors",
			})
				.then((r) => r.json())
				.then((geojson) => {
					const geojsonLayer = L.geoJson.css(geojson).addTo(map);
					map.fitBounds(geojsonLayer.getBounds(), {
						maxZoom: 15,
						padding: [25, 25],
					});
				});
		} catch (e) {
			console.log(e);
		}
	}
	if (hashParams.has("latlon")) {
		const latlon = hashParams.get("latlon");
		const [latRaw, lonRaw] = latlon.split(",", 2);
		try {
			const lat = Number.parseFloat(latRaw);
			const lon = Number.parseFloat(lonRaw);
			map.addLayer(L.marker([lat, lon]));
			map.setView([lat, lon], 10);
		} catch (e) {
			console.log(e);
		}
	}
	if (!hashParams.has("latlon") && !hashParams.has("geojson")) {
		// Center on load if no args
		fetch(`${window.local.apiRoot}check-latlon`)
			.then((r) => r.json())
			.then((data) => {
				if (data.status === "success") {
					map.setView([data.lat, data.lon], 10, {
						duration: 0,
					});
				}
			})
			.catch();
	}
})();
