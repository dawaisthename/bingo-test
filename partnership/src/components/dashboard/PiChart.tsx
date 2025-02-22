import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";

export const description = "A pie chart showing active and deactivated users";

interface UserChartProps {
  activeUsers: number;
  deactivatedUsers: number;
}

const chartConfig = {
  count: {
    label: "Users",
  },
  active: {
    label: "Active Users",
    color: "hsl(var(--chart-active))", 
  },
  deactivated: {
    label: "Deactivated Users",
    color: "hsl(var(--chart-deactivated))", 
  },
} satisfies ChartConfig;

export function PiChartComponent({ activeUsers, deactivatedUsers }: UserChartProps) {
  const chartData = [
    { 
      status: "Active Users", 
      count: activeUsers,
      fill: "#3b82f6",  
    },
    { 
      status: "Deactivated Users", 
      count: deactivatedUsers, 
      fill: "#ef4444" 
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" label nameKey="status" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none flex-col">
            <h1>
                Active Partners: {activeUsers}
            </h1>
            <h1>
                De-activated partners: {deactivatedUsers}
            </h1>
        </div>
      </CardFooter>
    </Card>
  );
}
