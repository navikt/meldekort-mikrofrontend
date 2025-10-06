import {
  MELDEKORT_API_AUDIENCE,
  MELDEKORT_API_URL,
  MELDEKORTREGISTER_AUDIENCE,
  MELDEKORTREGISTER_URL,
} from "astro:env/server";
import { requestTokenxOboToken } from "@navikt/oasis";
import type { MeldekortData, MeldekortDataFraApi, NesteMeldekort } from "@src/types/MeldekortType.ts";
import { isLocal } from "@src/utils/environment.ts";
import { logger } from "@src/utils/logger.ts";
import dayjs from "dayjs";

export const hentMeldekortDataFraApi = async (oboToken: string): Promise<MeldekortDataFraApi> => {
  logger.info("Henter meldekortdata fra API");
  logger.info(oboToken);

  // meldekort-api
  const meldekortApiAudience = MELDEKORT_API_AUDIENCE || "";
  const meldekortApiUrl = MELDEKORT_API_URL || "";

  const meldekortFraArena = await hentMeldekortstatus(oboToken, meldekortApiAudience, meldekortApiUrl);

  // dp-meldekortregister
  const meldekortregisterAudience = MELDEKORTREGISTER_AUDIENCE || "";
  const meldekortregisterUrl = MELDEKORTREGISTER_URL || "";

  const meldekortFraDp = await hentMeldekortstatus(oboToken, meldekortregisterAudience, meldekortregisterUrl);

  // Sammenslåing
  const antallGjenstaaendeFeriedagerArena = meldekortFraArena ? meldekortFraArena.antallGjenstaaendeFeriedager : 0;
  const antallGjenstaaendeFeriedagerDp = meldekortFraDp ? meldekortFraDp.antallGjenstaaendeFeriedager : 0;

  const etterregistrerteMeldekortArena = meldekortFraArena ? meldekortFraArena.etterregistrerteMeldekort : 0;
  const etterregistrerteMeldekortDp = meldekortFraDp ? meldekortFraDp.etterregistrerteMeldekort : 0;

  const meldekortArena = meldekortFraArena ? meldekortFraArena.meldekort : 0;
  const meldekortDp = meldekortFraDp ? meldekortFraDp.meldekort : 0;

  const nesteInnsendingAvMeldekortArena = meldekortFraArena?.nesteInnsendingAvMeldekort
    ? meldekortFraArena.nesteInnsendingAvMeldekort
    : null;
  const nesteInnsendingAvMeldekortDp = meldekortFraDp?.nesteInnsendingAvMeldekort
    ? meldekortFraDp.nesteInnsendingAvMeldekort
    : null;

  const nesteInnsendingAvMeldekort = finnNesteInnsendingAvMeldekort(
    nesteInnsendingAvMeldekortArena,
    nesteInnsendingAvMeldekortDp,
  );

  const nesteMeldekortArena = meldekortFraArena?.nesteMeldekort ? meldekortFraArena.nesteMeldekort : null;
  const nesteMeldekortDp = meldekortFraDp?.nesteMeldekort ? meldekortFraDp.nesteMeldekort : null;

  const nesteMeldekort = finnNesteMeldekort(nesteMeldekortArena, nesteMeldekortDp);

  return {
    antallGjenstaaendeFeriedager: antallGjenstaaendeFeriedagerArena + antallGjenstaaendeFeriedagerDp,
    etterregistrerteMeldekort: etterregistrerteMeldekortArena + etterregistrerteMeldekortDp,
    meldekort: meldekortArena + meldekortDp,
    nesteInnsendingAvMeldekort: nesteInnsendingAvMeldekort,
    nesteMeldekort: nesteMeldekort,
  } as MeldekortDataFraApi;
};

const hentMeldekortstatus = async (oboToken: string, audience: string, url: string) => {
  logger.info(`Henter meldekortstatus fra ${url}`);

  let meldekortstatus = {
    antallGjenstaaendeFeriedager: 0,
    etterregistrerteMeldekort: 0,
    meldekort: 0,
    nesteInnsendingAvMeldekort: null,
    nesteMeldekort: null,
  };

  try {
    let token = "Fake token";

    if (!isLocal) {
      const tokenResult = await requestTokenxOboToken(oboToken, audience);
      if (tokenResult.ok) {
        token = tokenResult.token;
      } else {
        logger.error(`tokenRequest feilet ${tokenResult.error}`);
        return meldekortstatus;
      }
    }

    const dataResponse = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!dataResponse.ok && dataResponse.status !== 404) {
      logger.error(`dataResponse·fra·${url}·feilet·med·status·${dataResponse.status}`);
      return meldekortstatus;
    }

    if (dataResponse.status !== 404) {
      meldekortstatus = await dataResponse.json();
    } else {
      logger.info("Person finnes ikke");
      return meldekortstatus;
    }
  } catch (e) {
    logger.error(`Feil·ved·henting·av·data·fra·${url}: ${e}`);
  }

  return meldekortstatus;
};

const finnNesteInnsendingAvMeldekort = (
  nesteInnsendingAvMeldekortArena: NesteMeldekort | null,
  nesteInnsendingAvMeldekortDp: NesteMeldekort | null,
) => {
  let nesteInnsendingAvMeldekort: NesteMeldekort | null;

  if (nesteInnsendingAvMeldekortArena === null && nesteInnsendingAvMeldekortDp === null) {
    nesteInnsendingAvMeldekort = null;
  } else if (nesteInnsendingAvMeldekortArena === null) {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortDp;
  } else if (nesteInnsendingAvMeldekortDp === null) {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortArena;
  } else if (nesteInnsendingAvMeldekortArena < nesteInnsendingAvMeldekortDp) {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortArena;
  } else {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortDp;
  }

  return nesteInnsendingAvMeldekort;
};

const finnNesteMeldekort = (nesteMeldekortArena: NesteMeldekort | null, nesteMeldekortDp: NesteMeldekort | null) => {
  let nesteMeldekort: NesteMeldekort | null;

  if (nesteMeldekortArena === null && nesteMeldekortDp === null) {
    nesteMeldekort = null;
  } else if (nesteMeldekortArena === null) {
    nesteMeldekort = nesteMeldekortDp;
  } else if (nesteMeldekortDp === null) {
    nesteMeldekort = nesteMeldekortArena;
  } else if (nesteMeldekortArena.kanSendesFra < nesteMeldekortDp.kanSendesFra) {
    nesteMeldekort = nesteMeldekortArena;
  } else {
    nesteMeldekort = nesteMeldekortDp;
  }

  return nesteMeldekort;
};

export const prosesserMeldekortDataFraApi = (meldekort: MeldekortDataFraApi) => {
  logger.info(meldekort);
  const isMeldekortBruker = erMeldekortbruker(meldekort);
  const { sisteDatoForTrekk, risikerTrekk } = beregnSisteDatoForTrekk(meldekort.nesteMeldekort?.til);

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
    meldekortData.nyeMeldekort?.antallNyeMeldekort !== undefined &&
    meldekortData.nyeMeldekort.antallNyeMeldekort > 0;

  return { isPendingForInnsending, isReadyForInnsending, meldekortData };
};

const erMeldekortbruker = (meldekort: MeldekortDataFraApi) => {
  return (
    meldekort.nesteMeldekort != null ||
    meldekort.nesteInnsendingAvMeldekort != null ||
    meldekort.antallGjenstaaendeFeriedager > 0 ||
    meldekort.etterregistrerteMeldekort > 0 ||
    meldekort.meldekort > 0
  );
};

const beregnSisteDatoForTrekk = (til?: string) => {
  const sisteDatoForTrekk = dayjs(til).add(8, "day");
  const risikerTrekk = dayjs().isAfter(sisteDatoForTrekk);

  return {
    sisteDatoForTrekk: sisteDatoForTrekk.format("YYYY-MM-DD"),
    risikerTrekk,
  };
};
