using Microsoft.AspNetCore.Mvc;
using ProEventos.API.Data;
using ProEventos.API.Models;

namespace ProEventos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventoController : ControllerBase
{
    private readonly DataContext _options;

    public EventoController(DataContext options)
    {
        _options = options;
    }

    [HttpGet]
    public IEnumerable<Evento> Get()
    {
        return _options.Eventos;
    }

    [HttpGet("{id}")]
    public Evento GetById(int id)
    {
        return _options.Eventos.FirstOrDefault(p => p.EventoId == id);
    }

    [HttpPost]
    public string Post()
    {
        return "Exemplo de Post";
    }
}
