export interface FiEcoResponce {
  idFuente:                 number;
  idPp:                     string;
  fuente:                   string;
  linkFuente:               string;
  linkAccesoFuente:         string;
  anioEvento:               string;
  comentario:               string;
  isactive:                 boolean;
  responsableRegister:      number;
  responsableActualizacion: number | null;
}
