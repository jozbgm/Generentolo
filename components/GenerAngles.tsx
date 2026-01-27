import React, { useState, useMemo } from 'react';

interface GenerAnglesProps {
    onGenerate: (params: AngleGenerationParams) => void;
    isGenerating: boolean;
    referenceImages: File[];
}

export interface AngleGenerationParams {
    referenceImage: string;
    rotation: number;
    tilt: number;
    zoom: number;
}

const GenerAngles: React.FC<GenerAnglesProps> = ({
    onGenerate,
    isGenerating,
    referenceImages
}) => {
    const [rotation, setRotation] = useState(45);
    const [tilt, setTilt] = useState(-30);
    const [zoom, setZoom] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, rotation: 0, tilt: 0 });

    // Get the first reference image as the primary one for the viewport
    const activeReferenceUrl = useMemo(() => {
        if (referenceImages.length > 0) {
            return URL.createObjectURL(referenceImages[0]);
        }
        return null;
    }, [referenceImages]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX,
            y: e.clientY,
            rotation: rotation,
            tilt: tilt
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        // Horizontal drag = rotation
        const newRotation = dragStart.rotation + deltaX * 1.5;
        // Vertical drag = tilt
        const newTilt = Math.max(-90, Math.min(90, dragStart.tilt - deltaY * 1.0));

        setRotation(((newRotation % 360) + 360) % 360);
        setTilt(newTilt);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleGenerate = () => {
        if (!activeReferenceUrl) return;

        onGenerate({
            referenceImage: activeReferenceUrl,
            rotation,
            tilt,
            zoom
        });
    };

    // Calculate camera position on a sphere for the visualization
    const getCameraPosition = () => {
        const radius = 90; // Slightly smaller for better fit
        const rotRad = (rotation * Math.PI) / 180;
        const tiltRad = (tilt * Math.PI) / 180;

        // Sphere projection to 2D
        const x = Math.sin(rotRad) * Math.cos(tiltRad) * radius;
        const y = -Math.sin(tiltRad) * radius;

        // Scale factor based on Z (depth) to simulate size/perspective
        const z = Math.cos(rotRad) * Math.cos(tiltRad) * radius;
        const scale = 0.8 + (z + radius) / (radius * 2) * 0.4;
        const opacity = 0.5 + (z + radius) / (radius * 2) * 0.5;

        return { x, y, scale, opacity, z };
    };

    const cameraPos = getCameraPosition();

    return (
        <div className="flex flex-col gap-5 py-2 select-none">
            {/* Header - Minimal & Consistent */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className="text-xl">📐</span>
                    <div>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-blue leading-none">Angles Studio</h2>
                        <p className="text-[9px] text-light-text-muted dark:text-dark-text-muted font-medium mt-1">Virtual Camera Controller</p>
                    </div>
                </div>
            </div>

            {/* Viewport Box - Glassmorphic high-end style */}
            <div
                className="relative aspect-square w-full rounded-[2.5rem] bg-gradient-to-b from-dark-surface/40 to-black/60 shadow-2xl overflow-hidden border border-white/10 cursor-grab active:cursor-grabbing group backdrop-blur-sm"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Background Grid / Glow */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#5e8bff_0%,_transparent_70%)]" />

                {/* Instruction - Styled like FloatingAction */}
                <div className="absolute top-6 left-0 right-0 text-center pointer-events-none z-10 transition-opacity duration-300 group-hover:opacity-0">
                    <span className="bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] text-white/40">
                        Drag to adjust angle
                    </span>
                </div>

                {/* Wireframe Sphere SVG - More subtle and artistic */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05]">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-white">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.1" />
                        {[15, 32, 50, 68, 85].map(v => (
                            <ellipse key={`h-${v}`} cx="50" cy="50" rx="48" ry={Math.abs(50 - v)} fill="none" stroke="currentColor" strokeWidth="0.1" />
                        ))}
                        {[15, 32, 50, 68, 85].map(v => (
                            <ellipse key={`v-${v}`} cx="50" cy="50" rx={Math.abs(50 - v)} ry="48" fill="none" stroke="currentColor" strokeWidth="0.1" />
                        ))}
                    </svg>
                </div>

                {/* Reference Image Container (Subject in the Center) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 perspective-[1000px]">
                    {activeReferenceUrl ? (
                        <div className="relative group/ref">
                            <div className="absolute -inset-4 bg-brand-blue/20 blur-2xl opacity-0 group-hover/ref:opacity-100 transition-opacity" />
                            <div className="w-20 h-28 rounded-2xl p-0.5 bg-white/10 border border-white/20 shadow-2xl backdrop-blur-md overflow-hidden transform transition-all duration-500 hover:scale-105">
                                <img src={activeReferenceUrl} alt="Subject" className="w-full h-full object-cover rounded-xl opacity-90" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-20 h-28 rounded-2xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-white/10">
                            <span className="text-[10px] uppercase font-bold tracking-widest leading-none">NO REF</span>
                        </div>
                    )}
                </div>

                {/* Depth Connector - Laser style */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                    <defs>
                        <linearGradient id="laser" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#5e8bff" stopOpacity="0" />
                            <stop offset="100%" stopColor="#5e8bff" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <line
                        x1="50%"
                        y1="50%"
                        x2={`calc(50% + ${cameraPos.x}px)`}
                        y2={`calc(50% + ${cameraPos.y}px)`}
                        stroke="url(#laser)"
                        strokeWidth="1"
                        strokeDasharray="2 4"
                        className="animate-[dash_2s_linear_infinite]"
                    />
                </svg>

                {/* Advanced Camera Object */}
                <div
                    className="absolute top-1/2 left-1/2 z-40 pointer-events-none transition-all duration-75"
                    style={{
                        transform: `translate(calc(-50% + ${cameraPos.x}px), calc(-50% + ${cameraPos.y}px)) scale(${cameraPos.scale})`,
                        opacity: cameraPos.opacity
                    }}
                >
                    <div className="relative w-12 h-10 flex items-center justify-center">
                        {/* 3D Camera Body */}
                        <div className="w-10 h-8 bg-gradient-to-br from-[#444] to-[#111] border border-white/20 rounded-lg shadow-2xl flex items-center justify-center relative">
                            {/* Lens Ring */}
                            <div className="absolute -right-1 w-3 h-5 bg-gradient-to-r from-[#222] to-[#444] border border-white/10 rounded shadow-lg" />
                            {/* Blue Recording Light */}
                            <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-brand-blue shadow-[0_0_8px_#5e8bff] animate-pulse" />
                            {/* Viewfinder Detail */}
                            <div className="w-5 h-4 bg-black/40 border border-white/5 rounded-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Parameter Sliders */}
            <div className="grid grid-cols-1 gap-3 px-1">
                {[
                    { label: 'Rotation', value: rotation, min: 0, max: 360, unit: '°', setter: setRotation, color: '#7209b7' },
                    { label: 'Tilt', value: tilt, min: -90, max: 90, unit: '°', setter: setTilt, color: '#4361ee' },
                    { label: 'Zoom', value: zoom, min: -20, max: 20, unit: '', setter: setZoom, color: '#f72585' }
                ].map((p) => (
                    <div key={p.label} className="group/s relative bg-light-surface-accent dark:bg-dark-surface-accent/30 rounded-2xl p-3 border border-light-border dark:border-dark-border/30 transition-all hover:border-brand-blue/30">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted group-hover/s:text-white transition-colors">{p.label}</span>
                            <span className="text-[10px] font-black text-white bg-dark-surface px-2 py-0.5 rounded-md border border-white/5">{Math.round(p.value)}{p.unit}</span>
                        </div>
                        <div className="relative h-4 flex items-center">
                            <input
                                type="range"
                                min={p.min}
                                max={p.max}
                                value={p.value}
                                onChange={(e) => p.setter(Number(e.target.value))}
                                className={`w-full h-1 rounded-full appearance-none cursor-pointer bg-black/40`}
                                style={{ accentColor: p.color }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Premium Generation Button */}
            <div className="mt-2 px-1">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !activeReferenceUrl}
                    className="w-full group relative overflow-hidden flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-brand-purple to-brand-blue rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:hover:scale-100"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    {isGenerating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <span className="text-xl">⚡</span>
                    )}

                    <div className="text-left leading-none">
                        <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-white">
                            {isGenerating ? "Processing..." : "Start Generation"}
                        </span>
                        {!isGenerating && (
                            <span className="block text-[8px] text-white/60 font-medium uppercase tracking-widest mt-1">
                                Cinematic Render Engine
                            </span>
                        )}
                    </div>
                </button>

                {!activeReferenceUrl && !isGenerating && (
                    <p className="text-[9px] text-center text-brand-pink font-bold uppercase tracking-widest mt-3 animate-pulse">
                        ⚠️ Please add a reference image first
                    </p>
                )}
            </div>

            <style>{`
                @keyframes dash {
                    to { stroke-dashoffset: -12; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                input[type='range'] {
                    -webkit-appearance: none;
                }
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 14px;
                    width: 14px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(94, 139, 255, 0.5);
                    border: 2px solid currentColor;
                    transition: transform 0.2s;
                }
                input[type='range']:hover::-webkit-slider-thumb {
                    transform: scale(1.2);
                }
            `}</style>
        </div>
    );
};

export default GenerAngles;
