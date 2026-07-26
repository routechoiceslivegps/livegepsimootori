(() => {
	u(".date-utc").each((el) => {
		const $el = u(el);
		$el.text(dayjs($el.data("date")).local().format("YYYY-MM-DD HH:mm:ss"));
	});

	u("a[data-sort-name]").each((el) => {
		const sortName = u(el).attr("data-sort-name");
		const name = u(el).text();
		const params = new URL(document.location.toString()).searchParams;
		const [currentSort, currentDir] = (
			params.get("sort_by") ?? "nickname_asc"
		).split("_");
		let newDir = "asc";
		if (currentSort === sortName) {
			newDir = currentDir === "asc" ? "dsc" : "asc";
		}
		const newUrl = new URL(document.location.toString());
		params.set("sort_by", [sortName, newDir].join("_"));
		newUrl.search = params;
		u(el)
			.attr("href", newUrl.toString())
			.html(
				`${name}${
					sortName === currentSort
						? ` <i class="fa-solid fa-chevron-${currentDir === "asc" ? "up" : "down"}"></i>`
						: ""
				}</a>`,
			);
	});

	u(".copy-btn").on("click", (ev) => {
		const $el = u(ev.currentTarget);
		const tooltip = new bootstrap.Tooltip(ev.currentTarget, {
			placement: "right",
			title: "copied",
		});
		tooltip.show();
		setTimeout(() => {
			tooltip.dispose();
		}, 500);
		navigator.clipboard.writeText($el.data("value"));
	});

	u(".gpsseuranta-set-btn").on("click", function (e) {
		e.preventDefault();
		const el = u(this).closest(".gpsseuranta-set-btn");
		const devId = el.attr("data-dev-id");
		const isActive = !el.find(".until-date").hasClass("d-none");
		const property = `${isActive ? "de" : ""}activate-gpsseuranta-relay`;
		reqwest({
			url: `/clubs/${window.local.clubSlug}/devices/${devId}/`,
			data: { [property]: 1 },
			headers: {
				"X-CSRFToken": window.local.csrfToken,
			},
			crossOrigin: true,
			withCredentials: true,
			method: "patch",
			type: "json",
			success: (data) => {
				const activeUntilDate = new Date(data.gpsseuranta_until).toISOString();
				const activeUntilHuman = dayjs(activeUntilDate)
					.local()
					.format("YYYY-MM-DD HH:mm:ss");
				el.find(".date-utc")
					.attr("data-date", activeUntilDate)
					.text(activeUntilHuman);
				el.find("input").first().checked = !isActive;
				const dateDiv = el.find(".until-date");
				if (isActive) {
					dateDiv.addClass("d-none");
				} else {
					dateDiv.removeClass("d-none");
				}
			},
			failed: () => {
				alert("Something went wrong");
			},
		});
	});
})();
