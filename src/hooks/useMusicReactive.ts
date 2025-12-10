import { useEffect, useRef } from "react";

// Extend window interface to store music data globally for Three.js perfromance
declare global {
    interface Window {
        __onMusicFrame?: (data: {
            low: number;
            mid: number;
            high: number;
            total: number;
        }) => void;
    }
}

export function useMusicReactive() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number>(0);

    const initAudio = (audioElement: HTMLAudioElement) => {
        if (audioContextRef.current) return;

        // 1. Crear Contexto
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        audioContextRef.current = ctx;

        // 2. Crear Analyser
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256; // 128 bins
        analyserRef.current = analyser;

        // 3. Conectar al elemento de audio
        if (!sourceRef.current) {
            const source = ctx.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(ctx.destination);
            sourceRef.current = source;
        }

        // 4. Loop de análisis
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const analyze = () => {
            analyser.getByteFrequencyData(dataArray);

            // Low: bins 0-8 (~0-700Hz)
            const low = dataArray.slice(0, 8).reduce((a, b) => a + b, 0) / 8;

            // Mid: bins 8-40 (~700-3.5kHz)
            const mid = dataArray.slice(8, 40).reduce((a, b) => a + b, 0) / 32;

            // High: bins 40-80 (~3.5kHz - 7kHz)
            const high = dataArray.slice(40, 80).reduce((a, b) => a + b, 0) / 40;

            // Total energy
            const total = dataArray.reduce((a, b) => a + b, 0) / bufferLength;

            // Enviar a Three.js (si existe el listener)
            if (window.__onMusicFrame) {
                window.__onMusicFrame({ low, mid, high, total });
            }

            animationFrameRef.current = requestAnimationFrame(analyze);
        };

        analyze();
    };

    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return { initAudio, audioContextRef };
}
