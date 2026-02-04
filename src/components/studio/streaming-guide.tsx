'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Radio, 
  Monitor, 
  Smartphone, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

interface StreamingGuideProps {
  rtmpUrl: string;
  streamKey: string;
}

type StreamingApp = 'obs' | 'prism' | 'streamlabs' | 'xsplit' | 'wirecast';

export function StreamingGuide({ rtmpUrl, streamKey }: StreamingGuideProps) {
  const [selectedApp, setSelectedApp] = useState<StreamingApp>('obs');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['obs']));

  const toggleSection = (app: StreamingApp) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(app)) {
      newExpanded.delete(app);
    } else {
      newExpanded.add(app);
    }
    setExpandedSections(newExpanded);
  };

  const apps: { id: StreamingApp; name: string; icon: React.ReactNode; downloadUrl: string }[] = [
    {
      id: 'obs',
      name: 'OBS Studio',
      icon: <Radio className="w-5 h-5" />,
      downloadUrl: 'https://obsproject.com/',
    },
    {
      id: 'prism',
      name: 'Prism Live Studio',
      icon: <Monitor className="w-5 h-5" />,
      downloadUrl: 'https://prismlive.com/',
    },
    {
      id: 'streamlabs',
      name: 'Streamlabs Desktop',
      icon: <Monitor className="w-5 h-5" />,
      downloadUrl: 'https://streamlabs.com/',
    },
    {
      id: 'xsplit',
      name: 'XSplit Broadcaster',
      icon: <Monitor className="w-5 h-5" />,
      downloadUrl: 'https://www.xsplit.com/',
    },
    {
      id: 'wirecast',
      name: 'Wirecast',
      icon: <Monitor className="w-5 h-5" />,
      downloadUrl: 'https://www.telestream.net/wirecast/',
    },
  ];

  const getGuideSteps = (app: StreamingApp) => {
    switch (app) {
      case 'obs':
        return [
          {
            step: 1,
            title: 'OBS Studio 다운로드 및 설치',
            description: 'OBS Studio 공식 웹사이트에서 다운로드하여 설치합니다.',
            action: (
              <a
                href="https://obsproject.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
              >
                다운로드 <ExternalLink className="w-3 h-3" />
              </a>
            ),
          },
          {
            step: 2,
            title: '방송 설정 열기',
            description: 'OBS Studio → 설정 → 방송 메뉴를 엽니다.',
          },
          {
            step: 3,
            title: '서비스 선택',
            description: '서비스 드롭다운에서 "사용자 지정"을 선택합니다.',
          },
          {
            step: 4,
            title: '서버 및 스트림 키 입력',
            description: (
              <div className="space-y-2">
                <p>서버: <code className="px-2 py-1 rounded bg-zinc-800 text-xs">{rtmpUrl}</code></p>
                <p>스트림 키: <code className="px-2 py-1 rounded bg-zinc-800 text-xs font-mono">{streamKey}</code></p>
              </div>
            ),
          },
          {
            step: 5,
            title: '출력 설정 (선택사항)',
            description: '출력 → 인코더에서 "x264" 또는 "NVENC H.264"를 선택합니다. 비트레이트는 2500 kbps를 권장합니다.',
          },
          {
            step: 6,
            title: '방송 시작',
            description: '설정을 저장한 후 "방송 시작" 버튼을 클릭합니다.',
          },
        ];
      case 'prism':
        return [
          {
            step: 1,
            title: 'Prism Live Studio 다운로드 및 설치',
            description: 'Prism Live Studio 공식 웹사이트에서 다운로드하여 설치합니다.',
            action: (
              <a
                href="https://prismlive.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
              >
                다운로드 <ExternalLink className="w-3 h-3" />
              </a>
            ),
          },
          {
            step: 2,
            title: 'RTMP 설정 열기',
            description: 'Prism Live Studio → 설정 → RTMP 설정 메뉴를 엽니다.',
          },
          {
            step: 3,
            title: 'RTMP 서버 추가',
            description: '새 RTMP 서버를 추가하고 다음 정보를 입력합니다:',
            action: (
              <div className="space-y-2 mt-2">
                <p>서버 URL: <code className="px-2 py-1 rounded bg-zinc-800 text-xs">{rtmpUrl}</code></p>
                <p>스트림 키: <code className="px-2 py-1 rounded bg-zinc-800 text-xs font-mono">{streamKey}</code></p>
              </div>
            ),
          },
          {
            step: 4,
            title: '방송 시작',
            description: '설정을 저장한 후 "라이브 시작" 버튼을 클릭합니다.',
          },
        ];
      case 'streamlabs':
        return [
          {
            step: 1,
            title: 'Streamlabs Desktop 다운로드 및 설치',
            description: 'Streamlabs 공식 웹사이트에서 다운로드하여 설치합니다.',
            action: (
              <a
                href="https://streamlabs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
              >
                다운로드 <ExternalLink className="w-3 h-3" />
              </a>
            ),
          },
          {
            step: 2,
            title: '방송 설정 열기',
            description: 'Streamlabs Desktop → 설정 → 방송 메뉴를 엽니다.',
          },
          {
            step: 3,
            title: '서비스 선택',
            description: '서비스 드롭다운에서 "사용자 지정"을 선택합니다.',
          },
          {
            step: 4,
            title: '서버 및 스트림 키 입력',
            description: (
              <div className="space-y-2">
                <p>서버: <code className="px-2 py-1 rounded bg-zinc-800 text-xs">{rtmpUrl}</code></p>
                <p>스트림 키: <code className="px-2 py-1 rounded bg-zinc-800 text-xs font-mono">{streamKey}</code></p>
              </div>
            ),
          },
          {
            step: 5,
            title: '방송 시작',
            description: '설정을 저장한 후 "Go Live" 버튼을 클릭합니다.',
          },
        ];
      case 'xsplit':
        return [
          {
            step: 1,
            title: 'XSplit Broadcaster 다운로드 및 설치',
            description: 'XSplit 공식 웹사이트에서 다운로드하여 설치합니다.',
            action: (
              <a
                href="https://www.xsplit.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
              >
                다운로드 <ExternalLink className="w-3 h-3" />
              </a>
            ),
          },
          {
            step: 2,
            title: '방송 설정 열기',
            description: 'XSplit → 방송 → 방송 설정 메뉴를 엽니다.',
          },
          {
            step: 3,
            title: 'RTMP 서버 추가',
            description: 'RTMP 서버를 추가하고 다음 정보를 입력합니다:',
            action: (
              <div className="space-y-2 mt-2">
                <p>서버 URL: <code className="px-2 py-1 rounded bg-zinc-800 text-xs">{rtmpUrl}</code></p>
                <p>스트림 키: <code className="px-2 py-1 rounded bg-zinc-800 text-xs font-mono">{streamKey}</code></p>
              </div>
            ),
          },
          {
            step: 4,
            title: '방송 시작',
            description: '설정을 저장한 후 "방송 시작" 버튼을 클릭합니다.',
          },
        ];
      case 'wirecast':
        return [
          {
            step: 1,
            title: 'Wirecast 다운로드 및 설치',
            description: 'Telestream 공식 웹사이트에서 다운로드하여 설치합니다.',
            action: (
              <a
                href="https://www.telestream.net/wirecast/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
              >
                다운로드 <ExternalLink className="w-3 h-3" />
              </a>
            ),
          },
          {
            step: 2,
            title: '출력 설정 열기',
            description: 'Wirecast → 출력 → 출력 설정 메뉴를 엽니다.',
          },
          {
            step: 3,
            title: 'RTMP 출력 추가',
            description: 'RTMP 출력을 추가하고 다음 정보를 입력합니다:',
            action: (
              <div className="space-y-2 mt-2">
                <p>서버 URL: <code className="px-2 py-1 rounded bg-zinc-800 text-xs">{rtmpUrl}</code></p>
                <p>스트림 키: <code className="px-2 py-1 rounded bg-zinc-800 text-xs font-mono">{streamKey}</code></p>
              </div>
            ),
          },
          {
            step: 4,
            title: '방송 시작',
            description: '설정을 저장한 후 "방송 시작" 버튼을 클릭합니다.',
          },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold">방송 프로그램 설정 가이드</h3>
      </div>

      {/* 방송 프로그램 선택 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => {
              setSelectedApp(app.id);
              if (!expandedSections.has(app.id)) {
                toggleSection(app.id);
              }
            }}
            className={`p-3 rounded-lg border transition-all ${
              selectedApp === app.id
                ? 'border-amber-500/50 bg-amber-500/10'
                : 'border-zinc-800/80 bg-secondary/50 hover:border-zinc-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`${selectedApp === app.id ? 'text-amber-400' : 'text-zinc-400'}`}>
                {app.icon}
              </div>
              <span className="text-xs font-medium text-center">{app.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 선택된 프로그램 가이드 */}
      {expandedSections.has(selectedApp) && (
        <div className="space-y-4">
          {getGuideSteps(selectedApp).map((step) => (
            <div
              key={step.step}
              className="p-4 rounded-lg border border-zinc-800/80 bg-card/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-400">{step.step}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  {typeof step.description === 'string' ? (
                    <p className="text-sm text-zinc-400">{step.description}</p>
                  ) : (
                    <div className="text-sm text-zinc-400">{step.description}</div>
                  )}
                  {step.action && <div className="mt-2">{step.action}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 공통 설정 팁 */}
      <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          공통 권장 설정
        </h4>
        <ul className="text-sm text-zinc-300 space-y-1">
          <li>• 비트레이트: 2500 kbps (권장)</li>
          <li>• 해상도: 1920x1080 (1080p) 또는 1280x720 (720p)</li>
          <li>• 프레임레이트: 30 fps</li>
          <li>• 키프레임 간격: 2초 (60 프레임 @ 30fps)</li>
          <li>• 인코더: x264 또는 하드웨어 인코더 (NVENC, Quick Sync 등)</li>
        </ul>
      </div>
    </div>
  );
}
