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
        <div className="flex flex-col gap-3 py-2 select-none">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-brand-blue/30 blur-sm rounded-full" />
                        <svg className="relative size-5 text-brand-blue" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.8682 5.63231C12.3302 5.32488 11.6698 5.32487 11.1318 5.63231L6.88176 8.06088C6.83858 8.08555 6.7967 8.11191 6.7562 8.13984L11.9998 11.1362L17.2436 8.13972C17.2032 8.11184 17.1614 8.08552 17.1182 8.06088L12.8682 5.63231Z" />
                            <path d="M6 9.58031C6 9.53277 6.00193 9.48551 6.00573 9.43863L11.2498 12.4352V18.4293C11.1292 18.4103 11.1705 18.3898 11.1318 18.3677L6.88176 15.9391C6.3365 15.6275 6 15.0477 6 14.4197V9.58031Z" />
                            <path d="M12.8682 18.3677C12.8294 18.3899 12.7899 18.4105 12.7498 18.4295V12.4352L17.9943 9.43841C17.9981 9.48537 18 9.5327 18 9.58031V14.4197C18 15.0477 17.6635 15.6275 17.1182 15.9391L12.8682 18.3677Z" />
                        </svg>
                    </div>
                    <span className="text-sm font-bold text-white">3D Angles</span>
                </div>
                {/* Live Position Badge */}
                <div className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all ${isSnapped ? 'bg-brand-blue/20 text-brand-blue' : 'bg-white/5 text-white/50'}`}>
                    {getAngleLabel(rotation)} • {getTiltLabel(tilt)}
                </div>
            </div>

            {/* Main Viewport */}
            <div className="relative w-full rounded-xl bg-[#0a0a0b] border border-white/10 shadow-xl flex flex-col" style={{ minHeight: '320px' }}>

                {/* 3D Scene Layer */}
                <div
                    ref={containerRef}
                    className={`flex-1 relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{ minHeight: '280px' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Instruction */}
                    <div className={`absolute top-3 left-0 right-0 z-10 text-center pointer-events-none transition-opacity ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
                        <span className="text-[10px] text-white/40 font-medium">Drag to rotate • Snaps to 45°</span>
                    </div>

                    {/* 3D Wireframe Sphere with Orbiting Camera */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ minHeight: '280px' }}>
                        <div className="relative" style={{ width: '200px', height: '200px', perspective: '500px' }}>
                            <div
                                className="relative size-full transition-transform duration-150 ease-out"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: `rotateX(${-tilt}deg) rotateY(${-rotation}deg)`
                                }}
                            >
                                {/* Equator Ring - MAIN, most visible */}
                                <div
                                    className={`absolute inset-0 rounded-full border-2 transition-colors duration-150 ${isSnapped ? 'border-brand-blue' : 'border-white/50'}`}
                                    style={{ transform: 'rotateX(90deg)' }}
                                />

                                {/* Vertical Ring (Meridian) - also visible */}
                                <div className={`absolute inset-0 rounded-full border-2 transition-colors ${isSnapped ? 'border-brand-blue/60' : 'border-white/40'}`} />

                                {/* Additional Longitude Rings for depth */}
                                {[45, 90, 135].map(deg => (
                                    <div
                                        key={deg}
                                        className="absolute inset-0 rounded-full border border-white/20"
                                        style={{ transform: `rotateY(${deg}deg)` }}
                                    />
                                ))}

                                {/* The Orbiting Camera */}
                                <div
                                    className="absolute left-1/2 top-1/2"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transform: 'translate(-50%, -50%) translateZ(105px)'
                                    }}
                                >
                                    {/* Camera Icon */}
                                    <div className="relative flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                                        {/* Main Lens */}
                                        <div
                                            className={`absolute w-8 h-8 rounded-full border-2 shadow-lg transition-all duration-150 ${isSnapped ? 'bg-brand-blue/40 border-brand-blue shadow-brand-blue/60' : 'bg-[#222] border-white/60 shadow-white/30'}`}
                                            style={{ transform: 'translateZ(-4px)' }}
                                        >
                                            <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-black to-[#444]" />
                                            <div className={`absolute inset-2.5 rounded-full blur-[2px] ${isSnapped ? 'bg-brand-blue' : 'bg-brand-blue/50'}`} />
                                        </div>

                                        {/* Camera Body */}
                                        <div
                                            className={`w-10 h-7 border-2 rounded shadow-2xl transition-colors duration-150 ${isSnapped ? 'bg-brand-blue/30 border-brand-blue' : 'bg-[#333] border-white/40'}`}
                                            style={{ transform: 'translateZ(-10px)' }}
                                        >
                                            <div className={`absolute -top-1.5 right-1 w-2.5 h-1.5 rounded-full shadow-lg ${isSnapped ? 'bg-brand-blue shadow-brand-blue' : 'bg-red-500 shadow-red-500'}`} />
                                        </div>

                                        {/* Laser beam to center */}
                                        <div
                                            className={`absolute w-1 h-[105px] bg-gradient-to-t to-transparent ${isSnapped ? 'from-brand-blue opacity-80' : 'from-white/60 opacity-50'}`}
                                            style={{
                                                transformOrigin: 'bottom center',
                                                transform: 'rotateX(90deg)',
                                                bottom: '0px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Central Subject - smaller to not overlap with sphere */}
                    <div
                        className="absolute top-1/2 left-1/2 select-none pointer-events-none z-20"
                        style={{
                            transform: `translate(-50%, -50%) scale(${1 + (zoom / 40)})`,
                            filter: isDragging ? 'brightness(1.2)' : 'none'
                        }}
                    >
                        {activeReferenceUrl ? (
                            <img
                                className={`w-14 h-14 object-cover rounded-lg bg-black/40 shadow-2xl transition-all duration-150 ${isSnapped ? 'ring-2 ring-brand-blue ring-offset-2 ring-offset-[#0c0d0e]' : 'ring-1 ring-white/30'}`}
                                src={activeReferenceUrl}
                                alt="Reference"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                                <span className="text-[8px] font-black text-white/30 uppercase">REF</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="p-4 bg-white/[0.02] border-t border-white/5 space-y-3">
                    {/* Rotation Slider */}
                    <div className="relative overflow-hidden flex items-center rounded-xl bg-black/40 border border-white/5 h-10 px-4">
                        <div
                            className="absolute inset-0 pointer-events-none transition-all duration-150"
                            style={{
                                background: `linear-gradient(to right, ${isSnapped ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'} 0%, ${isSnapped ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'} ${(rotation / 360) * 100}%, transparent ${(rotation / 360) * 100}%)`
                            }}
                        />
                        <div className="relative z-1 flex items-center justify-between w-full pointer-events-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Orbit</span>
                            <span className={`text-xs font-mono font-bold transition-colors ${SNAP_ANGLES.includes(rotation) ? 'text-brand-blue' : 'text-white'}`}>
                                {Math.round(rotation)}°
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
                    <div className="relative overflow-hidden flex items-center rounded-xl bg-black/40 border border-white/5 h-10 px-4">
                        <div
                            className="absolute inset-0 pointer-events-none transition-all duration-150"
                            style={{
                                background: `linear-gradient(to right, ${isSnapped ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'} 0%, ${isSnapped ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'} ${((tilt + 30) / 90) * 100}%, transparent ${((tilt + 30) / 90) * 100}%)`
                            }}
                        />
                        <div className="relative z-1 flex items-center justify-between w-full pointer-events-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Tilt</span>
                            <span className={`text-xs font-mono font-bold transition-colors ${SNAP_TILTS.includes(tilt) ? 'text-brand-blue' : 'text-white'}`}>
                                {Math.round(tilt)}°
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
                    <div className="relative overflow-hidden flex items-center rounded-xl bg-black/40 border border-white/5 h-10 px-4">
                        <div
                            className="absolute inset-0 pointer-events-none transition-all duration-300"
                            style={{
                                background: `linear-gradient(to right, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) ${(zoom / 10) * 100}%, transparent ${(zoom / 10) * 100}%)`
                            }}
                        />
                        <div className="relative z-1 flex items-center justify-between w-full pointer-events-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Zoom</span>
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

                    {/* Best Angles Toggle - now outside viewport */}
                    <label className="flex items-center justify-center gap-2 py-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <input
                            type="checkbox"
                            checked={generateBestAngles}
                            onChange={(e) => setGenerateBestAngles(e.target.checked)}
                            className="w-4 h-4 rounded bg-transparent border-white/30 text-brand-blue focus:ring-brand-blue"
                        />
                        <span className="text-[11px] uppercase font-black tracking-widest text-white/60">Generate 12 Key Angles</span>
                    </label>
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
