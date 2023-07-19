using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProEventos.API.Extensions;
using ProEventos.API.Helpers;
using ProEventos.Application.Dtos;
using ProEventos.Application.Interfaces;
using ProEventos.Persistence.Helpers;
using System.IO;

namespace ProEventos.API.Controllers;
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EventosController : ControllerBase
{
    private readonly IEventoService _eventoService;
    public readonly IUtil _util;
    private readonly IAccountService _accountService;
    private readonly string _destino = "Images";

    public EventosController(IEventoService eventoService,
                            IUtil util,
                            IAccountService accountService)
    {
        _util = util;
        _accountService = accountService;
        _eventoService = eventoService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery]PageParams pageParams) //ESTUDAR SOBRE [FromQuery]


    // VIOLA O PRINCÍPIO SOLID, POIS ESTA CLASSE VEM DA CAMADA DE PERSISTÊNCIA, QUANDO ELA DEVERIA VIR DA CAMADA DE APLICAÇÃO.
    //SUGESTÃO DADA PELO PROFESSOR: CRIAR UMA DTO DE PageParamsDTO EM APP, MAPEÁ-LA COM PageParams E USÁ-LA AQUI
    {
        try
        {
            var eventos = await _eventoService.GetAllEventosAsync(User.GetUserId(), pageParams, true);
            if (eventos == null) return NoContent();

            Response.AddPagination(eventos.CurrentPage, eventos.PageSize, eventos.TotalCount, eventos.TotalPages);

            return Ok(eventos);
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar recuperar eventos. Mensagem: {e.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var eventoPorId = await _eventoService.GetEventoByIdAsync(User.GetUserId(), id, false);
            if (eventoPorId == null) return NoContent();
            return Ok(eventoPorId);
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar recuperar eventos. Mensagem: {e.Message}");
        }
    }    

    [HttpPost("upload-image/{eventoId}")]
    public async Task<IActionResult> UploadImage(int eventoId)
    {
        try
        {
            var evento = await _eventoService.GetEventoByIdAsync(User.GetUserId(), eventoId, true);
            if (evento == null) return NoContent();

            var file = Request.Form.Files[0];
            if (file.Length > 0)
            {
                _util.DeleteImage(evento.ImagemURL, _destino);

                evento.ImagemURL = await _util.SaveImage(file, _destino);
            }

            var eventoRetorno = await _eventoService.UpdateEvento(User.GetUserId(), eventoId, evento);

            return Ok(eventoRetorno);
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar adicionar foto do Evento. Mensagem: {e.Message}");
        }
    }

    [HttpPost]
    public async Task<IActionResult> Post(EventoDto model)
    {
        try
        {
            var evento = await _eventoService.AddEventos(User.GetUserId(), model);
            if (evento == null) return BadRequest("Erro ao tentar adicionar evento");

            return Ok(evento);
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar adicionar eventos. Mensagem: {e.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, EventoDto model)
    {
        try
        {
            var evento = await _eventoService.UpdateEvento(User.GetUserId(), id, model);
            if (evento == null) return BadRequest("Erro ao tentar recuperar evento por este código");

            return Ok(evento);
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar atualizar eventos. Mensagem: {e.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var eventoPorId = await _eventoService.GetEventoByIdAsync(User.GetUserId(), id, false);
            if (eventoPorId == null) return NoContent();

            if (await _eventoService.DeleteEvento(User.GetUserId(), id))
            {
                _util.DeleteImage(eventoPorId.ImagemURL, _destino);
                return Ok(new { message = "Deletado" });
            }
            else
            {
                throw new Exception("Ocorreu um erro ao deletar este evento:");
            }
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar deletar eventos. Mensagem: {e.Message}");
        }
    }   
}
