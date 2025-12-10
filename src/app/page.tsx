"use client";

import { useState, useRef } from "react";

export default function InvitacionAnabellaPablo() {
    const [entrar, setEntrar] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [nombre, setNombre] = useState("");
    const [enviado, setEnviado] = useState(false);
    const [loading, setLoading] = useState(false);

    const activarMusica = () => {
        setEntrar(true);
        if (audioRef.current) {
            audioRef.current.muted = false;
            audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
    };

    const enviarAsistencia = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;

        setLoading(true);

        // Usamos FormSubmit.co para enviar emails sin backend
        try {
            await fetch("https://formsubmit.co/ajax/pangarano@gmail.com", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    Nombre: nombre,
                    _subject: "Confirmación Fiesta Kittie ✨",
                    _cc: "fanabellaf@gmail.com",
                    _template: "table",
                    _captcha: "false"
                })
            });

            setEnviado(true);
        } catch (error) {
            console.error("Error al enviar", error);
            alert("Hubo un drama con el envío. ¡Avisanos por WhatsApp!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-slate-950 to-[#14001F] text-white font-sans">
            {/* CAPA ESTRELLAS TIPO LUMA */}
            <div
                className="pointer-events-none absolute inset-0 bg-stars mix-blend-screen"
                aria-hidden="true"
            />

            {/* GLOWS NEÓN */}
            <div
                className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.45),transparent_60%)] blur-3xl"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute bottom-[-10rem] left-[-5rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.4),transparent_60%)] blur-3xl"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.4),transparent_60%)] blur-3xl"
                aria-hidden="true"
            />

            {/* AUDIO */}
            <audio
                ref={audioRef}
                src="/audio/ButNotTonight.mp3"
                autoPlay
                loop
                muted
                playsInline
            />

            {/* OVERLAY DE ENTRADA */}
            {!entrar && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-center px-6 z-50">
                    <div className="mb-6 text-xs uppercase tracking-[0.35em] text-fuchsia-300">
                        Fiesta My Darling Kittie 100% · Acceso concedido
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light tracking-[0.25em] mb-4">
                        Fiesta My Darling Kittie
                    </h1>
                    <p className="text-sm md:text-base opacity-80 mb-8">
                        Tocá para entrar a la invitación <br /> con música y neón.
                    </p>
                    <button
                        onClick={activarMusica}
                        className="px-8 py-3 rounded-full border border-fuchsia-400 bg-fuchsia-500/10 text-sm md:text-base font-semibold tracking-wide shadow-[0_0_25px_rgba(244,114,182,0.9)] hover:bg-fuchsia-500/20 hover:shadow-[0_0_40px_rgba(244,114,182,1)] transition cursor-pointer"
                    >
                        Entrar con música
                    </button>
                </div>
            )}

            {/* CONTENIDO PRINCIPAL */}
            <div
                className={`relative flex items-center justify-center min-h-screen transition-opacity duration-700 ${entrar ? "opacity-100" : "opacity-0"
                    } `}
            >
                <div className="relative max-w-xl mx-auto px-6 py-16 md:py-24">
                    {/* CARD PRINCIPAL */}
                    <div className="relative rounded-3xl border border-white/10 bg-black/55 backdrop-blur-xl px-6 py-10 md:px-10 md:py-12 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
                        {/* BARRITA TOP */}
                        <div className="flex items-center gap-2 mb-6 text-[10px] uppercase tracking-[0.3em] text-sky-200/80">
                            <span className="h-[6px] w-[6px] rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(244,114,182,1)]" />
                            <span className="h-[6px] w-[6px] rounded-full bg-sky-400/80" />
                            <span className="h-[6px] w-[6px] rounded-full bg-emerald-300/80" />
                            <span className="ml-2">Fiesta My Darling Kittie 100% · Acceso concedido</span>
                        </div>

                        <h2 className="text-xl md:text-2xl font-light tracking-[0.22em] mb-4 text-fuchsia-100">
                            … Fiesta My Darling Kittie 100%
                        </h2>

                        <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-slate-300/80">
                            Cumpleaños de Kittie y Versión 1.0 del Depto · Hogar de Anabella &amp; Pablo
                        </p>

                        <p className="mt-6 text-sm md:text-base leading-relaxed opacity-95">
                            <span className="block text-sm md:text-base font-semibold mb-2 text-sky-100">
                                Bienvenidx a la web donde empieza la fiesta.
                            </span>
                            Retro 70s/80s/90s y Depeche Mode flotando en el aire con buena vibra y 5 michis.
                            <br />
                            <br />
                            Scrolleá, bailá, vení. Este update lo instalamos juntxs.
                        </p>

                        <div className="mt-8 grid gap-2 text-sm md:text-base opacity-95 text-left">
                            <p>✨ Habrá comida vegana</p>
                            <p>🍾 Podés traer lo que quieras tomar</p>
                            <p>💿 Música 70s/ 80s / 90s / Depeche Mode / And One vibes</p>
                            <p>🎥 Proyector con visuales retro &amp; loops estéticos</p>
                            <p>💃 Caño habilitado para quien quiera subir a brillar</p>
                            <p>🪢 Habrá cuerdas disponibles para nudos estéticos (actividad opcional y en espacio cuidado)</p>
                        </div>

                        <div className="mt-8 grid gap-2 text-sm md:text-base text-left">
                            <p>
                                📍{" "}
                                <span className="font-semibold">
                                    Avenida Santa Fe 2982 – Piso 5, Depto I
                                </span>
                            </p>
                            <p>
                                📅 <span className="font-semibold">20 de diciembre</span>
                            </p>
                            <p>
                                ⏰ <span className="font-semibold">10:30 PM</span>
                            </p>
                        </div>

                        {/* FORMULARIO DE ASISTENCIA */}
                        <div className="mt-10 flex flex-col items-center gap-4">
                            {enviado ? (
                                <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/50 text-center animate-pulse">
                                    <p className="text-green-200 font-semibold tracking-wide">
                                        ¡Confirmado! Nos vemos ahí.
                                    </p>
                                    <p className="text-xs text-green-300/70 mt-1 uppercase tracking-widest">
                                        Access Granted
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={enviarAsistencia} className="flex flex-col items-center gap-3 w-full max-w-xs">
                                    <input
                                        type="text"
                                        placeholder="Tu nombre aquí..."
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="w-full px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 text-center focus:outline-none focus:border-fuchsia-400 focus:bg-white/20 transition"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-8 py-3 rounded-full border border-sky-400/80 bg-sky-500/10 text-sm md:text-base font-semibold tracking-wide shadow-[0_0_22px_rgba(56,189,248,0.9)] hover:bg-sky-500/20 hover:shadow-[0_0_38px_rgba(56,189,248,1)] disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {loading ? "Confirmando..." : "Asistir"}
                                    </button>
                                    <p className="text-xs md:text-[11px] uppercase tracking-[0.25em] text-slate-400/90 text-center">
                                        Ingresá tu nombre y dale a Asistir
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

