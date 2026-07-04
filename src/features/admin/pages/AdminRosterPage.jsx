import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import {
  Button,
  Input,
  Card,
  Spinner,
  Field,
  Alert,
  Modal,
  Avatar
} from '../../../components/ui/index.js';
import { UserPlus, Shield, ShieldCheck, Mail, Lock, User, UserCheck } from 'lucide-react';
import { cn } from '../../../utils/cn.js';
import { useAuth } from '../../auth/useAuth.js';
import { useNavigate } from 'react-router-dom';

function AdminRosterPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Create Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });

  // Promote Modal State
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');

  const [error, setError] = useState(null);

  const { data: admins, isLoading, isError } = useQuery({
    queryKey: ['adminRoster'],
    queryFn: adminApi.listAdmins,
    enabled: currentUser?.role === 'super_admin'
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminRoster']);
      setIsAddModalOpen(false);
      setForm({ fullName: '', email: '', password: '', confirmPassword: '' });
      setError(null);
    },
    onError: (err) => {
      setError(err.message || 'Failed to create admin');
    }
  });

  const promoteMutation = useMutation({
    mutationFn: adminApi.promoteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminRoster']);
      setIsPromoteModalOpen(false);
      setPromoteEmail('');
      setError(null);
      alert('User successfully promoted to Administrator.');
    },
    onError: (err) => {
      setError(err.message || 'Promotion failed. Ensure the email is correct and user is a student.');
    }
  });

  const handleCreate = (e) => {
    e?.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      return setError('All fields are required');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    createMutation.mutate(form);
  };

  const handlePromote = (e) => {
    e?.preventDefault();
    if (!promoteEmail) return setError('Email is required');
    promoteMutation.mutate(promoteEmail);
  };

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="mx-auto max-w-xl py-20 px-5 text-center">
        <Shield size={48} className="mx-auto text-danger mb-4 opacity-20" />
        <h1 className="text-2xl font-bold text-foreground-strong font-display">Access Denied</h1>
        <p className="text-muted mt-2 font-medium">Only Super Administrators can manage the admin roster.</p>
        <Button className="mt-8 rounded-xl px-8" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-foreground-strong tracking-tight font-display">Admin Roster</h1>
          <p className="text-muted text-sm font-medium">Manage executive and technical platform administrators</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => { setError(null); setIsPromoteModalOpen(true); }}
            leadingIcon={<UserCheck size={18} />}
            className="rounded-xl px-6"
          >
            Promote User
          </Button>
          <Button
            onClick={() => { setError(null); setIsAddModalOpen(true); }}
            leadingIcon={<UserPlus size={18} />}
            className="shadow-lg shadow-primary/20 rounded-xl px-6"
          >
            Create Admin
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <Alert variant="danger" className="rounded-xl">Failed to load admin roster.</Alert>
      ) : (
        <div className="grid gap-4">
          {admins?.map((admin) => (
            <Card key={admin.id} className="p-5 flex items-center justify-between border-primary/5 hover:border-primary/10 transition-colors">
              <div className="flex items-center gap-4">
                <Avatar name={admin.fullName} size="md" className="border-2 border-primary/10" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground-strong">{admin.fullName}</p>
                    {admin.role === 'super_admin' && (
                      <span className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                        Founder
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted font-medium">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  admin.role === 'super_admin' ? "bg-primary/5 text-primary" : "bg-surface-strong text-muted"
                )}>
                  <ShieldCheck size={12} />
                  {admin.role.replace('_', ' ')}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Admin Modal */}
      <Modal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Create Administrator"
        description="Add a completely new staff member"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button
              loading={createMutation.isPending}
              onClick={handleCreate}
              className="px-8 shadow-lg shadow-primary/10"
            >
              Create Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          {error && <Alert variant="danger" className="rounded-xl">{error}</Alert>}
          <Field label="Full Name">
            <Input
              value={form.fullName}
              onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="e.g. John Doe"
              leadingAdornment={<User size={16} className="text-muted" />}
            />
          </Field>
          <Field label="Email Address">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@testflow.com"
              leadingAdornment={<Mail size={16} className="text-muted" />}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Temporary Password">
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                leadingAdornment={<Lock size={16} className="text-muted" />}
              />
            </Field>
            <Field label="Confirm Password">
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                leadingAdornment={<Lock size={16} className="text-muted" />}
              />
            </Field>
          </div>
        </form>
      </Modal>

      {/* Promote User Modal */}
      <Modal
        open={isPromoteModalOpen}
        onOpenChange={setIsPromoteModalOpen}
        title="Promote to Administrator"
        description="Grant admin privileges to an existing student by email"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsPromoteModalOpen(false)}>Cancel</Button>
            <Button
              loading={promoteMutation.isPending}
              onClick={handlePromote}
              className="px-8 shadow-lg shadow-primary/10"
            >
              Confirm Promotion
            </Button>
          </>
        }
      >
        <form onSubmit={handlePromote} className="space-y-4 pt-2">
          {error && <Alert variant="danger" className="rounded-xl">{error}</Alert>}
          <Field label="Student Email Address">
            <Input
              type="email"
              value={promoteEmail}
              onChange={(e) => setPromoteEmail(e.target.value)}
              placeholder="student@example.com"
              leadingAdornment={<Mail size={16} className="text-muted" />}
            />
          </Field>
          <div className="rounded-2xl bg-amber-500/5 p-5 border border-amber-500/10">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Administrative Warning</p>
            <p className="text-[11px] leading-relaxed text-muted font-medium">
              Promoting a user will give them full access to manage subjects and questions.
              The user will be logged out and must sign in again to see their new dashboard.
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminRosterPage;
