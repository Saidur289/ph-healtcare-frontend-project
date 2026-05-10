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
