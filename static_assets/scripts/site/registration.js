(() => {
	if (window.location.hash) {
		const hash = window.location.hash;
		u(".registration-link").map((e) => {
			e.href += hash;
		});
	}
})();
