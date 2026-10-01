export interface NavItem {
  title: string;
  href: string;
  icon: string;
}
export interface NavSection {
  title?: string;
  items: NavItem[];
}
export interface PieChartData {
  status: string;
  count: number;
}
export interface BarChartData {
  month: Date | string;
  count: number;
}
export interface IAdminDashboardData {
  appointmentCount: number;
  patientCount: number;
  doctorCount: number;
  adminCount: number;
  userCount: number;
  paymentCount: number;
  totalRevenue: number;
  superAdminCount: number;
  pieChartData: PieChartData[];
  barChartData: BarChartData[];
}
export interface IStatusCount {
  status: string;
  count: number;
}
export interface IDoctorDashboardData {
  reviewCount: number;
  averageRating: number;
  isAvailable: boolean;
  patientCount: number;
  newPatientsToday: number;
  appointmentCount: number;
  todayAppointmentCount: number;
  yesterdayAppointmentCount: number;
  totalRevenue: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  appointmentStatusDistribution: IStatusCount[];
}
export interface IPatientDashboardData {
  appointmentCount: number;
  reviewCount: number;
  prescriptionCount: number;
  upcomingCount: number;
  totalPaid: number;
  appointmentStatusDistribution: IStatusCount[];
}
export interface IDashboardNotice {
  id: string;
  kind: "call" | "payment";
  title: string;
  message: string;
  at: string;
  href: string;
}
