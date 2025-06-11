import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { submitFeedback } from '@/services/feedbackService';
import type { FeedbackType, Sentiment } from '@/services/feedbackService';

interface FeedbackFormProps {
  onClose: () => void;
  isPageView?: boolean;
}

export function FeedbackForm({ onClose, isPageView = false }: FeedbackFormProps) {
  const [message, setMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [sentiment, setSentiment] = useState<Sentiment>('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please enter your feedback', {
        position: 'top-center',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitFeedback({
        message,
        type: feedbackType,
        sentiment,
      });

      // Show success message
      toast.success('Thank you for your feedback!', {
        position: 'top-center',
        duration: 3000,
      });

      // Reset form
      setMessage('');
      setFeedbackType('suggestion');
      setSentiment('neutral');

      // If in page view, stay on the page and scroll to top
      if (isPageView) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // If in dialog, close the dialog
        onClose();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback', {
        position: 'top-center',
        duration: 3000,
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isPageView ? 'space-y-6' : 'space-y-4'}>
      {isPageView && (
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to previous page
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Your Feedback
          </label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts, suggestions, or report an issue..."
            className="min-h-[160px]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            How do you feel?
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'happy', label: '😊 Happy' },
              { value: 'neutral', label: '😐 Neutral' },
              { value: 'sad', label: '😞 Sad' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSentiment(item.value as Sentiment)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  sentiment === item.value
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Type of Feedback
          </label>
          <select
            id="type"
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="suggestion">Suggestion</option>
            <option value="bug">Bug Report</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className={`flex ${isPageView ? 'justify-end' : 'justify-between'} gap-3 pt-2`}>
          {!isPageView && (
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={isPageView ? 'w-full sm:w-auto' : ''}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Feedback'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
