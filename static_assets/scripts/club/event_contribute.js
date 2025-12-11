function onGPXLoaded(e) {
	const xml = e.target.result;
	let parsedGpx;
	try {
		parsedGpx = parseGpx(xml);
	} catch (e) {
		swal({
			text: "Error parsing your GPX file!",
			title: "error",
			type: "error",
		});
		return;
	}
	const newRoute = [];
	if (parsedGpx.segments.length === 0) {
		onRouteLoaded(newRoute);
		return;
	}
	let missingTimeInfo = false;
	for (let i = 0; i < parsedGpx.segments[0].length; i++) {
		const pos = parsedGpx.segments[0][i];
		if (pos.loc[0] && pos.time) {
			newRoute.push({ time: pos.time, latLon: [pos.loc[0], pos.loc[1]] });
		} else if (pos.loc[0] && !missingTimeInfo) {
			missingTimeInfo = true;
		}
	}
	onRouteLoaded(newRoute, missingTimeInfo);
}

function onRouteLoaded(newRoute, missingTimeInfo) {
	if (!newRoute?.length) {
		if (missingTimeInfo) {
			swal({
				text: "Missing locations date/time information!",
				title: "error",
				type: "error",
			});
		} else {
			swal({
				text: "No locations found in this file!",
				title: "error",
				type: "error",
			});
		}
		return;
	}
	const ts = newRoute.map((pt) => Math.round(+pt.time / 1e3)).join(",");
	const lats = newRoute.map((pt) => +pt.latLon[0]).join(",");
	const lons = newRoute.map((pt) => +pt.latLon[1]).join(",");
	route = { timestamps: ts, latitudes: lats, longitudes: lons };
}

route = {};

function getGpxData(node, resultRaw) {
	const result = resultRaw ?? { segments: [] };
	switch (node.nodeName) {
		case "name":
			result.name = node.textContent;
			break;
		case "trkseg": {
			const segment = [];
			result.segments.push(segment);
			for (let i = 0; i < node.childNodes.length; i++) {
				const snode = node.childNodes[i];
				if (snode.nodeName === "trkpt") {
					const trkpt = {
						loc: [
							Number.parseFloat(snode.attributes.lat.value),
							Number.parseFloat(snode.attributes.lon.value),
						],
					};
					for (let j = 0; j < snode.childNodes.length; j++) {
						const ssnode = snode.childNodes[j];
						if (ssnode.nodeName === "time") {
							trkpt.time = new Date(ssnode.childNodes[0].data);
						}
					}
					segment.push(trkpt);
				}
			}
			break;
		}
		default:
			break;
	}
	for (let i = 0; i < node.childNodes.length; i++) {
		getGpxData(node.childNodes[i], result);
	}
	return result;
}

function parseGpx(xmlstr) {
	if (typeof DOMParser === "undefined") {
		function DOMParser() {}
		DOMParser.prototype.parseFromString = (
			str,
			contentType = "application/xml",
		) => {
			if (typeof XMLHttpRequest !== "undefined") {
				const xmldata = new XMLHttpRequest();
				xmldata.open(
					"GET",
					`data:${contentType};charset=utf-8,${encodeURIComponent(str)}`,
					false,
				);
				if (xmldata.overrideMimeType) {
					xmldata.overrideMimeType(contentType);
				}
				xmldata.send(null);
				return xmldata.responseXML;
			}
		};
	}
	const doc = new DOMParser().parseFromString(xmlstr, "text/xml");
	return getGpxData(doc.documentElement);
}

function selectizeDeviceInput(field) {
	new TomSelect(field, {
		valueField: "device_id",
		labelField: "device_id",
		searchField: "device_id",
		create: false,
		createOnBlur: false,
		persist: false,
		plugins: ["preserve_on_blur"],
		load: (query, callback) => {
			if (query.length < 4) {
				return callback();
			}
			reqwest({
				url: `${window.local.apiBaseUrl}search/device?q=${encodeURIComponent(query)}`,
				method: "get",
				type: "json",
				withCredentials: true,
				crossOrigin: true,
				success: (res) => {
					callback(res.results);
				},
				error: () => {
					callback();
				},
			});
		},
	});
}

(() => {
	const thisUrl = window.location.href;
	if (
		thisUrl.includes("competitor-added=1") ||
		thisUrl.includes("route-uploaded=1")
	) {
		window.history.pushState("-", null, window.location.pathname);
	}
	if (u("#registration-form").nodes.length) {
		u("#registration-form").on("submit", (e) => {
			e.preventDefault();
			const formData = new FormData(e.target);
			const data = {
				event_id: window.local.eventId,
				name: formData.get("name"),
				short_name: formData.get("short_name"),
			};
			if (formData.get("device_id")) {
				data.device_id = formData.get("device_id");
			}
			reqwest({
				url: `${window.local.apiBaseUrl}competitors/`,
				method: "post",
				type: "json",
				withCredentials: true,
				crossOrigin: true,
				data: data,
				headers: {
					"X-CSRFToken": window.local.csrfToken,
				},
				success: () => {
					window.location.href = `${window.location.href}&competitor-added=1`;
				},
				error: (err) => {
					if (err.status === 400) {
						swal({
							text: JSON.parse(err.responseText).join("\n"),
							title: "error",
							type: "error",
						});
					} else {
						swal({
							text: "Something went wrong",
							title: "error",
							type: "error",
						});
					}
				},
			});
		});
		if (window.local.eventEnded) {
			u("#id_device_id").parent().remove();
		} else {
			selectizeDeviceInput("select[name='device_id']");
			u("select[name='device_id']").on("change", (e) => {
				if (e.target.value) {
					u("#warning-if-device-id").removeClass("d-none");
				}
			});
		}
		if (u("#upload-form").nodes.length) {
			u("#id_device_id-ts-label").text(
				"Device ID (You can leave blank if you want to upload a GPS File)",
			);
		}
	}

	if (u("#id_gpx_file").nodes.length) {
		u("#id_gpx_file").attr("accept", ".gpx");
		u("#id_gpx_file").on("change", function (e) {
			if (this.files.length > 0 && this.files[0].size > 2 * 1e7) {
				swal({
					title: "Error!",
					text: "File is too big!",
					type: "error",
					confirmButtonText: "OK",
				});
				this.value = "";
				return;
			}
			if (this.files.length > 0) {
				const reader = new FileReader();
				reader.onload = onGPXLoaded;
				reader.readAsText(this.files[0]);
			}
		});
	}
	u(".date-utc").each((el) => {
		$el = u(el);
		$el.text(dayjs($el.data("date")).local().format("LLLL"));
	});

	if (u("#upload-form").nodes.length) {
		u("#upload-form").on("submit", (e) => {
			e.preventDefault();
			const formData = new FormData(e.target);
			const cmp_aid = formData.get("competitor_aid");
			reqwest({
				url: `${window.local.apiBaseUrl}competitors/${cmp_aid}/route`,
				method: "post",
				type: "json",
				withCredentials: true,
				crossOrigin: true,
				data: route,
				headers: {
					"X-CSRFToken": window.local.csrfToken,
				},
				success: () => {
					window.location.href = `${window.location.href}&route-uploaded=1`;
				},
				error: (err) => {
					if (err.status === 400) {
						swal({
							text: JSON.parse(err.responseText).join("\n"),
							title: "error",
							type: "error",
						});
					} else {
						swal({
							text: "Something went wrong",
							title: "error",
							type: "error",
						});
					}
				},
			});
		});
	}

	const uploadModalDiv = document.getElementById("uploadRouteModal");
	if (uploadModalDiv) {
		const uploadModal = new bootstrap.Modal(uploadModalDiv);
		const uploadCompetitorOptions = [
			...document.getElementById("id_competitor_aid").options,
		].map((o) => o.value);
		u(".upload-route-btn").each((el) => {
			if (
				!uploadCompetitorOptions.includes(u(el).attr("data-competitor-aid"))
			) {
				u(el).attr({ disabled: true });
				const wrapper = u(
					'<div class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" data-bs-title="Already assigned a route">',
				);
				u(el).wrap(wrapper);
				new bootstrap.Tooltip(wrapper.nodes[0]);
			} else {
				u(el).on("click", (e) => {
					u("#id_competitor_aid").parent().hide();
					u("#id_competitor_aid").val(u(el).attr("data-competitor-aid"));
					u("#uploader-name").text(u(el).attr("data-competitor-name"));
					uploadModal.show();
				});
			}
		});
	} else {
		u(".upload-route-btn").hide();
	}
})();
