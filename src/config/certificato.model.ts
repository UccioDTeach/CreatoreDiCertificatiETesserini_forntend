import UtenteRegistrato from './utenteRegistrato.model';
// import Utente from './utente.model'; // Removed

type Certificato = {
  id: number;

  createdBy: UtenteRegistrato | null; // User who created the record
  // utente?: Utente | null; // Removed

  tipoCertificato: string;

  dataEmissione?: Date; // Make optional or remove if not used

  titolo: string;

  siAttestaChe: string; // Added back

  sottotitolo: string;

  luogoFormazione: string;

  sottotitolo2: string;

  carica1: string;

  carica2: string;

  carica3: string;
};

export default Certificato;
