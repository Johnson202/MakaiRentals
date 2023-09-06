using Sabio.Data.Providers;
using Sabio.Models.Domain.Appointments;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using Sabio.Data;
using Sabio.Models;
using Sabio.Models.Requests.Appointments;
using Sabio.Services.Interfaces;

namespace Sabio.Services
{
    public class AppointmentsService: IAppointmentsService
    {
        IDataProvider _data = null;
        IBaseUserMapper _userMapper = null;

        public AppointmentsService(IDataProvider data, IBaseUserMapper userMapper)
        {
            _data = data;
            _userMapper = userMapper;
        }
        #region GET methods
        public List<Appointment> GetAll()
        {
            string procName = "[dbo].[Appointments_SelectAll]";

            List<Appointment> listOfAppointments = null;

            _data.ExecuteCmd(procName, inputParamMapper: null
            ,delegate (IDataReader reader, short set)
            {
                int startingIndex = 0;
                Appointment appointment = MapSingleAppointment(reader, ref startingIndex);
                if (listOfAppointments == null)
                {
                    listOfAppointments = new List<Appointment>();
                }
                listOfAppointments.Add(appointment);
            }
            );
            return listOfAppointments;
        }
        public Appointment GetById(int id)
        {
            string procName = "[dbo].[Appointments_Select_ById]";

            Appointment appointment = null;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramCollection)
            {
                paramCollection.AddWithValue("@Id", id);
            }, delegate (IDataReader reader, short set)
            {
                int startingIndex = 0;
                appointment = MapSingleAppointment(reader, ref startingIndex);
            }
            );
            return appointment;
        }
        public Paged<Appointment> GetByUserId(int pageIndex, int pageSize, int userId)
        {
            Paged<Appointment> pagedListOfAppointments = null;
            List<Appointment> listOfAppointments = null;
     
            string procName = "[dbo].[Appointments_Select_ByUserId]";
            int totalCount = 0;

            _data.ExecuteCmd(procName, (param) =>
            {
                param.AddWithValue("@PageIndex", pageIndex);
                param.AddWithValue("@PageSize", pageSize);
                param.AddWithValue("@UserId", userId);

            }, delegate (IDataReader reader, short set)
            {
                int startingIndex = 0;
                Appointment anAppointment = MapSingleAppointment(reader, ref startingIndex);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(startingIndex++);
                }
                if (listOfAppointments == null)
                {
                    listOfAppointments = new List<Appointment>();
                }
                listOfAppointments.Add(anAppointment);
            }
            );

            if (listOfAppointments != null)
            {
                pagedListOfAppointments = new Paged<Appointment>(listOfAppointments, pageIndex, pageSize, totalCount);
            }
            return pagedListOfAppointments;
        }
        #endregion

        #region ADD/UPDATE methods
        public int Add(AppointmentAddRequest appointmentRequestModel, int userId)
        {
            int id = 0;

            string procName = "[dbo].[Appointments_Insert]";
            _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                AddCommonParams(appointmentRequestModel, col);
                col.AddWithValue("@CreatedBy", userId);
                col.AddWithValue("@ModifiedBy", userId);


                SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                idOut.Direction = ParameterDirection.Output;

                col.Add(idOut);
            },
            returnParameters: delegate (SqlParameterCollection returnCol)
            {
                object objId = returnCol["@Id"].Value;

                Int32.TryParse(objId.ToString(), out id);

            });
            return id;
        }
        public void Update(AppointmentUpdateRequest updateAppointmentRequestModel, int userId)
        {
            string procName = "[dbo].[Appointments_Update]";
            _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                AddCommonParams(updateAppointmentRequestModel, col);
                col.AddWithValue("@ModifiedBy", userId);
                col.AddWithValue("@Id", updateAppointmentRequestModel.Id);
            },
            returnParameters: null);
        }

        public void UpdateIsConfirmed(AppointmentUpdateIsConfirmedRequest appointmentUpdateRequestModel, int userId)
        {
            string procName = "[dbo].[Appointments_Update_IsConfirmed]";
            _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@Id", appointmentUpdateRequestModel.Id);
                col.AddWithValue("@IsConfirmed", appointmentUpdateRequestModel.IsConfirmed);
                col.AddWithValue("@ModifiedBy", userId);
            },
            returnParameters: null);
        }
        
        public void UpdateIsCancelled(int id, int userId)
        {
            string procName = "[dbo].[Appointments_Update_IsCancelled]";
            _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@Id", id);
                col.AddWithValue("@ModifiedBy", userId);
            },
            returnParameters: null);
        }
        #endregion

        #region mapper/private functions
        private Appointment MapSingleAppointment(IDataReader reader, ref int startingIndex)
        {
            Appointment anAppointment = new Appointment();
            
            anAppointment.Id = reader.GetSafeInt32(startingIndex++);
            anAppointment.Phone = reader.GetSafeString(startingIndex++);
            anAppointment.StartDateTime = reader.GetSafeDateTime(startingIndex++);
            anAppointment.Time = reader.GetSafeTimeSpan(startingIndex++);
            anAppointment.IsConfirmed = reader.GetSafeBool(startingIndex++);
            anAppointment.IsCancelled = reader.GetSafeBool(startingIndex++);
            anAppointment.DateCreated = reader.GetSafeDateTime(startingIndex++);
            anAppointment.DateModified = reader.GetSafeDateTime(startingIndex++);
            anAppointment.CreatedBy = _userMapper.MapUser(reader, ref startingIndex);
            anAppointment.ModifiedBy = _userMapper.MapUser(reader, ref startingIndex);

            return anAppointment;
        }

        private static void AddCommonParams(AppointmentAddRequest model, SqlParameterCollection collectionOfParams)
        {
            collectionOfParams.AddWithValue("@Phone", model.Phone);
            collectionOfParams.AddWithValue("@StartDateTime", model.StartDateTime);
            collectionOfParams.AddWithValue("@Time", model.Time);
        }
        #endregion
    }
}
