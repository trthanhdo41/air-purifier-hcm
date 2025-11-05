import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data } = await supabase
    .rpc('is_admin', { user_id: userId });

  return data === true;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminCheck = await isAdmin(user.id);
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { user_id, delete_all } = body;

    // Delete chat messages
    let deletedMessages = 0;
    let deletedAIHistory = 0;

    if (delete_all) {
      // Delete all chat messages and AI history
      // First get count before deletion
      const { count: messagesCountBefore } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true });
      
      const { count: aiHistoryCountBefore } = await supabase
        .from('ai_chat_history')
        .select('*', { count: 'exact', head: true });

      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using a condition that always matches)

      if (messagesError) {
        console.error('Error deleting all chat messages:', messagesError);
      } else {
        deletedMessages = messagesCountBefore || 0;
      }

      const { error: aiHistoryError } = await supabase
        .from('ai_chat_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (aiHistoryError) {
        console.error('Error deleting all AI chat history:', aiHistoryError);
      } else {
        deletedAIHistory = aiHistoryCountBefore || 0;
      }
    } else if (user_id) {
      // Delete messages for specific user
      const { error: messagesError, count: messagesCount } = await supabase
        .from('chat_messages')
        .delete({ count: 'exact' })
        .eq('user_id', user_id);

      if (messagesError) {
        console.error('Error deleting chat messages:', messagesError);
        return NextResponse.json(
          { error: messagesError.message },
          { status: 500 }
        );
      }
      deletedMessages = messagesCount || 0;

      // Delete AI chat history for this user
      const { error: aiHistoryError, count: aiHistoryCount } = await supabase
        .from('ai_chat_history')
        .delete({ count: 'exact' })
        .eq('user_id', user_id);

      if (aiHistoryError) {
        console.error('Error deleting AI chat history:', aiHistoryError);
        // Don't fail if AI history deletion fails, just log it
      }
      deletedAIHistory = aiHistoryCount || 0;
    } else {
      return NextResponse.json(
        { error: 'user_id or delete_all is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted_messages: deletedMessages,
      deleted_ai_history: deletedAIHistory,
      message: delete_all 
        ? `Đã xóa tất cả lịch sử chat (${deletedMessages} tin nhắn, ${deletedAIHistory} lịch sử AI)`
        : `Đã xóa lịch sử chat của khách hàng (${deletedMessages} tin nhắn, ${deletedAIHistory} lịch sử AI)`
    });
  } catch (error: any) {
    console.error('Error deleting chat history:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

