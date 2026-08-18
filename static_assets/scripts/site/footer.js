(async function updateStatus() {
	const statusTexts = {
		none: "All systems are operational",
		major: "Partial System Outage",
		critical: "Major System Outage",
	};

	await fetch(
		`https://raw.githubusercontent.com/routechoices/upptime/master/history/summary.json?${Date.now()}`,
	)
		.then((r) => r.json())
		.then((data) => {
			const statuses = data.map((s) => s.status);

			let status = "major";
			if (statuses.every((s) => s === "up")) {
				status = "none";
			} else if (statuses.every((s) => s === "down")) {
				status = "critical";
			}

			const el = document.getElementById("status-indicator");
			el.classList.remove("status-indicator-default");

			const className = `status-indicator-${status}`;
			el.classList.add(className);
			el.parentNode.title = statusTexts[status];
		})
		.catch(() => {});
})();
