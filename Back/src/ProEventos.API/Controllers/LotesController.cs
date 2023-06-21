using Microsoft.AspNetCore.Mvc;
using ProEventos.Application.Dtos;
using ProEventos.Application.Interfaces;

namespace ProEventos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LotesController : ControllerBase
{
    private readonly ILoteService _loteService;

    public LotesController(ILoteService loteService)
    {
        _loteService = loteService;
    }

    [HttpGet("{eventoId}")]
    public async Task<IActionResult> Get(int eventoId)
    {
        try
        {
            var lotes = await _loteService.GetLotesByEventoIdAsync(eventoId);
            if (lotes == null) return NoContent();

            return Ok(lotes);
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar recuperar eventos. Mensagem: {e.Message}");
        }
    } 
    
    [HttpPut("{eventoId}")]
    public async Task<IActionResult> Put(int eventoId, LoteDto[] models)
    {
        try
        {
            var lotes = await _loteService.SaveLotes(eventoId, models);
            if (lotes == null) return BadRequest("Erro ao tentar recuperar lote por este código");

            return Ok(lotes);
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar salvar lotes. Mensagem: {e.Message}");
        }
    }

    [HttpDelete("{eventoId}/{loteId}")]
    public async Task<IActionResult> Delete(int eventoId, int loteId)
    {
        try
        {
            var lote = await _loteService.GetLoteByIdsAsync(eventoId, loteId);
            if (lote == null) return NoContent();

            return await _loteService.Delete(lote.EventoId, lote.Id) ? Ok(new { message = "Lote Deletado" }) : throw new Exception("Ocorreu um erro ao deletar este lote.");
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar deletar lote. Mensagem: {e.Message}");
        }
    }
}
