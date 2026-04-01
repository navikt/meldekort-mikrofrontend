export interface MeldekortData {
  isPendingForInnsending: boolean;
  isReadyForInnsending: boolean;
  nesteMeldekort: MeldekortTilUtfylling | null;
  ordinareMeldekort: MeldekortTilUtfylling[];
  etterregistrerteMeldekort: MeldekortTilUtfylling[];
}

export interface MeldekortStatus {
  harInnsendteMeldekort: boolean;
  meldekortTilUtfylling: MeldekortTilUtfylling[];
  redirectUrl: string;
}

export interface MeldekortTilUtfylling {
  fraOgMed: string;
  tilOgMed: string;
  uke: string;
  kanSendesFra: string;
  kanFyllesUtFra?: string | null;
  fristForInnsending: string;
  etterregistrering: boolean;
}
