import React, { useState, useRef } from 'react';
import { useLocalization } from '../App';
import { ModelType } from '../types';

interface GenerAnglesProps {
    onGenerate: (params: AngleGenerationParams) => void;
    isGenerating: boolean;
    selectedModel: ModelType;
}

export interface AngleGenerationParams {
    referenceImage: string;
    rotation: number;
    tilt: number;
    zoom: number;
    generateBestAngles: boolean;
}

const GenerAngles: React.FC<GenerAnglesProps> = ({
    onGenerate,
    isGenerating,
    selectedModel
}) => {
    const { t } = useLocalization();
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [rotation, setRotation] = useState(0);
    const [tilt, setTilt] = useState(0);
    const [zoom, setZoom] = useState(0);
    const [generateBestAngles, setGenerateBestAngles] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, rotation: 0, tilt: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setReferenceImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!referenceImage) return;
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
        const newRotation = dragStart.rotation + deltaX * 0.5;
        // Vertical drag = tilt
        const newTilt = Math.max(-90, Math.min(90, dragStart.tilt - deltaY * 0.3));

        setRotation(((newRotation % 360) + 360) % 360);
        setTilt(newTilt);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleGenerate = () => {
        if (!referenceImage) return;
        onGenerate({
            referenceImage,
            rotation,
            tilt,
            zoom,
            generateBestAngles
        });
    };

    const getCameraPosition = () => {
        const radius = 120;
        const rotRad = (rotation * Math.PI) / 180;
        const tiltRad = (tilt * Math.PI) / 180;

        const x = Math.sin(rotRad) * Math.cos(tiltRad) * radius;
        const y = -Math.sin(tiltRad) * radius;

        return { x, y };
    };

    const cameraPos = getCameraPosition();

    return (
        <div className="flex flex-col h-full bg-light-bg dark:bg-dark-bg">
            {/* Header */}
            <div className="p-4 border-b border-light-border dark:border-dark-border">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📐</span>
                    <h2 className="text-lg font-bold text-light-text dark:text-dark-text">GenerAngles</h2>
                </div>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                    Generate images from different camera angles
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

                {/* Upload Section */}
                {!referenceImage ? (
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
                            Reference Image
                        </label>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-48 border-2 border-dashed border-light-border dark:border-dark-border rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-brand-purple hover:bg-brand-purple/5 transition-all group"
                        >
                            <span className="text-4xl group-hover:scale-110 transition-transform">🖼️</span>
                            <span className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted">
                                Click to upload reference image
                            </span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <>
                        {/* 3D Viewport */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
                                    Camera Position
                                </label>
                                <button
                                    onClick={() => setReferenceImage(null)}
                                    className="text-xs text-red-500 hover:text-red-400 font-medium"
                                >
                                    Change Image
                                </button>
                            </div>

                            <div
                                ref={viewportRef}
                                className="relative w-full aspect-square bg-black/5 dark:bg-white/5 rounded-2xl overflow-hidden border border-light-border dark:border-dark-border cursor-grab active:cursor-grabbing"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                {/* Instruction Text */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white/70 text-xs font-medium pointer-events-none">
                                    Hold and drag to change camera angle
                                </div>

                                {/* Circular Guide */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                    <circle cx="50%" cy="50%" r="120" fill="none" stroke="currentColor" strokeWidth="1" className="text-light-text dark:text-dark-text" />
                                    <circle cx="50%" cy="50%" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-light-text dark:text-dark-text" />
                                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-light-text dark:text-dark-text" />
                                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-light-text dark:text-dark-text" />
                                </svg>

                                {/* Reference Image (Center) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 pointer-events-none">
                                    <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                                </div>

                                {/* Camera Icon (Moving) */}
                                <div
                                    className="absolute top-1/2 left-1/2 w-8 h-8 transition-transform duration-100 pointer-events-none"
                                    style={{
                                        transform: `translate(calc(-50% + ${cameraPos.x}px), calc(-50% + ${cameraPos.y}px))`
                                    }}
                                >
                                    <div className="relative">
                                        {/* Line connecting camera to center */}
                                        <svg className="absolute" style={{ width: '200px', height: '200px', left: '-100px', top: '-100px' }}>
                                            <line
                                                x1="100"
                                                y1="100"
                                                x2={100 - cameraPos.x}
                                                y2={100 - cameraPos.y}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="text-brand-purple opacity-50"
                                            />
                                        </svg>
                                        {/* Camera Icon */}
                                        <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-purple/50 relative z-10">
                                            <span className="text-lg">📷</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Angle Indicators */}
                                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg text-white text-xs font-mono pointer-events-none">
                                    R: {Math.round(rotation)}°
                                </div>
                                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg text-white text-xs font-mono pointer-events-none">
                                    T: {Math.round(tilt)}°
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                            {/* Rotation Slider */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
                                        Rotation
                                    </label>
                                    <span className="text-xs font-mono text-brand-purple font-bold">{Math.round(rotation)}°</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={rotation}
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                    className="w-full h-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full appearance-none cursor-pointer slider-purple"
                                />
                            </div>

                            {/* Tilt Slider */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
                                        Tilt
                                    </label>
                                    <span className="text-xs font-mono text-brand-magenta font-bold">{Math.round(tilt)}°</span>
                                </div>
                                <input
                                    type="range"
                                    min="-90"
                                    max="90"
                                    value={tilt}
                                    onChange={(e) => setTilt(Number(e.target.value))}
                                    className="w-full h-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full appearance-none cursor-pointer slider-magenta"
                                />
                            </div>

                            {/* Zoom Slider */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
                                        Zoom
                                    </label>
                                    <span className="text-xs font-mono text-brand-yellow font-bold">{zoom}</span>
                                </div>
                                <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full appearance-none cursor-pointer slider-yellow"
                                />
                            </div>
                        </div>

                        {/* Best Angles Option */}
                        <div className="flex items-center gap-3 p-3 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border">
                            <input
                                type="checkbox"
                                id="bestAngles"
                                checked={generateBestAngles}
                                onChange={(e) => setGenerateBestAngles(e.target.checked)}
                                className="w-4 h-4 accent-brand-purple cursor-pointer"
                            />
                            <label htmlFor="bestAngles" className="flex-1 text-xs font-medium text-light-text dark:text-dark-text cursor-pointer">
                                Generate from 12 best angles
                            </label>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full py-3.5 bg-gradient-to-r from-brand-purple via-brand-magenta to-brand-purple bg-[length:200%_100%] hover:bg-[position:100%_0] text-white font-bold text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-brand-purple/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95"
                        >
                            {isGenerating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⚙️</span>
                                    Generating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <span>⚡</span>
                                    Generate Angle
                                </span>
                            )}
                        </button>
                    </>
                )}
            </div>

            {/* Custom Slider Styles */}
            <style>{`
                .slider-purple::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #8B5CF6, #A855F7);
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
                }
                .slider-magenta::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #EC4899, #F472B6);
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4);
                }
                .slider-yellow::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FFD60A, #FDE047);
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(255, 214, 10, 0.4);
                }
            `}</style>
        </div>
    );
};

export default GenerAngles;
