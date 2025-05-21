// src/components/dashboard/LineChart.jsx
import React, { useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import './LineChart.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-campaign">{label}</p>
        <div className="tooltip-content">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="tooltip-item">
              <div className="tooltip-item-header">
                <span className="tooltip-bullet" style={{ backgroundColor: entry.color }}></span>
                <span className="tooltip-label">{entry.name}:</span>
              </div>
              <span className="tooltip-value">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const truncateText = (text, maxLength = 15) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const LineChart = ({ data }) => {
  const [activeLines, setActiveLines] = useState({
    sent: true,
    opened: true,
    clicked: true,
    replied: true
  });

  const handleLegendClick = (dataKey) => {
    setActiveLines({
      ...activeLines,
      [dataKey]: !activeLines[dataKey]
    });
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="custom-legend">
        {payload.map((entry, index) => (
          <div 
            key={`legend-${index}`} 
            className={`legend-item ${!activeLines[entry.dataKey] ? 'inactive' : ''}`}
            onClick={() => handleLegendClick(entry.dataKey)}
          >
            <span className="legend-icon" style={{ backgroundColor: entry.color }}></span>
            <span className="legend-text">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="line-chart">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fontFamily: 'var(--font-family-primary)' }}
            tickFormatter={(value) => truncateText(value)}
            axisLine={{ stroke: '#E0E4E8' }}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fontSize: 12, fontFamily: 'var(--font-family-primary)' }}
            axisLine={false}
            tickLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            content={<CustomLegend />}
            verticalAlign="top" 
            align="right"
          />
          <ReferenceLine y={0} stroke="#E0E4E8" />
          
          {activeLines.sent && (
            <Line
              type="monotone"
              dataKey="sent"
              stroke="#0066cc"
              strokeWidth={2}
              activeDot={{ r: 8, fill: '#0066cc', stroke: 'white', strokeWidth: 2 }}
              dot={{ r: 3, fill: '#0066cc', stroke: 'white', strokeWidth: 2 }}
              name="Sent"
              animationDuration={1000}
            />
          )}
          
          {activeLines.opened && (
            <Line
              type="monotone"
              dataKey="opened"
              stroke="#27AE60"
              strokeWidth={2}
              activeDot={{ r: 8, fill: '#27AE60', stroke: 'white', strokeWidth: 2 }}
              dot={{ r: 3, fill: '#27AE60', stroke: 'white', strokeWidth: 2 }}
              name="Opened"
              animationDuration={1500}
            />
          )}
          
          {activeLines.clicked && (
            <Line
              type="monotone"
              dataKey="clicked"
              stroke="#F39C12"
              strokeWidth={2}
              activeDot={{ r: 8, fill: '#F39C12', stroke: 'white', strokeWidth: 2 }}
              dot={{ r: 3, fill: '#F39C12', stroke: 'white', strokeWidth: 2 }}
              name="Clicked"
              animationDuration={2000}
            />
          )}
          
          {activeLines.replied && (
            <Line
              type="monotone"
              dataKey="replied"
              stroke="#9B59B6"
              strokeWidth={2}
              activeDot={{ r: 8, fill: '#9B59B6', stroke: 'white', strokeWidth: 2 }}
              dot={{ r: 3, fill: '#9B59B6', stroke: 'white', strokeWidth: 2 }}
              name="Replied"
              animationDuration={2500}
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;