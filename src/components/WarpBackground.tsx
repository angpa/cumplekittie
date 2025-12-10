"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

// ==========================================
// 1. ESTRELLAS REALISTAS (LUMA STYLE)
// ==========================================
function WarpStars() {
    const ref = useRef<THREE.Points>(null);
    const starCount = 6000;

    // Generamos posiciones una vez
    const { positions, geometry } = useMemo(() => {
        const pos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i += 3) {
            pos[i] = (Math.random() - 0.5) * 120;     // X más ancho
            pos[i + 1] = (Math.random() - 0.5) * 120; // Y más alto
            pos[i + 2] = Math.random() * -150;        // Z profundo
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        return { positions: pos, geometry: geo };
    }, []);

    useFrame(() => {
        if (!ref.current || !ref.current.geometry) return;

        // Rotación sutil del universo
        ref.current.rotation.z += 0.0001;

        // Movimiento "Viaje Espacial"
        const posArray = ref.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < starCount * 3; i += 3) {
            // Mover estrella hacia la cámara (Z positivo)
            posArray[i + 2] += 0.2;

            // Reset si pasa la cámara
            if (posArray[i + 2] > 5) {
                posArray[i + 2] = -150;
                // Reset random XY para variedad
                posArray[i] = (Math.random() - 0.5) * 120;
                posArray[i + 1] = (Math.random() - 0.5) * 120;
            }
        }

        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={ref} geometry={geometry}>
            <pointsMaterial
                color="white"
                size={0.06}
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

// ==========================================
// 2. WARP REACTIVO (PARTÍCULAS GRANDES)
// ==========================================
function ReactiveWarp() {
    const count = 1500; // Reducido para no saturar junto con las estrellas
    const mesh = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;

        // Leer datos globales de audio
        const { low, mid, high, total } = (window as any).__musicData || { low: 0, mid: 0, high: 0, total: 0 };

        const t = state.clock.getElapsedTime();

        particles.forEach((particle, i) => {
            let { factor, speed, xFactor, yFactor, zFactor } = particle;

            // Acelerar con bajos
            particle.t += speed / 2 + (low * 0.0001);
            const pt = particle.t;

            // Posición "túnel"
            const a = Math.cos(t) + Math.sin(pt * 1) / 10;
            const b = Math.sin(t) + Math.cos(pt * 2) / 10;

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );

            // AUDIO REACTIVITY
            // Pulsos profundos
            dummy.position.z -= (low * 0.1);
            if (dummy.position.z < -100) dummy.position.z = 50;

            // Rotación
            dummy.rotation.z += (mid * 0.00005);
            dummy.rotation.x += (mid * 0.0003);

            // Escala por agudos
            dummy.scale.setScalar(1 + (high * 0.005));

            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;

        // Cambio color material BASE (Violeta a Magenta)
        const material = mesh.current.material as THREE.MeshBasicMaterial;
        const hue = 0.75 + (high * 0.0002);
        const light = 0.5 + (high * 0.001);
        material.color.setHSL(hue % 1, 1, Math.min(0.8, light));
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color="#7209B7" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    );
}

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================
export default function WarpBackground() {
    return (
        <>
            <color attach="background" args={['#030008']} />

            {/* CAPAS DE ESTRELLAS Y PARTÍCULAS */}
            <WarpStars />
            <ReactiveWarp />

            {/* EFECTOS POSTPROCESSING (LUMA STYLE) */}
            <EffectComposer disableNormalPass>
                {/* Glow suave */}
                <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.5} />

                {/* Aberración cromática (Rainbow edges) */}
                <ChromaticAberration
                    offset={new THREE.Vector2(0.002, 0.002)} // Desplazamiento RGB sutil
                    radialModulation={false}
                    modulationOffset={0}
                />
            </EffectComposer>
        </>
    );
}
