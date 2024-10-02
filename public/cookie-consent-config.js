import "https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.0.1/dist/cookieconsent.umd.js";

// Enable dark mode
document.documentElement.classList.add("cc--darkmode");

async function logConsent() {
  // Retrieve all the fields
  const cookie = CookieConsent.getCookie();
  const preferences = CookieConsent.getUserPreferences();

  // In this example we're saving only 4 fields
  const userConsent = {
    consentId: cookie.consentId,
    acceptType: preferences.acceptType,
    acceptedCategories: preferences.acceptedCategories,
    rejectedCategories: preferences.rejectedCategories,
  };

  // Send the data to your backend
  // replace "/your-endpoint-url" with your API
  const response = await fetch("/api/updateConsent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userConsent),
  });

  return response.json();
}

CookieConsent.run({
  onFirstConsent: () => {
    logConsent().then((response) => {
      if (response.success) {
        console.log("Consent has been saved");
      } else {
        console.error("Failed to save the consent");
      }
    });
  },

  onChange: () => {
    logConsent().then((response) => {
      if (response.success) {
        console.log("Consent has been saved");
      } else {
        console.error("Failed to save the consent");
      }
    });
  },
  guiOptions: {
    consentModal: {
      layout: "bar inline",
      position: "bottom right",
      equalWeightButtons: true,
      flipButtons: true,
    },
    preferencesModal: {
      layout: "box",
      position: "right",
      equalWeightButtons: true,
      flipButtons: false,
    },
  },
  categories: {
    necessary: {
      readOnly: true,
    },
  },
  language: {
    default: "en",
    autoDetect: "browser",
    translations: {
      en: {
        consentModal: {
          title: "Cookie Consent",
          description:
            "By clicking 'Accept all', you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts.",
          acceptAllBtn: "Accept all",
          //   acceptNecessaryBtn: "Reject all",
          showPreferencesBtn: "Manage preferences",
          footer:
            '<a href="/privacy">Privacy Policy</a>\n<a href="/terms">Terms and conditions</a>',
        },
        preferencesModal: {
          title: "Consent Preferences Center",
          acceptAllBtn: "Accept all",
          //   acceptNecessaryBtn: "Reject all",
          savePreferencesBtn: "Save preferences",
          closeIconLabel: "Close modal",
          serviceCounterLabel: "Service|Services",
          sections: [
            {
              title: "Cookie Usage",
              // description:
              //   "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            },
            {
              title:
                'Strictly Necessary Cookies <span class="pm__badge">Always Enabled</span>',
              // description:
              //   "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
              linkedCategory: "necessary",
            },
            {
              title: "More information",
              description:
                'For any query in relation to my policy on cookies and your choices, please <a class="cc__link" href="#yourdomain.com">contact me</a>.',
            },
          ],
        },
      },
    },
  },
  disablePageInteraction: false,
});
