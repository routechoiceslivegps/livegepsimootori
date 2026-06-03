(() => {
	u("form").on("submit", function (e) {
		const t = u(this);
		const submitBtn = t.find("#submit-btn");
		const icon = submitBtn.find("i");
		submitBtn.attr({ disabled: true });
		icon.attr({ class: "" }).addClass("fa-solid fa-spinner fa-spin");
	});

	u("input[name=type-confirmation]").on("keyup", function (ev) {
		const submitBtn = u(this).closest(":has(#submit-btn)").find("#submit-btn");
		if (ev.target.value === "DELETE") {
			submitBtn.attr({ disabled: false });
		} else {
			submitBtn.attr({ disabled: true });
		}
	});
	if (u("input[name=type-confirmation]").nodes.length > 0) {
		u("input[name=type-confirmation]").nodes[0].focus();
	}
})();
