const COLORS = [
	"#4363d8",
	"#3cb44b",
	"#e6194B",
	"#f58231",
	"#911eb4",
	"#42d4f4",
	"#f032e6",
	"#bfef45",
	"#ffe119",
	"#800000",
	"#469990",
	"#9A6324",
	"#aaffc3",
	"#808000",
	"#000075",
	"#a9a9a9",
	"#000000",
];
const supportedLanguages = {
	en: "English",
	es: "Espa&ntilde;ol",
	fr: "Fran&ccedil;ais",
	nl: "Nederlands",
	pl: "Polski",
	fi: "Suomi",
	sv: "Svenska",
};
const tailSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="12" viewBox="0 0 11.492 5.042">
<!-- White Background Ripple -->
<path d="M4.7387 1.391c-.7838.049-1.7114.3693-2.8574 1.0605a.321.321 0 0 0-.1094.4414l.4473.7402a.321.321 0 0 0 .4414.1094c1.3557-.8178 2.1103-.9085 2.5586-.8301.4486.0785.7327.352 1.1738.707 1.1915.9588 3.3161 1.112 4.9746-.1738a.321.321 0 0 0 .0566-.4512l-.5293-.6836a.321.321 0 0 0-.4512-.0566c-.5401.4187-1.1798.5805-1.7617.5762s-1.102-.1903-1.3438-.3848c-.3527-.2838-.9333-.8552-1.8613-1.0176a2.531 2.531 0 0 0-.7383-.0371z" fill="#fff"/>
<!-- Outer White Badge Base Rings -->
<path d="M2.476 0.222a2.2544 2.2988 0 0 0-2.2544 2.2988 2.2544 2.2988 0 0 0 2.2544 2.2988 2.2544 2.2988 0 0 0 2.2531-2.2988A2.2544 2.2988 0 0 0 2.476 0.222z" fill="#fff"/>
<path d="M4.7291 2.5215a2.2544 2.2988 0 0 1-2.2545 2.2988 2.2544 2.2988 0 0 1-2.253-2.2988 2.2544 2.2988 0 0 1 2.253-2.2988 2.2544 2.2988 0 0 1 2.2545 2.2988z" fill="#fff"/>
<path d="M2.476 0c-1.3672 0-2.476 1.135-2.476 2.5222 0 1.3871 1.1088 2.5197 2.476 2.5197 1.3672 0 2.476-1.1326 2.476-2.5197S3.8432 0 2.476 0zm0 .4437c1.123 0 2.0325.9265 2.0325 2.0785 0 1.1519-.9095 2.0758-2.0325 2.0758-.1123 0-2.0325-.9239-2.0325-2.0758 0-1.152.9095-2.0785 2.0325-2.0785z" fill="#fff"/>
<!-- Blue Foreground Ripples -->
<path d="M5.4223 1.7445c-.8256-.1445-1.884.083-3.375.9824l.4473.7402c1.3921-.8397 2.2292-.9673 2.7793-.871.55.0964.8928.4294 1.3203.7734 1.0549.8488 3.0344 1.0175 4.5762-.1777l-.5293-.6836c-1.2109.9388-2.8509.7129-3.5039.1875-.3772-.3035-.8892-.8067-1.7148-.9512z" fill="#09F"/>
<path d="M2.469.6254a1.8566 1.8923 0 0 0-1.8574 1.8926 1.8566 1.8923 0 0 0 1.8574 1.8906 1.8566 1.8923 0 0 0 1.8555-1.8906A1.8566 1.8923 0 0 0 2.469.6254z" fill="#09F"/>
<path d="M4.3256 2.5171a1.8566 1.8923 0 0 1-1.8566 1.8923 1.8566 1.8923 0 0 1-1.8566-1.8923 1.8566 1.8923 0 0 1 1.8566-1.8923 1.8566 1.8923 0 0 1 1.8566 1.8923z" fill="#09F"/>
<!-- Black Inner Ring Overlay -->
<path d="M2.469.4418c-1.1259 0-2.0391.9343-2.0391 2.0762 0 1.1419.9132 2.0742 2.0391 2.0742 1.1259 0 2.0391-.9324 2.0391-2.0742S3.595.4418 2.469.4418zm0 .3652c.9249 0 1.6738.7626 1.6738 1.7109s-.749 1.709-1.6738 1.709c-.9249 0-1.6738-.7607-1.6738-1.709s.749-1.7109 1.6738-1.7109z" fill="#000"/>
</svg>`;

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

const printTime = (time) => {
	const prependZero = (x) => `0${x}`.slice(-2);
	const t = Math.round(time);
	const h = Math.floor(t / 3600);
	const m = Math.floor((t % 3600) / 60);
	const s = t % 60;
	if (h === 0) {
		let text = "";
		if (m === 0) {
			return `${s}s`;
		}
		text = `${m}min`;
		if (s === 0) {
			return text;
		}
		return `${text + prependZero(s)}s`;
	}
	let text = `${h}h`;
	if (m === 0 && s === 0) {
		return text;
	}
	text += `${prependZero(m)}min`;
	if (s === 0) {
		return text;
	}
	return `${text + prependZero(s)}s`;
};

const logoWatermark = L.control({ position: "bottomright" });
logoWatermark.onAdd = () => {
	var div = L.DomUtil.create("div", "rounded logo p-1");
	div.innerHTML = `<a class="d-inline-block site-name m-0 pe-2 text-decoration-none" href="${window.local.watermarkLink}" target="_blank" rel="nofollow noopener">
	<div class="d-inline-block">
		<img alt="Site logo" src="${window.local.watermarkLogo}" height="35" style="vertical-align:top">
	</div>
	<div class="d-inline-block px-2" style="vertical-align: bottom;color: #000">
		<div style="line-height:1em"><small>Powered By</small></div>
		<div style="text-align:left;font-size:1em;line-height:1em;color: #000">ROUTECHOICES</div>
		<div style="font-size:1em;line-height:1em">LIVE GPS TRACKING</div>
	</div>
</a>`;
	return div;
};

function getProgressBarText(
	currentTime,
	hide = false,
	date = false,
	relative = true,
	split = false,
	noData = false,
) {
	let result = "";
	if (hide || noData) {
		return "";
	}
	const viewedTime = currentTime;
	if (relative) {
		if (currentTime === 0) {
			return "00:00:00";
		}

		const t = viewedTime / 1e3;

		function to2digits(x) {
			return `0${Math.floor(x)}`.slice(-2);
		}
		result += t > 3600 || split ? `${Math.floor(t / 3600)}:` : "";
		result += `${to2digits((t / 60) % 60)}:${to2digits(t % 60)}`;
	} else {
		const t = Math.round(viewedTime / 1e3);
		if (t === 0) {
			return "00:00:00";
		}

		if (date) {
			result = dayjs(viewedTime).format("YYYY-MM-DD");
			if (split) {
				result += `<br><span class="time">${dayjs(viewedTime).format("HH:mm:ss")}</span>`;
			} else {
				result += ` ${dayjs(viewedTime).format("HH:mm:ss")}`;
			}
		} else {
			result = dayjs(viewedTime).format("HH:mm:ss");
		}
	}
	return result;
}

L.Control.EventState = L.Control.extend({
	options: {
		position: "topleft",
	},

	addHooks: function () {
		L.DomEvent.on(event, "eventname", this._doSomething, this);
	},

	removeHooks: function () {
		L.DomEvent.off(event, "eventname", this._doSomething, this);
	},

	onAdd: function (map) {
		const div = L.DomUtil.create("div");
		div.style.userSelect = "none";
		div.style["-webkit-user-select"] = "none";
		this._div = div;
		this.t = "";
		this.tl = 0;
		this.pr = 1;
		this.isLive = false;
		return div;
	},
	setTailLength(v) {
		this.tl = v;
		u(this._div).find(".tail-length-display").text(printTime(v));
	},
	setPlaybackRate(r) {
		this.pr = r;
		u(this._div).find(".playback-rate").text(`x${r}`);
	},
	setClockEl(el) {
		this.t = el;
		u(this._div).find(".big-clock").html(el);
	},
	refresh() {
		if (this.isLive) {
			this.setLive();
		} else {
			this.setReplay();
		}
	},
	hide() {
		if (!this._div) {
			return;
		}
		this._div.style.display = "none";
	},
	setLive() {
		if (!this._div) {
			return;
		}
		this.isLive = true;
		this._div.innerHTML = `
<div class="m-0 py-0 px-2 d-inline-block">
	<div style="background-color:red;color: white;" class="ps-1 pe-2 rounded d-flex align-items-center">
		<div style="line-height:0.7em">
			<i style="font-size:.8em" class="fa-solid fa-circle blink mx-1"></i>
		</div>
		<div>${banana.i18n("live-mode")}</div>
	</div>
</div>
<div class="m-0 py-0 px-2" style="font-size:0.7rem;color: #09F;text-shadow: -1px -1px 0 #fff,-1px 0px 0 #fff,-1px 1px 0 #fff,0px -1px 0 #fff,0px 0px 0 #fff,0px 1px 0 #fff,1px -1px 0 #fff,1px 0px 0 #fff,1px 1px 0 #fff">
	<span>
		${tailSvg}
	</span>
	<span class="tail-length-display" style="text-transform: none;">${printTime(this.tl)}</span>
</div>
`;
		u(this._div).css({
			display: "block",
			fontSize: "20px",
			color: "#fff",
			padding: "0",
			fontWeight: "bold",
			textTransform: "uppercase",
			marginLeft: "0px",
		});
	},
	setReplay() {
		this.isLive = false;
		this._div.innerHTML = `
<div class="m-0 py-0 px-2">
	<span class="px-1 rounded" style="background-color: #666;color: white">
		${banana.i18n("replay-mode")}
	</span>
</div>
<div class="py-0 px-2" style="font-size:1rem;color: #000;text-shadow: -1px -1px 0 #fff,-1px 0px 0 #fff,-1px 1px 0 #fff,0px -1px 0 #fff,0px 0px 0 #fff,0px 1px 0 #fff,1px -1px 0 #fff,1px 0px 0 #fff,1px 1px 0 #fff"">
	<span class="big-clock">${this.t}</span> <span class="small playback-rate" style="text-transform: lowercase;color: #777;text-shadow: -1px -1px 0 #fff,-1px 0px 0 #fff,-1px 1px 0 #fff,0px -1px 0 #fff,0px 0px 0 #fff,0px 1px 0 #fff,1px -1px 0 #fff,1px 0px 0 #fff,1px 1px 0 #fff">x${this.pr}</span>
</div>
<div class="m-0 py-0 px-2" style="font-size:0.7rem;color: #09F;text-shadow: -1px -1px 0 #fff,-1px 0px 0 #fff,-1px 1px 0 #fff,0px -1px 0 #fff,0px 0px 0 #fff,0px 1px 0 #fff,1px -1px 0 #fff,1px 0px 0 #fff,1px 1px 0 #fff">
	<span>
		${tailSvg}
	</span>
	<span class="tail-length-display" style="text-transform: none;">${printTime(this.tl)}</span>
</div>
`;
		u(this._div).css({
			display: "block",
			fontSize: "20px",
			color: "#fff",
			padding: "0",
			fontWeight: "bold",
			textTransform: "uppercase",
			marginLeft: "0px",
		});
	},
	setPreview() {
		this.isLive = false;
		this._div.innerHTML = `
<div class="m-0 py-0 px-2">
	<span class="px-1 rounded" style="background-color: #09f;color: white">
		${banana.i18n("preview")}
	</span>
</div>`;
		u(this._div).css({
			display: "block",
			fontSize: "20px",
			color: "#fff",
			padding: "0",
			fontWeight: "bold",
			textTransform: "uppercase",
			marginLeft: "0px",
		});
	},
	onRemove: (map) => {
		// Nothing to do here
	},
});

L.control.eventState = (opts) => new L.Control.EventState(opts);

L.Control.Grouping = L.Control.extend({
	onAdd: (map) => {
		const back = L.DomUtil.create(
			"div",
			"leaflet-bar leaflet-control leaflet-control-grouping",
		);
		back.setAttribute("data-bs-theme", "light");
		back.style.width = "205px";
		back.style.background = "white";
		back.style.color = "black";
		back.style.padding = "5px";
		back.style.top = "0px";
		back.style.right = "0px";
		back.style["max-height"] = "195px";
		back.style["overflow-y"] = "auto";
		back.style["overflow-x"] = "hidden";
		back.style["z-index"] = 10000;
		back.style["font-size"] = "12px";
		L.DomEvent.on(back, "mousewheel", L.DomEvent.stopPropagation);
		L.DomEvent.on(back, "touchstart", L.DomEvent.stopPropagation);
		return back;
	},

	setValues: (c, clusters) => {
		const el = u(".leaflet-control-grouping");
		let out = "";
		if (clusters.length === 0) {
			out = `<h6>${banana.i18n("no-group")}</h6>`;
		} else {
			clusters.forEach((k, i) => {
				if (i !== 0) {
					out += "<br/>";
				}
				out += `<h6>
				<span style="color: ${k.color}">&#11044;</span> ${banana.i18n("group")} ${alphabetizeNumber(i)}
				</h6>`;
				for (const ci of k.parts) {
					out += `<div class="text-nowrap" style="clear:both;width:200px;height:1em">
						<div class="text-nowrap overflow-hidden float-start d-inline-block text-truncate" style="width:195px;">
							<span style="color: ${c[ci].color}">&#11044;</span> ${u("<span/>")
								.text(c[ci].name ?? "")
								.html()}
						</div>
					</div>`;
				}
			});
		}
		const testOut = u("<div>").html(out);
		if (el.html() !== testOut.html()) {
			el.html(out);
		}
	},

	onRemove: (map) => {
		u(".leaflet-control-grouping").remove();
		u(".tmp2").remove();
	},
});

L.control.grouping = (opts) => new L.Control.Grouping(opts);

function getLangIfSupported(code) {
	return Object.keys(supportedLanguages).includes(code) ? code : null;
}

function getColor(i) {
	return COLORS[i % COLORS.length];
}

function getContrastYIQ(hexcolorRaw) {
	const hexcolor = hexcolorRaw.replace("#", "");
	const hexSize = 0x10;
	const r = Number.parseInt(hexcolor.substr(0, 2), hexSize);
	const g = Number.parseInt(hexcolor.substr(2, 2), hexSize);
	const b = Number.parseInt(hexcolor.substr(4, 2), hexSize);
	const yiq = (r * 299 + g * 587 + b * 114) / 1e3;
	return yiq <= 168;
}

function getRunnerIcon(color, faded = false, focused = false, scale = 2) {
	const iconSize = 15 * scale;
	const liveColor = tinycolor(color).setAlpha(faded ? 0.5 : 1);
	const htmlRect = `<div class="runner-dot${faded ? " faded" : ""}" style="background: ${liveColor.toRgbString()};"></div>`;
	const runnerIcon = L.divIcon({
		html: htmlRect,
		iconAnchor: [iconSize / 2, iconSize / 2],
		className: focused ? "runner-focused" : "",
	});
	return runnerIcon;
}

function intersectRatio(a, b, c, d) {
	denominator = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y);
	return ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / denominator;
}

function getRunnerNameMarker(
	name,
	color,
	isDark,
	rightSide,
	faded = false,
	focused = false,
	scale = 2,
) {
	const iconStyle = `color: ${color};opacity: ${faded ? 0.5 : 1};${
		focused ? `padding-bottom: 0px;border-bottom: 4px solid ${color};` : ""
	}`;
	const iconHtml = `<span style="${iconStyle}">${u("<span/>")
		.text(name ?? "")
		.html()}</span>`;
	const iconClass = `runner-icon runner-icon-${isDark ? "dark" : "light"}${
		needFlagsEmojiPolyfill ? " flags-polyfill" : ""
	}${focused ? " runner-focused" : ""}`;

	// mesure tagname width
	const tmpIconClass = `${iconClass} leaflet-marker-icon leaflet-zoom-animated leaflet-interactive`;
	const nameTagEl = document.createElement("div");
	nameTagEl.className = tmpIconClass;
	nameTagEl.innerHTML = iconHtml;
	const mapEl = document.getElementById("map");
	mapEl.appendChild(nameTagEl);
	const nameTagWidth = nameTagEl.childNodes[0].getBoundingClientRect().width;
	mapEl.removeChild(nameTagEl);

	const runnerIcon = L.divIcon({
		className: iconClass,
		html: iconHtml,
		iconAnchor: [
			rightSide
				? nameTagWidth + scale * (focused ? 10 : 0)
				: scale * (focused ? -10 : 0),
			rightSide ? 0 : scale * 25,
		],
	});
	return runnerIcon;
}

function getSplitLineMarker(name, color = "purple") {
	const iconStyle = `color: ${color};opacity: 0.75;`;
	const iconHtml = `<span style="${iconStyle}">${u("<span/>")
		.text(name ?? "")
		.html()}</span>`;
	const iconClass = "runner-icon runner-icon-dark";
	const icon = L.divIcon({
		className: iconClass,
		html: iconHtml,
		iconAnchor: [10, 0],
	});
	return icon;
}

function alphabetizeNumber(integer) {
	return Number(integer)
		.toString(26)
		.split("")
		.map((c) =>
			(c.charCodeAt() > 96
				? String.fromCharCode(c.charCodeAt() + 10)
				: String.fromCharCode(97 + Number.parseInt(c))
			).toUpperCase(),
		)
		.join("");
}

function batteryIconName(perc) {
	if (perc === null) return "half";
	const level = Math.min(4, Math.round((perc - 5) / 20));
	return ["empty", "quarter", "half", "three-quarters", "full"][level];
}

function toggleCompetitorFullRoute(competitor) {
	if (!competitor.isShown) {
		return;
	}
	if (competitor.displayFullRoute) {
		competitor.displayFullRoute = null;
		competitor.sidebarCard
			?.find(".full-route-icon")
			.attr({ fill: "share_button(--bs-body-color)" });
	} else {
		competitor.displayFullRoute = true;
		competitor.sidebarCard?.find(".full-route-icon").attr({ fill: "#20c997" });
	}
}

function sortingFunction(a, b) {
	return a - b;
}

const banana = new Banana();
function updateText(locale) {
	banana.setLocale(locale);
	const langFile = `${window.local.staticRoot}i18n/club/event/${locale}.json`;
	return fetch(`${langFile}?v=2026052800`)
		.then((response) => response.json())
		.then((messages) => {
			banana.load(messages, banana.locale);
		})
		.catch(() => {});
}

const coordsFormatters = {
	wgs84: {
		name: "WGS84",
		format: (lat, lng) => {
			return `${lat.toFixed(5)}º, ${lng.toFixed(5)}º`;
		},
	},
	uk: {
		name: "British Grid",
		format: (lat, lng) => {
			const wgs84 = new GT_WGS84();
			wgs84.setDegrees(lat, lng);
			const osgb = wgs84.getOSGB();
			return osgb.getGridRef(6);
		},
	},
};
