-- ============================================
-- 초기 데이터 시드
-- ============================================

-- 한국 지역 데이터 삽입
INSERT INTO regions (code, name, type, latitude, longitude, center_x, center_y) VALUES
('11', '서울특별시', 'sido', 37.5665, 126.9780, 30, 25),
('26', '부산광역시', 'sido', 35.1796, 129.0756, 55, 80),
('27', '대구광역시', 'sido', 35.8714, 128.6014, 45, 50),
('28', '인천광역시', 'sido', 37.4563, 126.7052, 20, 20),
('29', '광주광역시', 'sido', 35.1595, 126.8526, 30, 70),
('30', '대전광역시', 'sido', 36.3504, 127.3845, 35, 40),
('31', '울산광역시', 'sido', 35.5384, 129.3114, 60, 65),
('41', '경기도', 'sido', 37.4138, 127.5183, 28, 30),
('42', '강원도', 'sido', 37.8228, 128.1555, 45, 15),
('43', '충청북도', 'sido', 36.8000, 127.7000, 35, 35),
('44', '충청남도', 'sido', 36.5184, 126.8000, 30, 40),
('45', '전라북도', 'sido', 35.7175, 127.1530, 30, 55),
('46', '전라남도', 'sido', 34.8679, 126.9910, 25, 70),
('47', '경상북도', 'sido', 36.4919, 128.8889, 50, 45),
('48', '경상남도', 'sido', 35.4606, 128.2132, 50, 70),
('50', '제주특별자치도', 'sido', 33.4996, 126.5312, 20, 95)
ON CONFLICT (code) DO NOTHING;

-- 제주도 특산물 예시
INSERT INTO local_products (name, description, region_id, category, season_start, season_end)
SELECT 
  '한라봉',
  '제주도 대표 특산물',
  r.id,
  '과일',
  11,
  2
FROM regions r
WHERE r.code = '50'
ON CONFLICT DO NOTHING;

INSERT INTO local_products (name, description, region_id, category, season_start, season_end)
SELECT 
  '감귤',
  '제주도 감귤',
  r.id,
  '과일',
  10,
  2
FROM regions r
WHERE r.code = '50'
ON CONFLICT DO NOTHING;
