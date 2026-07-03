import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import {
  Button,
  Input,
  Card,
  Spinner,
  Field
} from '../../../components/ui/index.js';
import { Search, ChevronLeft, ChevronRight, User, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../../utils/cn.js';

function StudentManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminStudents', { page, search }],
    queryFn: () => adminApi.listStudents({ page, search, limit: 15 }),
    placeholderData: keepPreviousData,
  });

  const students = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground-strong">Student Management</h1>
        <p className="text-muted text-sm">View and manage registered students</p>
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
          <div className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr_1fr] gap-4 px-5 py-2 text-xs font-bold uppercase tracking-wider text-muted">
            <span>Name</span>
            <span>Email</span>
            <span>Matric No.</span>
            <span>Status</span>
          </div>
          {students.map((student) => (
            <Card key={student.id} className="p-5">
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_1.5fr_1fr_1fr] items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground-strong truncate">
                    {student.fullName}
                  </span>
                </div>

                <span className="text-sm text-muted truncate">
                  {student.email}
                </span>

                <span className="text-sm font-mono text-foreground-strong">
                  {student.matricNumber || 'N/A'}
                </span>

                <div className="flex items-center gap-1.5">
                  {student.isEmailVerified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-muted" />
                      <span className="text-xs font-medium text-muted">Unverified</span>
                    </>
                  )}
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
    </div>
  );
}

export default StudentManagementPage;
