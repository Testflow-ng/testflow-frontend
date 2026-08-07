import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card } from '../../../components/ui/index.js';

function PostUtmeRadarChart({ stats = [] }) {
  // Aggregate data by subject category
  // In a real app, we'd map subject codes to these categories
  const categories = [
    { subject: 'English', fullMark: 40 },
    { subject: 'General Paper', fullMark: 40 },
    { subject: 'Elective 1', fullMark: 40 },
    { subject: 'Elective 2', fullMark: 40 },
    { subject: 'Elective 3', fullMark: 40 },
  ];

  // For the radar chart, we'll take the best score in each category or average
  // Here we'll simulate processing stats for the visual
  const data = categories.map(cat => {
    // Find sessions for this category
    const relevantStats = stats.filter(s =>
        s.subjectName?.toLowerCase().includes(cat.subject.toLowerCase()) ||
        s.category?.toLowerCase() === cat.subject.toLowerCase()
    );

    const bestScore = relevantStats.length > 0
        ? Math.max(...relevantStats.map(s => s.totalScore))
        : Math.floor(Math.random() * 20) + 10; // Placeholder for demo if no stats

    return {
      subject: cat.subject,
      score: bestScore,
      fullMark: cat.fullMark
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border bg-background p-3 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">
            {payload[0].payload.subject}
          </p>
          <p className="text-sm font-black text-foreground-strong">
            {payload[0].value} <span className="text-muted text-xs">/ {payload[0].payload.fullMark}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 border-primary/10 overflow-hidden h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground-strong">Performance Radar</h3>
        <p className="text-[10px] font-bold text-muted mt-1 uppercase">Visualizing your subject strength</p>
      </div>

      <div className="flex-1 min-h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
            />
            <PolarRadiusAxis
                angle={30}
                domain={[0, 40]}
                tick={false}
                axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Student"
              dataKey="score"
              stroke="#0E8C2C"
              fill="#0E8C2C"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
         <div>
            <p className="text-[9px] font-bold text-muted uppercase mb-1">Strongest Area</p>
            <p className="text-xs font-black text-primary uppercase">
                {data.sort((a,b) => b.score - a.score)[0].subject}
            </p>
         </div>
         <div className="text-right">
            <p className="text-[9px] font-bold text-muted uppercase mb-1">Focus Required</p>
            <p className="text-xs font-black text-amber-500 uppercase">
                {data.sort((a,b) => a.score - b.score)[0].subject}
            </p>
         </div>
      </div>
    </Card>
  );
}

export default PostUtmeRadarChart;
