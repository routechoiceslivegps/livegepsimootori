(() => {
	u(".date-utc").each((el) => {
		$el = u(el);
		$el.text(dayjs($el.data("date")).local().format("YYYY-MM-DD HH:mm:ss"));
	});
	u("#two-d-rerun-export-form").on("submit", (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);

		let rerunArgs = `${formData.get("event_id")}/${formData.get("map_idx")}`;
		if (formData.get("tag")) {
			rerunArgs += `/${formData.get("tag")}`;
		}
		window.open(
			`http://3drerun.worldofo.com/2d/?server=${encodeURIComponent(formData.get("api_root"))}woo&eventid=${encodeURIComponent(rerunArgs)}&liveid=-`,
		);
	});
})();
