(() => {
	u("form").on("submit", (e) => {
		const btn = u(e.target).find(".submit-btn");
		btn.addClass("disabled");
		btn.prepend('<i class="fa-solid fa-spinner fa-spin me-1"></i>');
	});
	u("#id_totp")
		.addClass("font-monospace", "totp-token")
		.attr({
			placeholder: "••••••",
			maxLength: 6,
		})
		.on("input", function () {
			this.value = this.value.replace(/[^0-9]/g, "");
			if (this.value.length >= 6) {
				u(this).closest(":has(button)").find("button").first().focus();
			}
		});
})();
