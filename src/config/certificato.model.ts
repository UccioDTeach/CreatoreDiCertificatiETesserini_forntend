import UtenteRegistrato from './utenteRegistrato.model';

type Certificato = {
  id: number;

  createdBy: UtenteRegistrato | null;

  TipoCertificato: string;

  titolo: string;

  siAttestaChe: string;

  sottotitolo: string;

  luogoFormazione: string;

  sottotitolo2: string;

  carica1: string;

  carica2: string;

  carica3: string;
};

export default Certificato;
