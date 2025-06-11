import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FeedbackType = 'bug' | 'suggestion' | 'other';
type Sentiment = 'happy' | 'neutral' | 'sad';

interface Feedback {
  id: string;
  message: string;
  type: FeedbackType;
  sentiment: Sentiment;
  created_at: string;
  user_id?: string;
}

const sentimentEmoji: Record<Sentiment, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😞',
};

const typeVariant: Record<FeedbackType, string> = {
  bug: 'destructive',
  suggestion: 'default',
  other: 'outline',
};

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | 'all'>('all');

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback');
      if (!response.ok) throw new Error('Failed to fetch feedback');
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch = item.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter;
    return matchesSearch && matchesType && matchesSentiment;
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">User Feedback</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search feedback..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as FeedbackType | 'all')}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sentimentFilter}
            onValueChange={(value) => setSentimentFilter(value as Sentiment | 'all')}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="happy">😊 Happy</SelectItem>
              <SelectItem value="neutral">😐 Neutral</SelectItem>
              <SelectItem value="sad">😞 Sad</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchFeedback} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Feedback</CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredFeedback.length} {filteredFeedback.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredFeedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No feedback found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-2xl">{sentimentEmoji[item.sentiment]}</TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-md">
                          <p className="line-clamp-2">{item.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeVariant[item.type] as any}>{item.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
