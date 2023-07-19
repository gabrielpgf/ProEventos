using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProEventos.API.Extensions;
using ProEventos.Application.Dtos;
using ProEventos.Application.Interfaces;
using ProEventos.Persistence.Helpers;
using System.IO;

namespace ProEventos.API.Controllers;
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PalestrantesController : ControllerBase
{
    private readonly IPalestranteService _palestranteService;
    public readonly IWebHostEnvironment _hostEnvironment;
    private readonly IAccountService _accountService;

    public PalestrantesController(IPalestranteService palestranteService,
                            IWebHostEnvironment hostEnvironment,
                            IAccountService accountService)
    {
        _hostEnvironment = hostEnvironment;
        _accountService = accountService;
        _palestranteService = palestranteService;
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll([FromQuery]PageParams pageParams) //ESTUDAR SOBRE [FromQuery]


    // VIOLA O PRINCÍPIO SOLID, POIS ESTA CLASSE VEM DA CAMADA DE PERSISTÊNCIA, QUANDO ELA DEVERIA VIR DA CAMADA DE APLICAÇÃO.
    //SUGESTÃO DADA PELO PROFESSOR: CRIAR UMA DTO DE PageParamsDTO EM APP, MAPEÁ-LA COM PageParams E USÁ-LA AQUI
    {
        try
        {
            var palestrantes = await _palestranteService.GetAllPalestrantesAsync(pageParams, true);
            if (palestrantes == null) return NoContent();

            Response.AddPagination(palestrantes.CurrentPage, palestrantes.PageSize, palestrantes.TotalCount, palestrantes.TotalPages);

            return Ok(palestrantes);
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar recuperar palestrantes. Mensagem: {e.Message}");
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetPalestrantes()
    {
        try
        {
            var palestrante = await _palestranteService.GetPalestranteByUserIdAsync(User.GetUserId(), false);
            if (palestrante == null) return NoContent();
            return Ok(palestrante);
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar recuperar o palestrantes. Mensagem: {e.Message}");
        }
    }    

    [HttpPost]
    public async Task<IActionResult> Post(PalestranteAddDto model)
    {
        try
        {
            var palestrante = await _palestranteService.GetPalestranteByUserIdAsync(User.GetUserId(), false);
            if (palestrante == null)
                palestrante = await _palestranteService.AddPalestrantes(User.GetUserId(), model);
            
            return Ok(palestrante);
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar adicionar eventos. Mensagem: {e.Message}");
        }
    }

    [HttpPut]
    public async Task<IActionResult> Put(PalestranteUpdateDto model)
    {
        try
        {
            var palestrante = await _palestranteService.UpdatePalestrante(User.GetUserId(), model);
            if (palestrante == null) return BadRequest("Erro ao tentar recuperar evento por este código");

            return Ok(palestrante);
        }
        catch (Exception e)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao tentar atualizar eventos. Mensagem: {e.Message}");
        }
    }
}
