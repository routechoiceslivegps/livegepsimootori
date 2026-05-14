(() => {
	u("#copy-btn").on("click", (ev) => {
		const tooltip = new bootstrap.Tooltip(ev.currentTarget, {
			placement: "right",
			title: "copied",
		});
		tooltip.show();
		navigator.clipboard.writeText(window.local.url);
		setTimeout(() => {
			tooltip.dispose();
		}, 750);
	});
})();
