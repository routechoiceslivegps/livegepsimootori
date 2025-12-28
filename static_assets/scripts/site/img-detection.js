function hasImgCookie() {
	const name = "accept-image=";
	const decodedCookie = decodeURIComponent(document.cookie);
	const ca = decodedCookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return true;
		}
	}
	return false;
}
((document) => {
	if (hasImgCookie()) {
		return;
	}
	const accepted = [];
	let formatTested = 0;
	const setFormat = (height, format) => {
		formatTested++;
		if (height === 2) {
			accepted.push(`image/${format}`);
		}
		if (formatTested === 3) {
			const domain = document.domain.match(/[^\.]*\.[^.]*$/)?.[0];
			document.cookie = `accept-image=${accepted.join(",")};path=/;domain=.${domain};`;
		}
	};
	const AVIF = new Image();
	AVIF.onload = AVIF.onerror = () => {
		setFormat(AVIF.height, "avif");
	};
	AVIF.src =
		"data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";

	const WebP = new Image();
	WebP.onload = WebP.onerror = () => {
		setFormat(WebP.height, "webp");
	};
	WebP.src =
		"data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
})(window.sandboxApi?.parentWindow?.document || document);
