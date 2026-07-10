-- Reusar fuentes corregidas en armonizacion.
-- Ejecutar en PostgreSQL despues de respaldar la base y validar nombres reales
-- de constraints en el ambiente destino.

BEGIN;

-- Si esta consulta devuelve filas, primero hay que consolidar duplicados antes
-- de poder crear el UNIQUE de id_fuente.
-- SELECT id_fuente, count(*)
-- FROM armonizacion.fuentes
-- GROUP BY id_fuente
-- HAVING count(*) > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_armonizacion_fuentes_id_fuente'
      AND conrelid = 'armonizacion.fuentes'::regclass
  ) THEN
    ALTER TABLE armonizacion.fuentes
      ADD CONSTRAINT uq_armonizacion_fuentes_id_fuente UNIQUE (id_fuente);
  END IF;
END $$;

ALTER TABLE armonizacion.variables
  DROP CONSTRAINT IF EXISTS fk_variables_fuentes;

UPDATE armonizacion.variables AS variable
SET id_fuente = fuente.id_fuente
FROM armonizacion.fuentes AS fuente
WHERE variable.id_fuente = fuente.id_fuente_seleccion;

ALTER TABLE armonizacion.variables
  ADD CONSTRAINT fk_variables_fuentes
  FOREIGN KEY (id_fuente)
  REFERENCES armonizacion.fuentes (id_fuente)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

COMMIT;
