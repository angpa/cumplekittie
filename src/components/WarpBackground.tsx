"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function Particles() {
    const count = 2000;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    // Posiciones aleatorias iniciales
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

    // Hook al render loop para animar
    useFrame((state) => {
        if (!mesh.current) return;

        // Leer datos de música desde el hook (global)
        // Low:0-255, Mid:0-255, High:0-255, Total:0-255
        let { low, mid, high, total } = (window as any).__onMusicFrame
            ? (window as any).__musicData || { low: 0, mid: 0, high: 0, total: 0 }
            : { low: 0, mid: 0, high: 0, total: 0 };

        // Hack para leer el callback directo si se asignó
        // En useMusicReactive asignamos window.__onMusicFrame como funcion
        // Acá necesitamos leer el valor que esa funcion guarda
        // CORRECCIÓN: El hook de arriba llama a la funcion, mejor guardamos el valor en window.__musicData en el callback

        // Simplificamos: Asumimos que el componente padre pasa los datos O
        // Mantenemos la logica del hook que inyecta en window.__onMusicFrame
        // Vamos a parchear esto en el componente principal, aqui solo leemos.

        // Efectos de cámara/grupo global (Warp Speed)
        // Usamos el tiempo para avanzar
        const t = state.clock.getElapsedTime();

        particles.forEach((particle, i) => {
            let { t: pt, factor, speed, xFactor, yFactor, zFactor } = particle;

            // Movimiento warp base + acelera con bajos
            pt = particle.t += speed / 2 + (low * 0.0001);

            // Posición "túnel" infinito
            const a = Math.cos(t) + Math.sin(pt * 1) / 10;
            const b = Math.sin(t) + Math.cos(pt * 2) / 10;
            const s = Math.cos(t);

            // Posicionamiento
            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );

            // LOGICA REACTIVA ESPECÍFICA (User Request)
            // Low: Pulsos en profundidad Z
            dummy.position.z -= (low * 0.1);
            // Wrap around para efecto infinito
            if (dummy.position.z < -100) dummy.position.z = 50;


            // Mid: Rotación y deriva
            dummy.rotation.z += (mid * 0.00005);
            dummy.rotation.x += (mid * 0.0003);

            dummy.scale.setScalar(1 + (high * 0.005));

            // Update instance
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);

            // Color Reactivo (High) -> Lavanda a Magenta
            // Necesitamos acceder al color de la instancia, Threejs InstancedMesh no permite facilemente setear color per frame sin performance cost.
            // Usaremos color global del material para optimizar o hackeamos un poco.
            // Mejor: Cambiamos el color global del material basado en High

        });

        mesh.current.instanceMatrix.needsUpdate = true;

        // Material Color Update (High Freq -> Color Shift)
        // Base: #7209B7 (Violeta) -> #F72585 (Magenta)
        const material = mesh.current.material as THREE.MeshBasicMaterial;
        const hue = 0.7 + (high * 0.00025); // 0.7 aprox violeta
        const light = 0.45 + (high * 0.002);
        material.color.setHSL(hue % 1, 1, Math.min(0.8, light));


        // Movimiento de cámara sutil "Barco"
        state.camera.position.x = Math.sin(t * 0.1) * (mid * 0.02);
        state.camera.lookAt(0, 0, 0);

    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color="#7209B7" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    );
}

export default function WarpBackground() {
    return (
        <Particles />
    );
}
