export interface FiEcoResponce {
  idFuente:                 number;
  idPp:                     string;
  fuente:                   string;
  linkFuente:               string;
  linkAccesoFuente?:        string | null;
  anioEvento:               string;
  comentario:               string;
  isactive?:                boolean | null;
  responsableRegister?:     number;
  responsableActualizacion: number | null;
}
