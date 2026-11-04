export const ORG_ROLES = [
  { value: 'student', label: 'Student: takes exams and sees their own results' },
  { value: 'examiner', label: 'Examiner: creates exams and sees all results' },
  { value: 'admin', label: 'Admin: manages people, site and settings' },
];

/** Who can be invited. Students are not invited: they sign in on the organisation's own site. */
export const INVITE_ROLES = ORG_ROLES.filter((r) => r.value !== 'student');
