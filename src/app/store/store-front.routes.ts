import { Routes } from "@angular/router";
import { StoreFrontLayoutComponent } from "./layouts/store-front-layout/store-front-layout.component";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { ProductPageComponent } from "./pages/product-page/product-page.component";
import { NotFoundPageComponent } from "./pages/not-found-page/not-found-page.component";
import { GenderPageComponent } from "./pages/gender-page/gender-page.component";
import { ProcesoProduccionComponent } from "@/procesoProduccion/pages/proceso-produccion/proceso-produccion.component";
import { NotAuthenticatedGuard } from "@/auth/guards/not-authenticated.guard";
import { FuenteIdentificacionComponent } from "@/fuenteIdentificacion/pages/fuente-identificacion/fuente-identificacion.component";
import { FuentesListComponent } from "@/fuenteIdentificacion/pages/fuentes-list/fuentes-list.component";
import { NuevaFuenteComponent } from "@/fuenteIdentificacion/pages/nueva-fuente/nueva-fuente.component";
import { NuevaVariableComponent } from "@/variables/pages/nueva-variable/nueva-variable.component";

export const storeFrontRoutes: Routes = [
  {
    path: '',
    component: StoreFrontLayoutComponent,

    children: [
      {
        path: '',
        component: HomePageComponent,
      },
      {
        path: 'gender/:gender',
        component: GenderPageComponent,
      },
      {
        path: 'product/:idSlug',
        component: ProductPageComponent,
      },
      {
        path: 'procesos',
        component: ProcesoProduccionComponent,
      },
      {
        path: 'fuentes',
        component: FuentesListComponent,
      },
      {
        path: 'fuente/:id',
        component: FuenteIdentificacionComponent,
      },
      {
        path: 'nueva-fuente',
        component: NuevaFuenteComponent,
      },
      {
        path: 'nueva-variable',
        component: NuevaVariableComponent,
      },
      {
        path: '**',
        component: NotFoundPageComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default storeFrontRoutes;
