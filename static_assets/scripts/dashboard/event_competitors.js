const seletizeOptions = {
	valueField: "id",
	labelField: "device_id",
	searchField: "device_id",
	create: false,
	createOnBlur: false,
	persist: false,
	plugins: ["preserve_on_blur", "change_listener"],
	load: (query, callback) => {
		if (query.length < 4) {
			return callback();
		}
		reqwest({
			url: `${window.local.apiBaseUrl}search/device?q=${encodeURIComponent(query)}`,
			method: "get",
			type: "json",
			withCredentials: true,
			crossOrigin: true,
			success: (res) => {
				callback(res.results);
			},
			error: () => {
				callback();
			},
		});
	},
};

const createTagWidget = (i) => {
	new TomSelect(i, {
		persist: false,
		createOnBlur: true,
		create: true,
		delimiter: "\u2063",
	});
};

function showLocalTime(el) {
	const val = u(el).val();
	if (val) {
		let local = dayjs(val).local(true).utc().format("YYYY-MM-DD HH:mm:ss");
		local += local === "Invalid Date" ? "" : " UTC";
		u(el).closest(":has(.local_time)").find(".local_time").text(local);
	} else {
		u(el)
			.closest(":has(.local_time)")
			.find(".local_time")
			.html("&ZeroWidthSpace;");
	}
}

(() => {
	const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	console.log(`User timezone: ${userTimezone}`);
	const timezoneInput = document.getElementById("id_timezone");
	if (timezoneInput && timezoneInput.value !== userTimezone) {
		timezoneInput.value = userTimezone;
	}
	u(".datetimepicker").each((el) => {
		const val = el.value;
		if (val) {
			const date = new Date(
				`${val.substring(0, 10)}T${val.substring(11, 19)}Z`,
			);
			el.value = date.toLocaleString("sv");
		}
	});

	u(".datetimepicker").each((el) => {
		makeTimeFieldClearable(el);
		makeFieldNowable(el);
		el.autocomplete = "off";
		new tempusDominus.TempusDominus(el);
		el.addEventListener(tempusDominus.TempusDominus, (e) => {
			showLocalTime(e.target);
		});
		showLocalTime(el);
	});

	u('label[for$="-DELETE"]').parent(".form-group").hide();
	$(".formset_row").formset({
		addText: "",
		deleteText: '<i class="fa-solid fa-trash fa-2x"></i>',
		prefix: "competitors",
	});
	u(".dynamic-form-add").hide();
	// next line must come after formset initialization
	let hasArchivedDevices = false;
	u('select[name$="-device"]').each((el) => {
		if (el.options[el.selectedIndex].text.endsWith("*")) {
			hasArchivedDevices = true;
		}
		new TomSelect(el, seletizeOptions);
	});
	if (hasArchivedDevices) {
		u(".table-bottom").before(
			'<div class="form-text"><span>* Archive of original device</span></div>',
		);
	}

	u(".utc-offset").text(`(Timezone ${userTimezone})`);

	const colorModal = new bootstrap.Modal(
		document.getElementById("color-modal"),
	);

	const createColorWidget = (i) => {
		const originalInput = u(i);
		originalInput.hide();
		let color = originalInput.val();
		const colorSelector = u("<b>")
			.addClass("me-2")
			.css({ color, cursor: "pointer" })
			.html("&#11044;")
			.on("click", (e) => {
				e.preventDefault();

				u("#color-picker").html("");
				new iro.ColorPicker("#color-picker", {
					color,
					width: 150,
					display: "inline-block",
				}).on("color:change", (c) => {
					color = c.hexString;
				});

				function saveColor() {
					colorModal.hide();
					u("#save-color").off("click");
					u("#color-modal").off("keypress");

					originalInput.val(color);
					colorSelector.css({ color });
				}

				u("#save-color").on("click", saveColor);

				u("#color-modal").on("keypress", (e) => {
					e.preventDefault();
					if (e.which === 13) {
						saveColor();
					}
				});

				colorModal.show();
			});
		const clearColor = u("<button>")
			.addClass("btn btn-info btn-sm")
			.attr("type", "button")
			.html("Reset")
			.on("click", (e) => {
				e.preventDefault();
				selectColorWidget.remove();
				originalInput.after(setBtn);
				originalInput.val("");
			});
		const selectColorWidget = u("<div>")
			.addClass("text-nowrap")
			.append(colorSelector)
			.append(clearColor);
		const setBtn = u("<button>")
			.addClass("btn btn-info btn-sm")
			.attr("type", "button")
			.html('<i class="fa-solid fa-palette"></i>')
			.on("click", (e) => {
				e.preventDefault();
				color = `#${(((1 << 24) * Math.random()) | 0).toString(16).padStart(6, "0")}`;
				colorSelector.css({ color });
				setBtn.remove();
				originalInput.after(selectColorWidget);
			});
		if (i.value === "") {
			originalInput.after(setBtn);
		} else {
			originalInput.after(selectColorWidget);
		}
	};

	u(".color-input").each(createColorWidget);
	u(".tag-input").each(createTagWidget);

	u("form").on("submit", (e) => {
		u(".datetimepicker").each((el) => {
			const val = el.value;
			if (val) {
				el.value = dayjs.tz(el.value, userTimezone).toISOString();
			}
		});
		u("#submit-btn").attr({ disabled: true });
		u("button[name='save_continue']").addClass("disabled");
		u(e.submitter)
			.find("i")
			.removeClass("fa-floppy-disk")
			.addClass("fa-spinner fa-spin");
	});
})();
