import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GraduationCap, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button, Modal, Card, Alert } from '../../../components/ui/index.js';
import { useAuth } from '../../auth/useAuth.js';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/client.js';

const DEPARTMENTS = [
  'Architecture', 'Building', 'Estate Management', 'Fine Arts', 'Quantity Surveying', 'Urban and Regional Planning',
  'Agricultural Economics', 'Agricultural Extension and Rural Development', 'Animal Sciences', 'Crop Production', 'Family, Nutrition and Consumer Sciences', 'Plant Science', 'Soil Science',
  'English', 'Fine and Applied Arts', 'Foreign Languages', 'History', 'Linguistics and African Languages', 'Music', 'Philosophy', 'Religious Studies', 'Dramatic Arts',
  'Adult Education and Lifelong Learning', 'Educational Foundations and Counselling', 'Educational Management', 'Kinesiology, Health Education and Recreation', 'Library and Information Science', 'Science and Technology Education', 'Special Education',
  'Chemical Engineering', 'Civil Engineering', 'Computer Science and Engineering', 'Electronic and Electrical Engineering', 'Mechanical Engineering', 'Materials Science and Engineering', 'Agricultural and Environmental Engineering',
  'Law',
  'Medicine', 'Medical Rehabilitation (Physiotherapy)', 'Nursing Science', 'Dentistry',
  'Pharmaceutics', 'Pharmacognosy', 'Pharmacology', 'Pharmaceutical Chemistry',
  'Applied Geophysics', 'Biochemistry and Molecular Biology', 'Botany', 'Chemistry', 'Geology', 'Mathematics', 'Microbiology', 'Physics', 'Statistics', 'Zoology',
  'Economics', 'Geography', 'Political Science', 'Psychology', 'Sociology and Anthropology',
];

function MigrationModal({ open, onOpenChange }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [department, setDepartment] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.patch('/api/auth/migrate', data);
      return res.data;
    },
    onSuccess: () => {
      refreshUser();
      setIsSuccess(true);
    }
  });

  const handleMigrate = () => {
    mutation.mutate({
      department,
      matricNumber,
      level: '100'
    });
  };

  if (isSuccess) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Welcome to OAU!">
         <div className="flex flex-col items-center text-center py-6 space-y-6">
            <div className="flex size-20 items-center justify-center rounded-full bg-success/10 text-success">
               <CheckCircle2 size={48} />
            </div>
            <div>
               <h3 className="text-xl font-black text-foreground-strong">Account Migrated Successfully</h3>
               <p className="text-sm text-muted mt-2">Your account has been upgraded to University Mode. You now have access to 100L courses.</p>
            </div>
            <Button fullWidth onClick={() => { onOpenChange(false); navigate('/courses'); }} className="h-12 rounded-2xl">
               Start 100L Practice
               <ChevronRight size={18} className="ml-2" />
            </Button>
         </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Migrate to University"
      description="Gained admission? Switch your account to University Mode."
      size="md"
    >
      <div className="space-y-6 pt-4">
        <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10 flex items-start gap-3">
           <Sparkles size={20} className="text-primary shrink-0 mt-0.5" />
           <p className="text-xs leading-relaxed text-foreground-strong font-medium">
             Congratulations on your admission! Migrating will hide Post-UTME features and unlock the full University course bank for your department.
           </p>
        </div>

        <div className="space-y-2">
           <label className="text-xs font-black uppercase tracking-widest text-muted">Intended Department</label>
           <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-surface-strong px-4 font-bold text-foreground-strong outline-none focus:border-primary transition-all appearance-none"
           >
              <option value="" disabled>Select Department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
           </select>
        </div>

        <div className="space-y-2">
           <label className="text-xs font-black uppercase tracking-widest text-muted">Matric Number (Optional)</label>
           <input
              type="text"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
              placeholder="e.g. CSC/2024/001"
              className="h-12 w-full rounded-2xl border border-border bg-surface-strong px-4 font-bold text-foreground-strong outline-none focus:border-primary transition-all"
           />
        </div>

        <Alert variant="warning" className="rounded-2xl">
           This action is permanent. You will not be able to return to Post-UTME mode after migrating.
        </Alert>

        <Button
          fullWidth
          onClick={handleMigrate}
          disabled={!department}
          loading={mutation.isPending}
          className="h-14 rounded-2xl shadow-xl shadow-primary/20"
          leadingIcon={<GraduationCap size={24} />}
        >
          Migrate My Account
        </Button>
      </div>
    </Modal>
  );
}

export default MigrationModal;
