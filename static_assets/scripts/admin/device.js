document.addEventListener("DOMContentLoaded", () => {
	const $ = django.jQuery;
	$('input[name="_download_gpx_button"]').on("click", (e) => {
		e.preventDefault();
		const deviceId = $(e.target).attr("data-id");
		const encodedData = $("#id_locations_encoded").val();
		const positions = PositionArchive.fromEncoded(encodedData);
		const posArray = positions.getArray();
		let gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="RouteChoices.com" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" >
<metadata/>
<trk>
<name>Device ${deviceId} Data</name>
<trkseg>`;
		for (const point of posArray) {
			const dateIsoString = new Date(point[0]).toISOString();
			gpxData += `
<trkpt lat="${point[1]}" lon="${point[2]}"><time>${dateIsoString}</time></trkpt>`;
		}
		gpxData += `
</trkseg>
</trk>
</gpx>`;
		const blob = new Blob([gpxData], { type: "text/xml" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.download = `device-${deviceId}.gpx`;
		link.href = url;
		document.body.appendChild(link);
		link.click();
		link.remove();
	});
});
