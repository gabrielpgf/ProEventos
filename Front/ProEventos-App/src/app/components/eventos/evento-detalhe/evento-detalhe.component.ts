import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';

import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss'],
})
export class EventoDetalheComponent implements OnInit {
  evento = {} as Evento;
  form!: FormGroup;
  estadoSalvar = 'post';
  mensagemToastr: string = '';

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

  constructor(
    private fb: FormBuilder,
    private localService: BsLocaleService,
    private router: ActivatedRoute,
    private eventoService: EventoService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {
    this.localService.use('pt-br');
  }

  public carregarEvento(): void {
    //VALOR SEMPRE RETORNADO COMO STRING
    const eventoIdParam = this.router.snapshot.paramMap.get('id');

    if (eventoIdParam !== null) {
      //CONVERTO A CONSTANTE PARA INTEIRO COM O VALOR + DEPOIS DE TESTAR SE A CONSTANTE NÃO É NULA.
      //POR FIM, FAÇO O SUBSCRIBE
      this.spinner.show();

      this.estadoSalvar = 'put';

      this.eventoService.getEventoById(+eventoIdParam).subscribe(
        (evento: Evento) => {
          this.evento = { ...evento };
          this.form.patchValue(this.evento);
        },
        (error: any) => {
          this.spinner.hide();
          this.toastr.error('Erro ao tentar carregar o evento.');
          console.error(error);
        },
        () => this.spinner.hide()
      );
    }
  }

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
      imagemURL: ['', Validators.required],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  public resetForm(): void {
    this.form.reset();
  }

  public cssValidator(campoForm: FormControl): any {
    return { 'is-invalid': campoForm.errors && campoForm.touched };
  }

  public salvarAlteracao(): void {
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
        () => {
          this.toastr.success(this.mensagemToastr, 'Sucesso.');
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
}
