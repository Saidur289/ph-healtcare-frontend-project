import { NavSection } from "@/types/dashboard.types";
import { getDefaultDashboardRoute, UserRole } from "./authUtils";

export const getCommonNavItems = (role: UserRole): NavSection[] => {
  const defaultDashboard = getDefaultDashboardRoute(role);
  return [
    {
      items: [
        {
          title: "Home",
          href: "/",
          icon: "home",
        },
        {
          title: "Dashboard",
          href: defaultDashboard,
          icon: "LayoutDashboard",
        },
        {
          title: "My Profile",
          href: "/my-profile",
          icon: "User",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Change Password",
          href: "/change-password",
          icon: "Settings",
        },
      ],
    },
  ];
};
export const doctorNavItems: NavSection[] = [
  {
    title: "Patient Management",
    items: [
      {
        title: "Appointments",
        href: "/doctor/dashboard/appointments",
        icon: "Calendar",
      },
      {
        title: "My Reviews",
        href: "/doctor/dashboard/my-reviews",
        icon: "Star",
      },
      {
        title: "My Schedules",
        href: "/doctor/dashboard/my-schedules",
        icon: "Clock",
      },
      {
        title: "Prescriptions",
        href: "/doctor/dashboard/prescriptions",
        icon: "FileText",
      },
    ],
  },
];
export const adminNavItems: NavSection[] = [
  {
    title: "User Management",
    items: [
      {
        title: "Doctors",
        href: "/admin/dashboard/doctors-management",
        icon: "Stethoscope",
      },
      {
        title: "Patients",
        href: "/admin/dashboard/patients-management",
        icon: "Users",
      },
      {
        title: "Admins",
        href: "/admin/dashboard/admins-management",
        icon: "Shield",
      },
    ],
  },
  {
    title: "Hospital Management",
    items: [
      {
        title: "Specialties",
        href: "/admin/dashboard/specialties-management",
        icon: "Hospital",
      },
      {
        title: "Schedules",
        href: "/admin/dashboard/schedules-management",
        icon: "Clock",
      },
      {
        title: "Reviews",
        href: "/admin/dashboard/reviews-management",
        icon: "Star",
      },
      {
        title: "Payments",
        href: "/admin/dashboard/payments-management",
        icon: "CreditCard",
      },
      {
        title: "Prescriptions",
        href: "/admin/dashboard/prescriptions-management",
        icon: "FileText",
      },
      {
        title: "Appointments",
        href: "/admin/dashboard/appointments-management",
        icon: "Calendar",
      },
      {
        title: "Doctors Schedules",
        href: "/admin/dashboard/doctor-schedules-management",
        icon: "CalenderClock",
      },
      {
        title: "Doctors Specialties",
        href: "/admin/dashboard/doctor-specialties-management",
        icon: "Stethoscope",
      },
      {
        title: "Prescriptions",
        href: "/admin/dashboard/prescriptions-management",
        icon: "FileText",
      },
      {
        title: "Payments",
        href: "/admin/dashboard/payments-management",
        icon: "CreditCard",
      },
    ],
  },
];
export const patientNavItems: NavSection[] = [
  {
    title: "Appointments",
    items: [
      {
        title: "My Appointments",
        href: "/dashboard/my-appointments",
        icon: "Calendar",
      },
      {
        title: "Book Appointment",
        href: "/dashboard/book-appointment",
        icon: "Calendar",
      },
    ],
  },
  {
    title: "Medical Records",
    items: [
      {
        title: "Health Records",
        href: "/dashboard/health-records",
        icon: "FileText",
      },
      {
        title: "My Prescriptions",
        href: "/dashboard/my-prescriptions",
        icon: "Activity",
      },
    ],
  },
];
export const commonNavItems = (role: UserRole): NavSection[] => {
  const commonNavItems = getCommonNavItems(role);
  switch (role) {
    case "DOCTOR":
      return [...commonNavItems, ...doctorNavItems];
    case "ADMIN":
    case "SUPER_ADMIN":
      return [...commonNavItems, ...adminNavItems];
    case "PATIENT":
      return [...commonNavItems, ...patientNavItems];
    default:
      return commonNavItems;
  }
};
