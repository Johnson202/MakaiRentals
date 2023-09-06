import axios from "axios";
import debug from "sabio-debug";
import {
  API_HOST_PREFIX,
  onGlobalSuccess,
  onGlobalError,
} from "./serviceHelpers.js";

const appointmentsService = {
  endpoint: `${API_HOST_PREFIX}/api/appointments`,
  _logger: debug.extend("AppointmentsService"),
};

const getAll = () => {
  appointmentsService._logger("getAll is executing");

  const config = {
    method: "GET",
    url: appointmentsService.endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getAppointmentById = (id) => {
  appointmentsService._logger("getAppointmentById is executing");
  const config = {
    method: "GET",
    url: appointmentsService.endpoint + `/${id}`,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getAppointmentsByUserId = (pageIndex, pageSize) => {
  appointmentsService._logger("getAppointmentsByUserId is executing");

  const config = {
    method: "GET",
    url:
      appointmentsService.endpoint +
      `/current?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const addAppointment = (payload) => {
  appointmentsService._logger(
    `addAppointment is executing with payload: ${payload}`
  );

  const config = {
    method: "POST",
    url: appointmentsService.endpoint,
    data: payload,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const updateAppointment = (payload) => {
  appointmentsService._logger(
    `updateAppointment is executing on appointment with id: ${payload.id}`
  );
  const config = {
    method: "PUT",
    url: appointmentsService.endpoint + `/${payload.id}`,
    data: payload,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const cancelAppointmentById = (id) => {
  appointmentsService._logger(
    `cancelAppointmentById is executing on appointment with id: ${id}`
  );
  const config = {
    method: "PUT",
    url: appointmentsService.endpoint + `/${id}/cancel`,
    withCredentials: true,
    crossdomain: true,
    headers: { "Content-Type": "application/json" },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const updateIsConfirmedById = (payload) => {
  const id = payload.id;
  const isConfirm = payload.isConfirmed;

  appointmentsService._logger(
    `updateIsConfirmedById is executing on appointment with id: ${id} & isConfirmed: ${isConfirm}`
  );
  const config = {
    method: "PUT",
    url: appointmentsService.endpoint + `/${payload.id}/confirm`,
    data: payload,
    withCredentials: true,
    crossdomain: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then((response) => {
    return response;
  });
};

export {
  getAll,
  getAppointmentById,
  getAppointmentsByUserId,
  addAppointment,
  updateAppointment,
  cancelAppointmentById,
  updateIsConfirmedById,
};
