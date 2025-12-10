"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";

// ==========================================
// 1. ESTRELLAS REALISTAS (Dynamic Count)
// ==========================================
function WarpStars({ isMobile }: { isMobile: boolean }) {
    const ref = useRef<THREE.Points>(null);

    // DYNAMIC COUNT: 1200 for mobile (performant), 6000 for desktop (premium)
    const starCount = isMobile ? 1200 : 6000;

    const { positions, geometry } = useMemo(() => {
        const pos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i += 3) {
            pos[i] = (Math.random() - 0.5) * 120;
            pos[i + 1] = (Math.random() - 0.5) * 120;
            pos[i + 2] = Math.random() * -150;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        return { positions: pos, geometry: geo };
    }, [starCount]);

    useFrame((state, delta) => {
        if (!ref.current || !ref.current.geometry) return;

        ref.current.rotation.z += 0.0001;

        const posArray = ref.current.geometry.attributes.position.array as Float32Array;

        // SPEED ADJUSTMENT: Slower on mobile to reduce visual chaos/processing
        const speed = isMobile ? 0.05 : 0.2;

        for (let i = 0; i < starCount * 3; i += 3) {
            posArray[i + 2] += speed;

            if (posArray[i + 2] > 5) {
                posArray[i + 2] = -150;
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
                size={isMobile ? 0.09 : 0.06} // Slightly larger on mobile for visibility with lower count
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

// ==========================================
// 2. WARP REACTIVO (Audio Logic UNAFFECTED)
// ==========================================
function ReactiveWarp({ isMobile }: { isMobile: boolean }) {
    // Mobile: reduce count significantly to save CPU
    const count = isMobile ? 300 : 1500;

    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // PARTICLE DATA GENERATION
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor });
        }
        return temp;
    }, [count]);

    // Throttling for mobile updates
    const lastUpdate = useRef(0);

    useFrame((state, delta) => {
        if (!mesh.current) return;

        // AUDIO THROTTLING (Mobile: ~30FPS updates for audio reactivity)
        lastUpdate.current += delta;
        if (isMobile && lastUpdate.current < 0.033) return;
        lastUpdate.current = 0;

        const { low, mid, high, total } = (window as any).__musicData || { low: 0, mid: 0, high: 0, total: 0 };
        const t = state.clock.getElapsedTime();

        particles.forEach((particle, i) => {
            let { factor, speed, xFactor, yFactor, zFactor } = particle;

            // Audio Influence on Time (Speed up with bass)
            particle.t += speed / 2 + (low * 0.0001);
            const pt = particle.t;

            // Movement Logic (UNCHANGED)
            const a = Math.cos(t) + Math.sin(pt * 1) / 10;
            const b = Math.sin(t) + Math.cos(pt * 2) / 10;

            dummy.position.set(
                (0) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (0) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (0) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );

            // Z-Axis Pulse (Kick)
            dummy.position.z -= (low * 0.1);
            if (dummy.position.z < -100) dummy.position.z = 50;

            // Rotation (Mids)
            dummy.rotation.z += (mid * 0.00005);
            dummy.rotation.x += (mid * 0.0003);

            // Scalar Scale (Highs)
            dummy.scale.setScalar(1 + (high * 0.005));

            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;

        // Color Reaction (Highs -> Brightness/Hue shift)
        const material = mesh.current.material as THREE.MeshBasicMaterial;

        // RHTYHM HAPTICS (Mobile Only) - Physical Bass
        if (isMobile && low > 140) {
            // Simple throttle using a static variable on the window or local ref if possible, 
            // but here we rely on the frame loop. To avoid constant buzzing, we raise the threshold slightly.
            // A better approach is using Date.now()
            const now = Date.now();
            if (now - (mesh.current.userData.lastVibrate || 0) > 150) {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(30); // Short sharp kick
                }
                mesh.current.userData.lastVibrate = now;
            }
        }

        // RHYTHM FLASH (White on strong Kick/Snare)
        if (low > 130 || mid > 140) {
            material.color.setStyle("#FFFFFF"); // Flash White
            material.opacity = 1;
        } else {
            const hue = 0.75 + (high * 0.0002);
            const light = 0.5 + (high * 0.001);
            material.color.setHSL(hue % 1, 1, Math.min(0.8, light));
            material.opacity = 0.6 + (total * 0.001); // Breathing opacity
        }
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color="#7209B7" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    );
}

// ==========================================
// 3. COMPONENTE PRINCIPAL (Props)
// ==========================================
export default function WarpBackground({ isMobile }: { isMobile?: boolean }) {
    const mobile = isMobile ?? false;

    return (
        <>
            <color attach="background" args={['#030008']} />

            {/* Remove Stars on Mobile for cleaner look per user request */}
            {!mobile && <WarpStars isMobile={mobile} />}

            <ReactiveWarp isMobile={mobile} />

            {/* CONDITIONAL POST-PROCESSING: Only on Desktop */}
            {!mobile && (
                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.2} radius={0.5} />
                    <ChromaticAberration
                        offset={new THREE.Vector2(0.002, 0.002)}
                        radialModulation={false}
                        modulationOffset={0}
                    />
                </EffectComposer>
            )}
        </>
    );
}
