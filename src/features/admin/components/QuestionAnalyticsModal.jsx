import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import {
  Modal,
  Spinner,
  Alert,
  Badge,
  Card
} from '../../../components/ui/index.js';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { Target, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useChartColors } from './useChartColors.js';

const letter = (index) => String.fromCharCode(65 + index);

function QuestionAnalyticsModal({ questionId, onOpenChange }) {
  const isOpen = Boolean(questionId);
  const colors = useChartColors();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['questionAnalytics', questionId],
    queryFn: () => adminApi.getQuestionAnalytics(questionId),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const total = data?.total || 0;

  // Transform data for charts
  const optionData = (data?.options || []).map(opt => ({
    name: `Option ${letter(opt._id)}`,
    value: opt.count
  })).sort((a,b) => a.name.localeCompare(b.name));

  const accuracyData = [
    { name: 'Correct', value: data?.accuracy?.find(a => a._id === true)?.count || 0 },
    { name: 'Incorrect', value: data?.accuracy?.find(a => a._id === false)?.count || 0 },
  ];

  const accuracyRate = total > 0 ? Math.round((accuracyData[0].value / total) * 100) : 0;

  return (
    <Modal
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Public Response Analytics"
      description="Engagement and accuracy data for this shareable question."
      size="lg"
    >
      <div className="space-y-6 pt-4 pb-2">
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : isError ? (
          <Alert variant="danger">Failed to load analytics data.</Alert>
        ) : total === 0 ? (
          <div className="text-center py-20 bg-surface-strong rounded-3xl border border-dashed border-border">
            <Users size={48} className="mx-auto text-muted/20 mb-4" />
            <p className="text-sm text-muted font-bold uppercase tracking-widest">No responses yet</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 flex flex-col items-center text-center border-border/50">
                    <Users size={20} className="text-primary mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Total Views</p>
                    <h4 className="text-2xl font-black text-foreground-strong">{total}</h4>
                </Card>
                <Card className="p-4 flex flex-col items-center text-center border-border/50">
                    <Target size={20} className="text-success mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Accuracy</p>
                    <h4 className="text-2xl font-black text-success">{accuracyRate}%</h4>
                </Card>
                <Card className="p-4 flex flex-col items-center text-center border-border/50">
                    <CheckCircle2 size={20} className="text-info mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Correct Ans</p>
                    <h4 className="text-2xl font-black text-foreground-strong">{accuracyData[0].value}</h4>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Accuracy Pie */}
                <Card className="p-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-6">Success Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={accuracyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#0E8C2C" />
                                    <Cell fill="#B91C1C" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Option Popularity Bar */}
                <Card className="p-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-6">Option Popularity</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={optionData}>
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#0E8C2C" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default QuestionAnalyticsModal;
