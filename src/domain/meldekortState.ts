import dayjs from "dayjs";

import { MeldekortData, MeldekortDataFraApi } from "../types/MeldekortType";

export const meldekortState = (meldekort: MeldekortDataFraApi) => {
  const isMeldekortBruker = isMeldekortbruker(meldekort);
  const { sisteDatoForTrekk, risikerTrekk } = calculateSisteDatoForTrekk(meldekort.nesteMeldekort?.til);

  let nesteMeldekort = null;
  if (meldekort.nesteMeldekort) {
    nesteMeldekort = {
      fra: meldekort.nesteMeldekort.fra,
      kanSendesFra: meldekort.nesteMeldekort.kanSendesFra,
      risikererTrekk: risikerTrekk,
      sisteDatoForTrekk: sisteDatoForTrekk,
      til: meldekort.nesteMeldekort.til,
      uke: meldekort.nesteMeldekort.uke,
    };
  }

  const nyeMeldekort = {
    antallNyeMeldekort: meldekort.meldekort,
    nesteInnsendingAvMeldekort: meldekort.nesteInnsendingAvMeldekort,
    nesteMeldekort: nesteMeldekort,
  };

  const meldekortData: MeldekortData = {
    etterregistrerteMeldekort: meldekort.etterregistrerteMeldekort,
    meldekortbruker: isMeldekortBruker,
    nyeMeldekort,
    resterendeFeriedager: meldekort.antallGjenstaaendeFeriedager,
  };

  const isPendingForInnsending = isMeldekortBruker && meldekortData.nyeMeldekort?.nesteInnsendingAvMeldekort != null;
  const isReadyForInnsending =
    isMeldekortBruker &&
    meldekortData.nyeMeldekort?.antallNyeMeldekort &&
    meldekortData.nyeMeldekort.antallNyeMeldekort > 0;

  return { isPendingForInnsending, isReadyForInnsending, meldekortData };
};

export const isMeldekortbruker = (meldekort: MeldekortDataFraApi) => {
  return (
    meldekort.nesteMeldekort != null ||
    meldekort.nesteInnsendingAvMeldekort != null ||
    meldekort.antallGjenstaaendeFeriedager > 0 ||
    meldekort.etterregistrerteMeldekort > 0 ||
    meldekort.meldekort > 0
  );
};

const calculateSisteDatoForTrekk = (til?: string) => {
  const sisteDatoForTrekk = dayjs(til).add(8, "day");
  const risikerTrekk = dayjs().isAfter(sisteDatoForTrekk);

  return {
    sisteDatoForTrekk: sisteDatoForTrekk.format("YYYY-MM-DD"),
    risikerTrekk,
  };
};
