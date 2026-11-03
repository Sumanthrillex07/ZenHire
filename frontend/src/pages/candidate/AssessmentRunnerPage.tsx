import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { assessmentApi, SubmitAnswerItem } from '../../api/assessmentApi';
import { TestDetail, AttemptResult } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CategoryBadge } from '../../components/Badge';
import Button from '../../components/ui/Button';
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Check, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const AssessmentRunnerPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<TestDetail | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);

  useEffect(() => {
    if (testId) {
      initAssessment(testId);
    }
  }, [testId]);

  const initAssessment = async (id: string) => {
    setLoading(true);
    try {
      const [testData, attemptData] = await Promise.all([
        assessmentApi.getTestById(id),
        assessmentApi.startAttempt(id),
      ]);
      setTest(testData);
      setAttemptId(attemptData.attemptId);
    } catch (err) {
      console.error('Failed to initialize test attempt', err);
      alert('Could not start assessment attempt. Please try again.');
      navigate('/candidate/assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!test || !attemptId) return;

    // Check if unanswered questions remain
    const unansweredCount = test.questions.filter((q) => selectedAnswers[q.id] === undefined).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const payload: SubmitAnswerItem[] = test.questions.map((q) => ({
        questionId: q.id,
        selectedIndex: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
      }));

      const attemptResult = await assessmentApi.submitAttempt(attemptId, payload);
      setResult(attemptResult);
    } catch (err) {
      console.error('Failed to submit test', err);
      alert('Failed to calculate assessment score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Preparing assessment session..." size="lg" />;
  }

  if (!test) {
    return null;
  }

  // If test has already been completed, show Result View
  if (result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 animate-fadeIn">
        <div className="glass-card p-8 sm:p-10 text-center space-y-6">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
              result.passed
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            }`}
          >
            {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 border">
              {result.passed ? (
                <span className="text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  PASSED &bull; CREDENTIAL VERIFIED
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10">
                  FAILED &bull; RETAKE REQUIRED
                </span>
              )}
            </div>

            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              Score: {result.score}%
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              You answered {result.correctCount} of {result.totalQuestions} questions correctly.
              (Passing requirement: {test.passScore}%)
            </p>
          </div>

          <div className="p-4 bg-muted/40 rounded-xl border border-border/70 text-xs text-muted-foreground text-left space-y-1">
            <div className="flex items-center gap-1.5 text-foreground font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-primary" /> Assessment Gating Impact:
            </div>
            <p>
              {result.passed
                ? `Congratulations! You have satisfied the assessment gate for all ${test.roleCategory || 'General'} engineering requisitions.`
                : `You fell short of the ${test.passScore}% pass threshold. You can review key topic areas on your dashboard and retry anytime.`}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link to="/candidate/assessments" className="flex-1">
              <Button variant="outline" size="md" className="w-full">
                All Assessments
              </Button>
            </Link>
            {result.passed ? (
              <Link to="/jobs" className="flex-1">
                <Button variant="primary" size="md" className="w-full gap-1.5 font-bold">
                  Browse Gated Roles <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => {
                  setResult(null);
                  setSelectedAnswers({});
                  setCurrentIndex(0);
                  initAssessment(test.id);
                }}
                variant="primary"
                size="md"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
              >
                Retry Assessment Now
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = test.questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / test.questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Test Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/70">
        <div>
          <span className="text-xs text-muted-foreground font-medium">ZenHire Verified Evaluation</span>
          <h1 className="text-xl font-bold text-foreground tracking-tight">{test.title}</h1>
        </div>
        {test.roleCategory && <CategoryBadge category={test.roleCategory} />}
      </div>

      {/* Progress Bar & Question Tracker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Question <b className="text-foreground">{currentIndex + 1}</b> of {test.questions.length}
          </span>
          <span className="font-medium">{progressPercent}% Complete</span>
        </div>
        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Active Question Card */}
      {currentQ && (
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary">
              Topic: {currentQ.topicTag}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              Difficulty: {currentQ.difficulty}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
            {currentQ.questionText}
          </h2>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, optIndex) => {
              const isSelected = selectedAnswers[currentQ.id] === optIndex;
              return (
                <button
                  key={optIndex}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, optIndex)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 shadow-sm'
                      : 'bg-card hover:bg-muted/40 border-border text-foreground/90'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/50'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="leading-relaxed font-normal">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          variant="outline"
          size="sm"
          className="gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        {currentIndex < test.questions.length - 1 ? (
          <Button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(test.questions.length - 1, prev + 1))}
            variant="primary"
            size="md"
            className="gap-1.5 font-bold"
          >
            Next Question <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            isLoading={submitting}
            variant="primary"
            size="md"
            className="shadow-md font-bold"
          >
            {submitting ? 'Grading Assessment...' : 'Submit Answers & Calculate Score'}
          </Button>
        )}
      </div>
    </div>
  );
};
export default AssessmentRunnerPage;