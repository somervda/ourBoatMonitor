// This test  walks through a admin user signing in . It checks
// that the email login process works and user has
// the expected access to admin functionality

/// <reference types="Cypress" />

context("Admin user login", () => {
  it("Site opens", () => {
    cy.visit("", {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear();
      },
    });
  });
  it("Login", () => {
    cy.logonEmail(Cypress.env("adminUser"), Cypress.env("adminUserPassword"));
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

  it("Navigate to Users", () => {
    cy.verifyUsersComponent();
  });

  it("Logout", () => {
    cy.verifyLogout();
  });
});
