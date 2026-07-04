import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import {
  Button,
  Input,
  Card,
  Spinner,
  Field,
  IconButton,
  Alert,
  Modal
} from '../../../components/ui/index.js';
import { Search, ChevronLeft, ChevronRight, User, CheckCircle2, Eye, EyeOff, Lock, ShieldAlert, ShieldCheck, Trash2, Plus } from 'lucide-react';

const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}${name[1]}***${name[name.length - 1]}@${domain}`;
};

function StudentManagementPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showSensitive, setShowSensitive] = useState(false);

  // Reset Password State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Add Student State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ fullName: '', email: '', matricNumber: '', password: '' });
  const [addError, setAddError] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminStudents', { page, search }],
    queryFn: () => adminApi.listStudents({ page, search, limit: 15 }),
    placeholderData: keepPreviousData,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }) => adminApi.resetStudentPassword(id, password),
    onSuccess: () => {
      setResetSuccess(true);
      setNewPassword('');
      setTimeout(() => {
        setResetModalOpen(false);
        setResetSuccess(false);
        setSelectedStudent(null);
      }, 2000);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: adminApi.toggleStudentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminStudents']);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminStudents']);
      alert('Student account deleted successfully.');
    }
  });

  const createStudentMutation = useMutation({
    mutationFn: adminApi.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminStudents']);
      setIsAddModalOpen(false);
      setAddForm({ fullName: '', email: '', matricNumber: '', password: '' });
      setAddError(null);
      alert('Student added successfully.');
    },
    onError: (err) => {
      setAddError(err.message || 'Failed to add student.');
    }
  });

  const students = data?.items || [];
  const totalPages = data?.pages || 1;

  const handleOpenReset = (student) => {
    setSelectedStudent(student);
    setResetModalOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground-strong tracking-tight">Student Management</h1>
          <p className="text-muted text-sm">View and manage registered students</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSensitive(!showSensitive)}
            leadingIcon={showSensitive ? <EyeOff size={14} /> : <Eye size={14} />}
          >
            {showSensitive ? 'Privacy Mode' : 'Reveal Data'}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leadingIcon={<Plus size={14} />}
          >
            Add Student
          </Button>
        </div>
      </div>

      <Card className="p-4 mb-6">
        <Field label="Search Students">
          <Input
            placeholder="Search by name, email, or matric number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leadingAdornment={<Search className="w-4 h-4 text-muted" />}
          />
        </Field>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <Card className="p-12 text-center text-danger">
          Failed to load students. Please try again.
        </Card>
      ) : students.length === 0 ? (
        <Card className="p-12 text-center text-muted">
          No students found matching your criteria.
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="hidden sm:grid grid-cols-[1.5fr_1.5fr_1fr_1fr_100px] gap-4 px-5 py-2 text-xs font-bold uppercase tracking-wider text-muted">
            <span>Name</span>
            <span>Email</span>
            <span>Matric No.</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          {students.map((student) => (
            <Card key={student.id} className="p-5">
              <div className="flex flex-col sm:grid sm:grid-cols-[1.5fr_1.5fr_1fr_1fr_100px] items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground-strong truncate">
                    {student.fullName}
                  </span>
                </div>

                <span className="text-sm text-muted truncate w-full">
                  {showSensitive ? student.email : maskEmail(student.email)}
                </span>

                <span className="text-sm font-mono text-foreground-strong">
                  {student.matricNumber ? (showSensitive ? student.matricNumber : `${student.matricNumber.slice(0, 3)}***`) : 'N/A'}
                </span>

                <div className="flex items-center gap-1.5">
                  {student.isEmailVerified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">Active</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-danger" />
                      <span className="text-xs font-medium text-danger">Suspended</span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 w-full">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenReset(student)}
                    icon={<Lock size={14} className="text-muted" />}
                    aria-label="Reset Password"
                  />
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to ${student.isEmailVerified ? 'suspend' : 'activate'} this student?`)) {
                        toggleStatusMutation.mutate(student.id);
                      }
                    }}
                    icon={student.isEmailVerified ? <ShieldAlert size={14} className="text-warning" /> : <ShieldCheck size={14} className="text-success" />}
                    aria-label={student.isEmailVerified ? 'Suspend Student' : 'Activate Student'}
                  />
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to PERMANENTLY delete ${student.fullName}? This will also delete their exam history.`)) {
                        deleteUserMutation.mutate(student.id);
                      }
                    }}
                    icon={<Trash2 size={14} className="text-danger" />}
                    aria-label="Delete Student"
                  />
                </div>
              </div>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                leadingIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                trailingIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Password Reset Modal */}
      <Modal
        open={resetModalOpen}
        onOpenChange={setResetModalOpen}
        title="Administrative Password Reset"
        description={`Set a temporary password for ${selectedStudent?.fullName}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button
              loading={resetPasswordMutation.isPending}
              onClick={() => resetPasswordMutation.mutate({ id: selectedStudent.id, password: newPassword })}
            >
              Reset Password
            </Button>
          </>
        }
      >
        <div className="space-y-4 pt-2">
          {resetSuccess && <Alert variant="success">Password updated. User has been signed out of all devices.</Alert>}
          <Field label="New Temporary Password">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              leadingAdornment={<Lock size={16} className="text-muted" />}
            />
          </Field>
          <div className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Impact</p>
            <p className="text-[11px] leading-relaxed text-muted font-medium">
              Resetting a password will immediately invalidate all active login sessions for this student.
            </p>
          </div>
        </div>
      </Modal>

      {/* Add Student Modal */}
      <Modal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Add New Student"
        description="Manually register a new student account"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button
              loading={createStudentMutation.isPending}
              onClick={() => createStudentMutation.mutate(addForm)}
            >
              Create Account
            </Button>
          </>
        }
      >
        <div className="space-y-4 pt-2">
          {addError && <Alert variant="danger">{addError}</Alert>}
          <Field label="Full Name">
            <Input
              value={addForm.fullName}
              onChange={(e) => setAddForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="e.g. Jane Doe"
            />
          </Field>
          <Field label="Email Address">
            <Input
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm(f => ({ ...f, email: e.target.value }))}
              placeholder="jane@example.com"
            />
          </Field>
          <Field label="Matric Number">
            <Input
              value={addForm.matricNumber}
              onChange={(e) => setAddForm(f => ({ ...f, matricNumber: e.target.value }))}
              placeholder="e.g. CSC/2024/001"
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

export default StudentManagementPage;
