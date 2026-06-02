import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Satellite,
  Sparkles,
  Star,
  Volume2,
  VolumeX
} from "lucide-react";

const API_BASE = import.meta.env.PROD ? "/api" : "http://localhost:8081/api";
const DEFAULT_TOPIC = "WORD_NEBULA_FOUNDATIONS";
const BGM_SRC = "/assets/audio/kids-fun-space-adventure.mp3";
const DEFAULT_VOLUME = 0.7;
const CORRECT_ADVANCE_DELAY = 540;
const WRONG_RESET_DELAY = 640;

const planetSkins = [
  "from-cyan-200 via-sky-500 to-blue-950 shadow-[inset_0_0_34px_rgba(255,255,255,0.2),0_0_34px_rgba(34,211,238,0.72)]",
  "from-fuchsia-200 via-pink-500 to-violet-950 shadow-[inset_0_0_34px_rgba(255,255,255,0.2),0_0_34px_rgba(255,43,214,0.68)]",
  "from-lime-200 via-emerald-400 to-teal-950 shadow-[inset_0_0_34px_rgba(255,255,255,0.2),0_0_34px_rgba(167,255,60,0.62)]"
];

const promptFallbacks = {
  audio_match: "Tap the sound!",
  case_match: "Match the letter!",
  image_word: "Find the picture word!",
  rhyme_catch: "Find the rhyme!",
  initial_sound: "Match the first sound!",
  token_order: "Build the word!",
  mixed_checkpoint: "Find the match!"
};

function useWordNebulaSession(userId, topic = DEFAULT_TOPIC) {
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visitedIndices, setVisitedIndices] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const activeQuestion = useMemo(() => {
    if (!session?.questions?.length) return null;
    return session.questions[currentIndex] || null;
  }, [currentIndex, session]);

  const hydrate = useCallback((nextSession) => {
    setSession(nextSession);
    setCurrentIndex(nextSession.currentIndex || 0);
    const consumed = new Set(nextSession.consumedQuestionIds || []);
    setVisitedIndices(
      (nextSession.activeQuestionIds || [])
        .map((id, index) => (consumed.has(id) ? index : -1))
        .filter((index) => index >= 0)
    );
  }, []);

  const start = useCallback(async () => {
    setStatus("loading");
    setError("");
    if (!userId) {
      setError("Login required.");
      setStatus("error");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/word-nebula/sessions?userId=${encodeURIComponent(userId)}&topic=${encodeURIComponent(topic)}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error(`Start failed: ${response.status}`);
      hydrate(await response.json());
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, [hydrate, topic, userId]);

  useEffect(() => {
    start();
  }, [start]);

  const advance = useCallback(async () => {
    if (!session || !activeQuestion) return;

    setVisitedIndices((current) => (
      current.includes(currentIndex) ? current : [...current, currentIndex]
    ));

    const response = await fetch(
      `${API_BASE}/word-nebula/sessions/${session.sessionId}/advance?userId=${encodeURIComponent(userId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: activeQuestion.id })
      }
    );
    if (!response.ok) throw new Error(`Advance failed: ${response.status}`);
    hydrate(await response.json());
  }, [activeQuestion, currentIndex, hydrate, session, userId]);

  const reset = useCallback(async () => {
    if (!session) return start();
    const response = await fetch(
      `${API_BASE}/word-nebula/sessions/${session.sessionId}/reset?userId=${encodeURIComponent(userId)}`,
      { method: "POST" }
    );
    if (!response.ok) throw new Error(`Reset failed: ${response.status}`);
    hydrate(await response.json());
  }, [hydrate, session, start, userId]);

  return { session, activeQuestion, currentIndex, visitedIndices, status, error, advance, reset };
}

function optionText(option) {
  if (typeof option === "string") return option.trim();
  return String(option?.text || "").trim();
}

function slug(text) {
  return String(text || "sparkle")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function assetPath(text) {
  return `/assets/images/word-nebula/cosmic-${slug(text)}.svg`;
}

function questionImage(question) {
  return question?.questionImageUrl || question?.imageCue || assetPath(question?.answer);
}

function questionPrompt(question) {
  const prompt = String(question?.promptText || "").trim();
  if (prompt) return prompt;
  return promptFallbacks[question?.promptType] || "Find the match!";
}

function targetTitle(question) {
  const payload = question?.payload || {};
  const phoneme = payload.phoneme || payload.rime || question?.audioCue?.split("/").pop();
  const target = phoneme || payload.uppercase || payload.target;
  if (!target) return "";
  
  if (String(target).toLowerCase() === String(question?.answer || "").toLowerCase() && String(target).length > 1) {
    return "";
  }
  
  return `TARGET: ${String(target).replaceAll("/", "")}`;
}

function gameEngineType(question) {
  return question?.gameEngineType || question?.engineKey || "ROCKET_MATCH_MAZE";
}

function isCorrectAnswer(question, option) {
  return optionText(option).toLowerCase() === String(question?.answer || "").trim().toLowerCase();
}

function WordNebulaGame({ userId, onExit, onAnswer }) {
  const { session, activeQuestion, currentIndex, visitedIndices, status, error, advance, reset } = useWordNebulaSession(userId);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answerState, setAnswerState] = useState("idle");
  const [hintPulse, setHintPulse] = useState(0);
  const [musicReady, setMusicReady] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef(null);
  const audioFailedRef = useRef(false);
  const audioContextRef = useRef(null);
  const synthMasterRef = useRef(null);
  const melodyTimerRef = useRef(null);
  const synthStepRef = useRef(0);
  const engine = gameEngineType(activeQuestion);
  const total = session?.activeQuestionIds?.length || 50;
  const progress = `${visitedIndices.length}/${total}`;

  const applyAudioLevels = useCallback((nextVolume, nextMuted) => {
    const safeVolume = Math.min(1, Math.max(0, Number(nextVolume)));
    if (audioRef.current) {
      audioRef.current.volume = safeVolume;
      audioRef.current.muted = nextMuted;
    }
    if (synthMasterRef.current) {
      synthMasterRef.current.gain.value = nextMuted ? 0 : 0.12 * safeVolume;
    }
  }, []);

  const playSynthNote = useCallback(() => {
    const context = audioContextRef.current;
    const master = synthMasterRef.current;
    if (!context || !master) return;

    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 739.99, 880, 739.99];
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(melody[synthStepRef.current % melody.length], now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.8, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(now);
    oscillator.stop(now + 0.36);
    synthStepRef.current += 1;
  }, []);

  const stopSynthLoop = useCallback(() => {
    if (melodyTimerRef.current) {
      window.clearInterval(melodyTimerRef.current);
      melodyTimerRef.current = null;
    }
  }, []);

  const startSynthMusic = useCallback(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!audioContextRef.current) {
      const context = new AudioContextClass();
      const master = context.createGain();
      master.gain.value = muted ? 0 : 0.12 * volume;
      master.connect(context.destination);
      audioContextRef.current = context;
      synthMasterRef.current = master;
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }

    if (!melodyTimerRef.current) {
      playSynthNote();
      melodyTimerRef.current = window.setInterval(playSynthNote, 380);
    }

    setMusicReady(true);
    setMusicPlaying(true);
    return true;
  }, [muted, playSynthNote, volume]);

  const pauseSynthMusic = useCallback(() => {
    stopSynthLoop();
    setMusicPlaying(false);
  }, [stopSynthLoop]);

  const closeSynthMusic = useCallback(() => {
    stopSynthLoop();
    synthMasterRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, [stopSynthLoop]);

  const playMusic = useCallback(async () => {
    const gameAudio = audioRef.current;
    if (!gameAudio || audioFailedRef.current) return startSynthMusic();

    try {
      await gameAudio.play();
      setMusicReady(true);
      setMusicPlaying(true);
      return true;
    } catch {
      if (gameAudio.error) {
        audioFailedRef.current = true;
        return startSynthMusic();
      }
      setMusicReady(false);
      setMusicPlaying(false);
      return false;
    }
  }, [startSynthMusic]);

  const pauseMusic = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    pauseSynthMusic();
    setMusicPlaying(false);
  }, [pauseSynthMusic]);

  const unlockMusic = useCallback(() => {
    if (!musicPlaying) playMusic();
  }, [musicPlaying, playMusic]);

  useEffect(() => {
    const gameAudio = new Audio(BGM_SRC);
    gameAudio.loop = true;
    gameAudio.preload = "auto";
    gameAudio.volume = DEFAULT_VOLUME;
    gameAudio.muted = false;
    audioRef.current = gameAudio;
    audioFailedRef.current = false;

    const handleAudioError = () => {
      audioFailedRef.current = true;
      setMusicReady(false);
      setMusicPlaying(false);
    };

    gameAudio.addEventListener("error", handleAudioError);
    gameAudio.play()
      .then(() => {
        setMusicReady(true);
        setMusicPlaying(true);
      })
      .catch(() => {
        setMusicReady(false);
        setMusicPlaying(false);
      });

    return () => {
      gameAudio.removeEventListener("error", handleAudioError);
      gameAudio.pause();
      gameAudio.currentTime = 0;
      gameAudio.src = "";
      audioRef.current = null;
      audioFailedRef.current = false;
      closeSynthMusic();
      setMusicPlaying(false);
    };
  }, [closeSynthMusic]);

  useEffect(() => {
    applyAudioLevels(volume, muted);
  }, [applyAudioLevels, muted, volume]);

  const togglePlayback = useCallback(() => {
    if (musicPlaying) {
      pauseMusic();
      return;
    }
    playMusic();
  }, [musicPlaying, pauseMusic, playMusic]);

  const toggleVolumeDrawer = useCallback(() => {
    setShowVolumeSlider((current) => !current);
    if (!musicPlaying) playMusic();
  }, [musicPlaying, playMusic]);

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      const nextMuted = !current;
      applyAudioLevels(volume, nextMuted);
      return nextMuted;
    });
    if (!musicPlaying) playMusic();
  }, [applyAudioLevels, musicPlaying, playMusic, volume]);

  const handleVolumeChange = useCallback((event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    if (nextVolume > 0 && muted) {
      setMuted(false);
      applyAudioLevels(nextVolume, false);
      return;
    }
    applyAudioLevels(nextVolume, muted);
    if (!musicPlaying) playMusic();
  }, [applyAudioLevels, muted, musicPlaying, playMusic]);

  useEffect(() => {
    setSelectedAnswer("");
    setAnswerState("idle");
    setHintPulse(0);
  }, [activeQuestion?.id]);

  const handleAnswer = useCallback(
    async (option) => {
      unlockMusic();
      if (!activeQuestion || answerState === "correct") return;

      const answerText = optionText(option);
      const correct = isCorrectAnswer(activeQuestion, option);
      setSelectedAnswer(answerText);
      onAnswer?.({
        questionId: activeQuestion.id,
        gameEngineType: engine,
        answer: answerText,
        correct,
        expectedAnswer: activeQuestion.answer
      });

      if (!correct) {
        setAnswerState("wrong");
        setHintPulse((value) => value + 1);
        window.setTimeout(() => {
          setAnswerState("idle");
          setSelectedAnswer("");
        }, WRONG_RESET_DELAY);
        return;
      }

      setAnswerState("correct");
      window.setTimeout(async () => {
        try {
          await advance();
        } catch (err) {
          setAnswerState("idle");
          setSelectedAnswer("");
          console.error(err);
        }
      }, CORRECT_ADVANCE_DELAY);
    },
    [activeQuestion, advance, answerState, engine, onAnswer, unlockMusic]
  const playQuestionAudio = useCallback(() => {
    if (!("speechSynthesis" in window) || !activeQuestion) return;
    
    // Pause background music
    if (audioRef.current) audioRef.current.pause();
    pauseSynthMusic();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questionPrompt(activeQuestion));
    utterance.rate = 0.9;
    utterance.pitch = 1.25;
    utterance.volume = volume;
    
    utterance.onend = () => {
      // Resume music
      if (musicPlaying) {
        if (audioRef.current && !audioFailedRef.current) {
          audioRef.current.play().catch(() => {});
        } else {
          startSynthMusic();
        }
      }
    };
    utterance.onerror = utterance.onend;
    
    window.speechSynthesis.speak(utterance);
  }, [activeQuestion, musicPlaying, pauseSynthMusic, startSynthMusic, volume]);

  return (
    <div
      className="relative h-[100dvh] max-h-[100dvh] w-screen max-w-full overflow-hidden bg-[#050713] text-starWhite"
      onClickCapture={unlockMusic}
      onPointerDownCapture={unlockMusic}
    >
      <NebulaBackdrop />

      <header className="relative z-30 mx-auto grid h-14 max-h-14 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-2 sm:h-16 sm:max-h-16 sm:px-4">
        <button
          onClick={onExit}
          className="neon-btn cyan h-9 min-h-0 rounded-lg px-2 py-0 text-[11px] sm:h-10 sm:px-3"
          aria-label="Exit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Exit</span>
        </button>
        <div className="flex min-w-0 items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-cyanGlow drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
          <div className="h-2 w-20 overflow-hidden rounded-full border border-cyanGlow/40 bg-white/10 sm:w-36 md:w-44">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyanGlow via-limeGlow to-pinkGlow"
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: `${Math.min(100, (visitedIndices.length / total) * 100)}%` }}
            />
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <AudioMixer
            muted={muted}
            volume={volume}
            musicReady={musicReady}
            musicPlaying={musicPlaying}
            showVolumeSlider={showVolumeSlider}
            onTogglePlayback={togglePlayback}
            onToggleVolumeDrawer={toggleVolumeDrawer}
            onToggleMuted={toggleMuted}
            onVolumeChange={handleVolumeChange}
          />
          <div className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-300/20 via-purple-500/20 to-fuchsia-950/50 px-2.5 py-1.5 text-center shadow-[0_0_18px_rgba(251,191,36,0.28)]">
            <p className="text-[11px] font-black leading-none text-amber-50">{progress}</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] w-full max-w-7xl overflow-hidden px-2 pb-2 sm:h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-4rem)] sm:px-4">
        {status === "loading" && <LoadingConsole />}
        {status === "error" && <ErrorConsole error={error} onRetry={reset} />}
        {activeQuestion && (
          <VisualMatchScene
            question={activeQuestion}
            currentIndex={currentIndex}
            selectedAnswer={selectedAnswer}
            answerState={answerState}
            hintPulse={hintPulse}
            onAnswer={handleAnswer}
            onReset={reset}
            onPlayAudio={playQuestionAudio}
          />
        )}
      </main>

      <style>{`
        @keyframes wordNebulaShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          16% { transform: translateX(-12px) rotate(-5deg); }
          32% { transform: translateX(10px) rotate(4deg); }
          48% { transform: translateX(-9px) rotate(-4deg); }
          64% { transform: translateX(8px) rotate(3deg); }
          82% { transform: translateX(-4px) rotate(-2deg); }
        }
        @keyframes wordNebulaHint {
          0% { opacity: .15; transform: scale(.72); }
          42% { opacity: .92; transform: scale(1.08); }
          100% { opacity: .2; transform: scale(1.28); }
        }
        @keyframes wordNebulaTwinkle {
          0%, 100% { opacity: .28; transform: scale(.82); }
          50% { opacity: 1; transform: scale(1.14); }
        }
        .word-nebula-shake { animation: wordNebulaShake .48s ease-in-out; }
        .word-nebula-hint { animation: wordNebulaHint .72s ease-out; }
        .word-nebula-twinkle { animation: wordNebulaTwinkle 2.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function AudioMixer({
  muted,
  volume,
  musicReady,
  musicPlaying,
  showVolumeSlider,
  onTogglePlayback,
  onToggleVolumeDrawer,
  onToggleMuted,
  onVolumeChange
}) {
  const VolumeIcon = muted || volume === 0 ? VolumeX : Volume2;
  const PlayIcon = musicPlaying ? Pause : Play;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onTogglePlayback}
        className="neon-btn cyan min-h-11 w-11 justify-center p-0"
        aria-label={musicPlaying ? "Pause music" : "Play music"}
      >
        <PlayIcon className="h-5 w-5" />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={onToggleVolumeDrawer}
          className="neon-btn lime min-h-11 w-11 justify-center p-0"
          aria-label="Open volume control"
        >
          <VolumeIcon className="h-5 w-5" />
        </button>

        {showVolumeSlider && (
          <label className="absolute right-0 top-14 grid w-56 gap-2 rounded-2xl border border-limeGlow/40 bg-black/80 p-3 text-xs font-black text-limeGlow shadow-lime backdrop-blur z-50">
            <span>{Math.round((muted ? 0 : volume) * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={onVolumeChange}
              onInput={onVolumeChange}
              aria-label="Music volume"
              className="h-2 w-full accent-limeGlow"
            />
          </label>
        )}
      </div>
    </div>
  );
}

function QuestionBanner({ question, status, onPlayAudio }) {
  const text = question ? questionPrompt(question) : status === "loading" ? "Loading stars..." : "Find the match!";

  return (
    <div className="relative z-20 mx-auto flex h-14 w-full shrink-0 items-center justify-center px-12 sm:h-16 gap-2">
      <div className="relative flex h-11 w-full max-w-4xl items-center justify-center overflow-hidden rounded-xl border border-cyanGlow/40 bg-black/55 px-4 text-center shadow-[0_0_24px_rgba(34,211,238,0.28)] backdrop-blur-md sm:h-12">
        <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyanGlow to-transparent" />
        <Sparkles className="mr-2 h-4 w-4 shrink-0 text-limeGlow drop-shadow-[0_0_10px_rgba(167,255,60,0.82)]" />
        <p className="min-w-0 truncate text-sm font-black uppercase tracking-normal text-cyan-50 drop-shadow-[0_0_12px_rgba(34,211,238,0.78)] sm:text-base md:text-lg">
          {text}
        </p>
      </div>
      {onPlayAudio && (
        <button 
          className="neon-btn yellow min-h-11 w-11 justify-center p-0 rounded-full shrink-0"
          onClick={onPlayAudio}
          title="Read Question"
        >
          <Volume2 size={24} />
        </button>
      )}
    </div>
  );
}

function VisualMatchScene({ question, currentIndex, selectedAnswer, answerState, hintPulse, onAnswer, onReset, onPlayAudio }) {
  const options = question.options || [];

  return (
    <section className="relative grid h-full max-h-full grid-rows-[60%_40%] overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.22),transparent_18rem),radial-gradient(circle_at_12%_74%,rgba(255,43,214,0.18),transparent_14rem),linear-gradient(180deg,rgba(5,8,28,0.98),rgba(3,6,18,0.99))] px-2 py-2 shadow-[0_0_34px_rgba(34,211,238,0.24)] sm:px-4">
      <StarSprinkles />

      <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-cyanGlow">
          <span className="text-xs font-black">{currentIndex + 1}</span>
        </div>
      </div>
      <div className="absolute right-3 top-3 z-20">
        <button
          onClick={onReset}
          className="neon-btn pink h-8 min-h-0 rounded-lg px-2 py-0"
          aria-label="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="relative z-10 flex min-h-0 flex-col overflow-hidden">
        <QuestionBanner question={question} status="ready" onPlayAudio={onPlayAudio} />
        <div className="grid min-h-0 flex-1 place-items-center overflow-hidden px-2 pb-2">
          <QuestionPlanet question={question} answerState={answerState} hintPulse={hintPulse} />
        </div>
      </div>

      <div className="relative z-10 min-h-0 overflow-hidden px-1 pb-2 pt-1 sm:px-2 sm:pb-3 sm:pt-2">
        <div className="mx-auto flex h-full max-h-full w-full max-w-6xl items-center justify-center gap-3 overflow-hidden sm:gap-5 md:gap-7 lg:gap-9">
          {options.slice(0, 3).map((option, index) => {
            const text = optionText(option);
            const selected = selectedAnswer === text;
            const correct = isCorrectAnswer(question, option);
            return (
              <PlanetOption
                key={`${question.id}-${text}-${index}`}
                text={text}
                index={index}
                selected={selected}
                correct={correct}
                answerState={answerState}
                onClick={() => onAnswer(option)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function QuestionPlanet({ question, answerState, hintPulse }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [question.id]);
  const title = targetTitle(question);

  return (
    <motion.div
      className="relative grid h-full max-h-full min-h-0 w-full place-items-center"
      animate={{ y: [0, -5, 0], rotate: [-1, 1.5, -1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute h-56 w-72 rounded-full bg-cyanGlow/15 blur-3xl sm:h-64 sm:w-96 md:h-80 md:w-[34rem]"
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
      />
      {hintPulse > 0 && (
        <div
          key={hintPulse}
          className="word-nebula-hint absolute h-48 w-48 rounded-full border-4 border-amber-200/70 shadow-[0_0_42px_rgba(251,191,36,0.45)] sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72"
        />
      )}
      <div className={`relative grid aspect-square h-48 max-h-[calc(100%-0.75rem)] w-48 max-w-[calc(100vw-2rem)] grid-rows-[auto_minmax(0,1fr)] place-items-center rounded-full border bg-gradient-to-br from-cyan-200/20 via-sky-500/20 to-fuchsia-950/40 p-4 shadow-[inset_0_0_42px_rgba(255,255,255,0.14),0_0_46px_rgba(34,211,238,0.4)] sm:h-56 sm:w-56 sm:p-5 md:h-64 md:w-64 lg:h-72 lg:w-72 xl:h-80 xl:w-80 ${
        answerState === "correct" ? "border-limeGlow ring-4 ring-limeGlow/30" : "border-cyanGlow/40"
      }`}>
        <span className="absolute inset-3 rounded-full border border-white/15" />
        <span className="absolute left-1/2 top-1/2 h-10 w-[112%] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] rounded-full border border-white/20 bg-white/10 sm:h-12" />
        {title && (
          <div className="relative z-10 flex min-h-[2.1rem] w-[86%] items-center justify-center rounded-full bg-black/20 px-3 py-1 text-center backdrop-blur-sm sm:min-h-[2.35rem]">
            <p className="max-w-full whitespace-normal break-words text-center text-[clamp(0.9rem,1.9vh,1.25rem)] font-black uppercase leading-tight tracking-normal text-cyan-50 drop-shadow-[0_0_12px_rgba(34,211,238,0.95)]">
              {title}
            </p>
          </div>
        )}
        {!imgError && (
          <img
            src={questionImage(question)}
            alt=""
            aria-hidden="true"
            className="relative z-10 h-full w-full object-contain scale-[1.3] drop-shadow-[0_0_28px_rgba(255,255,255,0.78)]"
            draggable="false"
            onError={() => setImgError(true)}
          />
        )}
        {answerState === "correct" && (
          <CheckCircle2 className="absolute right-5 top-5 h-8 w-8 text-limeGlow drop-shadow-[0_0_14px_rgba(167,255,60,0.85)]" />
        )}
        <Sparkles className="absolute -left-1 bottom-10 h-7 w-7 text-pinkGlow drop-shadow-[0_0_12px_rgba(255,43,214,0.8)] sm:-left-2 sm:bottom-12" />
        <Satellite className="absolute -right-1 top-10 h-7 w-7 rotate-12 text-limeGlow drop-shadow-[0_0_12px_rgba(167,255,60,0.8)] sm:-right-2 sm:top-12" />
      </div>
    </motion.div>
  );
}

function PlanetOption({ text, index, selected, correct, answerState, onClick }) {
  const skin = planetSkins[index % planetSkins.length];
  const isWrongTap = selected && answerState === "wrong" && !correct;
  const isCorrectTap = selected && answerState === "correct" && correct;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={answerState === "correct"}
      className={`group relative grid aspect-square h-32 max-h-[calc(100%-0.75rem)] w-32 max-w-[31vw] shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br text-center transition duration-200 hover:brightness-125 active:scale-95 disabled:cursor-wait sm:h-40 sm:w-40 md:h-48 md:w-48 lg:h-56 lg:w-56 ${skin} ${
        isWrongTap ? "word-nebula-shake ring-4 ring-amber-200/90 brightness-125" : ""
      } ${isCorrectTap ? "scale-105 ring-4 ring-limeGlow/90" : ""}`}
      animate={{ y: [0, -4, 0], rotate: [0, 1.6, 0] }}
      transition={{ duration: 4.4 + index * 0.25, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
      whileHover={{ scale: 1.04 }}
      style={{ animationDelay: `${index * 0.24}s` }}
      aria-label={`Choose ${text}`}
    >
      <span className="absolute inset-3 rounded-full border border-white/25" />
      <span className="absolute -right-1 top-1/2 h-8 w-[62%] -translate-y-1/2 rotate-12 rounded-full border border-white/20 bg-white/10 sm:h-10" />
      <span className="relative z-10 flex h-[74%] w-[82%] items-center justify-center text-center text-[clamp(1.15rem,4.2vw,3.15rem)] font-black leading-none text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.72)]">
        <span className="block max-w-full break-words leading-none">{text}</span>
      </span>
    </motion.button>
  );
}

function StarSprinkles() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-70">
      {Array.from({ length: 34 }).map((_, index) => (
        <span
          key={index}
          className="word-nebula-twinkle absolute h-1 w-1 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
          style={{
            left: `${(index * 37) % 98}%`,
            top: `${(index * 53) % 92}%`,
            animationDelay: `${(index % 7) * 0.28}s`
          }}
        />
      ))}
    </div>
  );
}

function NebulaBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(34,211,238,0.22),transparent_18rem),radial-gradient(circle_at_82%_12%,rgba(255,43,214,0.2),transparent_20rem),radial-gradient(circle_at_55%_96%,rgba(167,255,60,0.12),transparent_22rem),linear-gradient(180deg,#050713,#030612)]" />
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_12px_12px,rgba(255,255,255,.8)_1px,transparent_2px),radial-gradient(circle_at_40px_34px,rgba(34,211,238,.8)_1px,transparent_2px)] [background-size:86px_86px]" />
      <Star className="absolute left-[8%] top-[18%] h-5 w-5 text-cyanGlow opacity-80 drop-shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
      <Star className="absolute right-[11%] top-[30%] h-4 w-4 text-pinkGlow opacity-80 drop-shadow-[0_0_14px_rgba(255,43,214,0.9)]" />
      <Sparkles className="absolute bottom-[12%] left-[18%] h-5 w-5 text-limeGlow opacity-80 drop-shadow-[0_0_14px_rgba(167,255,60,0.9)]" />
    </div>
  );
}

function LoadingConsole() {
  return (
    <div className="grid h-full place-items-center rounded-xl border border-cyanGlow/30 bg-black/50 p-6 shadow-[0_0_34px_rgba(34,211,238,0.24)]">
      <Orbit className="h-8 w-8 animate-spin text-cyanGlow" />
    </div>
  );
}

function ErrorConsole({ error, onRetry }) {
  return (
    <div className="grid h-full place-items-center rounded-xl border border-red-400/40 bg-red-950/30 p-6 text-center shadow-[0_0_28px_rgba(248,113,113,0.25)]">
      <div className="grid justify-items-center gap-3">
        <p className="text-sm font-black text-red-100">{error}</p>
        <button onClick={onRetry} className="neon-btn pink h-10 min-h-0 px-3 py-0">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default WordNebulaGame;
