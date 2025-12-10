"use client";

import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import WarpBackground from "@/components/WarpBackground";
import { useMusicReactive } from "@/hooks/useMusicReactive";
import { useMobile } from "@/hooks/useMobile"; // NEW HOOK

export default function InvitacionAnabellaPablo() {
    const [entrar, setEntrar] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { initAudio } = useMusicReactive();
    const isMobile = useMobile(); // DETECT MOBILE

    // RSVP STATE
    const [nombre, setNombre] = useState("");
    const [enviado, setEnviado] = useState(false);
    const [loading, setLoading] = useState(false);

    // GLOW REF FOR AUDIO REACTION
    const glowRef = useRef<HTMLDivElement>(null);

    // SYNC AUDIO DATA TO WINDOW FOR THREEJS & DOM
    useEffect(() => {
        // FORCE SCROLL TO TOP ON LOAD
        window.scrollTo(0, 0);

        (window as any).__onMusicFrame = (data: { low: number, mid: number, high: number, total: number }) => {
            // Guardar para Three.js
            (window as any).__musicData = data;

            // DOM Updates (Glow)
            if (glowRef.current) {
                // Opacidad base + energía
                const opacity = 0.25 + (data.total / 900);
                const blur = 2 + (data.total / 50); // px

                glowRef.current.style.opacity = Math.min(0.8, opacity).toString();
                glowRef.current.style.filter = `blur(${blur}px)`;

                // Efecto "It's raining" (Estribillo detectado por energía alta en mix)
                if (data.mid > 90 && data.high > 70) {
                    glowRef.current.style.opacity = "0.55";
                    glowRef.current.style.filter = `blur(6px)`;
                    glowRef.current.style.boxShadow = `0 0 50px rgba(247, 37, 133, ${data.total / 300})`;
                } else {
                    glowRef.current.style.boxShadow = "none";
                }
            }
        };
    }, []);

    const activarMusica = () => {
        setEntrar(true);
        // FORCE SCROLL TOP WHEN ENTERING
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (audioRef.current) {
            audioRef.current.muted = false;
            audioRef.current.play().then(() => {
                initAudio(audioRef.current!);
            }).catch(e => console.log("Audio play failed:", e));
        }
    };

    import { submitRSVP } from "./actions"; // Import Server Action

    // ... inside component ...

    const enviarAsistencia = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;

        setLoading(true);

        try {
            // Usamos Server Action
            const formData = new FormData();
            formData.append('nombre', nombre);

            const result = await submitRSVP(formData);

            if (result.success) {
                setEnviado(true);
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Error al enviar", error);
            alert("Hubo un drama con el envío. ¡Avisanos por WhatsApp!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[100dvh] overflow-hidden bg-black text-white font-sans selection:bg-fuchsia-500 selection:text-white">

            {/* CANVAS 3D FONDO */}
            <div className="absolute inset-0 z-0 text-white">
                <Canvas
                    dpr={isMobile ? 1 : [1, 1.5]} // MOBILE: estricto 1. DESKTOP: hasta 1.5
                    gl={{ antialias: false, powerPreference: "high-performance" }} // AA off gana muchos FPS y el Bloom lo disimula
                    camera={{ position: [0, 0, 50], fov: 75 }}
                    style={{ width: '100%', height: '100%' }}
                >
                    <WarpBackground isMobile={isMobile} />
                </Canvas>
            </div>

            {/* CSS STARS LAYER (Always active for texture on Desktop, hidden on Mobile) */}
            <div className="pointer-events-none absolute inset-0 bg-stars mix-blend-screen opacity-60 hidden md:block" aria-hidden="true" />

            {/* REACTIVE GLOW OVERLAY */}
            <div
                ref={glowRef}
                className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-fuchsia-900/20 via-transparent to-cyan-900/20 mix-blend-screen transition-all duration-100 ease-out"
            />

            {/* AUDIO */}
            <audio
                ref={audioRef}
                src="/audio/ButNotTonight.mp3"
                loop
                muted
                playsInline
                crossOrigin="anonymous" // Necesario para Web Audio API
            />

            {/* OVERLAY DE ENTRADA */}
            {!entrar && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-center px-6 z-50">
                    <div className="mb-6 text-xs uppercase tracking-[0.35em] text-fuchsia-400 animate-pulse">
                        Fiesta de Anabella 100% · Acceso concedido
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extralight tracking-[0.1em] mb-6 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 via-white to-cyan-200">
                        Fiesta My Darling Kittie
                    </h1>
                    <p className="text-sm md:text-base text-slate-400 mb-10 tracking-widest">
                        Cumpleaños de Kittie y Versión 1.0 del Depto  Hogar de Anabella & Pablo
                    </p>
                    <button
                        onClick={activarMusica}
                        className="group relative px-10 py-4 rounded-full border border-fuchsia-500/50 bg-black/50 text-sm md:text-lg font-light tracking-[0.2em] shadow-[0_0_30px_rgba(244,114,182,0.3)] hover:bg-fuchsia-900/20 hover:shadow-[0_0_50px_rgba(244,114,182,0.6)] hover:border-fuchsia-400 transition-all duration-500 cursor-pointer overflow-hidden"
                    >
                        <span className="relative z-10">ENTRAR CON MÚSICA</span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent transition-transform duration-700" />
                    </button>
                </div>
            )}

            {/* CONTENIDO PRINCIPAL */}
            <div
                className={`relative z-10 min-h-[100dvh] flex items-center justify-center transition-opacity duration-[1500ms] ease-in-out ${entrar ? "opacity-100" : "opacity-0"
                    } `}
            >
                <div className="relative max-w-2xl mx-auto px-6 py-20 pb-40">
                    {/* CARD PRINCIPAL FROSTED */}
                    <div className="relative rounded-[2rem] border border-white/5 bg-black/40 backdrop-blur-xl px-8 py-12 md:px-12 md:py-16 shadow-[0_0_60px_rgba(0,0,0,0.8)]">

                        {/* DECORACIÓN SUPERIOR */}
                        <div className="flex justify-between items-center mb-8 opacity-60">
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-ping" />
                                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.4em]">System Ready</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-thin tracking-wider mb-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            Fiesta My Darling Kittie
                        </h2>

                        <p className="text-sm md:text-base uppercase tracking-[0.25em] text-cyan-200/80 mb-8 border-b border-white/10 pb-8">
                            Retro 80s/90s, Depeche Mode flotando en el aire
                        </p>

                        <div className="space-y-6 text-slate-200 font-light leading-relaxed text-lg text-center md:text-left">
                            <p>
                                <span className="text-fuchsia-300">Bienvenidx a la web donde empieza la fiesta.</span><br />
                                Retro 70s/80s/90s y Depeche Mode flotando en el aire con buena vibra y 5 michis.
                            </p>
                            <p>
                                Scrolleá, bailá, vení. <br />
                                Este update lo instalamos juntxs.
                            </p>
                        </div>

                        {/* LISTA DE ACTIVIDADES */}
                        <div className="mt-12 grid gap-4 text-sm md:text-base text-left bg-white/5 p-6 rounded-2xl border border-white/5 mx-[-1rem] md:mx-0">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">✨</span>
                                <p>Habrá comida vegana</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-xl">🍾</span>
                                <p>Podés traer lo que quieras tomar</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-xl">💿</span>
                                <p>Música 70s/ 80s / 90s / Depeche Mode / And One vibes</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-xl">🎥</span>
                                <p>Proyector con visuales retro &amp; loops estéticos</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-xl">💃</span>
                                <p>Caño habilitado para quien quiera subir a brillar</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-xl">🪢</span>
                                <p>Habrá cuerdas Shibari disponibles para nudos estéticos ( espacio cuidado )</p>
                            </div>
                        </div>

                        {/* INFO FECHA */}
                        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left border-t border-white/10 pt-8">
                            <div>
                                <p className="text-2xl font-light text-white">20 de Diciembre</p>
                                <p className="text-sm uppercase tracking-widest text-slate-400">10:30 PM</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-cyan-300">Avenida Santa Fe 2982</p>
                                <p className="text-xs text-slate-500">Piso 5, Depto I</p>
                            </div>
                        </div>

                        {/* FORMULARIO DE ASISTENCIA */}
                        <div className="mt-12 pt-8 border-t border-white/10">
                            <h3 className="text-center text-xs uppercase tracking-[0.4em] mb-6 text-fuchsia-400">
                                Confirmar Asistencia
                            </h3>

                            {enviado ? (
                                <div className="p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 text-center animate-pulse">
                                    <p className="text-green-200 font-semibold tracking-widest text-lg">
                                        ACCESO CONFIRMADO
                                    </p>
                                    <p className="text-[10px] text-green-400/60 mt-2 font-mono">
                                        ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={enviarAsistencia} className="flex flex-col gap-4 max-w-sm mx-auto">
                                    <input
                                        type="text"
                                        placeholder="Ingresá tu nombre..."
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="w-full px-6 py-4 rounded-full bg-black/50 border border-white/20 text-white placeholder-white/30 text-center focus:outline-none focus:border-fuchsia-500 focus:shadow-[0_0_20px_rgba(247,37,133,0.3)] transition-all"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold tracking-widest hover:from-fuchsia-500 hover:to-purple-500 hover:shadow-[0_0_30px_rgba(247,37,133,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
                                    >
                                        {loading ? "PROCESANDO..." : "ASISTIR AL EVENTO"}
                                    </button>
                                </form>
                            )}
                        </div>

                    </div>
                </div>

                {/* FOOTER */}
                <div className="fixed bottom-4 left-0 right-0 text-center pointer-events-none opacity-50 z-0">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-cyan-900/40">Synthewave Invite v2.0</p>
                </div>
            </div>
        </div>
    );
}
