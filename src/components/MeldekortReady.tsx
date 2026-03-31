import { DAGPENGER_MELDEKORT_URL, MELDEKORT_URL } from "astro:env/server";
import { Alert, BodyLong } from "@navikt/ds-react";
import LinkCard from "@src/components/linkCard/LinkCard.tsx";
import { text } from "@src/language/text.ts";
import type { Language } from "@src/language/types.ts";
import type { MeldekortStatus, MeldekortTilUtfylling } from "@src/types/MeldekortType.ts";
import { formatDate } from "@src/utils/dates.ts";
import dayjs from "dayjs";

interface Props {
  language: Language;
  meldekortStatus: MeldekortStatus;
  dagpenger: boolean;
}

const MeldekortReady = ({ language, meldekortStatus, dagpenger }: Props) => {
  const url = dagpenger ? DAGPENGER_MELDEKORT_URL : MELDEKORT_URL;

  let nesteMeldekort: MeldekortTilUtfylling | null = null;

  if (meldekortStatus.meldekortTilUtfylling.length > 0) {
    nesteMeldekort = meldekortStatus.meldekortTilUtfylling[0];
  }

  const title = createReadyForInnsendingText(language, meldekortStatus);
  const dato = createDatoLabel(language, nesteMeldekort);
  const risikererTrekk = nesteMeldekort ? dayjs().isAfter(nesteMeldekort.fristForInnsending) : false;
  const risikererTrekkDescription = createRisikererTrekkDescription(language, nesteMeldekort);

  return (
    <LinkCard language={language} href={url} dagpenger={dagpenger}>
      <BodyLong>{title}</BodyLong>
      <Alert inline variant="info" size="small">
        {risikererTrekk ? risikererTrekkDescription : dato}
      </Alert>
    </LinkCard>
  );
};

const createReadyForInnsendingText = (language: Language, meldekortStatus: MeldekortStatus) => {
  if (meldekortStatus.meldekortTilUtfylling.length === 1) {
    return text.sendInnEttMeldekort[language];
  } else if (meldekortStatus.meldekortTilUtfylling.length > 1) {
    return text.sendInnFlereMeldekort[language].replace(
      "{count}",
      meldekortStatus.meldekortTilUtfylling.length.toString() || "0",
    );
  } else {
    return "";
  }
};

const createDatoLabel = (language: Language, nesteMeldekort: MeldekortTilUtfylling | null) => {
  if (nesteMeldekort) {
    return text.ukeMedPeriode[language]
      .replace("{next}", nesteMeldekort.uke)
      .replace("{from}", formatDate(nesteMeldekort.fraOgMed))
      .replace("{until}", formatDate(nesteMeldekort.tilOgMed));
  } else {
    return "";
  }
};

const createRisikererTrekkDescription = (language: Language, nesteMeldekort: MeldekortTilUtfylling | null) => {
  return text.infoOmTrekk[language].replace("{dato}", formatDate(nesteMeldekort?.fristForInnsending));
};

export default MeldekortReady;
