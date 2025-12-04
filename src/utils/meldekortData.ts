import { requestTokenxOboToken } from "@navikt/oasis";
import type { MeldekortData, MeldekortDataFraApi } from "@src/types/MeldekortType.ts";
import { isLocal } from "@src/utils/environment.ts";
import { logger } from "@src/utils/logger.ts";
import dayjs from "dayjs";

export const hentMeldekortDataFraApi = async (
  oboToken: string,
  audience: string,
  url: string,
): Promise<MeldekortDataFraApi> => {
  logger.info("Henter meldekortdata fra API");

  const meldekortData = await hentMeldekortstatus(oboToken, audience, url);

  return {
    antallGjenstaaendeFeriedager: meldekortData ? meldekortData.antallGjenstaaendeFeriedager : 0,
    etterregistrerteMeldekort: meldekortData ? meldekortData.etterregistrerteMeldekort : 0,
    meldekort: meldekortData ? meldekortData.meldekort : 0,
    nesteInnsendingAvMeldekort: meldekortData?.nesteInnsendingAvMeldekort
      ? meldekortData.nesteInnsendingAvMeldekort
      : null,
    nesteMeldekort: meldekortData?.nesteMeldekort ? meldekortData.nesteMeldekort : null,
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
