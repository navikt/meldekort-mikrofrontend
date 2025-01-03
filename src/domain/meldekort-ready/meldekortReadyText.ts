import { IntlShape, useIntl } from "react-intl";

import { formatDayAndMonth } from "../../language/i18";
import { MeldekortData } from "../../types/MeldekortType";

export const createReadyForInnsendingText = (meldekort: MeldekortData) => {
  const { formatMessage }: IntlShape = useIntl();

  return meldekort.nyeMeldekort?.nesteMeldekort
    ? formatMessage(
        {
          id: meldekort.nyeMeldekort?.antallNyeMeldekort === 1 ? "meldekort.ett" : "meldekort.flere",
        },
        {
          count: meldekort.nyeMeldekort?.antallNyeMeldekort,
        },
      )
    : "";
};

export const createDatoLabel = (meldekort: MeldekortData) => {
  const { formatMessage }: IntlShape = useIntl();

  return meldekort.nyeMeldekort?.nesteMeldekort
    ? formatMessage(
        {
          id: "meldekort.dato",
        },
        {
          from: formatDayAndMonth(meldekort.nyeMeldekort?.nesteMeldekort?.fra),
          until: formatDayAndMonth(meldekort.nyeMeldekort?.nesteMeldekort?.til),
          next: meldekort.nyeMeldekort.nesteMeldekort.uke,
        },
      )
    : "";
};

export const createRisikererTrekkDescription = (meldekort: MeldekortData) => {
  const { formatMessage }: IntlShape = useIntl();

  return formatMessage(
    { id: "meldekort.info.om.trekk" },
    { dato: formatDayAndMonth(meldekort?.nyeMeldekort?.nesteMeldekort?.sisteDatoForTrekk) },
  );
};
