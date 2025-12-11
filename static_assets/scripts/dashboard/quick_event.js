(() => {
	let tsDevId = null;
	function selectizeDeviceInput() {
		tsDevId = new TomSelect("select[name='device_id']", {
			valueField: "id",
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
					url: `${window.local.apiBaseUrl}search/device?aid=true&q=${encodeURIComponent(query)}`,
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

	selectizeDeviceInput();
	u("#id_device_id").attr("required", true);
	u("#id_name").val(window.local.username);
	const myUrl = new URL(window.location.href.replace(/#/g, "?"));
	const urlDevId = myUrl.searchParams.get("device_id");
	const devId = urlDevId || window.localStorage.getItem("quick-event-devId");
	if (devId) {
		tsDevId.load(devId, (res) => {
			if (res) {
				tsDevId.setValue(devId);
			}
		});
	}
})();
