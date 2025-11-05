-- =====================================================
-- AI CHATBOT SETUP
-- Tạo bảng cài đặt AI và lịch sử chat AI
-- =====================================================

-- AI Settings table
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enabled BOOLEAN DEFAULT true,
  schedule_enabled BOOLEAN DEFAULT false,
  schedule_start TIME DEFAULT '08:00:00',
  schedule_end TIME DEFAULT '22:00:00',
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  default_prompt TEXT DEFAULT 'Bạn là nhân viên tư vấn bán hàng của công ty máy lọc không khí. Hãy trả lời một cách thân thiện, chuyên nghiệp và hỗ trợ khách hàng.',
  agent_name TEXT DEFAULT 'Chị Lan',
  agent_avatar TEXT,
  agent_title TEXT DEFAULT 'Tư vấn viên',
  api_key TEXT, -- Gemini API key (encrypted)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default AI settings
INSERT INTO ai_settings (id, enabled, schedule_enabled, schedule_start, schedule_end)
VALUES (uuid_generate_v4(), false, false, '08:00:00', '22:00:00')
ON CONFLICT DO NOTHING;

-- Chat History table (lưu lịch sử AI chat)
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  is_ai_response BOOLEAN DEFAULT true,
  is_agent_response BOOLEAN DEFAULT false,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  model TEXT DEFAULT 'gemini-2.5-flash',
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Sessions table (track AI vs Agent)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'handed_over')),
  is_ai_active BOOLEAN DEFAULT true,
  is_agent_active BOOLEAN DEFAULT false,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_agent_message_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session_id ON ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at ON ai_chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

-- Update trigger for ai_settings
CREATE OR REPLACE FUNCTION update_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();

-- RLS Policies for ai_settings (chỉ admin)
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view ai_settings" ON ai_settings;
DROP POLICY IF EXISTS "Admin can insert ai_settings" ON ai_settings;
DROP POLICY IF EXISTS "Admin can update ai_settings" ON ai_settings;
DROP POLICY IF EXISTS "Admin can delete ai_settings" ON ai_settings;

CREATE POLICY "Admin can view ai_settings"
  ON ai_settings FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can insert ai_settings"
  ON ai_settings FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update ai_settings"
  ON ai_settings FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete ai_settings"
  ON ai_settings FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for ai_chat_history (admin xem được, user xem được của mình)
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat history"
  ON ai_chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all chat history"
  ON ai_chat_history FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role can insert chat history"
  ON ai_chat_history FOR INSERT
  WITH CHECK (true);

-- RLS Policies for chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all sessions"
  ON chat_sessions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role can manage sessions"
  ON chat_sessions FOR ALL
  USING (true);

