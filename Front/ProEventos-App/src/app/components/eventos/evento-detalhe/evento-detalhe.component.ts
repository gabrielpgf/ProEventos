import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Evento } from '@app/models/Evento';
import { Lote } from '@app/models/Lote';
import { EventoService } from '@app/services/evento.service';
import { LoteService } from '@app/services/lote.service';
import { environment } from '@environments/environment';

import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss'],
})
export class EventoDetalheComponent implements OnInit {
  modalRef?: BsModalRef;
  eventoId: number;
  evento = {} as Evento;
  form!: FormGroup;
  estadoSalvar = 'post';
  mensagemToastr: string = '';
  loteAtual = { id: 0, nome: '', indice: 0 };
  imagemURL = 'assets/img/upload.png';
  file: File;

  get modoEditar(): boolean {
    return this.estadoSalvar === 'put';
  }

  get lotes(): FormArray {
    return this.form.get('lotes') as FormArray;
  }

  get f(): any {
    return this.form.controls;
  }

  get bsConfig(): any {
    return {
      dateInputFormat: 'DD/MM/YYYY hh:mm a',
      adaptivePosition: true,
      isAnimated: true,
      containerClass: 'theme-default',
      showWeekNumbers: false,
      showTodayButton: true,
      todayPosition: 'center',
    };
  }

  get bsConfigLote(): any {
    return {
      dateInputFormat: 'DD/MM/YYYY',
      adaptivePosition: true,
      isAnimated: true,
      containerClass: 'theme-default',
      showWeekNumbers: false,
      // showTodayButton: true,
      todayPosition: 'center',
    };
  }

  constructor(
    private fb: FormBuilder,
    private localService: BsLocaleService,
    private modalService: BsModalService,
    private activatedRouter: ActivatedRoute,
    private eventoService: EventoService,
    private loteService: LoteService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.localService.use('pt-br');
  }

  public carregarEvento(): void {
    //VALOR SEMPRE RETORNADO COMO STRING
    this.eventoId = +this.activatedRouter.snapshot.paramMap.get('id');

    if (this.eventoId !== null && this.eventoId !== 0) {
      //CONVERTO A CONSTANTE PARA INTEIRO COM O VALOR + DEPOIS DE TESTAR SE A CONSTANTE NÃO É NULA.
      //POR FIM, FAÇO O SUBSCRIBE
      this.spinner.show();

      this.estadoSalvar = 'put';

      this.eventoService
        .getEventoById(this.eventoId)
        .subscribe(
          (evento: Evento) => {
            this.evento = { ...evento };
            this.form.patchValue(this.evento);
            if (this.evento.imagemURL !== '' && this.evento.imagemURL !== null) {
              this.imagemURL =
                environment.apiUrl +
                'resources/images/' +
                this.evento.imagemURL;
            }

            //INSTANCIANDO A FORMA MAIS VERBOSA DE LISTAR OS LOTES
            //this.carregarLotes();

            //FORMA MAIS SIMPLES DE LISTAR OS LOTES, TENDO COMO OBJETO DE EVENTO UMA LISTA DE LOTES
            this.evento.lotes.forEach((lote) => {
              this.lotes.push(this.criarLote(lote));
            });
          },
          (error: any) => {
            this.toastr.error('Erro ao tentar carregar o evento.');
            console.error(error);
          }
        )
        .add(() => this.spinner.hide());
    }
  }

  //FORMA MAIS VERBOSA DE LISTAR OS LOTES
  // public carregarLotes(): void {
  //   this.loteService
  //     .getLotesByEventoId(this.eventoId)
  //     .subscribe(
  //       (lotesRetorno: Lote[]) => {
  //         lotesRetorno.forEach((lote) => {
  //           this.lotes.push(this.criarLote(lote));
  //         });
  //       },
  //       (error: any) => {
  //         this.toastr.error('Erro ao tentar carregar os lotes.', 'Erro.');
  //         console.error(error);
  //       }
  //     )
  //     .add(() => this.spinner.hide());
  // }

  ngOnInit(): void {
    this.carregarEvento();
    this.validation();
  }

  public validation(): void {
    this.form = this.fb.group({
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      tema: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50),
        ],
      ],
      qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
      imagemURL: [''],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      lotes: this.fb.array([]),
    });
  }

  adicionarLote(): void {
    this.lotes.push(this.criarLote({ id: 0 } as Lote));
  }

  criarLote(lote: Lote): FormGroup {
    return this.fb.group({
      id: [lote.id],
      nome: [lote.nome, Validators.required],
      preco: [lote.preco, Validators.required],
      quantidade: [lote.quantidade, Validators.required],
      dataInicio: [lote.dataInicio],
      dataFim: [lote.dataFim],
    });
  }

  public mudarFormatoData(value: Date, indice: number, campo: string): void {
    this.lotes.value[indice][`${campo}`] = value;
  }

  public retornaTituloLote(titulo: string): string {
    return titulo === null || titulo === '' ? 'Nome do Lote' : titulo;
  }

  removerLote(template: TemplateRef<any>, indice: number): void {
    this.loteAtual.id = this.lotes.get(indice + '.id').value;
    this.loteAtual.nome = this.lotes.get(indice + '.nome').value;
    this.loteAtual.indice = indice;

    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmDeleteLote(): void {
    this.modalRef?.hide();
    this.spinner.show();
    this.loteService
      .deleteLote(this.eventoId, this.loteAtual.id)
      .subscribe(
        () => {
          this.lotes.removeAt(this.loteAtual.indice);
          this.toastr.success('Lote Excluído com Sucesso!', 'Sucesso!');
        },
        (error: any) => {
          this.toastr.error('Erro ao Excluir o Lote', 'Erro!');
          console.error(error);
        }
      )
      .add(() => this.spinner.hide());
  }

  declineDeleteLote(): void {
    this.modalRef?.hide();
  }

  public resetForm(): void {
    this.form.reset();
  }

  public cssValidator(campoForm: FormControl | AbstractControl): any {
    return { 'is-invalid': campoForm.errors && campoForm.touched };
  }

  public salvarEvento(): void {
    this.spinner.show();
    if (this.form.valid) {
      if (this.estadoSalvar === 'post') {
        this.evento = { ...this.form.value };
        this.mensagemToastr = 'Evento salvo com sucesso!';
      } else {
        this.evento = { id: this.evento.id, ...this.form.value };
        this.mensagemToastr = 'Evento alterado com sucesso!';
      }

      this.eventoService[this.estadoSalvar](this.evento).subscribe(
        (eventoRetorno: Evento) => {
          this.toastr.success(this.mensagemToastr, 'Sucesso.');
          this.router.navigate([`eventos/detalhe/${eventoRetorno.id}`]);
        },
        (error: any) => {
          this.spinner.hide();
          this.toastr.error('Erro ao tentar alterar o evento.');
          console.error(error);
        },
        () => this.spinner.hide()
      );
    }
  }

  public salvarLotes(): void {
    if (this.form.controls.lotes.valid) {
      this.spinner.show();
      this.loteService
        .saveLote(this.eventoId, this.form.value.lotes)
        .subscribe(
          () => {
            this.toastr.success('Lotes salvos com Sucesso!', 'Sucesso!');
            this.lotes.reset();
          },
          (error: any) => {
            this.toastr.error('Erro ao tentar salvar lotes.', 'Erro.');
            console.error(error);
          }
        )
        .add(() => this.spinner.hide());
    }
  }

  onFileChange(ev: any): void {
    const reader = new FileReader();
    reader.onload = (event: any) => (this.imagemURL = event.target.result);

    this.file = ev.target.files;
    reader.readAsDataURL(this.file[0]);

    this.uploadImage();
  }

  uploadImage(): void {
    this.spinner.show();

    this.eventoService
      .postUpload(this.eventoId, this.file)
      .subscribe(
        () => {
          //RECARREGO O EVENTO POIS NA API A PROPRIEDADE DO EVENTO É ALTERADA.
          this.carregarEvento();
          this.toastr.success('Imagem salva com sucesso', 'Sucesso!');
        },
        (error: any) => {
          this.toastr.error('Erro ao salvar a imagem', 'Erro!');
          console.error(error);
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }
}
