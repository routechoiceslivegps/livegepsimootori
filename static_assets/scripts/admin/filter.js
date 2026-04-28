django
	.jQuery(`.admin-filter-${document.currentScript.dataset.title} select`)
	.on("change", function () {
		const opt = this.options[this.selectedIndex].value;
		window.location = window.location.pathname + opt;
	});
