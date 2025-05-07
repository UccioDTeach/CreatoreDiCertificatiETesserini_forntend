import UtenteRegistrato from './utenteRegistrato.model';

type Utente = {
  id: number;
  name: string;
  cognome: string;
  dataNascita: string;
  codiceFiscale: string;
  email: string;
  createdBy: UtenteRegistrato | null;
  voto: string;
};

export default Utente;
