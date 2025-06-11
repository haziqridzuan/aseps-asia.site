import { Database as GeneratedDatabase } from './types';

declare global {
  // Extend the generated Database type to include the feedback table
  namespace SupabaseSchema {
    interface Database extends GeneratedDatabase {
      public: {
        Tables: {
          feedback: {
            Row: {
              id: string;
              message: string;
              type: 'bug' | 'suggestion' | 'other';
              sentiment: 'happy' | 'neutral' | 'sad';
              status: 'open' | 'in_progress' | 'resolved' | 'wont_fix';
              created_at: string;
              updated_at: string;
              user_id?: string;
            };
            Insert: {
              id?: string;
              message: string;
              type: 'bug' | 'suggestion' | 'other';
              sentiment: 'happy' | 'neutral' | 'sad';
              status?: 'open' | 'in_progress' | 'resolved' | 'wont_fix';
              created_at?: string;
              updated_at?: string;
              user_id?: string;
            };
            Update: {
              id?: string;
              message?: string;
              type?: 'bug' | 'suggestion' | 'other';
              sentiment?: 'happy' | 'neutral' | 'sad';
              status?: 'open' | 'in_progress' | 'resolved' | 'wont_fix';
              created_at?: string;
              updated_at?: string;
              user_id?: string;
            };
          };
        } & GeneratedDatabase['public']['Tables'];
      };
    }
  }
}
