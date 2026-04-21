import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, DnaIcon, ClapperboardIcon } from './icons';
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
    const [showControls, setShowControls] = useState(true);
    const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [initialDistance, setInitialDistance] = useState<number | null>(null);
    const [initialScale, setInitialScale] = useState(1);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchStartY, setTouchStartY] = useState<number | null>(null);

    const currentImage = images[index];

    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [index]);

    // Auto-hide controls after 3s of inactivity
    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
        hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }, []);

    useEffect(() => {
        resetHideTimer();
        return () => { if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current); };
    }, [index]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [index]);

    // Prevent body scroll while lightbox is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handlePrev = useCallback(() => {
        onNavigate(index > 0 ? index - 1 : images.length - 1);
    }, [index, images.length, onNavigate]);

    const handleNext = useCallback(() => {
        onNavigate(index < images.length - 1 ? index + 1 : 0);
    }, [index, images.length, onNavigate]);

    const getTouchDistance = (touches: React.TouchList) => {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        resetHideTimer();
        if (e.touches.length === 2) {
            e.stopPropagation();
            setInitialDistance(getTouchDistance(e.touches));
            setInitialScale(scale);
        } else if (e.touches.length === 1) {
            if (scale > 1) {
                e.stopPropagation();
                setIsDragging(true);
                setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
            } else {
                setTouchStartX(e.touches[0].clientX);
                setTouchStartY(e.touches[0].clientY);
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialDistance) {
            e.preventDefault();
            e.stopPropagation();
            const newScale = Math.min(Math.max(initialScale * (getTouchDistance(e.touches) / initialDistance), 1), 8);
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
            if (scale === 1 && touchStartX !== null && touchStartY !== null) {
                const dx = e.changedTouches[0].clientX - touchStartX;
                const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
                // Only swipe if horizontal movement dominates
                if (Math.abs(dx) > 50 && Math.abs(dx) > dy) {
                    if (dx > 0) handlePrev();
                    else handleNext();
                }
            }
            setTouchStartX(null);
            setTouchStartY(null);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newScale = Math.min(Math.max(scale + e.deltaY * -0.01, 1), 8);
        setScale(newScale);
        if (newScale === 1) setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        resetHideTimer();
        if (scale > 1) {
            e.stopPropagation();
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        resetHideTimer();
        if (isDragging && scale > 1) {
            e.preventDefault();
            const img = imageRef.current;
            const container = containerRef.current;
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;
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

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = currentImage.imageDataUrl || currentImage.thumbnailDataUrl!;
        link.download = `generentolo-${currentImage.id}.png`;
        link.click();
    };

    return (
        <div
            className="fixed inset-0 z-[200] bg-black animate-fadeIn"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {/* Full-screen image area */}
            <div
                ref={containerRef}
                className="absolute inset-0 flex items-center justify-center touch-none select-none"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => { if (scale === 1) resetHideTimer(); }}
            >
                <div
                    className="transition-transform duration-100 ease-out"
                    style={{
                        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    }}
                >
                    <img
                        ref={imageRef}
                        src={currentImage.imageDataUrl || currentImage.thumbnailDataUrl}
                        alt={currentImage.prompt}
                        className="max-w-[100vw] max-h-[100vh] w-screen h-screen object-contain"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Overlaid controls — fade in/out */}
            <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Top bar: close + actions */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-3 pb-6 bg-gradient-to-b from-black/70 to-transparent pointer-events-auto">
                    {/* Left: action buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onSaveAsDna(currentImage); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-brand-yellow backdrop-blur-md border border-white/10 transition-all"
                        >
                            <DnaIcon className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">DNA</span>
                        </button>
                        {onStoryboard && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onStoryboard(currentImage); }}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-brand-yellow backdrop-blur-md border border-white/10 transition-all"
                            >
                                <ClapperboardIcon className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Story</span>
                            </button>
                        )}
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-brand-yellow backdrop-blur-md border border-white/10 transition-all"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Right: close */}
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Desktop navigation arrows */}
                <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 hidden md:flex items-center justify-center pointer-events-auto transition-all"
                >
                    <ChevronLeftIcon className="w-7 h-7" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 hidden md:flex items-center justify-center pointer-events-auto transition-all"
                >
                    <ChevronRightIcon className="w-7 h-7" />
                </button>

                {/* Bottom bar: counter + zoom level */}
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 pb-4 pt-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-auto">
                    {scale > 1 && (
                        <div className="px-3 py-1 bg-black/70 rounded-full text-white text-xs font-bold border border-white/10">
                            {Math.round(scale * 100)}%
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        {/* Mobile swipe navigation */}
                        <button onClick={handlePrev} className="p-3 text-white/60 hover:text-white md:hidden">
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-xs font-bold tracking-widest border border-white/10">
                            {index + 1} <span className="opacity-50 mx-1">/</span> {images.length}
                        </div>
                        <button onClick={handleNext} className="p-3 text-white/60 hover:text-white md:hidden">
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <span className="hidden md:inline">Scroll to Zoom · Drag to Pan · Esc to close</span>
                        <span className="md:hidden">Pinch to Zoom · Swipe to Navigate</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ImageLightbox;
