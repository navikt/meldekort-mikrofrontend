import useSWRImmutable from "swr/immutable";

import { fetcher } from "./api/api";
import { meldekortApiUrl, meldekortregisterUrl } from "./api/urls";
import styles from "./App.module.css";
import MeldekortEtterregistrering from "./domain/meldekort-etterregistrering/MeldekortEtterregistrering";
import MeldekortPending from "./domain/meldekort-pending/MeldekortPending";
import MeldekortReady from "./domain/meldekort-ready/MeldekortReady";
import { isMeldekortbruker, meldekortState } from "./domain/meldekortState";
import { MeldekortDataFraApi, NesteMeldekortFraApi } from "./types/MeldekortType";

function App() {
  const { data: meldekortFraArena, error: errorFraApi } = useSWRImmutable<MeldekortDataFraApi>(
    meldekortApiUrl,
    fetcher,
  );
  const { data: meldekortFraDp, error: errorFraDp } = useSWRImmutable<MeldekortDataFraApi>(
    meldekortregisterUrl,
    fetcher,
  );

  if (errorFraApi) {
    console.error("Failed to fetch data from meldekort API:", errorFraApi);
  }
  if (errorFraDp) {
    console.error("Failed to fetch data from meldekortregister API:", errorFraDp);
  }

  if (errorFraApi && errorFraDp) {
    throw Error("Klarte ikke å hente meldekortdata");
  }

  const antallGjenstaaendeFeriedagerArena = meldekortFraArena ? meldekortFraArena.antallGjenstaaendeFeriedager : 0;
  const antallGjenstaaendeFeriedagerDp = meldekortFraDp ? meldekortFraDp.antallGjenstaaendeFeriedager : 0;

  const etterregistrerteMeldekortArena = meldekortFraArena ? meldekortFraArena.etterregistrerteMeldekort : 0;
  const etterregistrerteMeldekortDp = meldekortFraDp ? meldekortFraDp.etterregistrerteMeldekort : 0;

  const meldekortArena = meldekortFraArena ? meldekortFraArena.meldekort : 0;
  const meldekortDp = meldekortFraDp ? meldekortFraDp.meldekort : 0;

  const nesteInnsendingAvMeldekortArena =
    meldekortFraArena && meldekortFraArena.nesteInnsendingAvMeldekort
      ? meldekortFraArena.nesteInnsendingAvMeldekort
      : null;
  const nesteInnsendingAvMeldekortDp =
    meldekortFraDp && meldekortFraDp.nesteInnsendingAvMeldekort ? meldekortFraDp.nesteInnsendingAvMeldekort : null;

  const nesteInnsendingAvMeldekort = finnNesteInnsendingAvMeldekort(
    nesteInnsendingAvMeldekortArena,
    nesteInnsendingAvMeldekortDp,
  );

  const nesteMeldekortArena =
    meldekortFraArena && meldekortFraArena.nesteMeldekort ? meldekortFraArena.nesteMeldekort : null;
  const nesteMeldekortDp = meldekortFraDp && meldekortFraDp.nesteMeldekort ? meldekortFraDp.nesteMeldekort : null;

  const nesteMeldekort = finnNesteMeldekort(nesteMeldekortArena, nesteMeldekortDp);

  const meldekort: MeldekortDataFraApi = {
    antallGjenstaaendeFeriedager: antallGjenstaaendeFeriedagerArena + antallGjenstaaendeFeriedagerDp,
    etterregistrerteMeldekort: etterregistrerteMeldekortArena + etterregistrerteMeldekortDp,
    meldekort: meldekortArena + meldekortDp,
    nesteInnsendingAvMeldekort: nesteInnsendingAvMeldekort,
    nesteMeldekort: nesteMeldekort,
  };

  if (!isMeldekortbruker(meldekort)) {
    return null;
  }

  const { isPendingForInnsending, isReadyForInnsending, meldekortData } = meldekortState(meldekort);

  return (
    <div className={styles.container}>
      <MeldekortEtterregistrering meldekort={meldekortData} />
      {isPendingForInnsending ? <MeldekortPending meldekort={meldekortData} /> : null}
      {isReadyForInnsending ? <MeldekortReady meldekort={meldekortData} /> : null}
    </div>
  );
}

function finnNesteInnsendingAvMeldekort(
  nesteInnsendingAvMeldekortArena: string | null,
  nesteInnsendingAvMeldekortDp: string | null,
) {
  let nesteInnsendingAvMeldekort;

  if (nesteInnsendingAvMeldekortArena == null && nesteInnsendingAvMeldekortDp == null) {
    nesteInnsendingAvMeldekort = null;
  } else if (nesteInnsendingAvMeldekortArena == null) {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortDp;
  } else if (nesteInnsendingAvMeldekortDp == null) {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortArena;
  } else if (nesteInnsendingAvMeldekortArena < nesteInnsendingAvMeldekortDp) {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortArena;
  } else {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortDp;
  }

  return nesteInnsendingAvMeldekort;
}

function finnNesteMeldekort(
  nesteMeldekortArena: NesteMeldekortFraApi | null,
  nesteMeldekortDp: NesteMeldekortFraApi | null,
) {
  let nesteMeldekort;
  if (nesteMeldekortArena == null && nesteMeldekortDp == null) {
    nesteMeldekort = null;
  } else if (nesteMeldekortArena == null) {
    nesteMeldekort = nesteMeldekortDp;
  } else {
    nesteMeldekort = nesteMeldekortArena;
  }

  return nesteMeldekort;
}

export default App;
