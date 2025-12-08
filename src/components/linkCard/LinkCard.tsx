import { ChevronRightIcon, ExclamationmarkTriangleFillIcon } from "@navikt/aksel-icons";
import { Heading } from "@navikt/ds-react";
import { text } from "@src/language/text.ts";
import type { Language } from "@src/language/types.ts";
import type { ReactElement } from "react";
import styles from "./LinkCard.module.css";

interface Props {
  language: Language;
  href: string;
  dagpenger?: boolean;
  warning?: boolean;
  children: ReactElement | ReactElement[];
}

const LinkCard = ({ language, href, dagpenger, warning, children }: Props) => {
  return (
    <a className={styles.container} href={href}>
      <div className={styles.headerContainer}>
        <Heading size="small" level="2">
          {dagpenger ? text.tittelDagpenger[language] : text.tittel[language]}
        </Heading>
        <div className={styles.chevronContainer}>
          {warning && <ExclamationmarkTriangleFillIcon className={styles.warning} aria-hidden fontSize="24px" />}
          <ChevronRightIcon className={styles.chevron} aria-hidden fontSize="24px" />
        </div>
      </div>
      <div className={styles.contentContainer}>{children}</div>
    </a>
  );
};

export default LinkCard;
