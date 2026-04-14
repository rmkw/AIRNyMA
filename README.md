# 🧩 Frontend SIERNMA

Frontend del sistema **SIIERNMA (Sistema Integrado de Inventarios y Encuestas sobre Recursos Naturales y Medio Ambiente)**, desarrollado con Angular, orientado a la **gestión, captura y armonización de variables**.

Este sistema permite interactuar con el backend para registrar, consultar y enriquecer variables dentro del Inventario del SIERNMA.

---

## 🎯 Descripción

El frontend proporciona una interfaz para:

* Captura de variables provenientes de procesos estadísticos
* Visualización de información estructurada
* Armonización de variables (enriquecimiento de datos)
* Gestión de catálogos relacionados:

  * fuentes
  * procesos
  * ODS
  * MDEA
  * pertinencia

---

## 🧱 Arquitectura del proyecto

El proyecto está organizado por funcionalidades:

```id="m1k8vo"
src/app/
 ├── core/           # Servicios globales (auth, config, etc.)
 ├── shared/         # Componentes reutilizables
 ├── features/       # Módulos principales
 │    ├── variables/
 │    ├── fuentes/
 │    ├── procesos/
 │    ├── ods/
 │    └── mdea/
 └── app.routes.ts
```

---

## 🚀 Tecnologías utilizadas

* Angular 19
* TypeScript
* RxJS
* Angular Reactive Forms
* TailwindCSS (si aplica)
* Angular CLI

---

## ⚙️ Configuración del entorno

### 📡 Backend

Asegúrate de que el backend esté corriendo, por ejemplo:

```id="o9a2hs"
http://localhost:3000
```

Configura la URL en tus servicios Angular (ejemplo):

```ts id="h2x7qp"
private apiUrl = 'http://localhost:3000/api';
```

---

## ▶️ Ejecución del proyecto

```bash id="7n9lqx"
ng serve
```

Abrir en navegador:

```id="q1m2ds"
http://localhost:4200/
```

---

## 🧩 Funcionalidades principales

* 📥 Captura de variables (módulo selección)
* 🔄 Armonización de variables (enriquecimiento)
* 📚 Gestión de catálogos
* 🔎 Consulta de información estructurada
* 🧾 Formularios reactivos para validación de datos

---

## 🧠 Flujo del sistema

El frontend sigue el flujo principal:

```id="8c9lmn"
Selección → Armonización → Consulta
```

Donde:

* **Selección**: captura inicial de variables
* **Armonización**: enriquecimiento y estandarización
* **Consulta**: explotación de la información

---

## 🔌 Ejemplo de integración

### Crear variable

El frontend envía información al backend:

```id="2f7kdl"
POST /api/variables
```

Usando servicios Angular con `HttpClient`.

---

## 🧪 Desarrollo

Generar componentes:

```bash id="c5z8ra"
ng generate component nombre-componente
```

---

## ⚠️ Consideraciones

* El frontend depende completamente del backend
* Validar que los endpoints estén activos
* Mantener consistencia entre modelos frontend y backend

---

## 📌 Estado del proyecto

En desarrollo 🚧

---

## 👨‍💻 Autor

Proyecto desarrollado en el contexto del INEGI para el sistema SIERNMA.
