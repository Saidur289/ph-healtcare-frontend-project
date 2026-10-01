import { PieChartData } from "@/types/dashboard.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface AppointmentPieChartProps {
  data: PieChartData[];
  title?: string;
  description?: string;
}
// design palette (primary blue, teal, amber, violet, red)
const CHART_COLORS = ["#1565D8", "#14B8A6", "#F59E0B", "#8B5CF6", "#EF4444"];

const AppointmentPieChart = ({
  data,
  title,
  description,
}: AppointmentPieChartProps) => {
  if (!data || !Array.isArray(data))
    return (
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-75">
          <p className="text-sm text-muted-foreground">
            Invalid Data provided for the chart
          </p>
        </CardContent>
      </Card>
    );
  const formattedData = data.map((item) => ({
    name: item.status
      .replace(/_/g, " ") // Replace underscores with spaces for better readability
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()), // Capitalize the first letter of each word
    value: Number(item.count),
  }));
  if (
    !formattedData.length ||
    formattedData.every((item) => item.value === 0)
  ) {
    return (
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-75">
          <p className="text-sm text-muted-foreground">
            No appointment data available to display the chart.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={formattedData}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              cx="50%"
              cy="50%"
            >
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentPieChart;
