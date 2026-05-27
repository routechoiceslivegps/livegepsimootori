(() => {
	u(".error-message").hide();
	u("#imeiForm").on("submit", (e) => {
		e.preventDefault();

		const submitBtn = u("#submit-btn-imei");
		submitBtn.attr({ disabled: true });

		reqwest({
			url: `${window.local.apiRoot}device/`,
			method: "post",
			data: {
				imei: u("#IMEI").val(),
				csrfmiddlewaretoken: window.local.csrfToken,
			},
			type: "json",
			withCredentials: true,
			crossOrigin: true,
			success: (response) => {
				u("#IMEI").removeClass("is-invalid").addClass("is-valid");
				u("#imeiDevId").removeClass("d-none");
				u(".imeiDevId").text(response.device_id);
				u("#imeiErrorMsg").addClass("d-none");
				u("#copyDevIdBtn").off("click");
				u("#copyDevIdBtn").on("click", (ev) => {
					const tooltip = new bootstrap.Tooltip(ev.currentTarget, {
						placement: "right",
						title: "copied",
					});
					tooltip.show();
					navigator.clipboard.writeText(response.device_id);
					setTimeout(() => {
						tooltip.dispose();
					}, 750);
				});
			},
			error: (req) => {
				u("#imeiErrorMsg").removeClass("d-none");
				u("#IMEI").addClass("is-invalid");
				u("#imeiDevId").addClass("d-none");
				try {
					u("#imeiErrorMsg").html(
						`<i class="fa-solid fa-triangle-exclamation"></i> ${u("<div/>").text(JSON.parse(req.responseText)[0]).html()}`,
					);
				} catch {}
			},
			complete: () => {
				submitBtn.attr({ disabled: false });
			},
		});
	});

	u('button[data-bs-toggle="tab"]').each((el) => {
		u(el).on("show.bs.tab", (e) => {
			window.location.hash = u(e.target).attr("data-bs-target").slice(0, -5);
		});
	});

	const hash = window.location.hash;
	if (hash) {
		const triggerEl = document.querySelector(`${hash}-tab`);
		bootstrap.Tab.getOrCreateInstance(triggerEl).show();
	}
})();
