using System;
using System.ComponentModel.DataAnnotations;

namespace Sabio.Models.Requests.Appointments
{
    public class AppointmentUpdateRequest: AppointmentAddRequest, IModelIdentifier
    {
        [Required]
        [Range(1, Int32.MaxValue)]
        public int Id { get; set; }
    }
}
