import { useState } from 'react';
import { Button } from '../../../components/ui/index.js';
import QuestionCard from '../../../components/exam/QuestionCard.jsx';
import OptionRow from '../../../components/exam/OptionRow.jsx';
import QuestionNavigator from '../../../components/exam/QuestionNavigator.jsx';
import ExamTimer from '../../../components/exam/ExamTimer.jsx';
import ResultSummary from '../../../components/exam/ResultSummary.jsx';
import Calculator from '../../post-utme/components/Calculator.jsx';

export default [
  {
    id: 'question', name: 'Question card and options', category: 'Exam', source: ['exam/QuestionCard.jsx', 'exam/OptionRow.jsx'],
    description: 'A question with LaTeX support and answer rows. Presentational: the runtime owns answers and scoring.',
    keywords: ['exam', 'question', 'option', 'answer', 'latex', 'math', 'flag', 'mcq'],
    Preview: function Demo() {
      const [ans, setAns] = useState('B');
      const [flag, setFlag] = useState(false);
      return (
        <div className="space-y-6">
          <QuestionCard number={4} total={20} topic="Algebra" flagged={flag} onFlag={() => setFlag((f) => !f)} stem={'If $x^2 - 5x + 6 = 0$, what are the values of $x$?'}>
            {['2 and 3', '1 and 6', '-2 and -3', '0 and 5'].map((t, i) => {
              const k = 'ABCD'[i];
              return <OptionRow key={k} label={k} state={ans === k ? 'selected' : 'idle'} onSelect={() => setAns(k)}>{t}</OptionRow>;
            })}
          </QuestionCard>
          <div className="grid max-w-lg gap-2">
            <OptionRow label="A" state="correct">2 and 3</OptionRow>
            <OptionRow label="B" state="wrong">1 and 6</OptionRow>
            <OptionRow label="C" state="missed">-2 and -3 (the right answer you missed)</OptionRow>
            <OptionRow label="D" state="idle">0 and 5</OptionRow>
          </div>
        </div>
      );
    },
    usage: `import QuestionCard from '../components/exam/QuestionCard.jsx';
import OptionRow from '../components/exam/OptionRow.jsx';

// OptionRow state: idle | selected (during the paper) | correct | wrong | missed (review)
<QuestionCard number={4} total={20} stem={'If $x^2 - 5x + 6 = 0$, find $x$.'} flagged={flag} onFlag={toggleFlag}>
  {options.map((text, i) => (
    <OptionRow key={i} label={'ABCD'[i]} state={answer === i ? 'selected' : 'idle'} onSelect={() => choose(i)}>
      {text}
    </OptionRow>
  ))}
</QuestionCard>`,
  },
  {
    id: 'navigator', name: 'Question navigator and timer', category: 'Exam', source: ['exam/QuestionNavigator.jsx', 'exam/ExamTimer.jsx'],
    description: 'Jump between questions, and a countdown that turns amber then red.',
    keywords: ['timer', 'countdown', 'clock', 'jump', 'navigator', 'grid', 'flagged', 'answered'],
    Preview: function Demo() {
      const [cur, setCur] = useState(4);
      return (
        <div className="flex flex-wrap items-start gap-8">
          <div className="w-72"><QuestionNavigator total={20} current={cur} answered={new Set([1, 2, 3, 5, 8, 9])} flagged={new Set([5, 12])} onJump={setCur} /></div>
          <div className="grid gap-4"><ExamTimer secondsLeft={1500} totalSeconds={1800} /><ExamTimer secondsLeft={240} totalSeconds={1800} /><ExamTimer secondsLeft={42} totalSeconds={1800} /></div>
        </div>
      );
    },
    usage: `import QuestionNavigator from '../components/exam/QuestionNavigator.jsx';
import ExamTimer from '../components/exam/ExamTimer.jsx';

// answered and flagged are Sets of 1-based question numbers
<QuestionNavigator total={20} current={4} answered={new Set([1, 2, 3])} flagged={new Set([5])} onJump={setIndex} />
<ExamTimer secondsLeft={remaining} totalSeconds={1800} />   {/* amber under 5 min, red under 1 */}`,
  },
  {
    id: 'result-summary', name: 'Result summary and calculator', category: 'Exam', source: 'exam/ResultSummary.jsx',
    description: 'Score ring with the band (70+ on track, 50 to 69 borderline), and the in-exam calculator.',
    keywords: ['score', 'result', 'grade', 'calculator', 'summary', 'pass'],
    Preview: function Demo() {
      const [calc, setCalc] = useState(false);
      return (
        <div className="space-y-4">
          <ResultSummary score={74} correct={15} total={20} timeTaken="18 min" />
          <Button variant="outline" onClick={() => setCalc((v) => !v)}>{calc ? 'Close calculator' : 'Open calculator'}</Button>
          {calc && <Calculator onClose={() => setCalc(false)} />}
        </div>
      );
    },
    usage: `import ResultSummary from '../components/exam/ResultSummary.jsx';

<ResultSummary score={74} correct={15} total={20} timeTaken="18 min" />`,
  },
];
