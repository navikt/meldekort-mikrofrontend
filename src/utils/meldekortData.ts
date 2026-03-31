import { requestTokenxOboToken } from "@navikt/oasis";
import type { MeldekortData, MeldekortStatus, MeldekortTilUtfylling } from "@src/types/MeldekortType.ts";
import { isLocal } from "@src/utils/environment.ts";
import { logger } from "@src/utils/logger.ts";
import dayjs from "dayjs";

export const hentMeldekortstatus = async (oboToken: string, audience: string, url: string) => {
  logger.info(`Henter meldekortstatus fra ${url}`);

  let meldekortstatus: MeldekortStatus = {
    harInnsendteMeldekort: false,
    meldekortTilUtfylling: [],
    redirectUrl: "",
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
      logger.error(`dataResponse fra ${url} feilet med status ${dataResponse.status}`);
      return meldekortstatus;
    }

    if (dataResponse.status !== 404) {
      meldekortstatus = await dataResponse.json();
    } else {
      logger.info("Person finnes ikke");
      return meldekortstatus;
    }
  } catch (e) {
    logger.error(`Feil ved henting av data fra ${url}: ${e}`);
  }

  return meldekortstatus;
};

export const prosesserMeldekortDataFraApi = (meldekortStatus: MeldekortStatus): MeldekortData => {
  const erMeldekortbruker =
    meldekortStatus.harInnsendteMeldekort ||
    meldekortStatus.meldekortTilUtfylling.length > 0 ||
    meldekortStatus.redirectUrl !== "";

  let nesteMeldekort: MeldekortTilUtfylling | null = null;
  let nesteMeldekortKanSendesFra: dayjs.Dayjs | null = null;

  if (meldekortStatus.meldekortTilUtfylling.length > 0) {
    nesteMeldekort = meldekortStatus.meldekortTilUtfylling[0];
    nesteMeldekortKanSendesFra = dayjs(nesteMeldekort.kanSendesFra);
  }

  const isPendingForInnsending =
    erMeldekortbruker && nesteMeldekortKanSendesFra != null && nesteMeldekortKanSendesFra > dayjs();
  const isReadyForInnsending =
    erMeldekortbruker && nesteMeldekortKanSendesFra != null && nesteMeldekortKanSendesFra <= dayjs();

  return { isPendingForInnsending, isReadyForInnsending, nesteMeldekort };
};
