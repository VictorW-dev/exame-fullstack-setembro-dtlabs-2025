import React from 'react';

interface Props {
  data: { timestamp: string; value: number }[];
  metric: string;
}

export default function TimeSeriesChart({ data, metric }: Props) {
  return (
    <div className="chart-placeholder">
      <h3>📊 {metric} Chart</h3>
      <p>Gráfico de séries temporais será implementado aqui</p>
      <div className="chart-data">
        {data.slice(0, 5).map((item, index) => (
          <div key={index} className="data-point">
            <span>{item.timestamp}</span>: <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
