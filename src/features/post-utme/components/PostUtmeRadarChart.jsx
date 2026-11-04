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
import { useMemo } from 'react';
import { Target, Info } from 'lucide-react';

function PostUtmeRadarChart({ stats = [] }) {
  // Aggregate dynamic data from stats
  const chartData = useMemo(() => {
    if (!stats || stats.length === 0) return [];

    // Map to store subject performance
    const subjectMap = new Map();

    stats.forEach(session => {
        // session.scores is a Map/Object from Backend { subjectId: score }
        // session.subjectCodes is an array of codes [ENG, PHY, MTH, GK]

        // We need to match codes to scores.
        // Since we don't have subjectId -> Code mapping easily here without more data,
        // we'll calculate subject performance by iterating questions or using the codes.

        // Let's use the questions if they exist to be most accurate,
        // or the scores map if available.
        if (session.scores) {
            // If scores is a plain object (due to JSON serialization)
            const scoresObj = session.scores;
            // Since we don't have the subject name for the ID here,
            // we'll fallback to a generic subject-level mapping if possible.
            // Better: Let's extract subject performance from the questions array

            const sessionSubjectScores = new Map();
            session.questions.forEach(q => {
                const subjectCode = q.subjectCode || 'GK'; // Fallback
                const isCorrect = q.selectedOption === q.correctOption;

                if (!sessionSubjectScores.has(subjectCode)) {
                    sessionSubjectScores.set(subjectCode, { correct: 0, total: 0 });
                }
                const current = sessionSubjectScores.get(subjectCode);
                sessionSubjectScores.set(subjectCode, {
                    correct: current.correct + (isCorrect ? 1 : 0),
                    total: current.total + 1
                });
            });

            sessionSubjectScores.forEach((data, code) => {
                if (!subjectMap.has(code)) {
                    subjectMap.set(code, []);
                }
                subjectMap.get(code).push((data.correct / data.total) * 40); // Scale to 40
            });
        }
    });

    // Final data for Recharts
    return Array.from(subjectMap.entries()).map(([subject, scores]) => ({
      subject,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      fullMark: 40
    })).sort((a,b) => a.subject.localeCompare(b.subject));

  }, [stats]);

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

  const hasData = chartData.length >= 3;

  return (
    <Card className="p-6 border-primary/10 overflow-hidden h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground-strong">Performance Radar</h3>
        <p className="text-[10px] font-bold text-muted mt-1 uppercase">Visualizing subject mastery</p>
      </div>

      <div className="flex-1 min-h-[300px] w-full mt-4 flex items-center justify-center relative">
        {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
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
        ) : (
            <div className="text-center p-8">
                <div className="size-16 rounded-3xl bg-surface-strong border border-border flex items-center justify-center mx-auto mb-4 text-muted/30">
                    <Target size={32} />
                </div>
                <h4 className="text-xs font-black text-foreground-strong uppercase tracking-tight">Insufficient Data</h4>
                <p className="text-[10px] text-muted mt-2 max-w-[180px] mx-auto leading-relaxed">
                    Take at least one full-length mock test to visualize your performance radar.
                </p>
            </div>
        )}
      </div>

      {hasData && (
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
            <div>
                <p className="text-[9px] font-bold text-muted uppercase mb-1">Strongest Area</p>
                <p className="text-xs font-black text-primary uppercase">
                    {chartData.sort((a,b) => b.score - a.score)[0]?.subject}
                </p>
            </div>
            <div className="text-right">
                <p className="text-[9px] font-bold text-muted uppercase mb-1">Growth Opportunity</p>
                <p className="text-xs font-black text-amber-500 uppercase">
                    {chartData.sort((a,b) => a.score - b.score)[0]?.subject}
                </p>
            </div>
        </div>
      )}

      {!hasData && stats.length > 0 && (
         <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
            <Info size={12} className="text-primary" />
            <p className="text-[9px] font-bold text-muted uppercase">Processing your first attempts...</p>
         </div>
      )}
    </Card>
  );
}

export default PostUtmeRadarChart;
