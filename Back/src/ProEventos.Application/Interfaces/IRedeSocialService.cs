using ProEventos.Application.Dtos;
using ProEventos.Domain;

namespace ProEventos.Application.Interfaces
{
    public interface IRedeSocialService
    {
        Task<RedeSocialDto[]>SaveByEvento(int eventoId, RedeSocialDto[] models);
        Task<bool>DeleteByEvento(int eventoId, int redeSocialId);

        Task<RedeSocialDto[]>SaveByPalestrante(int id, RedeSocialDto[] models);
        Task<bool>DeleteByPalestrante(int palestranteId, int redeSocialId);

        Task<RedeSocialDto[]>GetAllByEventoIdAsync(int eventoId);
        Task<RedeSocialDto[]>GetAllByPalestranteIdAsync(int palestranteId);

        Task<RedeSocialDto>GetRedeSocialEventoByIdsAsync(int eventoId, int redeSocialId);
        Task<RedeSocialDto>GetRedeSocialPalestranteByIdsAsync(int palestranteId, int redeSocialId);
    }
}