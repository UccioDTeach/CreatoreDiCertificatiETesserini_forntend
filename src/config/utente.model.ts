import UtenteRegistrato from './utenteRegistrato.model';

type Utente = {
  id: number;
  name: string;
  cognome: string;
  dataNascita: string;
  codiceFiscale: string;
  email: string;
  dataRilascio: string;
  validita: string;
  direttore: string;
  istruttore: string;
  codiceCertificato: string;
  createdBy: UtenteRegistrato | null;
};

export default Utente;
