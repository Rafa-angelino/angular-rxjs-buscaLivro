import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, catchError, debounceTime, distinctUntilChanged, filter, map, of, switchMap, tap, throwError } from 'rxjs';
import { Item, LivrosResultado } from 'src/app/models/interfaces';
import { LivroVolumeInfo } from 'src/app/models/livroVolumeInfo';
import { LivroService } from 'src/app/service/livro.service';

const PAUSA = 300;
@Component({
  selector: 'app-lista-livros',
  templateUrl: './lista-livros.component.html',
  styleUrls: ['./lista-livros.component.css']
})
export class ListaLivrosComponent {

  campoBusca = new FormControl();
  mensagemErro = '';
  livrosResultado : LivrosResultado;
  constructor(private service : LivroService) { }

  totalDeLivros$ = this.campoBusca.valueChanges.pipe(
     debounceTime(PAUSA),
     filter((valorDigitado) => valorDigitado.length >= 3),
     tap(() => console.log('Fluxo inicial')),
     distinctUntilChanged(),
     switchMap((valorDigitado) => this.service.buscar(valorDigitado)),
     map(resultado => this.livrosResultado = resultado),
     catchError(erro => {
       console.log(erro);
       return of();
     })
  )

  livrosEncontrados$ = this.campoBusca.valueChanges.pipe(
    debounceTime(PAUSA), //tempo de espera para realizar a requisição
    filter((valorDigitado) => valorDigitado.length >= 3), //apenas faz a requisição ao servidor se o termo digitado tiver  3 dígitos ou mais
    tap(() => console.log('Fluxo inicial')),
    distinctUntilChanged(), //compara o valor atual com o IMEDIATAMENTE anterior para assim não ter requisições imediatamente duplicadas
    switchMap((valorDigitado) => this.service.buscar(valorDigitado)), //switch cancela requisições anteriores e devolve o último valor pedido
    //map(resultado => this.livrosResultado = resultado),
    tap((retornoApi)=> console.log(retornoApi)),
    map(resultado => resultado.items ?? []),
    map(items => this.livrosResultadosParaLivros(items)),
    catchError(erro => {
      console.log(erro);
      return throwError(() => new Error(this.mensagemErro = 'Ops... ocorreu um erro na busca. Tente novamente mais tarde'));
    })
  )



  livrosResultadosParaLivros(items : Item[]) : LivroVolumeInfo[] {
    return items.map(item => {
      return new LivroVolumeInfo(item)
    })
  }




}



