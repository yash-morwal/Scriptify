import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCirclePlay,
  faCircleStop,
  faMinus,
  faPlus,
  faRotateLeft,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../App';

export default function TeleprompterPage() {
  const user = React.useContext(UserContext);
  const setTeleprompterSettings = user.setTeleprompterSettings;
  const setTeleprompterFullscreen = user.setTeleprompterFullscreen;
  const containerRef = React.useRef(null);

  const scriptText = user.teleprompterScript || user.rawScripts?.[0] || '';
  const scriptTitle = user.teleprompterTitle || user.chosenTopic?.[0] || 'Teleprompter';
  const cleanTeleprompterText = (text) => (text || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  const [isRunning, setIsRunning] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [countdown, setCountdown] = React.useState(null);
  const [speed, setSpeed] = React.useState(user.teleprompterSettings?.speed ?? 42);
  const [size, setSize] = React.useState(user.teleprompterSettings?.size ?? 1.6);
  const [weight, setWeight] = React.useState(user.teleprompterSettings?.weight ?? 500);
  const [marqueeKey, setMarqueeKey] = React.useState(0);
  const [manualScript, setManualScript] = React.useState(scriptText);
  const [emptyMessage, setEmptyMessage] = React.useState('');
  const marqueeText = cleanTeleprompterText(manualScript);
  const displayText = marqueeText || emptyMessage;
  const hasScript = marqueeText.length > 0;
  const marqueeDuration = `${Math.max(12, 180 - speed)}s`;
  const marqueeFontSize = `${(isFullscreen ? 28 : 16) * size}px`;

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      setTeleprompterFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setTeleprompterFullscreen]);

  React.useEffect(() => {
    if (user.teleprompterSettings) {
      setSpeed(user.teleprompterSettings.speed ?? 42);
      setSize(user.teleprompterSettings.size ?? 1.6);
      setWeight(user.teleprompterSettings.weight ?? 500);
    }
  }, [user.teleprompterSettings]);

  React.useEffect(() => {
    setTeleprompterSettings({ speed, size, weight });
  }, [speed, size, weight, setTeleprompterSettings]);

  React.useEffect(() => {
    setManualScript(scriptText);
  }, [scriptText]);

  React.useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      setCountdown(null);
      setIsRunning(true);
      setMarqueeKey((prev) => prev + 1);
      return;
    }

    const timer = setTimeout(() => setCountdown((prev) => (prev ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const adjustSpeed = (delta) => setSpeed((prev) => clamp(prev + delta, 10, 120));
  const adjustSize = (delta) => setSize((prev) => clamp(Number((prev + delta).toFixed(1)), 1.1, 2.6));
  const adjustWeight = (delta) => setWeight((prev) => clamp(prev + delta, 300, 700));

  const resetScroll = () => {
    setIsRunning(false);
    setCountdown(null);
    setMarqueeKey((prev) => prev + 1);
  };

  const handleStart = async () => {
    if (countdown !== null) return;
    if (!hasScript) {
      setEmptyMessage('Please add the script first.');
      setIsRunning(false);
      setCountdown(null);
      setMarqueeKey((prev) => prev + 1);
      return;
    }
    setEmptyMessage('');
    if (!document.fullscreenElement) {
      await toggleFullscreen();
    }
    setIsRunning(false);
    setMarqueeKey((prev) => prev + 1);
    setCountdown(3);
  };

  const handleStop = () => {
    setCountdown(null);
    setIsRunning(false);
  };

  const handleManualScriptChange = (event) => {
    const value = event.target.value;
    setManualScript(value);
    setEmptyMessage('');
    user.setTeleprompterScript(value);
    if (!user.teleprompterTitle) {
      user.setTeleprompterTitle('Custom script');
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const target = containerRef.current || document.documentElement;
        await target.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen errors silently.
    }
  };

  return (
    <div ref={containerRef} className="contentContainer bg-[var(--bg-content)] rounded-[6px] flex-1 border-box flex flex-col relative overflow-hidden">
      {!isFullscreen && (
        <div className="w-full h-[52px] flex justify-between items-center px-6 border-b border-[var(--border-dim)] bg-[var(--bg-content)] z-10 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
              title="Back"
            >
              <FontAwesomeIcon icon={faXmark} size="sm" />
            </Link>
            <div>
              <div className="text-[var(--text-primary)] font-semibold text-[14px] varela-round">Teleprompter</div>
              <div className="text-[var(--text-muted)] text-[10px] varela-round uppercase tracking-wider truncate max-w-[280px]">
                {scriptTitle}
              </div>
            </div>
          </div>
          <button
            onClick={resetScroll}
            className="flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-md border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <FontAwesomeIcon icon={faRotateLeft} size="sm" />
            Reset
          </button>
        </div>
      )}

      <div className={`w-full ${isFullscreen ? 'px-4 py-3' : 'px-6 py-2'} bg-[var(--bg-content)]`}>
        <div className="relative overflow-hidden rounded-md border border-[var(--border-item)] bg-[var(--bg-panel)]">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg-panel)] to-transparent pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg-panel)] to-transparent pointer-events-none"></div>
          <div
            key={marqueeKey}
            className="marquee-rtl whitespace-nowrap px-4 text-[var(--text-secondary)]"
            style={{
              animationDuration: marqueeDuration,
              animationPlayState: isRunning ? 'running' : 'paused',
              fontSize: marqueeFontSize,
              fontWeight: weight,
              paddingTop: isFullscreen ? '10px' : '6px',
              paddingBottom: isFullscreen ? '10px' : '6px',
              paddingLeft: '50vw',
              paddingRight: '20vw',
            }}
          >
            {displayText}
          </div>
          <button
            onClick={toggleFullscreen}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-2 py-1 rounded border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </button>
        </div>
      </div>

      <div className={`flex-1 ${isFullscreen ? 'flex items-end justify-center' : 'flex items-start justify-end'} p-6`}>
        <div className="w-full max-w-[420px] flex flex-col gap-4">
          {!isFullscreen && (
            <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-2xl p-5">
              <div className="text-[var(--text-primary)] text-[13px] font-semibold varela-round mb-3">Script Text</div>
              <textarea
                value={manualScript}
                onChange={handleManualScriptChange}
                placeholder="Paste or type your script here..."
                rows={6}
                className="w-full rounded-lg bg-[var(--bg-content)] border border-[var(--border-item)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none resize-none px-3 py-2 leading-relaxed focus:border-[var(--border-focus)]"
              />
            </div>
          )}

          <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-2xl p-5">
            <div className="text-[var(--text-primary)] text-[13px] font-semibold varela-round mb-3">Playback</div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleStart}
                className={`flex-1 py-2 rounded-lg border text-[12px] font-semibold transition-colors ${
                  isRunning || countdown !== null
                    ? 'bg-[var(--accent-color-bg)] text-[var(--accent-color)] border-[var(--accent-color)]'
                    : 'border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <FontAwesomeIcon icon={faCirclePlay} className="mr-2" />
                {countdown !== null ? `Starting ${countdown}` : 'Start'}
              </button>
              <button
                onClick={handleStop}
                className={`flex-1 py-2 rounded-lg border text-[12px] font-semibold transition-colors ${
                  !isRunning && countdown === null
                    ? 'bg-[var(--accent-color-bg)] text-[var(--accent-color)] border-[var(--accent-color)]'
                    : 'border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <FontAwesomeIcon icon={faCircleStop} className="mr-2" />
                Stop
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-2xl p-5 flex flex-col gap-4">
            <ControlRow
              label="Speed"
              value={speed}
              onMinus={() => adjustSpeed(-4)}
              onPlus={() => adjustSpeed(4)}
            />
            <ControlRow
              label="Size"
              value={size.toFixed(1)}
              onMinus={() => adjustSize(-0.1)}
              onPlus={() => adjustSize(0.1)}
            />
            <ControlRow
              label="Weight"
              value={weight}
              onMinus={() => adjustWeight(-50)}
              onPlus={() => adjustWeight(50)}
            />
          </div>

          {!isFullscreen && (
            <div className="bg-[var(--bg-panel-light)] border border-[var(--border-dim)] rounded-2xl p-5 text-[11px] text-[var(--text-muted)] leading-relaxed">
              Tip: Use the single line above and adjust speed until it feels natural.
            </div>
          )}
        </div>
      </div>
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-[72px] font-bold text-[var(--text-primary)] drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
            {countdown}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlRow({ label, value, onMinus, onPlus }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onMinus}
          className="w-8 h-8 rounded-full border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <FontAwesomeIcon icon={faMinus} size="sm" />
        </button>
        <div className="w-12 text-center text-[13px] text-[var(--text-primary)] font-semibold">
          {value}
        </div>
        <button
          onClick={onPlus}
          className="w-8 h-8 rounded-full border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} size="sm" />
        </button>
      </div>
    </div>
  );
}
