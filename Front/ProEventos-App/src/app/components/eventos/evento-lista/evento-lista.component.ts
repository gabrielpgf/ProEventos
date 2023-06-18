import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';

@Component({
  selector: 'app-evento-lista',
  templateUrl: './evento-lista.component.html',
  styleUrls: ['./evento-lista.component.scss'],
})
export class EventoListaComponent implements OnInit {
  modalRef?: BsModalRef;
  public eventos: Evento[] = [];
  public eventosFiltrados: Evento[] = [];
  public eventoId: number;

  public widthImg: number = 140;
  public marginImg: number = 2;
  public showImage: boolean = false;
  public showOrHide: string = 'Mostrar';
  private filtroListado: string = '';

  public get filtroLista(): string {
    return this.filtroListado;
  }

  public set filtroLista(value: string) {
    this.filtroListado = value;
    this.eventosFiltrados = this.filtroListado
      ? this.filtrarEventos(this.filtroListado)
      : this.eventos;
  }

  public filtrarEventos(filtrarPor: string): Evento[] {
    filtrarPor = filtrarPor.toLowerCase();
    return this.eventos.filter(
      (evento: any) =>
        evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1 ||
        evento.local.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }

  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    /** spinner starts on init */
    this.spinner.show();
    this.carregarEventos();
  }

  public carregarEventos(): void {
    this.eventoService.getEventos().subscribe({
      next: (eventos: Evento[]) => {
        this.eventos = eventos;
        this.eventosFiltrados = this.eventos;
      },
      error: (error: any) => {
        this.spinner.hide();
        this.toastr.error('Falha ao carregar os eventos.', 'Erro!');
      },
      complete: () => this.spinner.hide(),
    });

    //OUTRA FORMA DE FAZER
    // const observer = {
    //   next: (eventos: Evento[]) => {
    //     this.eventos = eventos;
    //     this.eventosFiltrados = this.eventos;
    //   },
    //   error: (error: any) => console.log(error),
    // }
    // this.eventoService.getEventos().subscribe(observer);
  }

  public mostrarImagem(): void {
    this.showImage = !this.showImage;
  }

  openModal(event: any, template: TemplateRef<any>, eventoId: number): void {
    event.stopPropagation();
    this.eventoId = eventoId;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirm(): void {
    this.modalRef?.hide();
    this.spinner.show();
    this.eventoService
      .deleteEvento(this.eventoId)
      .subscribe(
        //OUTRA FORMA DE FAZER É COMPARANDO O VALOR DA STRING DE RETORNO CONFIGURADA NA API
        // (result: any) => {
        //   if (result.message === 'Deletado'){
        // }
        (result: any) => {
          //console.log(result);
          this.toastr.success('O Evento foi deletado com sucesso.', 'Deletado!');
          this.carregarEventos();
        },
        (error: any) => {
          console.error(error);
          this.toastr.error(`Erro ao tentar deletar o evento #${this.eventoId}`,'Erro');
        }
      ).add(() => this.spinner.hide());
  }

  decline(): void {
    this.modalRef?.hide();
  }

  detalheEvento(id: number): void {
    this.router.navigate([`eventos/detalhe/${id}`]);
  }
}
