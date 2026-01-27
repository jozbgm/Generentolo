import React, { useState, useMemo } from 'react';

// v1.9.8: Premium Angles Studio overhaul inspired by high-end 3D perspective editors
// Implements a full CSS 3D viewport, cinematic gizmo, and batch multi-angle generation.

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
    generateBestAngles?: boolean;
}

const GenerAngles: React.FC<GenerAnglesProps> = ({
    onGenerate,
    isGenerating,
    referenceImages
}) => {
    const [rotation, setRotation] = useState(45);
    const [tilt, setTilt] = useState(30);
    const [zoom, setZoom] = useState(0);
    const [generateBestAngles, setGenerateBestAngles] = useState(false);
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

        // Map movement to steps to feel more "mechanical" like the source
        // Horizontal drag = rotation
        const newRotation = dragStart.rotation + deltaX * 1.5;
        // Vertical drag = tilt
        const newTilt = Math.max(-30, Math.min(60, dragStart.tilt - deltaY * 1.0));

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
            zoom,
            generateBestAngles
        });
    };

    return (
        <div className="flex flex-col gap-4 py-2 select-none">
            {/* Header - Minimal & Technical */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-brand-blue/30 blur-sm rounded-full animate-pulse capitalize" />
                        <svg className="relative size-5 text-brand-blue" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 5C3.44772 5 3 4.55228 3 4C3 3.44772 3.44772 3 4 3C4.55228 3 5 3.44772 5 4C5 4.55228 4.55228 5 4 5Z" fill="currentColor"></path>
                            <path d="M20 5C19.4477 5 19 4.55228 19 4C19 3.44772 19.4477 3 20 3C20.5523 3 21 3.44772 21 4C21 4.55228 20.5523 5 20 5Z" fill="currentColor"></path>
                            <path d="M20 21C19.4477 21 19 20.5523 19 20C19 19.4477 19.4477 19 20 19C20.5523 19 21 19.4477 21 20C21 20.5523 20.5523 21 20 21Z" fill="currentColor"></path>
                            <path d="M4 21C3.44772 21 3 20.5523 3 20C3 19.4477 3.44772 19 4 19C4.55228 19 5 19.4477 5 20C5 20.5523 4.55228 21 4 21Z" fill="currentColor"></path>
                            <path d="M12.8682 5.63231C12.3302 5.32488 11.6698 5.32487 11.1318 5.63231L6.88176 8.06088C6.83858 8.08555 6.7967 8.11191 6.7562 8.13984L11.9998 11.1362L17.2436 8.13972C17.2032 8.11184 17.1614 8.08552 17.1182 8.06088L12.8682 5.63231Z" fill="currentColor"></path>
                            <path d="M6 9.58031C6 9.53277 6.00193 9.48551 6.00573 9.43863L11.2498 12.4352V18.4293C11.1292 18.4103 11.1705 18.3898 11.1318 18.3677L6.88176 15.9391C6.3365 15.6275 6 15.0477 6 14.4197V9.58031Z" fill="currentColor"></path>
                            <path d="M12.8682 18.3677C12.8294 18.3899 12.7899 18.4105 12.7498 18.4295V12.4352L17.9943 9.43841C17.9981 9.48537 18 9.5327 18 9.58031V14.4197C18 15.0477 17.6635 15.6275 17.1182 15.9391L12.8682 18.3677Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-white leading-none">Perspective Studio</h2>
                        <p className="text-[9px] text-light-text-muted dark:text-dark-text-muted font-bold mt-1 uppercase opacity-60">Kinematic Controller v2</p>
                    </div>
                </div>
            </div>

            {/* Main Interactive Viewport - Deep Dark Cinema Style */}
            <div className="relative w-full aspect-square md:aspect-auto md:min-h-[380px] rounded-[1.5rem] bg-[#0c0d0e] border border-white/5 overflow-hidden shadow-2xl flex flex-col">

                {/* 3D Scene Layer */}
                <div
                    className="flex-1 relative cursor-grab active:cursor-grabbing group overflow-hidden"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Top Instruction */}
                    <div className="absolute top-4 left-0 right-0 z-10 text-center pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Hold and drag to orbit</p>
                    </div>

                    {/* Central Subject Ghosting Effect */}
                    <div
                        className="absolute top-1/2 left-1/2 select-none pointer-events-none duration-300 ease-out"
                        style={{
                            zIndex: 1,
                            opacity: 1,
                            transform: `translate(-50%, -50%) scale(${1 + (zoom / 50)})`,
                            filter: isDragging ? 'brightness(1.5) blur(1px)' : 'none'
                        }}
                    >
                        {activeReferenceUrl ? (
                            <img
                                className="w-16 h-16 object-cover rounded-xl bg-black/40 ring-1 ring-white/10 shadow-2xl"
                                src={activeReferenceUrl}
                                alt="Anchor"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                                <span className="text-[8px] font-black text-white/20">EMPTY</span>
                            </div>
                        )}
                    </div>

                    {/* 3D Wireframe Sphere (CSS Preserve-3D) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="relative w-52 h-52 rounded-full border border-white/5" style={{ perspective: '800px' }}>
                            <div
                                className="relative size-full transition-transform duration-200 ease-out"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: `rotateX(${tilt}deg) rotateY(${rotation}deg)`
                                }}
                            >
                                {/* Horizontal Rings (Latitudes) */}
                                <div className="absolute inset-0 rounded-full border border-white/10" />
                                <div className="absolute inset-0 rounded-full border border-white/10" style={{ transform: 'rotateX(90deg)' }} />

                                {/* Vertical Rings (Longitudes) */}
                                {[15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165].map(deg => (
                                    <div
                                        key={deg}
                                        className="absolute inset-0 rounded-full border border-white/5"
                                        style={{ transform: `rotateY(${deg}deg)` }}
                                    />
                                ))}

                                {/* The Floating Camera Gizmo */}
                                <div
                                    className="absolute left-1/2 top-1/2"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transform: 'translate(-50%, -50%) translateZ(110px)'
                                    }}
                                >
                                    {/* 3D Camera Body Clone */}
                                    <div className="relative flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                                        {/* Main Lens Barrel */}
                                        <div className="absolute w-6 h-6 rounded-full bg-[#1a1a1a] border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{ transform: 'translateZ(-4px)' }}>
                                            <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-black to-[#333]" />
                                            <div className="absolute inset-2 rounded-full bg-brand-blue/30 blur-[2px]" />
                                        </div>

                                        {/* Camera Body Block */}
                                        <div className="w-8 h-6 bg-[#222] border border-white/20 rounded shadow-2xl" style={{ transform: 'translateZ(-10px)' }}>
                                            <div className="absolute -top-1 right-1 w-2 h-1 bg-red-500 rounded-full shadow-[0_0_5px_red]" />
                                        </div>

                                        {/* Laser Pointer (Focal Path) */}
                                        <div
                                            className="absolute w-0.5 h-[110px] bg-gradient-to-t from-brand-blue to-transparent opacity-40"
                                            style={{
                                                transformOrigin: 'bottom center',
                                                transform: 'rotateX(90deg) translateY(0px) translateZ(0px)',
                                                bottom: '0px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orbit Controls (HUD style) */}
                    <button
                        type="button"
                        onClick={() => setTilt(prev => Math.min(60, prev + 15))}
                        className="absolute left-1/2 top-8 -translate-x-1/2 text-white/40 hover:text-white transition-colors"
                    >
                        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => setTilt(prev => Math.max(-30, prev - 15))}
                        className="absolute left-1/2 bottom-12 -translate-x-1/2 text-white/40 hover:text-white transition-colors"
                    >
                        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRotation(prev => (prev - 15) % 360)}
                        className="absolute left-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRotation(prev => (prev + 15) % 360)}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                    </button>

                    {/* Best Angles Toggle Block */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                        <label className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 cursor-pointer hover:bg-black/80 transition-all pointer-events-auto">
                            <input
                                type="checkbox"
                                checked={generateBestAngles}
                                onChange={(e) => setGenerateBestAngles(e.target.checked)}
                                className="w-3.5 h-3.5 rounded-sm bg-transparent border-white/20 text-brand-blue focus:ring-brand-blue"
                            />
                            <span className="text-[10px] uppercase font-black tracking-widest text-white/70">12 Precision Shots</span>
                        </label>
                    </div>
                </div>

                {/* Bottom Control Bar (Hidden Selectors/Sliders) */}
                <div className="p-4 bg-white/[0.02] border-t border-white/5 space-y-3">
                    {/* Rotation Horizontal Progress */}
                    <div className="relative overflow-hidden flex items-center rounded-xl bg-black/40 border border-white/5 h-11 px-4">
                        <div
                            className="absolute inset-0 pointer-events-none transition-all duration-300"
                            style={{
                                background: `linear-gradient(to right, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) ${(rotation / 360) * 100}%, transparent ${(rotation / 360) * 100}%)`
                            }}
                        />
                        <div className="relative z-1 flex items-center justify-between w-full pointer-events-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Orbit Rotation</span>
                            <span className="text-xs font-mono font-bold text-white">{Math.round(rotation)}°</span>
                        </div>
                        <input
                            min="0" max="360" step="5"
                            className="absolute inset-0 size-full opacity-0 cursor-pointer"
                            type="range"
                            value={rotation}
                            onChange={(e) => setRotation(Number(e.target.value))}
                        />
                    </div>

                    {/* Tilt Vertical Progress */}
                    <div className="relative overflow-hidden flex items-center rounded-xl bg-black/40 border border-white/5 h-11 px-4">
                        <div
                            className="absolute inset-0 pointer-events-none transition-all duration-300"
                            style={{
                                background: `linear-gradient(to right, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) ${((tilt + 30) / 90) * 100}%, transparent ${((tilt + 30) / 90) * 100}%)`
                            }}
                        />
                        <div className="relative z-1 flex items-center justify-between w-full pointer-events-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Pitch/Tilt</span>
                            <span className="text-xs font-mono font-bold text-white">{Math.round(tilt)}°</span>
                        </div>
                        <input
                            min="-30" max="60" step="15"
                            className="absolute inset-0 size-full opacity-0 cursor-pointer"
                            type="range"
                            value={tilt}
                            onChange={(e) => setTilt(Number(e.target.value))}
                        />
                    </div>

                    {/* Zoom / Distance Progress */}
                    <div className="relative overflow-hidden flex items-center rounded-xl bg-black/40 border border-white/5 h-11 px-4">
                        <div
                            className="absolute inset-0 pointer-events-none transition-all duration-300"
                            style={{
                                background: `linear-gradient(to right, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) ${(zoom / 10) * 100}%, transparent ${(zoom / 10) * 100}%)`
                            }}
                        />
                        <div className="relative z-1 flex items-center justify-between w-full pointer-events-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Dolly Zoom</span>
                            <span className="text-xs font-mono font-bold text-white">X{zoom === 0 ? '1.0' : (1 + zoom / 10).toFixed(1)}</span>
                        </div>
                        <input
                            min="0" max="10" step="1"
                            className="absolute inset-0 size-full opacity-0 cursor-pointer"
                            type="range"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="mt-2">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !activeReferenceUrl}
                    className="w-full relative group h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-[12px] font-black uppercase tracking-[0.25em] text-white">Generate View</span>
                        <div className="flex gap-1 mt-1 opacity-40">
                            {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-white rounded-full" />)}
                        </div>
                    </div>
                    {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    ) : (
                        <svg className="size-5 text-brand-blue" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" /></svg>
                    )}
                </button>
            </div>

            <style>{`
                .rounded-t { border-top-left-radius: 4px; border-top-right-radius: 4px; }
            `}</style>
        </div>
    );
};

export default GenerAngles;
