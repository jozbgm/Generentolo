import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

// v2.0: Professional Perspective Studio with improved mouse interaction
// Features: Snap-to-grid, visual guides, smoother dragging, and tactile feedback

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

// 8 key azimuth positions for snap-to-grid
const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const SNAP_THRESHOLD = 8; // Degrees within which to snap

// 4 key tilt positions
const SNAP_TILTS = [-30, 0, 30, 60];
const SNAP_TILT_THRESHOLD = 7;

const GenerAngles: React.FC<GenerAnglesProps> = ({
    onGenerate,
    isGenerating,
    referenceImages
}) => {
    const [rotation, setRotation] = useState(45);
    const [tilt, setTilt] = useState(0);
    const [zoom, setZoom] = useState(0);
    const [generateBestAngles, setGenerateBestAngles] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isSnapped, setIsSnapped] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, startRotation: 0, startTilt: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Get the first reference image as the primary one for the viewport
    const activeReferenceUrl = useMemo(() => {
        if (referenceImages.length > 0) {
            return URL.createObjectURL(referenceImages[0]);
        }
        return null;
    }, [referenceImages]);

    // Snap value to nearest key angle if within threshold
    const snapToGrid = useCallback((value: number, snapPoints: number[], threshold: number): { value: number; snapped: boolean } => {
        for (const snapPoint of snapPoints) {
            const distance = Math.abs(value - snapPoint);
            const wrappedDistance = Math.abs(value - (snapPoint + 360)) % 360;
            if (distance <= threshold || wrappedDistance <= threshold) {
                return { value: snapPoint, snapped: true };
            }
        }
        return { value, snapped: false };
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startRotation: rotation,
            startTilt: tilt
        };
    }, [rotation, tilt]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;

        // Sensitivity: 0.8 degrees per pixel for smooth, professional feel
        const rawRotation = dragRef.current.startRotation + deltaX * 0.8;
        const rawTilt = Math.max(-30, Math.min(60, dragRef.current.startTilt - deltaY * 0.5));

        // Normalize rotation to 0-360
        const normalizedRotation = ((rawRotation % 360) + 360) % 360;

        // Check for snap
        const snapResult = snapToGrid(normalizedRotation, SNAP_ANGLES, SNAP_THRESHOLD);
        const tiltSnapResult = snapToGrid(rawTilt, SNAP_TILTS, SNAP_TILT_THRESHOLD);

        setRotation(snapResult.value);
        setTilt(tiltSnapResult.value);
        setIsSnapped(snapResult.snapped || tiltSnapResult.snapped);
    }, [isDragging, snapToGrid]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsSnapped(false);
    }, []);

    // Global mouse events for dragging outside the container
    useEffect(() => {
        if (isDragging) {
            const handleGlobalMove = (e: MouseEvent) => {
                const deltaX = e.clientX - dragRef.current.startX;
                const deltaY = e.clientY - dragRef.current.startY;

                const rawRotation = dragRef.current.startRotation + deltaX * 0.8;
                const rawTilt = Math.max(-30, Math.min(60, dragRef.current.startTilt - deltaY * 0.5));

                const normalizedRotation = ((rawRotation % 360) + 360) % 360;

                const snapResult = snapToGrid(normalizedRotation, SNAP_ANGLES, SNAP_THRESHOLD);
                const tiltSnapResult = snapToGrid(rawTilt, SNAP_TILTS, SNAP_TILT_THRESHOLD);

                setRotation(snapResult.value);
                setTilt(tiltSnapResult.value);
                setIsSnapped(snapResult.snapped || tiltSnapResult.snapped);
            };

            const handleGlobalUp = () => {
                setIsDragging(false);
                setIsSnapped(false);
            };

            window.addEventListener('mousemove', handleGlobalMove);
            window.addEventListener('mouseup', handleGlobalUp);

            return () => {
                window.removeEventListener('mousemove', handleGlobalMove);
                window.removeEventListener('mouseup', handleGlobalUp);
            };
        }
        return undefined;
    }, [isDragging, snapToGrid]);

    const handleGenerate = useCallback(() => {
        if (!activeReferenceUrl) return;

        onGenerate({
            referenceImage: activeReferenceUrl,
            rotation,
            tilt,
            zoom,
            generateBestAngles
        });
    }, [activeReferenceUrl, onGenerate, rotation, tilt, zoom, generateBestAngles]);

    // Get current angle label for display
    const getAngleLabel = (deg: number): string => {
        const labels: Record<number, string> = {
            0: 'FRONT',
            45: 'FRONT-R',
            90: 'RIGHT',
            135: 'BACK-R',
            180: 'BACK',
            225: 'BACK-L',
            270: 'LEFT',
            315: 'FRONT-L'
        };
        return labels[deg] || `${Math.round(deg)}°`;
    };

    const getTiltLabel = (deg: number): string => {
        if (deg <= -15) return 'LOW';
        if (deg >= 45) return 'HIGH';
        if (deg >= 15) return 'ELEVATED';
        return 'EYE-LEVEL';
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
                        <p className="text-[9px] text-light-text-muted dark:text-dark-text-muted font-bold mt-1 uppercase opacity-60">Multi-Angle Controller v3</p>
                    </div>
                </div>
                {/* Live Position Badge */}
                <div className={`px-3 py-1.5 rounded-lg border transition-all duration-150 ${isSnapped ? 'bg-brand-blue/20 border-brand-blue/50' : 'bg-white/5 border-white/10'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSnapped ? 'text-brand-blue' : 'text-white/60'}`}>
                        {getAngleLabel(rotation)} • {getTiltLabel(tilt)}
                    </span>
                </div>
            </div>

            {/* Main Interactive Viewport - Deep Dark Cinema Style */}
            <div className="relative w-full aspect-square md:aspect-auto md:min-h-[380px] rounded-[1.5rem] bg-[#0c0d0e] border border-white/5 overflow-hidden shadow-2xl flex flex-col">

                {/* 3D Scene Layer */}
                <div
                    ref={containerRef}
                    className={`flex-1 relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Top Instruction */}
                    <div className={`absolute top-4 left-0 right-0 z-10 text-center pointer-events-none transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Drag to orbit • Snaps to 45° grid</p>
                    </div>

                    {/* 8-Point Compass Guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-56 h-56">
                            {SNAP_ANGLES.map((angle, i) => {
                                const isActive = Math.abs(rotation - angle) < SNAP_THRESHOLD || Math.abs(rotation - angle - 360) < SNAP_THRESHOLD || Math.abs(rotation - angle + 360) < SNAP_THRESHOLD;
                                const labels = ['F', 'FR', 'R', 'BR', 'B', 'BL', 'L', 'FL'];
                                const radian = (angle - 90) * (Math.PI / 180);
                                const x = Math.cos(radian) * 100;
                                const y = Math.sin(radian) * 100;

                                return (
                                    <div
                                        key={angle}
                                        className={`absolute transition-all duration-150 ${isActive ? 'scale-125' : 'scale-100'}`}
                                        style={{
                                            left: `calc(50% + ${x}px)`,
                                            top: `calc(50% + ${y}px)`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black transition-all ${isActive ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/50' : 'bg-white/10 text-white/40'}`}>
                                            {labels[i]}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Center line from center to current angle */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 224 224">
                                <line
                                    x1="112"
                                    y1="112"
                                    x2={112 + Math.cos((rotation - 90) * Math.PI / 180) * 80}
                                    y2={112 + Math.sin((rotation - 90) * Math.PI / 180) * 80}
                                    stroke={isSnapped ? '#6366f1' : 'rgba(255,255,255,0.3)'}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="transition-all duration-100"
                                />
                                <circle
                                    cx={112 + Math.cos((rotation - 90) * Math.PI / 180) * 80}
                                    cy={112 + Math.sin((rotation - 90) * Math.PI / 180) * 80}
                                    r="6"
                                    fill={isSnapped ? '#6366f1' : 'rgba(255,255,255,0.5)'}
                                    className="transition-all duration-100"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Central Subject */}
                    <div
                        className="absolute top-1/2 left-1/2 select-none pointer-events-none duration-200 ease-out"
                        style={{
                            zIndex: 10,
                            transform: `translate(-50%, -50%) scale(${1 + (zoom / 30)})`,
                            filter: isDragging ? 'brightness(1.3)' : 'none'
                        }}
                    >
                        {activeReferenceUrl ? (
                            <img
                                className={`w-20 h-20 object-cover rounded-xl bg-black/40 shadow-2xl transition-all duration-150 ${isSnapped ? 'ring-2 ring-brand-blue ring-offset-2 ring-offset-[#0c0d0e]' : 'ring-1 ring-white/20'}`}
                                src={activeReferenceUrl}
                                alt="Reference"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                                <span className="text-[9px] font-black text-white/20 uppercase">Add Image</span>
                            </div>
                        )}
                    </div>

                    {/* Tilt Indicator (Vertical bar on left) */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none">
                        <div className="text-[8px] font-black text-white/30 uppercase">TILT</div>
                        <div className="relative w-1.5 h-24 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-100 ${isSnapped ? 'bg-brand-blue' : 'bg-white/40'}`}
                                style={{ height: `${((tilt + 30) / 90) * 100}%` }}
                            />
                        </div>
                        <div className={`text-[10px] font-mono font-bold transition-colors ${isSnapped ? 'text-brand-blue' : 'text-white/60'}`}>{Math.round(tilt)}°</div>
                    </div>

                    {/* Quick Angle Buttons (replacing old orbit controls) */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                        {[0, 90, 180, 270].map(angle => (
                            <button
                                key={angle}
                                onClick={() => setRotation(angle)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black uppercase transition-all ${rotation === angle ? 'bg-brand-blue text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}
                            >
                                {angle === 0 ? 'F' : angle === 90 ? 'R' : angle === 180 ? 'B' : 'L'}
                            </button>
                        ))}
                    </div>

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

                {/* Bottom Control Bar */}
                <div className="p-4 bg-white/[0.02] border-t border-white/5 space-y-3">
                    {/* Rotation Slider */}
                    <div className="relative overflow-hidden flex items-center rounded-xl bg-black/40 border border-white/5 h-11 px-4">
                        <div
                            className="absolute inset-0 pointer-events-none transition-all duration-150"
                            style={{
                                background: `linear-gradient(to right, ${isSnapped ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'} 0%, ${isSnapped ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'} ${(rotation / 360) * 100}%, transparent ${(rotation / 360) * 100}%)`
                            }}
                        />
                        <div className="relative z-1 flex items-center justify-between w-full pointer-events-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Orbit Rotation</span>
                            <span className={`text-xs font-mono font-bold transition-colors ${SNAP_ANGLES.includes(rotation) ? 'text-brand-blue' : 'text-white'}`}>
                                {Math.round(rotation)}° {SNAP_ANGLES.includes(rotation) && '•'}
                            </span>
                        </div>
                        <input
                            min="0" max="360" step="5"
                            className="absolute inset-0 size-full opacity-0 cursor-pointer"
                            type="range"
                            value={rotation}
                            onChange={(e) => setRotation(Number(e.target.value))}
                        />
                    </div>

                    {/* Tilt Slider */}
                    <div className="relative overflow-hidden flex items-center rounded-xl bg-black/40 border border-white/5 h-11 px-4">
                        <div
                            className="absolute inset-0 pointer-events-none transition-all duration-150"
                            style={{
                                background: `linear-gradient(to right, ${isSnapped ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'} 0%, ${isSnapped ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'} ${((tilt + 30) / 90) * 100}%, transparent ${((tilt + 30) / 90) * 100}%)`
                            }}
                        />
                        <div className="relative z-1 flex items-center justify-between w-full pointer-events-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Pitch/Tilt</span>
                            <span className={`text-xs font-mono font-bold transition-colors ${SNAP_TILTS.includes(tilt) ? 'text-brand-blue' : 'text-white'}`}>
                                {Math.round(tilt)}° {SNAP_TILTS.includes(tilt) && '•'}
                            </span>
                        </div>
                        <input
                            min="-30" max="60" step="15"
                            className="absolute inset-0 size-full opacity-0 cursor-pointer"
                            type="range"
                            value={tilt}
                            onChange={(e) => setTilt(Number(e.target.value))}
                        />
                    </div>

                    {/* Zoom Slider */}
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
        </div>
    );
};

export default GenerAngles;
