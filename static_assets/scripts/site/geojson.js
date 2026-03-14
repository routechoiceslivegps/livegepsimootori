const geoJSONs = [
	{
		type: "FeatureCollection",
		features: [
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Polygon",
					coordinates: [
						[
							[37.61489152908325, 55.752586015356876],
							[37.61577129364014, 55.7539867694403],
							[37.616543769836426, 55.75506145183324],
							[37.6177453994751, 55.75443355110991],
							[37.619526386260986, 55.753491681072205],
							[37.62143611907959, 55.75252563689488],
							[37.62117862701416, 55.75211506087468],
							[37.61875391006469, 55.750762544596384],
							[37.61813163757324, 55.749989657097],
							[37.61302471160889, 55.749035602973365],
							[37.612552642822266, 55.74907183330299],
							[37.6134967803955, 55.750641781933986],
							[37.61489152908325, 55.752586015356876],
						],
					],
				},
				style: {
					color: "#CC0000",
					weight: 2,
					opacity: 1,
					dashArray: "3, 5",
					fillColor: "#0000cc",
					"fill-opacity": 0.6,
				},
			},
		],
	},
	{
		type: "FeatureCollection",
		features: [
			{
				type: "Feature",
				properties: {},
				style: {
					color: "#0099ff",
					weight: 9,
					opacity: 0.7,
					className: "stroke-light",
				},
				geometry: {
					type: "LineString",
					coordinates: [
						[4.36414, 50.84248],
						[4.56451, 50.84241],
						[4.46451, 51.04241],
					],
				},
			},
		],
	},
	{
		type: "FeatureCollection",
		features: [
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.36, 50.84248],
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.37, 50.84248],
				},
				style: {
					icon: {
						className: "map-marker start-icon",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.38, 50.84248],
				},
				style: {
					icon: {
						className: "map-marker end-icon",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.39, 50.84248],
				},
				style: {
					icon: {
						className: "map-marker waypoint",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.4, 50.84248],
				},
				style: {
					icon: {
						className: "map-marker waypoint grey",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.41, 50.84248],
				},
				style: {
					icon: {
						className: "map-marker waypoint red",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.42, 50.84248],
				},
				style: {
					icon: {
						className: "map-marker waypoint green",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.43, 50.84248],
				},
				style: {
					icon: {
						className: "map-marker waypoint orange",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.44, 50.84248],
				},
				style: {
					icon: {
						className: "map-marker waypoint dark-green",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.45, 50.84248],
				},
				style: {
					icon: {
						className: "map-marker waypoint blue",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.36, 50.82248],
				},
				style: {
					icon: {
						className: "distance-marker d1",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.37, 50.82248],
				},
				style: {
					icon: {
						className: "distance-marker d2",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.38, 50.82248],
				},
				style: {
					icon: {
						className: "distance-marker d3",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.39, 50.82248],
				},
				style: {
					icon: {
						className: "distance-marker d10",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.4, 50.82248],
				},
				style: {
					icon: {
						className: "distance-marker d15",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.41, 50.82248],
				},
				style: {
					icon: {
						className: "distance-marker d95",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.42, 50.82248],
				},
				style: {
					icon: {
						className: "distance-marker d100",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.43, 50.82248],
				},
				style: {
					icon: {
						className: "distance-marker d110",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.44, 50.82248],
				},
				style: {
					icon: {
						className: "distance-marker d490",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.45, 50.82248],
				},
				style: {
					icon: {
						className: "distance-marker d500",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.36, 50.83248],
				},
				style: {
					icon: {
						className: "distance-marker warning",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.37, 50.83248],
				},
				style: {
					icon: {
						className: "distance-marker red",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.38, 50.83248],
				},
				style: {
					icon: {
						className: "distance-marker green",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.39, 50.83248],
				},
				style: {
					icon: {
						className: "map-marker cat1",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.4, 50.83248],
				},
				style: {
					icon: {
						className: "map-marker cat2",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.41, 50.83248],
				},
				style: {
					icon: {
						className: "map-marker cat3",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.42, 50.83248],
				},
				style: {
					icon: {
						className: "map-marker cat4",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.43, 50.83248],
				},
				style: {
					icon: {
						className: "map-marker cathc",
					},
				},
			},
			{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [4.44, 50.83248],
				},
				style: {
					icon: {
						className: "leaflet-fa-marker fa-solid fa-map-pin",
					},
				},
			},
			{
				type: "Feature",
				properties: {
					text: "CP01",
				},
				geometry: {
					type: "Point",
					coordinates: [4.45, 50.83248],
				},
			},
		],
	},
];

(() => {
	let i = 0;
	for (const geoJSON of geoJSONs) {
		const map = L.map(document.querySelectorAll(".map")[i]);
		L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 19,
			attribution:
				'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			referrerPolicy: "origin",
		}).addTo(map);
		const geoJsonLayer = L.geoJSON.css(geoJSON);
		geoJsonLayer.addTo(map);
		map.fitBounds(geoJsonLayer.getBounds(), {
			maxZoom: 15,
			padding: [25, 25],
		});
		i++;
	}
})();
