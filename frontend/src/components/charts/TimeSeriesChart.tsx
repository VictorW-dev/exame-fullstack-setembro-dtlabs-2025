import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface Props {
  data: { timestamp: string; value: number }[];
  metric: string;
}

export default function TimeSeriesChart({ data, metric }: Props) {
  return (
    <LineChart width={800} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" stroke="#8884d8" name={metric} />
    </LineChart>
  );
}
