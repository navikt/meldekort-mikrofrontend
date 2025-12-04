import { DAGPENGER_MELDEKORT_URL, ETTERREGISTRERING_MELDEKORT_URL } from "astro:env/server";
import { Alert, BodyLong } from "@navikt/ds-react";
import LinkCard from "@src/components/linkCard/LinkCard.tsx";
import { text } from "@src/language/text.ts";
import type { Language } from "@src/language/types.ts";
import type { MeldekortData } from "@src/types/MeldekortType.ts";

interface Props {
  language: Language;
  meldekort: MeldekortData;
  dagpenger: boolean;
}

const MeldekortEtterregistrering = ({ language, meldekort, dagpenger }: Props) => {
  if (meldekort.etterregistrerteMeldekort > 0) {
    const url = dagpenger ? DAGPENGER_MELDEKORT_URL : ETTERREGISTRERING_MELDEKORT_URL;

    return (
      <LinkCard language={language} warning={true} href={url} dagpenger={dagpenger}>
        <BodyLong>{text.etterregistreringer[language]}</BodyLong>
        <Alert inline variant="warning" size="small">
          {text.etterregistrering[language].replace("{count}", meldekort.etterregistrerteMeldekort.toString())}
        </Alert>
      </LinkCard>
    );
  }

  return null;
};

export default MeldekortEtterregistrering;
