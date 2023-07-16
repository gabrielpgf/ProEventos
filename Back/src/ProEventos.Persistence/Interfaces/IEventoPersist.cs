using ProEventos.Domain;
using ProEventos.Persistence.Helpers;

namespace ProEventos.Persistence.Interfaces
{
    public interface IEventoPersist
    {        
        Task<PageList<Evento>> GetAllEventosAsync(int userId, PageParams pageParams, bool includePalestrantes = false);
        Task<Evento> GetEventoByIdAsync(int userId, int eventoId, bool includePalestrantes = false);
    }
}