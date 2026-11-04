/**
 * The student tour. Every `target` is a real element carrying a `data-tour` attribute; nothing is invented.
 * A step whose target is not on screen (a phone has no sidebar, a role lacks a feature) is skipped quietly.
 *
 * target       data-tour value, or an array tried in order
 * path         route the step belongs on (the tour waits for it)
 * advanceTo    interactive step: clicking the target takes you here and moves on by itself
 * place        preferred tooltip side
 */
export const STUDENT_STEPS = [
  { id: 'nav', target: ['sidebar', 'menu'], title: 'Your home base', text: 'Everything in Testflow is one click from here.', place: 'right' },
  { id: 'courses', target: 'nav-/courses', title: 'Start with Courses', text: 'Click Courses to pick the subjects you are offering.', advanceTo: '/courses', place: 'right' },
  { id: 'manage', target: 'manage-courses', path: '/courses', title: 'Choose your courses', text: 'Tick the courses you offer. They are pinned to your sidebar.', place: 'bottom' },
  { id: 'grid', target: 'course-grid', path: '/courses', title: 'Practise any course', text: 'Click a course to set up a practice exam. Use the star to pin it.', place: 'top' },
  { id: 'progress', target: 'nav-/progress', title: 'Track your progress', text: 'Your scores, trends and every past paper live here.', place: 'right' },
  { id: 'fame', target: 'nav-/hall-of-fame', title: 'Hall of Fame', text: 'See the top scorers in each subject, and where you stand.', place: 'right' },
  { id: 'live', target: 'nav-/live', title: 'Sit exams with friends', text: 'Host or join a live exam with a code.', place: 'right' },
];
