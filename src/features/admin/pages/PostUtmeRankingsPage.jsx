import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import {
  Spinner,
  Alert,
  Card,
  Button,
} from '../../../components/ui/index.js';
import { TrendingUp, Download, User } from 'lucide-react';

function PostUtmeRankingsPage() {
  const { data: rankings, isLoading, isError } = useQuery({
    queryKey: ['adminPostUtmeRankings'],
    queryFn: adminApi.getPostUtmeRankings,
  });

  const handleExport = async () => {
    const csv = await adminApi.exportResults();
    const url = URL.createObjectURL(csv);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'testflow-results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6">
        <Alert variant="danger">Failed to load rankings.</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong sm:text-3xl">
            Post-UTME Rankings
          </h1>
          <p className="mt-1 text-sm text-muted">
            Global leaderboards based on aggregate performance
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          leadingIcon={<Download size={16} />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      <Card className="overflow-hidden border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted">Rank</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted">Student</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted text-center">JAMB</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted text-center">O'Level</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted text-center">Mock Avg</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted text-right">Aggregate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rankings?.map((student, index) => (
                <tr key={student.id} className="group transition-colors hover:bg-muted/10">
                  <td className="px-6 py-4">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      index === 0 ? 'bg-amber-500/20 text-amber-600' :
                      index === 1 ? 'bg-slate-400/20 text-slate-500' :
                      index === 2 ? 'bg-orange-400/20 text-orange-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground-strong">
                          {student.fullName}
                        </div>
                        <div className="text-[11px] text-muted font-medium">
                          {student.username ? `@${student.username}` : student.matricNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-foreground-strong">
                      {student.jambScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-foreground-strong">
                      {student.oLevelPoints || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <TrendingUp size={14} className="text-success" />
                      <span className="text-sm font-bold text-foreground-strong">
                        {Math.round(student.avgMockScore || 0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-sm font-black text-primary">
                      {(student.aggregate || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
              {rankings?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-sm text-muted font-medium">
                    No data available in the rankings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default PostUtmeRankingsPage;
