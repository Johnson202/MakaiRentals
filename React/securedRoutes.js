import { lazy } from "react";

const AppointmentForm = lazy(() =>
  import("../components/appointments/AppointmentForm")
);
const Appointment = lazy(() =>
  import("../components/appointments/Appointment")
);

const EmergencyContactSysAdminViewUsers = lazy(() =>
  import("../components/emergencycontacts/EmergencyContactSysAdminViewUsers")
);

const EmergencyContactSysAdminViewEmergencyContacts = lazy(() =>
  import(
    "../components/emergencycontacts/EmergencyContactSysAdminViewEmergencyContacts"
  )
);


const appointmentRoutes = [
  {
    path: "/appointments",
    name: "Appointments",
    header: "Navigation",
    exact: true,
    element: Appointment,
    roles: ["User", "Admin", "Partner"],
    isAnonymous: false,
  },
  {
    path: "/appointments/form",
    name: "AppointmentForm",
    header: "Navigation",
    exact: true,
    element: AppointmentForm,
    roles: ["User", "Admin", "Partner"],
    isAnonymous: false,
  },
];

const emergencyContactRoutes = [
  {
    path: "/emergency/contact/new",
    name: "EmergencyContacts",
    exact: true,
    element: EmergencyContactsForm,
    roles: ["Admin", "User"],
    isAnonymous: false,
  },
  {
    path: "/emergency/contact/:id/edit",
    name: "EmergencyContacts",
    exact: true,
    element: EmergencyContactsForm,
    roles: ["Admin", "User"],
    isAnonymous: false,
  },
  {
    path: "/emergency/contacts/:id",
    name: "EmergencyContactsList",
    exact: true,
    element: EmergencyContactsList,
    roles: ["Admin", "User"],
    isAnonymous: false,
  },
  {
    path: "/emergency/contact/admin/users/view",
    name: "EmergencyContactSysAdminViewUsers",
    exact: true,
    element: EmergencyContactSysAdminViewUsers,
    roles: ["Admin"],
    isAnonymous: false,
  },
  {
    path: "/emergency/contact/admin/users/view/user/emergencycontacts",
    name: "EmergencyContactSysAdminViewEmergencyContacts",
    exact: true,
    element: EmergencyContactSysAdminViewEmergencyContacts,
    roles: ["Admin"],
    isAnonymous: false,
  },
];

const errorRoutes = [
  {
    path: "/error-404",
    name: "Error - 404",
    element: PageNotFound,
    roles: [],
    exact: true,
    isAnonymous: false,
  },
];


const allRoutes = [
  ...surveyanalytics,
  ...sitereference,
  ...appointmentRoutes,
  ...dashboardRoutes,
  ...errorRoutes,
  ...emergencyContactRoutes,
  ...externalLinkRoutes,
  ...orders,
  ...blogAdminRoute,
  ...products,
  ...podcasts,
  ...messages,
  ...userList,
  ...standsForm,
  ...faqs,
  ...videoChat,
  ...userListTableView,
  ...userSetting,
  ...SurveyBuilderRoutes,
  ...stripeRoutes,
  ...fileManager,
];

export default allRoutes;
