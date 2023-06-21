using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProEventos.Domain;

namespace ProEventos.Persistence.Interfaces
{
    public interface ILotePersist
    {
        /// <summary>
        /// Método get que retornará uma lista de lotes por eventoId.
        /// </summary>
        /// <param name="eventoId">Chave primária da tabela Evento</param>
        /// <returns>Array de Lotes</returns>
        Task<Lote[]> GetLotesByEventoIdAsync(int eventoId);
        /// <summary>
        /// Método Get que retornará apenas 1 lote por meio de 2 chaves.
        /// </summary>
        /// <param name="eventoId">Chave primária da tabela Evento</param>
        /// <param name="Id">Chave primária da tabela Lote</param>
        /// <returns>Apenas 1 lote</returns>
        Task<Lote> GetLoteByIdsAsync(int eventoId, int id);
    }
}