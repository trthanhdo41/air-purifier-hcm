import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, userId, userName, userEmail, userPhone } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Get AI settings
    const { data: settings, error: settingsError } = await supabase
      .from('ai_settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: 'AI settings not found' },
        { status: 404 }
      );
    }

    // 2. Check if AI is enabled
    if (!settings.enabled) {
      return NextResponse.json(
        { error: 'AI is disabled', shouldWaitForAgent: true },
        { status: 200 }
      );
    }

    // 3. Check schedule (if enabled)
    if (settings.schedule_enabled) {
      const now = new Date();
      const timezone = settings.timezone || 'Asia/Ho_Chi_Minh';
      
      // Convert to local time (simplified - in production, use proper timezone library)
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = settings.schedule_start.split(':').map(Number);
      const [endHour, endMinute] = settings.schedule_end.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      if (currentTime < startTime || currentTime > endTime) {
        return NextResponse.json(
          { 
            error: 'AI is outside working hours',
            message: `Xin chào! Chúng tôi sẽ phản hồi bạn trong giờ làm việc (${settings.schedule_start} - ${settings.schedule_end}).`,
            shouldWaitForAgent: true 
          },
          { status: 200 }
        );
      }
    }

    // 4. Check if agent is currently chatting (check last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (session?.is_agent_active && session.last_agent_message_at) {
      const lastAgentMessage = new Date(session.last_agent_message_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastAgentMessage.getTime()) / (1000 * 60);

      if (diffMinutes < 5) {
        // Agent is actively chatting, AI should not respond
        return NextResponse.json(
          { error: 'Agent is currently chatting', shouldWaitForAgent: true },
          { status: 200 }
        );
      }
    }

    // 5. Get or create chat session
    let chatSession = session;
    if (!chatSession) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          session_id: sessionId,
          user_id: userId || null,
          status: 'active',
          is_ai_active: true,
          is_agent_active: false,
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
      } else {
        chatSession = newSession;
      }
    }

    // 6. Get API key
    if (!settings.api_key) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // 7. Get recent chat history for context
    const { data: chatHistory } = await supabase
      .from('ai_chat_history')
      .select('message, response')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build conversation history
    type ConversationItem = 
      | { role: 'user'; parts: Array<{ text: string }> }
      | { role: 'model'; parts: Array<{ text: string }> };

    const conversationHistory: ConversationItem[] = [];

    // Add previous messages (user and model responses)
    if (chatHistory && chatHistory.length > 0) {
      for (const msg of chatHistory.reverse()) {
        conversationHistory.push({
          role: 'user',
          parts: [{ text: msg.message }],
        });
        conversationHistory.push({
          role: 'model',
          parts: [{ text: msg.response }],
        });
      }
    }

    // Add current message
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // 8. Call Gemini API
    const startTime = Date.now();
    const genAI = new GoogleGenerativeAI(settings.api_key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `${settings.default_prompt || 'Bạn là nhân viên tư vấn bán hàng của công ty máy lọc không khí. Hãy trả lời một cách thân thiện, chuyên nghiệp và hỗ trợ khách hàng.'}

Khách hàng: ${message}

Hãy trả lời ngắn gọn, thân thiện và hữu ích.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();
    const latency = Date.now() - startTime;

    // 9. Save to chat history
    const { error: historyError } = await supabase
      .from('ai_chat_history')
      .insert({
        session_id: sessionId,
        user_id: userId || null,
        user_name: userName || null,
        user_email: userEmail || null,
        user_phone: userPhone || null,
        message: message,
        response: responseText,
        is_ai_response: true,
        is_agent_response: false,
        model: 'gemini-2.0-flash-exp',
        latency_ms: latency,
      });

    if (historyError) {
      console.error('Error saving chat history:', historyError);
    }

    // 10. Return response
    return NextResponse.json({
      success: true,
      message: responseText,
      is_ai_response: true,
      latency_ms: latency,
    });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

