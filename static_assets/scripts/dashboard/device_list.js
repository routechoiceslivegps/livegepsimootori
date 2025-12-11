(() => {
	u(".date-utc").each((el) => {
		const $el = u(el);
		$el.text(dayjs($el.data("date")).local().format("YYYY-MM-DD HH:mm:ss"));
	});

	u("th[data-sort-name]").each((el) => {
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
		u(el).html(
			`<a href="${newUrl.toString()}">${name}${
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
	u(".edit-nick-btn").on("click", function (ev) {
		const nick = u(this).attr("data-nick");
		const devId = u(this).attr("data-dev-id");
		swal(
			{
				title: "New nickname",
				text: "Enter new nickname for device (max 12 characters):",
				type: "input",
				showCancelButton: true,
				closeOnConfirm: false,
				animation: "slide-from-top",
				inputPlaceholder: "Nickname",
				inputValue: nick ? nick : null,
			},
			(inputValue) => {
				if (inputValue === null || inputValue === false) return false;
				reqwest({
					url: `/clubs/${window.local.clubSlug}/devices/${devId}`,
					data: { nickname: inputValue },
					headers: {
						"X-CSRFToken": window.local.csrfToken,
					},
					crossOrigin: true,
					withCredentials: true,
					method: "patch",
					type: "json",
					success: (response) => {
						window.location.reload();
					},
				});
			},
		);
		u('input[placeholder="Nickname"]').attr("maxlength", 12);
	});
	u(".remove-btn").on("click", function (ev) {
		const devId = u(this).attr("data-dev-id");
		swal(
			{
				title: "Confirm removal",
				text: "Are you sure you want to remove this device?",
				type: "warning",
				showCancelButton: true,
				closeOnConfirm: false,
				animation: "slide-from-top",
			},
			() => {
				reqwest({
					url: `/clubs/${window.local.clubSlug}/devices/${devId}`,
					headers: {
						"X-CSRFToken": window.local.csrfToken,
					},
					crossOrigin: true,
					withCredentials: true,
					method: "delete",
					type: "json",
					success: (response) => {
						window.location.reload();
					},
				});
			},
		);
	});
	u(".gpsseuranta-set-btn").on("click", function (ev) {
		const devId = u(this).attr("data-dev-id");
		reqwest({
			url: `/clubs/${window.local.clubSlug}/devices/${devId}`,
			data: { "activate-gpsseuranta-relay": 1 },
			headers: {
				"X-CSRFToken": window.local.csrfToken,
			},
			crossOrigin: true,
			withCredentials: true,
			method: "patch",
			type: "json",
			success: (response) => {
				window.location.reload();
			},
		});
	});
})();
