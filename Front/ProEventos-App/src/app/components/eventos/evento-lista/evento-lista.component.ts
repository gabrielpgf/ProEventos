import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';
import { environment } from '@environments/environment';
import { PaginatedResult, Pagination } from '@app/models/Pagination';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-evento-lista',
  templateUrl: './evento-lista.component.html',
  styleUrls: ['./evento-lista.component.scss'],
})
export class EventoListaComponent implements OnInit {
  modalRef?: BsModalRef;
  public eventos: Evento[] = [];

  public eventoId: number;
  public pagination = {} as Pagination;

  public widthImg: number = 140;
  public marginImg: number = 2;
  public showImage: boolean = false;
  public showOrHide: string = 'Mostrar';

  termoBuscaChanged: Subject<string> = new Subject<string>();

  public filtrarEventos(evt: any): void {
    if (this.termoBuscaChanged.observers.length === 0) {
      this.termoBuscaChanged
        .pipe(debounceTime(1000))
        .subscribe((filtrarPor) => {
          this.spinner.show();
          this.eventoService
            .getEventos(
              this.pagination.currentPage,
              this.pagination.itemsPerPage,
              filtrarPor
            )
            .subscribe(
              (paginatedResult: PaginatedResult<Evento[]>) => {
                this.eventos = paginatedResult.result;
                this.pagination = paginatedResult.pagination;
              },
              (error: any) => {
                this.spinner.hide();
                this.toastr.error('Falha ao carregar os eventos.', 'Erro!');
              }
            )
            .add(() => this.spinner.hide());
        }
      );
    }
    this.termoBuscaChanged.next(evt.value);
  }

  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.pagination = {
      currentPage: 1,
      itemsPerPage: 2,
      totalItems: 1,
    } as Pagination;

    this.carregarEventos();
  }

  public carregarEventos(): void {
    this.spinner.show();

    this.eventoService
      .getEventos(this.pagination.currentPage, this.pagination.itemsPerPage)
      .subscribe(
        (paginatedResult: PaginatedResult<Evento[]>) => {
          this.eventos = paginatedResult.result;
          this.pagination = paginatedResult.pagination;
        },
        (error: any) => {
          this.spinner.hide();
          this.toastr.error('Falha ao carregar os eventos.', 'Erro!');
        }
      )
      .add(() => this.spinner.hide());

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

  retornaImagem(imagemURL: string): string {
    return imagemURL !== '' && imagemURL !== null
      ? `${environment.apiUrl}resources/images/${imagemURL}`
      : 'assets/img/semImagem.jpeg';
  }

  openModal(event: any, template: TemplateRef<any>, eventoId: number): void {
    event.stopPropagation();
    this.eventoId = eventoId;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  public pageChanged(event): void {
    this.pagination.currentPage = event.page;
    this.carregarEventos();
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
          this.toastr.success(
            'O Evento foi deletado com sucesso.',
            'Deletado!'
          );
          this.carregarEventos();
        },
        (error: any) => {
          console.error(error);
          this.toastr.error(
            `Erro ao tentar deletar o evento #${this.eventoId}`,
            'Erro'
          );
        }
      )
      .add(() => this.spinner.hide());
  }

  decline(): void {
    this.modalRef?.hide();
  }

  detalheEvento(id: number): void {
    this.router.navigate([`eventos/detalhe/${id}`]);
  }
}
