import { DAGPENGER_MELDEKORT_URL, MELDEKORT_URL } from "astro:env/server";
import { Alert, BodyLong } from "@navikt/ds-react";
import LinkCard from "@src/components/linkCard/LinkCard.tsx";
import { text } from "@src/language/text.ts";
import type { Language } from "@src/language/types.ts";
import type { MeldekortData, MeldekortTilUtfylling } from "@src/types/MeldekortType.ts";
import { formatDate } from "@src/utils/dates.ts";
import dayjs from "dayjs";

interface Props {
  language: Language;
  meldekortData: MeldekortData;
  dagpenger: boolean;
}

const MeldekortReady = ({ language, meldekortData, dagpenger }: Props) => {
  const url = dagpenger ? DAGPENGER_MELDEKORT_URL : MELDEKORT_URL;

  const title = createReadyForInnsendingText(language, meldekortData.ordinareMeldekort);
  const dato = createDatoLabel(language, meldekortData.nesteMeldekort);
  const risikererTrekk = meldekortData.nesteMeldekort
    ? dayjs().isAfter(meldekortData.nesteMeldekort.fristForInnsending)
    : false;
  const risikererTrekkDescription = createRisikererTrekkDescription(language, meldekortData.nesteMeldekort);

  return (
    <LinkCard language={language} href={url} dagpenger={dagpenger}>
      <BodyLong>{title}</BodyLong>
      <Alert inline variant="info" size="small">
        {risikererTrekk ? risikererTrekkDescription : dato}
      </Alert>
    </LinkCard>
  );
};

const createReadyForInnsendingText = (language: Language, ordinareMeldekort: MeldekortTilUtfylling[]) => {
  if (ordinareMeldekort.length === 1) {
    return text.sendInnEttMeldekort[language];
  } else if (ordinareMeldekort.length > 1) {
    return text.sendInnFlereMeldekort[language].replace("{count}", ordinareMeldekort.length.toString());
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
