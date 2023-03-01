import { Next } from "@navikt/ds-icons";
import styles from "./LinkCard.module.css";
import { ReactElement } from "react";
import { loggAktivitet } from "../../utils/amplitude-utils";

interface Props {
  href: string;
  children: ReactElement;
}

const LinkCard = ({ href, children }: Props) => {
  return (
    <a
      id={styles.linkcard}
      className={`navds-panel navds-link-panel`}
      href={href}
      onClick={() => {
        loggAktivitet();
      }}
    >
      <div className="navds-link-panel__content">{children}</div>
      <Next id={styles.linkcardChevron} className="navds-link-panel__chevron" />
    </a>
  );
};

export default LinkCard;
