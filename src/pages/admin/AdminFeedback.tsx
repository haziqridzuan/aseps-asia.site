import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import {
  getFeedbackList,
  updateFeedbackStatus,
  type Feedback,
  type FeedbackType,
  type Sentiment,
  type FeedbackStatus,
} from '@/services/feedbackService';

const statusColors: Record<FeedbackStatus, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  wont_fix: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const feedbackTypeLabels: Record<FeedbackType, string> = {
  bug: 'Bug Report',
  suggestion: 'Suggestion',
  other: 'Other',
};

const sentimentEmoji: Record<Sentiment, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😞',
};

export default function AdminFeedback() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch feedback list
  const {
    data: feedback = [],
    isLoading,
    error,
  } = useQuery<Feedback[]>({
    queryKey: ['feedback'],
    queryFn: getFeedbackList,
    refetchOnWindowFocus: true,
  });

  // Update feedback status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackStatus }) =>
      updateFeedbackStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Status updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update status', {
        description: error.message || 'Please try again',
      });
    },
  });

  // Filter and search feedback
  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch = item.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        Error loading feedback: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Feedback</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">View and manage user feedback</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search feedback..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="wont_fix">Won't Fix</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.length > 0 ? (
                filteredFeedback.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[300px] break-words">
                      <div className="font-medium">{item.message}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{feedbackTypeLabels[item.type]}</Badge>
                    </TableCell>
                    <TableCell className="text-2xl">{sentimentEmoji[item.sentiment]}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select
                        value={item.status}
                        onValueChange={(value) =>
                          updateStatusMutation.mutate({
                            id: item.id,
                            status: value as FeedbackStatus,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="wont_fix">Won't Fix</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No feedback found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
