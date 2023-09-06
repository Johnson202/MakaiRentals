import React, { useState, useEffect } from "react";
import {
  Formik,
  Field,
  Form,
  ErrorMessage,
  useField,
  useFormikContext,
} from "formik";
import debug from "sabio-debug";
import {
  addAppointment,
  updateAppointment,
} from "../../services/appointmentsService.js";
import appointmentsFormSchema from "../../schemas/appointmentsFormSchema.js";
import swal from "sweetalert";
import { useLocation, useNavigate } from "react-router-dom";
import toastr from "toastr";
import "toastr/build/toastr.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";
import parseISO from "date-fns/parseISO";

const _logger = debug.extend("AppointmentForm");

function AppointmentForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState({
    id: location.state.payload.isEditing
      ? location.state.payload.formState.id
      : null,
    formState: {
      phone: location.state.payload.isEditing
        ? location.state.payload.formState.phone
        : "",
      startDateTime: location.state.payload.isEditing
        ? moment
            .utc(
              location.state.payload.formState.startDateTime,
              moment.ISO_8601
            )
            .tz(location.state.payload.timeZone)
        : "",
      time: location.state.payload.isEditing
        ? location.state.payload.formState.time
        : "",
    },
    dateTimeState: {
      timeZone: location.state.payload.timeZone,
      isUpdated: false,
      currentDate: "",
    },
    appts: location.state.payload.appts,
    invalidArray: [],
    invalidArrayIsAdded: false,
    show: false,
    isEditing: location.state.payload.isEditing,
  });

  useEffect(() => {
    if (state.dateTimeState.isUpdated === false) {
      getCurrentDateAndTime();
      computeEndDateTimes();
    } else if (
      state.dateTimeState.isUpdated === true &&
      state.invalidArrayIsAdded === false
    ) {
      compileInvalidArray();
    } else {
      renderForm();
    }
  }, [state.dateTimeState.isUpdated, state.invalidArrayIsAdded]);

  const renderForm = () => {
    setState((prevState) => {
      const newState = { ...prevState };
      newState.show = true;
      return newState;
    });
  };

  const restrictTimes = (date) => {
    let result = true;
    const currentUnixTime = state.dateTimeState.currentDate.getTime();
    const dateUnixTime = date.getTime();
    if (currentUnixTime > dateUnixTime) {
      // restrict ALL past times
      result = false;
    } else {
      //restrict appointment times already reserved
      for (let i = 0; i < state.invalidArray.length; i++) {
        const invalidStartTime = state.invalidArray[i].start;
        const invalidEndTime = state.invalidArray[i].end;
        if (dateUnixTime >= invalidStartTime && dateUnixTime < invalidEndTime) {
          result = false;
          break;
        }
      }
    }
    return result;
  };

  const handleCalendarInput = (e) => {
    // disable manual (typed) date and time user input
    e.preventDefault();
  };

  const DatePickerField = ({ ...props }) => {
    const { setFieldValue } = useFormikContext();
    const [field] = useField(props);
    return (
      <DatePicker
        {...field}
        {...props}
        selected={(field.value && new Date(field.value)) || null}
        onChange={(val) => {
          setFieldValue(field.name, val);
        }}
      />
    );
  };

  const submitAddForm = (values) => {
    if (!values.phone) {
      values.phone = null;
    }
    swal({
      title: "Confirm these appointment details?",
      icon: "warning",
      buttons: {
        confirm: {
          text: "Confirm",
          value: true,
          visible: true,
          className: "btn-success btn",
          closeModal: true,
        },
        cancel: {
          text: "Cancel",
          value: false,
          visible: true,
          className: "btn-danger btn",
          closeModal: true,
        },
      },
    }).then((doAdd) => {
      if (doAdd) {
        let payload = { ...values };
        _logger("payload", payload);
        if (payload.phone === "") {
          payload.phone = null;
        }
        if (values.phone === null) {
          values.phone = "";
        }
        addAppointment(payload)
          .then(onSubmitAddFormSuccess)
          .catch(onSubmitAddFormError);
      } else {
        swal("Appointment not scheduled...");
      }
    });
  };

  const submitEditForm = (values) => {
    if (!values.phone) {
      values.phone = null;
    }
    swal({
      title: "Confirm edit of appointment details?",
      icon: "warning",
      buttons: {
        confirm: {
          text: "Confirm",
          value: true,
          visible: true,
          className: "btn-success btn",
          closeModal: true,
        },
        cancel: {
          text: "Cancel Edit",
          value: false,
          visible: true,
          className: "btn-danger btn",
          closeModal: true,
        },
      },
    }).then((doEdit) => {
      if (doEdit) {
        const payload = { ...values, id: state.id };
        if (values.phone === null) {
          values.phone = "";
        }
        updateAppointment(payload)
          .then(onSubmitEditFormSuccess)
          .catch(onSubmitEditFormError);
      } else {
        swal("Appointment not updated...");
      }
    });
  };

  const onSubmitAddFormSuccess = (data) => {
    _logger(data);
    toastr.success("Appointment scheduled!", "Appointment added successfully");
    navigate("/appointments");
  };

  const onSubmitAddFormError = (err) => {
    toastr.error("Could not schedule appointment...", `${err}`);
    _logger(err);
  };

  const onSubmitEditFormSuccess = (data) => {
    _logger(data);
    toastr.success("Edit successful!", "Appointment updated successfully");
    navigate("/appointments");
  };

  const onSubmitEditFormError = (err) => {
    toastr.error("Edit unsuccessful", `${err}`);
    _logger(err);
  };

  const getCurrentDateAndTime = () => {
    const date = new Date();
    let dateNow = parseISO(
      moment.tz(date, state.dateTimeState.timeZone).format()
    );

    setState((prevState) => {
      const newState = { ...prevState };
      newState.dateTimeState.currentDate = dateNow;
      newState.dateTimeState.isUpdated = true;
      return newState;
    });
  };

  const computeEndDateTimes = () => {
    let addEndDateTimeToAppts = state.appts.map(addEndDateTime);
    setState((prevState) => {
      const newState = { ...prevState };
      newState.appts = [...prevState.appts];
      newState.appts = addEndDateTimeToAppts;
      return newState;
    });
  };

  const addEndDateTime = (appt) => {
    let startDateTimeOfAppt = appt.startDateTime;
    const lengthOfAppt = appt.time;
    const hours = Number(lengthOfAppt.slice(0, 2));
    const minutes = Number(lengthOfAppt.slice(3, 5)) - 1;
    let endDateTimeOfAppt = moment(startDateTimeOfAppt).add(hours, "hours");
    endDateTimeOfAppt = moment(endDateTimeOfAppt).add(minutes, "minutes");
    appt.endDateTime = endDateTimeOfAppt;
    return appt;
  };

  const compileInvalidArray = () => {
    let invalidDateTimeArray = [];
    let currentTime = state.dateTimeState.currentDate.getTime();
    for (let i = 0; i < state.appts.length; i++) {
      const apptStartTime = new Date(state.appts[i].startDateTime).getTime();
      if (state.appts[i].isCancelled !== true && currentTime <= apptStartTime) {
        const start = moment(state.appts[i].startDateTime).toDate().getTime();
        const end = state.appts[i].endDateTime.toDate().getTime();
        invalidDateTimeArray.push({
          start: start,
          end: end,
          title: "appointment time taken",
        });
      }
    }
    setState((prevState) => {
      const newState = { ...prevState };
      newState.invalidArray = [...prevState.invalidArray];
      newState.invalidArray = invalidDateTimeArray;
      newState.invalidArrayIsAdded = true;
      return newState;
    });
  };

  const onGoBackToAppointmentsClicked = (evt) => {
    _logger(evt);
    navigate("/appointments");
  };

  return (
    <React.Fragment>
      {state.show && (
        <React.Fragment>
          {" "}
          {state.isEditing && (
            <div className="row">
              <h1>Edit Appointment Details</h1>
            </div>
          )}
          {!state.isEditing && (
            <div className="row">
              <h1>Schedule Appointment</h1>
            </div>
          )}
          <div className="container">
            <div className="row">
              <div className="col-4">
                <Formik
                  enableReintialize={true}
                  initialValues={state.formState}
                  onSubmit={state.isEditing ? submitEditForm : submitAddForm}
                  validationSchema={appointmentsFormSchema}
                >
                  <Form>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <Field
                        type="text"
                        name="phone"
                        className="form-control"
                        placeholder="Ex. 1234567890"
                      />
                    </div>
                    <div className="form-group mt-1">
                      <label className="form-label" htmlFor="startDateTime">
                        Date & Time (of appointment)
                      </label>
                      <DatePickerField
                        className="form-control"
                        name="startDateTime"
                        selected={state.formState.startDateTime}
                        showTimeSelect
                        dataTimeZone={state.dateTimeState.timeZone}
                        hourFormat={"HH:mm"}
                        timeIntervals={30}
                        filterTime={restrictTimes}
                        minDate={state.dateTimeState.currentDate}
                        onKeyDown={handleCalendarInput}
                        dateFormat="yyyy-MM-dd hh:mm:ss"
                        displayTimeZone={state.dateTimeState.timeZone}
                      />
                      <ErrorMessage
                        name="startDateTime"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <div className="form-group mt-1">
                      <label htmlFor="time">Appointment Length (Time)</label>
                      <Field
                        as="select"
                        type="text"
                        name="time"
                        className="form-control"
                      >
                        <option>Select Time</option>
                        <option value="00:30:00">30 minutes</option>
                        <option value="01:00:00">60 minutes</option>
                        <option value="01:30:00">90 minutes</option>
                        <option value="02:00:00">120 minutes</option>
                      </Field>
                      <ErrorMessage
                        name="time"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary mt-3">
                      Submit
                    </button>
                    {!state.isEditing && (
                      <button
                        className="btn btn-danger ms-2 mt-3"
                        type="button"
                        id="goBackToAppointments"
                        onClick={onGoBackToAppointmentsClicked}
                      >
                        Cancel
                      </button>
                    )}
                  </Form>
                </Formik>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}{" "}
    </React.Fragment>
  );
}

export default AppointmentForm;
