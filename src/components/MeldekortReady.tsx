import { DAGPENGER_MELDEKORT_URL, MELDEKORT_URL } from "astro:env/server";
import { Alert, BodyLong } from "@navikt/ds-react";
import LinkCard from "@src/components/linkCard/LinkCard.tsx";
import { text } from "@src/language/text.ts";
import type { Language } from "@src/language/types.ts";
import type { MeldekortData } from "@src/types/MeldekortType.ts";
import { formatDate } from "@src/utils/dates.ts";

interface Props {
  language: Language;
  meldekort: MeldekortData;
  dagpenger: boolean;
}

const MeldekortReady = ({ language, meldekort, dagpenger }: Props) => {
  const url = dagpenger ? DAGPENGER_MELDEKORT_URL : MELDEKORT_URL;
  const title = createReadyForInnsendingText(language, meldekort);
  const dato = createDatoLabel(language, meldekort);
  const risikererTrekk = meldekort.nyeMeldekort?.nesteMeldekort?.risikererTrekk;
  const risikererTrekkDescription = createRisikererTrekkDescription(language, meldekort);

  return (
    <LinkCard language={language} href={url} dagpenger={dagpenger}>
      <BodyLong>{title}</BodyLong>
      <Alert inline variant="info" size="small">
        {risikererTrekk ? risikererTrekkDescription : dato}
      </Alert>
    </LinkCard>
  );
};

const createReadyForInnsendingText = (language: Language, meldekort: MeldekortData) => {
  if (meldekort.nyeMeldekort?.nesteMeldekort) {
    if (meldekort.nyeMeldekort?.antallNyeMeldekort === 1) {
      return text.sendInnEttMeldekort[language];
    } else {
      return text.sendInnFlereMeldekort[language].replace(
        "{count}",
        meldekort.nyeMeldekort?.antallNyeMeldekort.toString() || "0",
      );
    }
  } else {
    return "";
  }
};

const createDatoLabel = (language: Language, meldekort: MeldekortData) => {
  if (meldekort.nyeMeldekort?.nesteMeldekort) {
    return text.ukeMedPeriode[language]
      .replace("{next}", meldekort.nyeMeldekort.nesteMeldekort.uke)
      .replace("{from}", formatDate(meldekort.nyeMeldekort?.nesteMeldekort?.fra))
      .replace("{until}", formatDate(meldekort.nyeMeldekort?.nesteMeldekort?.til));
  } else {
    return "";
  }
};

const createRisikererTrekkDescription = (language: Language, meldekort: MeldekortData) => {
  return text.infoOmTrekk[language].replace(
    "{dato}",
    formatDate(meldekort?.nyeMeldekort?.nesteMeldekort?.sisteDatoForTrekk),
  );
};

export default MeldekortReady;
