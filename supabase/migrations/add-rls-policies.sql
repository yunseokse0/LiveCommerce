-- 새로 추가된 테이블들의 RLS 정책 설정

-- ============================================
-- 채팅 메시지 테이블 RLS
-- ============================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능 (삭제된 메시지 제외)
CREATE POLICY "Anyone can read non-deleted chat messages"
  ON chat_messages FOR SELECT
  USING (is_deleted = false);

-- 인증된 사용자는 자신의 메시지 작성 가능
CREATE POLICY "Authenticated users can insert chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 크리에이터는 자신의 스트림 메시지 삭제 가능
CREATE POLICY "Creators can delete messages in their streams"
  ON chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN live_streams ls ON ls.bj_id = up.bj_id
      WHERE up.id = auth.uid()
        AND ls.id = chat_messages.stream_id
        AND up.bj_id IS NOT NULL
    )
  );

-- ============================================
-- 채팅 차단 사용자 테이블 RLS
-- ============================================
ALTER TABLE chat_banned_users ENABLE ROW LEVEL SECURITY;

-- 크리에이터는 자신의 스트림 차단 목록 조회 가능
CREATE POLICY "Creators can read banned users in their streams"
  ON chat_banned_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN live_streams ls ON ls.bj_id = up.bj_id
      WHERE up.id = auth.uid()
        AND ls.id = chat_banned_users.stream_id
        AND up.bj_id IS NOT NULL
    )
  );

-- 크리에이터는 자신의 스트림에서 사용자 차단 가능
CREATE POLICY "Creators can ban users in their streams"
  ON chat_banned_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN live_streams ls ON ls.bj_id = up.bj_id
      WHERE up.id = auth.uid()
        AND ls.id = chat_banned_users.stream_id
        AND up.bj_id IS NOT NULL
    )
  );

-- 크리에이터는 자신의 스트림에서 차단 해제 가능
CREATE POLICY "Creators can unban users in their streams"
  ON chat_banned_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN live_streams ls ON ls.bj_id = up.bj_id
      WHERE up.id = auth.uid()
        AND ls.id = chat_banned_users.stream_id
        AND up.bj_id IS NOT NULL
    )
  );

-- ============================================
-- 알림 테이블 RLS
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 알림만 읽기 가능
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 알림만 업데이트 가능
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 사용자는 자신의 알림만 삭제 가능
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 관리자는 모든 알림 생성 가능
CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 검색 기록 테이블 RLS
-- ============================================
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 검색 기록만 읽기 가능
CREATE POLICY "Users can read own search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 사용자는 자신의 검색 기록만 삭제 가능
CREATE POLICY "Users can delete own search history"
  ON search_history FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 모든 사용자가 검색 기록 저장 가능
CREATE POLICY "Anyone can insert search history"
  ON search_history FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 인기 검색어 테이블 RLS
-- ============================================
ALTER TABLE popular_searches ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read popular searches"
  ON popular_searches FOR SELECT
  USING (true);

-- 서버 사이드에서만 쓰기 가능
CREATE POLICY "Service role can manage popular searches"
  ON popular_searches FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 사용자-크리에이터 매핑 테이블 RLS
-- ============================================
ALTER TABLE user_bj_mapping ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 매핑 정보만 읽기 가능
CREATE POLICY "Users can read own mapping"
  ON user_bj_mapping FOR SELECT
  USING (auth.uid() = user_id);

-- 관리자는 모든 매핑 읽기 가능
CREATE POLICY "Admins can read all mappings"
  ON user_bj_mapping FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 관리자는 매핑 생성/수정 가능
CREATE POLICY "Admins can manage mappings"
  ON user_bj_mapping FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
