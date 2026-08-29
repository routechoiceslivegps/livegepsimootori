(() => {
	u(".date-utc").each((el) => {
		$el = u(el);
		$el.text(dayjs($el.data("date")).local().format("LLLL"));
	});

	if ("IntersectionObserver" in window) {
		document.addEventListener("DOMContentLoaded", () => {
			function handleIntersection(entries) {
				entries.forEach((entry) => {
					if (entry.isIntersecting && entry.target.dataset.bgImg) {
						// Item has crossed our observation
						// threshold - load src from data-src
						entry.target.style.background = `linear-gradient(to right, var(--rc-color-from-trans), var(--rc-color-to-trans)), url('${entry.target.dataset.bgImg}') 100%`;
						// Job done for this item - no need to watch it!
						observer.unobserve(entry.target);
					}
				});
			}

			const events = document.querySelectorAll(".event-card");
			const observer = new IntersectionObserver(handleIntersection, {
				rootMargin: "100px",
			});
			for (const event of events) {
				observer.observe(event);
			}
		});
	} else {
		// No interaction support? Load all background images automatically
		const events = document.querySelectorAll(".event-card");
		for (const event of events) {
			if (event.dataset.bgImg) {
				event.style.background = `linear-gradient(to right, var(--rc-color-from-trans), var(--rc-color-to-trans)), url('${event.dataset.bgImg}') 100%`;
			}
		}
	}
})();
