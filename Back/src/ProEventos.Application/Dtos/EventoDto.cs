using System.ComponentModel.DataAnnotations;

namespace ProEventos.Application.Dtos
{
    public class EventoDto
    {
        public int Id { get; set; }
        public string Local { get; set; }
        // [Display(Name = "data do evento"),
        // Required(ErrorMessage = "O campo {0} é obrigatório.")]
        // DataType(DataType.DateTime, ErrorMessage = "O campo {0} precisa estar no formato de data.")]
        public DateTime DataEvento { get; set; }
        [Required(ErrorMessage = "O campo {0} é obrigatório."),
        StringLength(50, MinimumLength = 3, ErrorMessage = "O campo {0} deve possuir no mínimo {2} e no máximo {1} caracteres.")]
        public string Tema { get; set; }
        [Display(Name = "quantidade de pessoas"),
        Required(ErrorMessage = "O campo {0} é obrigatório."),
        Range(1, 120000, ErrorMessage = "O campo {0} precisa estar num intervalo entre {1} e {2}.")]
        public int QtdPessoas { get; set; }      
        [RegularExpression(@".*\.(gif|jpe?g|bmp|png|webp)$", ErrorMessage = "Não é um arquivo de imagem válido. Arquivos de extensão válidos: (gif, jpg, jpeg, bmp, png e webp).")]  
        public string ImagemURL { get; set; }
        [Required(ErrorMessage = "O campo {0} é obrigatório."),
        Phone(ErrorMessage = "O campo {0} está com formato de número inválido.")]
        public string Telefone { get; set; }
        [Display(Name = "e-mail"),
        Required(ErrorMessage = "O campo {0} é obrigatório."),
        EmailAddress(ErrorMessage = "O campo {0} precisa conter um endereço válido.")]
        public string Email { get; set; }
        public int UserId { get; set; }
        public UserDto UserDto { get; set; }
        public IEnumerable<LoteDto> Lotes { get; set; }
        public IEnumerable<RedeSocialDto> RedesSociais { get; set; }
        public IEnumerable<PalestranteDto> Palestrantes { get; set; }
    }
}