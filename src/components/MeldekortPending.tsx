import { DAGPENGER_MELDEKORT_URL, MELDEKORT_URL } from "astro:env/server";
import { BodyLong } from "@navikt/ds-react";
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

const MeldekortPending = ({ language, meldekort, dagpenger }: Props) => {
  const url = dagpenger ? DAGPENGER_MELDEKORT_URL : MELDEKORT_URL;
  const title = meldekort.nyeMeldekort?.nesteInnsendingAvMeldekort
    ? text.nesteMeldekortFra[language].replace("{dato}", formatDate(meldekort.nyeMeldekort?.nesteInnsendingAvMeldekort))
    : "";

  return (
    <LinkCard language={language} href={url} dagpenger={dagpenger}>
      <BodyLong>{title}</BodyLong>
    </LinkCard>
  );
};

export default MeldekortPending;
