import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, Share2, Trash2 } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  IconButton,
  Spinner,
  buttonClasses,
  useToast,
} from '../../components/ui/index.js';
import { sheetClasses } from '../../components/ui/surfaces.js';
import { PageHeader, Screen } from '../../components/layout/Screen.jsx';
import MathText from '../../components/MathText.jsx';
import OptionRow from '../../components/exam/OptionRow.jsx';
import ShareDialog from '../../components/share/ShareDialog.jsx';
import { useBookmarks, useToggleBookmark } from './useBookmarks.js';
import { questionShareCaption, questionShareUrl } from '../public-questions/shareUrl.js';

const letter = (index) => String.fromCharCode(65 + index);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
    : '';

/**
 * Saved questions.
 *
 * The other half of the bookmark button: the paper is where a question gets saved, this is
 * where it is read back. Each one is shown complete .stem, options, the answer and the
 * explanation .because a question saved to study is useless without the answer key, and the
 * student has already sat the paper it came from.
 *
 * Sharing a saved question hands over the same public card the question bank shares: a link
 * the backend serves with the question as its preview image, so it lands in WhatsApp as a
 * question someone can try rather than a URL.
 */
function BookmarksPage() {
  const toast = useToast();
  const { data: bookmarks, isLoading, isError, error } = useBookmarks();
  const toggleBookmark = useToggleBookmark();
  const [sharing, setSharing] = useState(null);

  const remove = (item) => {
    toggleBookmark.mutate(
      { questionId: item.questionId, question: item.question },
      {
        onSuccess: () => toast.success('Removed', 'That question is no longer saved.'),
      },
    );
  };

  return (
    <Screen width="xl">
      <PageHeader
        back="/profile"
        eyebrow="Study"
        title="Saved questions"
        subtitle="Questions you kept to come back to, with the answers."
        action={
          bookmarks?.length ? (
            <Badge variant="lavender">
              {bookmarks.length} saved
            </Badge>
          ) : null
        }
      />

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Spinner size={26} />
        </div>
      ) : isError ? (
        <Alert variant="danger" className="mt-6">
          {error?.message ?? 'Your saved questions could not be loaded.'}
        </Alert>
      ) : !bookmarks?.length ? (
        <EmptyState
          className="mt-6"
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap the bookmark on any question .in a paper or when reviewing your corrections .and it lands here with the answer and the explanation."
          action={
            <Link to="/courses" className={buttonClasses({})}>
              <Compass size={16} aria-hidden="true" />
              Start a paper
            </Link>
          }
        />
      ) : (
        <ol className="mt-6 flex flex-col gap-3">
          {bookmarks.map((item) => {
            const question = item.question;
            return (
              <li key={item.id} className={sheetClasses({ className: 'p-5' })}>
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {question?.subjectCode && (
                      <Badge variant="primary" className="font-bold">
                        {question.subjectCode}
                      </Badge>
                    )}
                    {question?.topic && (
                      <Badge variant="lavender">{question.topic}</Badge>
                    )}
                    {item.createdAt && (
                      <span className="text-xs text-muted">Saved {formatDate(item.createdAt)}</span>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSharing(item)}
                      leadingIcon={<Share2 size={15} aria-hidden="true" />}
                    >
                      Share
                    </Button>
                    <IconButton
                      size="sm"
                      aria-label="Remove from saved questions"
                      title="Remove"
                      onClick={() => remove(item)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>

                <MathText className="mt-3 block text-[15px] font-medium leading-relaxed text-foreground-strong">
                  {question?.stem ?? 'This question is no longer available.'}
                </MathText>

                {question?.options?.length ? (
                  <div className="mt-4 space-y-2">
                    {question.options.map((option, index) => (
                      <OptionRow
                        key={index}
                        label={letter(index)}
                        name={`saved-${item.id}`}
                        disabled
                        state={index === question.correctOption ? 'answer' : 'idle'}
                      >
                        {option}
                      </OptionRow>
                    ))}
                  </div>
                ) : null}

                {question?.explanation && (
                  <Alert variant="info" className="mt-3 text-[13px] leading-relaxed">
                    <span className="font-bold text-foreground-strong">Explanation. </span>
                    <MathText className="inline">{question.explanation}</MathText>
                  </Alert>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <ShareDialog
        open={Boolean(sharing)}
        onOpenChange={(open) => {
          if (!open) setSharing(null);
        }}
        title="Share this question"
        description="Anyone who opens the link gets the question with its options. The answer is not spoiled .they can try it first."
        url={sharing ? questionShareUrl(sharing.questionId) : ''}
        caption={questionShareCaption(sharing?.question)}
      />
    </Screen>
  );
}

export default BookmarksPage;
