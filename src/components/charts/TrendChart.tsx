import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface TrendChartProps {
  type: 'line' | 'area' | 'bar'
  data: object[]
  xKey: string
  yKey: string
  color?: string
  height?: number
  domain?: [number, number]
  unit?: string // e.g. '%' shown in tooltip
  compareKey?: string // optional dashed comparison series
  compareLabel?: string
}

const AXIS_STYLE = { fontSize: 11, fill: '#1C2620', opacity: 0.55 }

// Reusable Recharts wrapper for the class analytics page (Line, Area, Bar)
export function TrendChart({
  type,
  data,
  xKey,
  yKey,
  color = '#2F6B4F',
  height = 220,
  domain,
  unit = '',
  compareKey,
  compareLabel = 'Previous period',
}: TrendChartProps) {
  const tooltipFormatter = (value: number) => [`${value}${unit}`, undefined]

  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D3" vertical={false} />
  const xAxis = <XAxis dataKey={xKey} tick={AXIS_STYLE} tickLine={false} axisLine={{ stroke: '#E4E0D3' }} />
  const yAxis = (
    <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={34} domain={domain ?? ['auto', 'auto']} />
  )
  const tooltip = (
    <Tooltip
      formatter={tooltipFormatter as never}
      contentStyle={{ borderRadius: 8, border: '1px solid #E4E0D3', fontSize: 12 }}
    />
  )

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          <Area type="monotone" dataKey={yKey} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip}
        {compareKey && (
          <Line
            type="monotone"
            dataKey={compareKey}
            name={compareLabel}
            stroke="#BC8E55"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
          />
        )}
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
