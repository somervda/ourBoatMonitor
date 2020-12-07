# ourLora

This project aims to provide a starting point for IOT applications. Intent is for designer of a new IOT application to take a copy of this project, perform a set of standard replace operations to rename the project to the required new name and then start adding application specific code. The ourLora application provides the following capabilities that can be extended by the application designer. See application at https://ourLora.firebaseapp.com/

**ourLora Capabilities**

- Angular 11 (Version updated as new major releases of Angular occurs)
- Firebase - ourLora includes firestore, authentication, hosting, firestore rules and firebase functions
- Material Design - implements material design interface using @angular/material library. Custom material theme included to use as an example of extending base material design themes (Using SCSS and angular CDK features)
- Authentication - Set up to use firebase authentication and firebaseui library to provide the authentication UI elements. Authentication is enterprise oriented, examples are provided of using google, email and microsoft as authentication providers. The microsoft provider should allow enterprises to use office365 accounts (as long as account access is allowed.) Some basic authorization capabilities are included (administrator role and functions). Route Guards are set up to restrict access (CacActivate) to components/functions based on users privileges (isActivated, isAdmin)
- Home page - Example of a home splash page as a launching point for new users.
- PWA - Progressive web application, includes a service worker, desktop images, starter page etc that is required for a well behaved PWA. Caching defined for application and data to support offline operation.
- E2E test suite - Cypress test suite included to test ourLora capabilities and can be extended for applications based on ourLora (See section below for more details on e2e functionality)
- Built/tested/optimized - Base ourLora capabilities are built in, tested, and optimized to ensure new applications start at a consistent and well architected starting point.
- IOT data acquisition interface for collecting data from The Things Network (LoraWan), Sigfox, Hologram LTE as well as https.
- Management of IOT devices, devicetypes, applications, triggers and data views.

## Creating a new new project based on ourLora

**Getting a copy of ourLora Project**

A new project can be created based on the ourLora code. To do this will require a new firebase instance (See instructions below "Create Initial Firebase Project"). Note: these instructions do not include detailed instructions for firebase administration or how to manage your new project in github (You are on your own for that).

Create copy from the github template (GitHub repository created)

- Go to https://github.com/somervda/ourLora/generate and create a new github project based on the ourLora project.
- Get a copy of the clone link from the new project and use this in VsCode to create a local copy of your project.

_Or_ create copy as new local project (No GitHub repository created)

- Create a new folder for the new project. Name the folder after the new project name. This folder is the "New Project folder"
- Get a zip copy of the ourLora code from github https://github.com/somervda/ourLora/archive/master.zip
- Open the zip file and copy the content of the top level ourLora-master folder in the zip to the new project folder.
- Using VSCode open the new project folder.
- When initially opened a git repository will not be set up. In VSCode click on the "Source Control" icon on the left side. This will open with a message that "No source control providers are registered". Click on the "Initialize Repository" icon to create a new git repository (Normally select the first/default option for the location of this repository).

Update project name in the local copy

1. Perform a File->Replace in Files in VSCode. Replace "ourLora" to "[New Project Name]" and "our-lora" to "[New Project Name without capitals format]" e.g. in the case of creating a new project called ourDars , ourLora->ourDars , our-lora->our-dars .
2. In the VSCode terminal type "npm i" to install the node libraries defined in package.json (may take a while)
3. Perform a "ng build --prod" to check no errors exist

**Application specific changes**

The previous instructions will set up a direct copy of the ourLora code with your new project name, application specific changes will still be needed before adding your own code.

1. Use your own firebase project information(Please don't use the ourLora defaults, I will be periodically refreshing this firebase project to make sure it stays fresh. ). The firebase config information is stored in the src/environments folder files (environment.prod.ts and environment.ts).
2. Set the default firebase project to be used "firebase use [project-id]", check the firebase project in use using "firebase list"
3. In the VSCode terminal - cd to the functions folder. Perform a "npm i", then a "npm run deploy"
4. Start the application "ng serve" and perform an eMail based login. After the first user is created go to your firebase console, go to firestore and the first user , just created, should be present. Add the following fields to that user - isAdmin, boolean, true and isActivated, boolean , true. These two attributes will set up this first user as a valid administrator.
5. Change the PWA graphic set in src/assets/icons folder. These need to be sized to match the file name definitions i.e. "icon-48x48.png". Use https://app-manifest.firebaseapp.com/ to make this easier.

**Create initial firebase Project**

1. Go to https://console.firebase.google.com/ and create a new firestore project.
2. When asked to register an app select the web option , enter a name and also select "Set up Hosting". Exit the startup wizard at this point.
3. The client config information can be found under project settings -> your app -> firebase SDK settings (config option). Use the config setting in the environment files in your new angular project.
4. Make sure a "Support eMail" is defined for the project. (Also defined in the project settings page). Google authentication provider will fail if this is not set up.
5. I am using firebase storage to hold user profile pictures, enable storage in the firebase project console.

## E2E Testing with Cypress

The Cypress tooling (https://www.cypress.io/) is used to provide end to end testing for the ourLora application and any applications based on ourLora.

**Note: cypress tests did not work well with a PWA service worker**
The server worker option in the angular.json file should be set to false before running cypress tests, or in the chrome developer tools unregister the service worker and cached data (this will apply until the next time the client is refreshed). The enablePersistance() option in the app.module.ts file should also be disabled for testing (Only server data is used) .

Tests performed in the current test suite are

- `newUser.spec.js` : Non-activated user registration, authentication and authorization
- `basicUser.spec.js` : Activated user , authentication and authorization.
- `adminUser.spec.js` : Admin user , authentication and authorization and functionality

Note: Appropriate test users need to be set up for user testing (Admin: admin@fblstarter.com, Activated user: normal@ourLora.com).
