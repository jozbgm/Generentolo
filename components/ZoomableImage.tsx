import React, { useState, useRef, useEffect } from 'react';

interface ZoomableImageProps {
    src: string;
    alt: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Touch state for pinch-to-zoom
    const [initialDistance, setInitialDistance] = useState<number | null>(null);
    const [initialScale, setInitialScale] = useState(1);

    // Reset on image change
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [src]);

    // Calculate distance between two touch points
    const getTouchDistance = (touches: React.TouchList) => {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };


    // Handle pinch-to-zoom
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.stopPropagation();
            const distance = getTouchDistance(e.touches);
            setInitialDistance(distance);
            setInitialScale(scale);
        } else if (e.touches.length === 1 && scale > 1) {
            e.stopPropagation();
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y,
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialDistance) {
            e.preventDefault();
            e.stopPropagation();

            const distance = getTouchDistance(e.touches);
            const scaleChange = distance / initialDistance;
            const newScale = Math.min(Math.max(initialScale * scaleChange, 1), 5);
            setScale(newScale);

            // Reset position when zooming out completely
            if (newScale === 1) {
                setPosition({ x: 0, y: 0 });
            }
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
            e.preventDefault();
            e.stopPropagation();

            const newX = e.touches[0].clientX - dragStart.x;
            const newY = e.touches[0].clientY - dragStart.y;

            // Calculate boundaries
            const img = imageRef.current;
            const container = containerRef.current;
            if (img && container) {
                const maxX = (img.offsetWidth * scale - container.offsetWidth) / 2;
                const maxY = (img.offsetHeight * scale - container.offsetHeight) / 2;

                setPosition({
                    x: Math.min(Math.max(newX, -maxX), maxX),
                    y: Math.min(Math.max(newY, -maxY), maxY),
                });
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (e.touches.length < 2) {
            setInitialDistance(null);
        }
        if (e.touches.length === 0) {
            setIsDragging(false);
        }
    };

    // Mouse events for desktop
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY * -0.01;
        const newScale = Math.min(Math.max(scale + delta, 1), 5);
        setScale(newScale);

        if (newScale === 1) {
            setPosition({ x: 0, y: 0 });
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
                    x: Math.min(Math.max(newX, -maxX), maxX),
                    y: Math.min(Math.max(newY, -maxY), maxY),
                });
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Double tap to zoom
    const lastTapRef = useRef<number>(0);
    const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;

        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
            e.preventDefault();
            e.stopPropagation();

            if (scale === 1) {
                setScale(2.5);
            } else {
                setScale(1);
                setPosition({ x: 0, y: 0 });
            }
        }

        lastTapRef.current = now;
    };

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden max-w-[90vw] max-h-[90vh] touch-none select-none"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleDoubleTap}
        >
            <img
                ref={imageRef}
                src={src}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-transform duration-100"
                style={{
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                }}
                draggable={false}
            />

            {/* Zoom indicator */}
            {scale > 1 && (
                <div className="absolute top-2 right-2 px-3 py-1 bg-black/60 text-white text-sm rounded-full pointer-events-none">
                    {Math.round(scale * 100)}%
                </div>
            )}

            {/* Instructions overlay (only show initially) */}
            {scale === 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 text-white text-xs rounded-full pointer-events-none animate-fadeIn">
                    <span className="hidden sm:inline">🖱️ Scroll to zoom • Click & drag to pan</span>
                    <span className="sm:hidden">👆 Pinch to zoom • Double tap</span>
                </div>
            )}
        </div>
    );
};

export default ZoomableImage;
