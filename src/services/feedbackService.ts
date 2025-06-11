import { supabase } from '@/integrations/supabase/client';

export type FeedbackType = 'bug' | 'suggestion' | 'other';
export type Sentiment = 'happy' | 'neutral' | 'sad';
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'wont_fix';

export interface Feedback {
  id: string;
  message: string;
  type: FeedbackType;
  sentiment: Sentiment;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackInput {
  message: string;
  type: FeedbackType;
  sentiment: Sentiment;
  status?: FeedbackStatus;
}

export const submitFeedback = async (feedback: CreateFeedbackInput): Promise<Feedback> => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        { 
          ...feedback,
          status: feedback.status || 'open',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw new Error('Failed to submit feedback');
  }
};

export const getFeedbackList = async (): Promise<Feedback[]> => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching feedback list:', error);
    throw new Error('Failed to fetch feedback list');
  }
};

export const updateFeedbackStatus = async (
  id: string, 
  status: FeedbackStatus
): Promise<Feedback> => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .update({ 
        status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating feedback status:', error);
    throw new Error('Failed to update feedback status');
  }
};
