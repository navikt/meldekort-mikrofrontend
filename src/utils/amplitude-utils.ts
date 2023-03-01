import amplitude from "amplitude-js";

let initialized = false;

function initAmplitude() {
  const config = {
    apiEndpoint: "amplitude.nav.no/collect-auto",
    saveEvents: false,
    includeUtm: true,
    includeReferrer: false,
    platform: window.location.toString(),
  };

  amplitude.getInstance().init("default", undefined, config);

  initialized = true;
}

function amplitudeLogger(name: string, values?: object) {
  if (!initialized) {
    console.log("Aktivitet uten initialisert amplitude:", name, values);
    return;
  }
  amplitude.getInstance().logEvent(name, values);
}

export function loggAktivitet() {
  const eventData = { komponent: "meldekort-mikrofrontend" };
  amplitudeLogger("navigere", eventData);
}

initAmplitude();
