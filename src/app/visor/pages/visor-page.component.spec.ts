import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VisorPageComponent } from './visor-page.component';
import { OpcionesVisor } from '../interfaces/visor.interface';

describe('VisorPageComponent', () => {
  let fixture: ComponentFixture<VisorPageComponent>;
  let component: VisorPageComponent;
  let http: HttpTestingController;
  const opciones: OpcionesVisor = {
    unidades: ['Unidad A', 'Unidad B'], procesos: [{ acronimo: 'ATUS', proceso: 'Accidentes' }],
    fuentes: [], anios: [2023], tematica: ['Tipo'], tema1: ['Transporte'],
    subtema1: ['Tránsito'], tema2: [], subtema2: [],
  };
  const pagina = { content: [{ idA: 'ATUS-001-2023', variableA: 'Tipo de accidente',
    acronimo: 'ATUS', idFuente: 'F1', fuente: 'DDI', edicion: '2023',
    anioReferencia: 2023, validada: false }], page: 0, size: 20, totalElements: 41, totalPages: 3 };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisorPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(VisorPageComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { fixture.destroy(); http.verify({ ignoreCancelled: true }); });

  function iniciar() {
    fixture.detectChanges();
    tick();
    http.expectOne(r => r.url.endsWith('/visor/filtros')).flush(opciones);
    http.expectOne(r => r.url.endsWith('/visor')).flush(pagina);
    fixture.detectChanges();
  }

  it('carga solo una página y envía false sin confundirlo con Todos', fakeAsync(() => {
    iniciar();
    expect(fixture.nativeElement.textContent).toContain('Tipo de accidente');
    expect(fixture.nativeElement.textContent).toContain('Página 1 de 3');
    component.irPagina(1); tick();
    const segunda = http.expectOne(r => r.url.endsWith('/visor'));
    expect(segunda.request.params.get('page')).toBe('1');
    segunda.flush({ ...pagina, page: 1 });
    component.cambiar('validada', 'false'); tick();
    const filtrada = http.expectOne(r => r.url.endsWith('/visor'));
    expect(filtrada.request.params.get('validada')).toBe('false');
    expect(filtrada.request.params.get('page')).toBe('0');
    filtrada.flush(pagina);
    component.cambiar('validada', ''); tick();
    const todas = http.expectOne(r => r.url.endsWith('/visor'));
    expect(todas.request.params.has('validada')).toBeFalse();
    todas.flush(pagina);
  }));

  it('espera 400 ms y cancela la consulta anterior al cambiar el nombre', fakeAsync(() => {
    iniciar();
    component.cambiar('variableA', 'acc');
    tick(399);
    http.expectNone(r => r.url.endsWith('/visor'));
    component.cambiar('variableA', 'accidente');
    tick(400);
    const anterior = http.expectOne(r => r.url.endsWith('/visor'));
    expect(anterior.request.params.get('variableA')).toBe('accidente');
    component.cambiar('variableA', 'peatón');
    expect(anterior.cancelled).toBeTrue();
    tick(400);
    const ultima = http.expectOne(r => r.url.endsWith('/visor'));
    expect(ultima.request.params.get('variableA')).toBe('peatón');
    ultima.flush({ ...pagina, content: [], totalElements: 0, totalPages: 0 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No se encontraron variables');
  }));

  it('limpia filtros dependientes antes de listar al cambiar unidad', fakeAsync(() => {
    iniciar();
    component.filtros = { ...component.filtros, acronimo: 'ATUS', idFuente: 'F1',
      tema1: 'Transporte', subtema1: 'Tránsito', anioReferencia: '2023' };
    component.cambiar('unidad', 'Unidad B'); tick();
    const nuevas = http.expectOne(r => r.url.endsWith('/visor/filtros'));
    expect(nuevas.request.params.has('acronimo')).toBeFalse();
    expect(nuevas.request.params.has('idFuente')).toBeFalse();
    nuevas.flush({ ...opciones, tema1: [], subtema1: [], anios: [] });
    http.expectOne(r => r.url.endsWith('/visor/filtros')).flush({ ...opciones, tema1: [], subtema1: [], anios: [] });
    const lista = http.expectOne(r => r.url.endsWith('/visor'));
    expect(lista.request.params.has('tema1')).toBeFalse();
    expect(lista.request.params.has('subtema1')).toBeFalse();
    expect(lista.request.params.has('anioReferencia')).toBeFalse();
    lista.flush(pagina);
  }));

  it('cambia tamaño, muestra errores y permite reintentar', fakeAsync(() => {
    iniciar();
    component.cambiarTamano('100'); tick();
    const lista = http.expectOne(r => r.url.endsWith('/visor'));
    expect(lista.request.params.get('size')).toBe('100');
    lista.flush('error', { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Reintentar');
    component.reintentar(); tick();
    http.expectOne(r => r.url.endsWith('/visor/filtros')).flush(opciones);
    http.expectOne(r => r.url.endsWith('/visor')).flush({ ...pagina, size: 100, totalPages: 1 });
    expect(component.error).toBe('');
  }));

  it('muestra clasificadores y conserva el detalle si falla una traducción', fakeAsync(() => {
    iniciar();
    component.abrirDetalle('ATUS-001-2023');
    http.expectOne(r => r.url.endsWith('/ATUS-001-2023/detalle')).flush({
      variable: { idA: 'ATUS-001-2023', variableA: 'Tipo de accidente', validada: false },
      clasificadores: [{ idUnique: 1, clasificador: 'Clasificador de prueba', version: '2023', url: '-', comentariosA: '-' }],
      clasificaciones: [], microdatos: [], datosAbiertos: [], tabulados: [],
      mdeas: [{ idUnique: 2, componente: '4' }], odsList: [], pertinencia: null,
    });
    http.expectOne(r => r.url.includes('/mdea/tabla/')).flush('error', { status: 500, statusText: 'Error' });
    http.expectOne(r => r.url.includes('/ods/tabla/')).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Clasificador de prueba');
    expect(fixture.nativeElement.textContent).toContain('Se muestran sus códigos');
    expect(fixture.nativeElement.querySelector('dialog').open).toBeTrue();
    component.cerrarDetalle();
    expect(component.pagina.totalElements).toBe(41);
    expect(component.page).toBe(0);
  }));

  it('descarta un detalle pendiente al abrir otra variable o cerrar el modal', fakeAsync(() => {
    iniciar();
    component.abrirDetalle('ATUS-001-2023');
    const primera = http.expectOne(r => r.url.endsWith('/ATUS-001-2023/detalle'));
    component.abrirDetalle('ATUS-002-2023');
    expect(primera.cancelled).toBeTrue();
    const segunda = http.expectOne(r => r.url.endsWith('/ATUS-002-2023/detalle'));
    component.cerrarDetalle();
    expect(segunda.cancelled).toBeTrue();
    expect(component.detalle).toBeNull();
  }));
});
