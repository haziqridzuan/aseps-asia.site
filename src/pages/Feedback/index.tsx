import { FeedbackForm } from '@/components/feedback/FeedbackForm';

export default function FeedbackPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Feedback</h1>
        <p className="text-gray-600 dark:text-gray-400">
          We'd love to hear your thoughts, suggestions, or report any issues.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <FeedbackForm onClose={() => {}} isPageView />
      </div>
    </div>
  );
}
