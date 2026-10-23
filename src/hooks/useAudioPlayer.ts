import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { audioEngine } from '../services/audioEngine';
import { getFullAudioUrl } from '../services/audioStreamService';
import { tauriBridge } from '../services/tauriBridge';
import { androidBridge } from '../services/androidBridge';
import { useMediaSession } from './useMediaSession';

/**
 * Custom hook to bridge the Zustand player state with the HTML5 / Web Audio Engine.
 * Handles event listeners for progress, track completion, volume changes, and DSP equalization.
 */
export function useAudioPlayer() {
  // Synchronize OS-level MediaSession (Lock Screen, Notification Drawer, Media Keys)
  useMediaSession();

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    eqBands,
    bitPerfect,
    next,
    setCurrentTime,
    setDuration,
  } = usePlayerStore();

  const prevSongIdRef = useRef<string | null>(null);

  // Initialize Windows SMTC, Android Status Bar & Multimedia Controls
  useEffect(() => {
    tauriBridge.init();
    androidBridge.init();
    return () => {
      tauriBridge.destroy();
    };
  }, []);

  // Sync Audio Playback source and play/pause with full length stream resolution
  useEffect(() => {
    let isCancelled = false;

    if (!currentSong) {
      audioEngine.pause();
      return;
    }

    const isNewSong = prevSongIdRef.current !== currentSong.id;
    prevSongIdRef.current = currentSong.id;

    if (isNewSong) {
      if (isPlaying) {
        // Resolve full-length audio stream asynchronously, bypassing 30s snippets
        getFullAudioUrl(currentSong).then((fullUrl) => {
          if (!isCancelled) {
            audioEngine.play(fullUrl);
          }
        });
      }
    } else {
      if (isPlaying) {
        audioEngine.play();
      } else {
        audioEngine.pause();
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [currentSong, isPlaying]);

  // Sync Volume & Mute
  useEffect(() => {
    audioEngine.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Sync 10-band Equalizer (bypassed if Bit-Perfect DAC mode is enabled)
  useEffect(() => {
    eqBands.forEach((band) => {
      const targetGain = bitPerfect ? 0 : band.gain;
      audioEngine.setEqBand(band.frequency, targetGain);
    });
  }, [eqBands, bitPerfect]);

  // Attach HTMLAudioElement events
  useEffect(() => {
    const audio = audioEngine.getAudioElement();
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      next();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [next, setCurrentTime, setDuration]);

  return {
    currentSong,
    isPlaying,
    currentTime,
    volume,
    isMuted,
  };
}
