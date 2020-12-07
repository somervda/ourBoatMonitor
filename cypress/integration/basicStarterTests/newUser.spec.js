// This test suite walks through a new user signing in . It checks
// that the email login process works, and that the user is created as a
// inactive user with no access to application functionality
// User name is based on the e2eUser<time of day>.test.com email

/// <reference types="Cypress" />

context("Create new user", () => {
  let now = new Date();
  const userEmail = "e2eUser" + now.valueOf() + "@e2eTest.com";

  it("Site opens", () => {
    cy.visit("", {
      onBeforeLoad: win => {
        win.sessionStorage.clear();
      }
    });
  });

  it("Logon component opens", () => {
    cy.get("#mainMenu").click();
    cy.get("#mainMenuLogin").click();
    cy.contains("Sign in with Google");
    cy.contains("Sign in with email");
    cy.contains("Sign in with Microsoft");
  });

  it("Do new email login", () => {
    cy.log("userEmail:", userEmail);
    cy.get(":nth-child(2) > .firebaseui-idp-button").click();

    cy.log("Enter UserName");
    cy.get(".mdl-textfield__input").type(userEmail);
    cy.get(".firebaseui-id-submit").click();

    cy.log("Enter user details");
    cy.get(":nth-child(3) > .mdl-textfield__input").type(
      "e2e " + now.valueOf()
    );
    cy.get(
      ".firebaseui-new-password-component > .firebaseui-textfield > .mdl-textfield__input"
    ).type("password");
    cy.get(".firebaseui-id-submit").click();

    cy.log("Check that the user avitar is for non-activated user");
    cy.get(".user-avatar").then(elem => {
      let img = elem.attr("src");
      // If this assertion fails, the entire block will retry until it doesn't.
      cy.log("User avitar img", img);
      expect(img).to.equal("../../assets/images/Block_user_pic.png");
    });
  });

  it("Navigate to About Page", () => {
    cy.verifyAboutComponent();
  });

  it("Navigate to Home Page", () => {
    cy.verifyHomeComponent();
  });
  it("Not administrator", () => {
    cy.verifyNotAdministrator();
  });
  it("Not Activated User", () => {
    cy.verifyNotActivated();
  });
  it("Logout", () => {
    cy.verifyLogout();
  });
});
