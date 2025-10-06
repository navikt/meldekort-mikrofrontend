import { MELDEKORT_URL } from "astro:env/server";
import { BodyLong } from "@navikt/ds-react";
import LinkCard from "@src/components/linkCard/LinkCard.tsx";
import { text } from "@src/language/text.ts";
import type { Language } from "@src/language/types.ts";
import type { MeldekortData } from "@src/types/MeldekortType.ts";
import { formatDate } from "@src/utils/dates.ts";

interface Props {
  language: Language;
  meldekort: MeldekortData;
}

const MeldekortPending = ({ language, meldekort }: Props) => {
  const title = meldekort.nyeMeldekort?.nesteInnsendingAvMeldekort
    ? text.nesteMeldekortFra[language].replace("{dato}", formatDate(meldekort.nyeMeldekort?.nesteInnsendingAvMeldekort))
    : "";

  return (
    <LinkCard language={language} href={MELDEKORT_URL}>
      <BodyLong>{title}</BodyLong>
    </LinkCard>
  );
};

export default MeldekortPending;
