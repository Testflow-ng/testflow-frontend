import { Link } from 'react-router-dom';
import Avatar from '../../../components/ui/Avatar.jsx';

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function RecentStudents({ students = [] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-foreground-strong">
          Newest students
        </h3>
        <Link to="/admin/students" className="text-xs font-semibold text-primary">
          View all
        </Link>
      </div>

      {students.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No students yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {students.map((student) => (
            <li key={student.id ?? student.email} className="flex items-center gap-3 py-3">
              <Avatar name={student.fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground-strong">
                  {student.fullName}
                </p>
                <p className="truncate text-xs text-muted">
                  {student.username ? `@${student.username}` : student.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {student.level && (
                  <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[10px] font-semibold text-muted">
                    {student.level}L
                  </span>
                )}
                <span className="text-xs text-muted">{formatDate(student.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentStudents;
