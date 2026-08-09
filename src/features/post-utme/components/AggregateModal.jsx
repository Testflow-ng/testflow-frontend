import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Calculator, Check, Save } from 'lucide-react';
import { Button, Modal, Card, Alert } from '../../../components/ui/index.js';
import { useAuth } from '../../auth/useAuth.js';

const GRADES = [
  { label: 'A1', points: 10 },
  { label: 'B2', points: 9 },
  { label: 'B3', points: 8 },
  { label: 'C4', points: 7 },
  { label: 'C5', points: 6 },
  { label: 'C6', points: 5 },
  { label: 'D7/E8/F9', points: 0 },
];

function AggregateModal({ open, onOpenChange }) {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [jambScore, setJambScore] = useState(user.utmeData?.jambScore || '');
  const [grades, setGrades] = useState(new Array(5).fill(0)); // Store indices of GRADES
  const [department, setDepartment] = useState(user.utmeData?.departmentChoice || '');

  const totalOLevelPoints = grades.reduce((acc, idx) => acc + GRADES[idx].points, 0) / 5;

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/auth/utme-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update data');
      return res.json();
    },
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries(['postUtmeStats']);
      onOpenChange(false);
    }
  });

  const handleSave = () => {
    mutation.mutate({
      jambScore: Number(jambScore),
      oLevelPoints: totalOLevelPoints,
      departmentChoice: department
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Admission Aggregate Tool"
      description="Update your scores to see your total admission aggregate."
      size="md"
    >
      <div className="space-y-6 pt-4">
        <div className="space-y-2">
           <label className="text-xs font-black uppercase tracking-widest text-muted">JAMB UTME Score (out of 400)</label>
           <input
              type="number"
              value={jambScore}
              onChange={(e) => setJambScore(e.target.value)}
              placeholder="e.g. 280"
              className="h-12 w-full rounded-2xl border border-border bg-surface-strong px-4 font-bold text-foreground-strong outline-none focus:border-primary transition-all"
           />
        </div>

        <div className="space-y-2">
           <label className="text-xs font-black uppercase tracking-widest text-muted">Intended Department</label>
           <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science"
              className="h-12 w-full rounded-2xl border border-border bg-surface-strong px-4 font-bold text-foreground-strong outline-none focus:border-primary transition-all"
           />
        </div>

        <div className="space-y-3">
           <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-muted">O-Level Grades (Top 5)</label>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{totalOLevelPoints.toFixed(2)} pts</span>
           </div>
           <div className="grid grid-cols-5 gap-2">
              {grades.map((gradeIdx, i) => (
                <select
                  key={i}
                  value={gradeIdx}
                  onChange={(e) => {
                    const next = [...grades];
                    next[i] = Number(e.target.value);
                    setGrades(next);
                  }}
                  className="h-10 rounded-xl border border-border bg-surface text-center text-xs font-bold text-foreground-strong outline-none focus:border-primary"
                >
                  {GRADES.map((g, idx) => (
                    <option key={idx} value={idx}>{g.label}</option>
                  ))}
                </select>
              ))}
           </div>
        </div>

        <div className="rounded-2xl bg-indigo-500/5 p-4 border border-indigo-500/10">
           <div className="flex items-center gap-2 mb-2 text-indigo-500">
              <Calculator size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">OAU Aggregate Calculation</span>
           </div>
           <p className="text-[11px] leading-relaxed text-indigo-700 dark:text-indigo-300">
              Your O-Level contribution is calculated by taking the points of your best 5 subjects (A1=10, B2=9...) and dividing by 5.
              JAMB is divided by 8.
           </p>
        </div>

        <Button
          fullWidth
          onClick={handleSave}
          loading={mutation.isPending}
          className="h-12 rounded-2xl shadow-xl shadow-primary/20"
          leadingIcon={<Save size={20} />}
        >
          Save & Calculate
        </Button>
      </div>
    </Modal>
  );
}

export default AggregateModal;
