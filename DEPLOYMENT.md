# Instancias de pruebas y producción

| Perfil | Frontend | Backend | Tablas |
|---|---|---|---|
| pruebas | `/frontendv1/` | `/siscapback/api` | `public.*_s`, `public.*_a` |
| produccion | `/prod/` | `/prodback/api` | `seleccion.*`, `armonizacion.*`, `usuarios.tickets` |

Servidor: `http://10.200.130.27:8090`. Ambos backend usan la conexión existente a
`bd_siiernma` en `10.153.3.21:5433`. Usuarios y catálogos mantienen sus esquemas.
No se cambian columnas, encabezados del Excel ni contratos de la API.

## Generar los WAR

Desde AIRNyMA, en CMD:

```bat
npm.cmd run war:produccion
```

Produce `prod.war`, con base `/prod/` y API `http://10.200.130.27:8090/prodback/api`.
Requiere el `jar` del JDK en PATH o JAVA_HOME. También se puede definir
`set JAR_BIN=d:\sistemas\jdk\bin\jar.exe` antes de ejecutar el comando.

Para pruebas: `npm.cmd run war:pruebas` genera `frontendv1.war`.
Este comando sí reemplaza ese WAR; compilar producción no lo modifica.
`npm.cmd start` conserva la configuración local de desarrollo.

Desde la raíz de sistema-captura-backend:

```bat
mvn.cmd -Pproduccion package
mvn.cmd -Ppruebas package
```

Salidas: `target/produccion/prodback.war` y `target/pruebas/siscapback.war`.
Sin perfil, Maven selecciona pruebas. No activar ambos perfiles simultáneamente.
Cada perfil tiene su directorio de compilación para evitar mezclar clases.

En NetBeans se puede ejecutar la meta Maven `package` con el perfil `produccion`
(equivalente a `-Pproduccion package`). El proyecto conserva su nombre; el nombre
del WAR y su contexto los define el perfil. Para entregar al servidor usa el WAR
generado, no la opción de ejecución automática del IDE.

## Subir al servidor

1. Subir `prodback.war` y `prod.war` mediante Tomcat Manager o el procedimiento
   habitual de despliegue de WAR. Conservar exactamente esos nombres.
2. Si el formulario solicita contexto, usar `/prodback` para el backend y `/prod`
   para el frontend. No reemplazar ni eliminar las aplicaciones de pruebas.
3. Abrir `http://10.200.130.27:8090/prod/`, iniciar sesión y comprobar Visor,
   Validación, selección y consulta de tickets. Confirmar en Network que las
   solicitudes van a `/prodback/api` y que la cookie de sesión usa `/prodback`.
4. Comprobar también que `/frontendv1/` sigue usando `/siscapback/api`.

Los nuevos frontend usan claves de almacenamiento separadas por URL del backend
y el cierre de sesión borra solamente sus propias claves. Se requiere volver a
iniciar sesión y seleccionar procesos/fuentes. No se migran claves antiguas.

**Convivencia con el frontend antiguo:** la versión anterior de `/frontendv1/`
todavía ejecuta `localStorage.clear()`. Para aislamiento completo al usar ambas
instancias en el mismo navegador, actualizar también el frontend de pruebas con
el nuevo perfil `pruebas` y recargar/cerrar sus pestañas antiguas. Mientras no se
actualice, usar perfiles de navegador separados. El WAR de pruebas original no
se reemplazó en esta entrega; hay una copia nueva en `dist/pruebas/frontendv1.war`.

## Verificaciones realizadas

- Compilación de ambos perfiles de frontend y backend.
- Lectura de las 35 entidades en producción; revisión de claves, secuencias y
  relaciones de `armonizacion.clasificadores` y `usuarios.tickets`.
- Visor sobre 3,455 variables de producción: paginación, filtros, conteos y
  relaciones del detalle, con transacciones de solo lectura.
- Pruebas aisladas de los destinos de importación y de la bandera de clasificación.
- Ocho pruebas de frontend: Visor y aislamiento del almacenamiento.

La compilación presenta las advertencias CSS existentes de DaisyUI. No se
realizaron escrituras de datos, cambios de esquema, despliegues ni commits.
El flujo HTTP completo con las nuevas rutas se verifica después del despliegue.
