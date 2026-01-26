import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from './icons';

import { GeneratedImage } from '../types';

interface ImageLightboxProps {
    images: GeneratedImage[];
    index: number;
    onClose: () => void;
    onNavigate: (newIndex: number) => void;
    onSaveAsDna: (image: GeneratedImage) => void;
    onStoryboard?: (image: GeneratedImage) => void;
    t: any;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
    images,
    index,
    onClose,
    onNavigate,
    onSaveAsDna,
    onStoryboard,
    t
}) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Touch state for pinch-to-zoom
    const [initialDistance, setInitialDistance] = useState<number | null>(null);
    const [initialScale, setInitialScale] = useState(1);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    const currentImage = images[index];

    // Reset on image change
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [index]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [index]);

    const handlePrev = useCallback(() => {
        if (index > 0) onNavigate(index - 1);
        else onNavigate(images.length - 1);
    }, [index, images.length, onNavigate]);

    const handleNext = useCallback(() => {
        if (index < images.length - 1) onNavigate(index + 1);
        else onNavigate(0);
    }, [index, images.length, onNavigate]);

    // Calculate distance between two touch points
    const getTouchDistance = (touches: React.TouchList) => {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Handle touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.stopPropagation();
            const distance = getTouchDistance(e.touches);
            setInitialDistance(distance);
            setInitialScale(scale);
        } else if (e.touches.length === 1) {
            if (scale > 1) {
                e.stopPropagation();
                setIsDragging(true);
                setDragStart({
                    x: e.touches[0].clientX - position.x,
                    y: e.touches[0].clientY - position.y,
                });
            } else {
                setTouchStartX(e.touches[0].clientX);
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialDistance) {
            e.preventDefault();
            e.stopPropagation();
            const distance = getTouchDistance(e.touches);
            const scaleChange = distance / initialDistance;
            const newScale = Math.min(Math.max(initialScale * scaleChange, 1), 8);
            setScale(newScale);
            if (newScale === 1) setPosition({ x: 0, y: 0 });
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
            e.preventDefault();
            e.stopPropagation();
            const newX = e.touches[0].clientX - dragStart.x;
            const newY = e.touches[0].clientY - dragStart.y;

            const img = imageRef.current;
            const container = containerRef.current;
            if (img && container) {
                const maxX = (img.offsetWidth * scale - container.offsetWidth) / 2;
                const maxY = (img.offsetHeight * scale - container.offsetHeight) / 2;
                setPosition({
                    x: Math.min(Math.max(newX, -Math.max(0, maxX)), Math.max(0, maxX)),
                    y: Math.min(Math.max(newY, -Math.max(0, maxY)), Math.max(0, maxY)),
                });
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (e.touches.length < 2) setInitialDistance(null);
        if (e.touches.length === 0) {
            setIsDragging(false);
            if (scale === 1 && touchStartX !== null) {
                const diff = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(diff) > 70) {
                    if (diff > 0) handlePrev();
                    else handleNext();
                }
            }
            setTouchStartX(null);
        }
    };

    // Mouse events for desktop zoom/pan
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY * -0.01;
        const newScale = Math.min(Math.max(scale + delta, 1), 8);

        // When zooming in, try to keep the mouse point stable
        if (newScale !== scale) {
            setScale(newScale);
            if (newScale === 1) setPosition({ x: 0, y: 0 });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            e.stopPropagation();
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            e.preventDefault();
            e.stopPropagation();
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;
            const img = imageRef.current;
            const container = containerRef.current;
            if (img && container) {
                const maxX = (img.offsetWidth * scale - container.offsetWidth) / 2;
                const maxY = (img.offsetHeight * scale - container.offsetHeight) / 2;
                setPosition({
                    x: Math.min(Math.max(newX, -Math.max(0, maxX)), Math.max(0, maxX)),
                    y: Math.min(Math.max(newY, -Math.max(0, maxY)), Math.max(0, maxY)),
                });
            }
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement("a");
        link.href = currentImage.imageDataUrl || currentImage.thumbnailDataUrl!;
        link.download = `generentolo-${currentImage.id}.png`;
        link.click();
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 pointer-events-auto"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Header Controls */}
            <div className="flex items-center justify-between p-4 md:p-6 z-[110] bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
                        title={t.close}
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                    <div className="text-white/80 hidden md:block">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-0.5">{t.generationResult}</p>
                        <p className="text-sm font-medium truncate max-w-[400px]">{currentImage.prompt}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onSaveAsDna(currentImage); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-purple/20 hover:bg-brand-purple/30 text-white transition-all backdrop-blur-md border border-brand-purple/30"
                        title="Save DNA"
                    >
                        <span className="text-lg">🧬</span>
                        <span className="text-xs font-bold hidden sm:inline uppercase tracking-wider">DNA</span>
                    </button>

                    {onStoryboard && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onStoryboard(currentImage); }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-magenta/20 hover:bg-brand-magenta/30 text-white transition-all backdrop-blur-md border border-brand-magenta/30"
                            title="Storyboard"
                        >
                            <span className="text-lg">🎬</span>
                            <span className="text-xs font-bold hidden sm:inline uppercase tracking-wider">Story</span>
                        </button>
                    )}

                    <button
                        onClick={handleDownload}
                        className="p-2.5 rounded-xl bg-brand-yellow/20 hover:bg-brand-yellow/30 text-brand-yellow transition-all backdrop-blur-md border border-brand-yellow/30"
                        title={t.download}
                    >
                        <DownloadIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Viewer Area */}
            <div
                ref={containerRef}
                className="flex-1 relative overflow-hidden flex items-center justify-center touch-none select-none"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Navigation Arrows (Desktop) */}
                <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-6 z-[120] p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5 hidden md:flex items-center justify-center"
                >
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-6 z-[120] p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5 hidden md:flex items-center justify-center"
                >
                    <ChevronRightIcon className="w-8 h-8" />
                </button>

                {/* The Image */}
                <div
                    className="relative transition-transform duration-100 ease-out"
                    style={{
                        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                    }}
                >
                    <img
                        ref={imageRef}
                        src={currentImage.imageDataUrl || currentImage.thumbnailDataUrl}
                        alt={currentImage.prompt}
                        className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.5)] transition-opacity duration-300"
                        draggable={false}
                    />

                    {/* Zoom Level Indicator */}
                    {scale > 1 && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10 animate-in fade-in zoom-in pointer-events-none">
                            {Math.round(scale * 100)}%
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Info Bar */}
            <div className="p-6 pb-10 md:pb-6 z-[110] bg-gradient-to-t from-black/50 to-transparent flex flex-col items-center gap-4">
                <div className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white/90 text-sm font-bold tracking-widest uppercase">
                    {index + 1} <span className="opacity-30 mx-2">/</span> {images.length}
                </div>

                <div className="flex items-center gap-8 md:hidden">
                    <button onClick={handlePrev} className="p-4 text-white/50 hover:text-white"><ChevronLeftIcon className="w-8 h-8" /></button>
                    <div className="w-1 h-1 rounded-full bg-white/20"></div>
                    <button onClick={handleNext} className="p-4 text-white/50 hover:text-white"><ChevronRightIcon className="w-8 h-8" /></button>
                </div>

                <div className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
                    <span className="hidden md:inline">Scroll to Zoom • Drag to Pan • Escape to Exit</span>
                    <span className="md:hidden">Pinch to Zoom • Swipe to Navigate</span>
                </div>
            </div>
        </div>
    );
};

export default ImageLightbox;
