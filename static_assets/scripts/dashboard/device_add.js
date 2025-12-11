function displayErrors(err) {
	u("#importErrors")
		.text(err)
		.css({ display: "block", "white-space": "pre-line" });
}

function displaySuccess(msg) {
	u("#importSuccess").text(msg).css({ display: "block" });
}

function onCsvParsed(result) {
	u("#csv_input").val("");
	displayErrors("");
	let nImported = 0;
	let errors = "";
	if (result.errors.length > 0) {
		errors = "No lines found";
	}
	if (!errors) {
		for (const l of result.data) {
			if (l.length === 1 && l[0] === "") {
				continue; // empty line
			}
			if (l.length !== 2) {
				errors += "All rows should have 2 columns\n";
			} else {
				const imeiOrDeviceId = l[0];
				const nickname = l[1];
				if (nickname.length > 12) {
					errors += `IMEI or DeviceID ${imeiOrDeviceId}, nickname "${nickname}": nickname too long (Max 12 characters)\n`;
					continue;
				}
				if (imeiOrDeviceId.length === 8) {
					const deviceId = imeiOrDeviceId;
					reqwest({
						url: `/clubs/${window.local.clubSlug}/devices/${deviceId}/`,
						method: "patch",
						data: {
							nickname: nickname,
						},
						headers: { "X-CSRFToken": window.local.csrfToken },
						type: "json",
						withCredentials: true,
						crossOrigin: true,
					})
						.then(() => {
							nImported++;
							displaySuccess(`${nImported} devices imported`);
						})
						.fail(() => {
							errors += `Device ID ${deviceId}, nickname "${nickname}": Failed\n`;
							displayErrors(errors);
						});
				} else {
					const imei = imeiOrDeviceId;
					reqwest({
						url: `${window.local.apiBaseUrl}device/`,
						method: "post",
						data: {
							imei: imei,
							csrfmiddlewaretoken: window.local.csrfToken,
						},
						type: "json",
						withCredentials: true,
						crossOrigin: true,
					})
						.then((resp) => {
							const deviceId = resp.device_id;
							reqwest({
								url: `/clubs/${window.local.clubSlug}/devices/${deviceId}/`,
								method: "patch",
								data: {
									nickname: nickname,
								},
								headers: { "X-CSRFToken": window.local.csrfToken },
								type: "json",
								withCredentials: true,
								crossOrigin: true,
							})
								.then(() => {
									nImported++;
									displaySuccess(`${nImported} devices imported`);
								})
								.fail(() => {
									errors += `IMEI ${imei}, nickname "${nickname}": Failed\n`;
									displayErrors(errors);
								});
						})
						.fail(() => {
							errors += `IMEI ${imei}, nickname "${nickname}": Invalid IMEI\n`;
						});
				}
			}
		}
	}
	if (errors) {
		displayErrors(errors);
	}
}

(() => {
	new TomSelect("#id_device", {
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

	u("#importCSVImei").on("submit", (e) => {
		e.preventDefault();
		Papa.parse(u("#csv_input").nodes[0].files[0], {
			complete: onCsvParsed,
			delimiter: ";",
		});
	});
})();
