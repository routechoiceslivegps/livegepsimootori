function saveGeoJSON(filename, data) {
	const blob = new Blob([data], { type: "application/json" });
	const elem = window.document.createElement("a");
	elem.href = window.URL.createObjectURL(blob);
	elem.download = filename;
	document.body.appendChild(elem);
	elem.click();
	document.body.removeChild(elem);
}

(() => {
	const $field = u("#id_gpx_file");
	$field.attr("accept", ".gpx");
	$field.on("change", function () {
		if (this.files.length > 0 && this.files[0].size > 2 * 1e7) {
			swal({
				title: "Error!",
				text: "File is too big!",
				type: "error",
				confirmButtonText: "OK",
			});
			this.value = "";
		}
	});

	const fileUploader2 = document.getElementById("id_gpx2_file");
	u("#gpx-to-geojson-form").on("submit", async function (e) {
		e.preventDefault();
		const output = {
			type: "FeatureCollection",
			features: [],
		};
		const reader = new FileReader();
		reader.addEventListener("load", (event) => {
			const parser = new gpxParser();
			parser.parse(event.target.result);
			for (const track of [...parser.tracks, ...parser.routes]) {
				const latlons = track.points.map((pt) => [pt.lon, pt.lat]);
				const startLatLon = latlons[0];
				const endLatLon = latlons.at(-1);

				const startFeature = {
					type: "Feature",
					properties: {},
					style: {
						icon: {
							className: "map-marker start-icon",
						},
					},
					geometry: {
						type: "Point",
						coordinates: startLatLon,
					},
				};
				const lineFeature = {
					type: "Feature",
					properties: {},
					style: {
						className: "stroke-light",
					},
					geometry: {
						type: "LineString",
						coordinates: latlons,
					},
				};
				const endFeature = {
					type: "Feature",
					properties: {},
					style: {
						icon: {
							className: "map-marker end-icon",
						},
					},
					geometry: {
						type: "Point",
						coordinates: endLatLon,
					},
				};
				output.features.push(startFeature);
				output.features.push(lineFeature);
				output.features.push(endFeature);
			}
			for (const track of parser.routes) {
				const latlons = track.points.map((pt) => [pt.lon, pt.lat]);
				const startLatLon = latlons[0];
				const endLatLon = latlons.at(-1);

				const startFeature = {
					type: "Feature",
					properties: {},
					style: {
						icon: {
							className: "map-marker start-icon",
						},
					},
					geometry: {
						type: "Point",
						coordinates: startLatLon,
					},
				};
				const lineFeature = {
					type: "Feature",
					properties: {},
					style: {
						className: "stroke-light",
					},
					geometry: {
						type: "LineString",
						coordinates: latlons,
					},
				};
				const endFeature = {
					type: "Feature",
					properties: {},
					style: {
						icon: {
							className: "map-marker end-icon",
						},
					},
					geometry: {
						type: "Point",
						coordinates: endLatLon,
					},
				};
				output.features.push(startFeature);
				output.features.push(lineFeature);
				output.features.push(endFeature);
			}
			for (const wpt of parser.waypoints) {
				const feature = {
					type: "Feature",
					properties: {
						text: wpt.name,
					},
					style: {
						icon: {
							className: "map-marker waypoint",
						},
					},
					geometry: {
						type: "Point",
						coordinates: [wpt.lon, wpt.lat],
					},
				};
				output.features.push(feature);
			}
			const downloadData = JSON.stringify(output, null, 2);
			const filename = fileUploader2.files[0].name;

			saveGeoJSON(`${filename.slice(0, -4)}.geojson`, downloadData);
			this.reset();
		});
		reader.readAsText(fileUploader2.files[0]);
	});
})();
