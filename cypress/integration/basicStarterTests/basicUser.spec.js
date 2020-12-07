// This test  walks through a basic non-admin user signing in . It checks
// that the email login process works

/// <reference types="Cypress" />

context("Basic user login", () => {
  it("Site opens", () => {
    cy.visit("", {
      onBeforeLoad: win => {
        win.sessionStorage.clear();
      }
    });
  });
  it("Login", () => {
    cy.logonEmail(
      Cypress.env("nonAdminUser"),
      Cypress.env("nonAdminUserPassword")
    );
  });
  it("Navigate to About Page", () => {
    cy.verifyAboutComponent();
  });
  it("Navigate to Home Page", () => {
    cy.verifyHomeComponent();
  });
  it("Navigate to MyProfile", () => {
    cy.verifyMyProfileComponent();
  });
  it("Not administrator", () => {
    cy.verifyNotAdministrator();
  });
  it("Logout", () => {
    cy.verifyLogout();
  });
});
