import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss'],
})
export class EventosComponent implements OnInit {
  public eventos: any = [];
  public eventosFiltrados: any = [];
  widthImg: number = 140;
  marginImg: number = 2;
  showImage: boolean = false;
  showOrHide: string = 'Mostrar';
  private _filtroLista: string = '';

  public get filtroLista(): string {
    return this._filtroLista;
  }

  public set filtroLista(value: string) {
    this._filtroLista = value;
    this.eventosFiltrados = this._filtroLista
      ? this.filtrarEventos(this._filtroLista)
      : this.eventos;
  }

  filtrarEventos(filtrarPor: string): any {
    filtrarPor = filtrarPor.toLowerCase();
    return this.eventos.filter(
      (evento: any) =>
        evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1 ||
        evento.local.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getEventos();
  }

  public getEventos(): void {
    this.http.get('https://localhost:7191/api/Eventos').subscribe(
      (response) => {
        (this.eventos = response), (this.eventosFiltrados = this.eventos);
      },
      (error) => console.log(error)
    );
  }

  mostrarImagem() {
    this.showImage = !this.showImage;
    this.showOrHide = this.showImage === true ? 'Esconder' : 'Mostrar';
  }
}
