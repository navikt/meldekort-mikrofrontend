export interface NesteMeldekort {
  fra: string;
  kanSendesFra: string;
  risikererTrekk: boolean;
  sisteDatoForTrekk: string;
  til: string;
  uke: string;
}

interface NyeMeldekort {
  antallNyeMeldekort: number;
  nesteInnsendingAvMeldekort: string | null;
  nesteMeldekort: NesteMeldekort | null;
}

export interface MeldekortData {
  etterregistrerteMeldekort: number;
  meldekortbruker: boolean;
  nyeMeldekort: NyeMeldekort | null;
  resterendeFeriedager: number;
}

interface NesteMeldekortFraApi {
  fra: string;
  kanSendesFra: string;
  til: string;
  uke: string;
}

export interface MeldekortDataFraApi {
  antallGjenstaaendeFeriedager: number;
  etterregistrerteMeldekort: number;
  meldekort: number;
  nesteInnsendingAvMeldekort: string | null;
  nesteMeldekort: NesteMeldekortFraApi | null;
}
