import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from '@/components/ui/dialog';
import { FeedbackForm } from './FeedbackForm';
import { MessageSquare } from 'lucide-react';

export function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-slate-300 hover:bg-slate-700/50 hover:text-white"
      >
        <MessageSquare className="h-5 w-5 flex-shrink-0" />
        <span className="truncate">Feedback</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogOverlay className="bg-black/50" />
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-2xl font-bold">Send us your feedback!</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              We'd love to hear your thoughts, suggestions, or report any issues.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <FeedbackForm onClose={() => setIsOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
