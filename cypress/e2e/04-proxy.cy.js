function testPage(page) {
	cy.intercept("GET", `${page}map`).as(`mapLoaded${page}`, {
		statusCode: 200,
		forceNetworkError: true,
	});
	cy.get("#loading-text").should("be.visible");
	cy.get("#loading-text", { timeout: 30000 }).should("not.exist");
	cy.wait(`@mapLoaded${page}`, { timeout: 60000 });
}

context("Test proxy pages", () => {
	after(() => {
		cy.wait(100);
	});

	it("Visit livelox proxy page", () => {
		const page = "https://livelox.routechoices.dev/886369/";
		cy.visit(page);
		testPage(page);
	});

	it("Visit loggator proxy page", () => {
		const page = "https://loggator.routechoices.dev/EADQWA/";
		cy.visit(page);
		testPage(page);
	});

	it("Visit gpsseuranta proxy page", () => {
		const page = "https://gpsseuranta.routechoices.dev/20241205VJyoA/";
		cy.visit(page);
		testPage(page);
	});
});
