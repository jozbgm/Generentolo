import React, { useState, useEffect } from 'react';
import { ClapperboardIcon, XIcon, SparklesIcon } from './icons';

interface ShotsStoryboardModalProps {
    onClose: () => void;
    onGenerate: (duration: number, aspectRatio: string, audioType: string, brief: string) => void;
    language: 'en' | 'it';
    referenceImages: File[];
    initialDuration?: number;
    initialAspectRatio?: string;
    initialAudioType?: string;
    initialBrief?: string;
}

const DURATION_PRESETS = [5, 10, 15, 30, 60];

const ASPECT_RATIOS = ['Auto', '1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '4:5', '5:4', '21:9'];

const AUDIO_TYPES = [
    { value: 'none',      labelIT: '🔇 Nessuno',   labelEN: '🔇 None' },
    { value: 'music',     labelIT: '🎵 Musica',     labelEN: '🎵 Music' },
    { value: 'sfx',       labelIT: '🔊 SFX',        labelEN: '🔊 SFX' },
    { value: 'voiceover', labelIT: '🎙️ Voiceover',  labelEN: '🎙️ Voiceover' },
    { value: 'ambient',   labelIT: '🌿 Ambient',    labelEN: '🌿 Ambient' },
];

const ShotsStoryboardModal: React.FC<ShotsStoryboardModalProps> = ({
    onClose, onGenerate, language, referenceImages,
    initialDuration = 15, initialAspectRatio = '16:9', initialAudioType = 'music', initialBrief = ''
}) => {
    const [duration, setDuration] = useState(initialDuration);
    const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
    const [audioType, setAudioType] = useState(initialAudioType);
    const [brief, setBrief] = useState(initialBrief);
    const [thumbUrls, setThumbUrls] = useState<string[]>([]);

    const isIT = language === 'it';
    const hasImages = referenceImages.length > 0;

    useEffect(() => {
        const urls = referenceImages.slice(0, 4).map(f => URL.createObjectURL(f));
        setThumbUrls(urls);
        return () => urls.forEach(u => URL.revokeObjectURL(u));
    }, [referenceImages]);

    const handleSubmit = () => {
        if (!hasImages) return;
        onGenerate(duration, aspectRatio, audioType, brief.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
    };

    const pillBase = 'px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95';
    const pillActive = 'bg-brand-yellow text-dark-bg border-brand-yellow shadow-sm';
    const pillInactive = 'border-light-border dark:border-dark-border text-light-text-muted dark:text-dark-text-muted hover:border-brand-yellow hover:text-brand-yellow';

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fadeIn" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slideUp max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-light-border dark:border-dark-border flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-light-surface-accent dark:bg-dark-surface-accent border border-brand-yellow/30 flex items-center justify-center shadow-md">
                            <ClapperboardIcon className="w-5 h-5 text-brand-yellow" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-light-text dark:text-dark-text">
                                Shots Storyboard
                            </h2>
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest font-medium">
                                {isIT ? 'Genera prompt da sequenza video' : 'Generate prompts from video sequence'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent text-light-text-muted dark:text-dark-text-muted transition-all hover:rotate-90"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">

                    {/* Reference thumbnails / warning */}
                    {hasImages ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-light-border dark:border-dark-border/50">
                            <div className="flex gap-2 flex-wrap">
                                {thumbUrls.map((url, i) => (
                                    <img
                                        key={i}
                                        src={url}
                                        alt={`Reference ${i + 1}`}
                                        className="w-12 h-12 rounded-lg object-cover border border-light-border dark:border-dark-border flex-shrink-0"
                                    />
                                ))}
                                {referenceImages.length > 4 && (
                                    <div className="w-12 h-12 rounded-lg border border-light-border dark:border-dark-border bg-light-surface-accent dark:bg-dark-surface-accent flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-light-text-muted dark:text-dark-text-muted">
                                            +{referenceImages.length - 4}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted leading-relaxed ml-1">
                                {isIT
                                    ? `${referenceImages.length} reference verranno analizzate per generare i frame`
                                    : `${referenceImages.length} reference image${referenceImages.length > 1 ? 's' : ''} will be analyzed`}
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-brand-yellow/5 border border-brand-yellow/30 text-sm text-light-text-muted dark:text-dark-text-muted">
                            {isIT
                                ? '⚠ Carica almeno un\'immagine di reference per continuare'
                                : '⚠ Load at least one reference image to continue'}
                        </div>
                    )}

                    {/* Brief narrativo */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-2">
                            {isIT ? 'Idea / Brief narrativo (opzionale)' : 'Idea / Narrative brief (optional)'}
                        </label>
                        <textarea
                            value={brief}
                            onChange={e => setBrief(e.target.value)}
                            placeholder={isIT
                                ? 'Descrivi cosa vuoi che succeda, es: "logo 2s, donna cammina 3s, usa il prodotto 5s, closeup prodotto 3s, logo finale 2s"'
                                : 'Describe what should happen, e.g. "logo 2s, woman walks 3s, uses product 5s, product closeup 3s, final logo 2s"'}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-sm resize-none focus:outline-none focus:border-brand-yellow/60 transition-colors placeholder:text-light-text-muted/40 dark:placeholder:text-dark-text-muted/40"
                        />
                        <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-1.5 leading-relaxed">
                            {isIT
                                ? 'È l\'idea che decide quanti shot generare, non la durata. Puoi fare riferimento alle reference per numero, es: "ref 0 (donna)", "ref 1 (prodotto)"'
                                : 'The brief decides how many shots to generate, not the duration. You can reference images by number, e.g. "ref 0 (woman)", "ref 1 (product)"'}
                        </p>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-2">
                            {isIT ? 'Durata (secondi)' : 'Duration (seconds)'}
                        </label>
                        <div className="flex items-center gap-3 mb-2">
                            <input
                                type="number"
                                min={3}
                                max={120}
                                step={1}
                                value={duration}
                                onChange={e => setDuration(Math.max(3, Math.min(120, Number(e.target.value))))}
                                className="w-24 px-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-sm font-bold text-center focus:outline-none focus:border-brand-yellow/60 transition-colors"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {DURATION_PRESETS.map(preset => (
                                <button
                                    key={preset}
                                    onClick={() => setDuration(preset)}
                                    className={`${pillBase} ${duration === preset ? pillActive : pillInactive}`}
                                >
                                    {preset}s
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-1.5">
                            {isIT
                                ? '→ il numero di shot viene deciso in base al brief'
                                : '→ shot count is decided based on the brief'}
                        </p>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-2">
                            Aspect Ratio
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ASPECT_RATIOS.map(ar => (
                                <button
                                    key={ar}
                                    onClick={() => setAspectRatio(ar)}
                                    className={`${pillBase} ${aspectRatio === ar ? pillActive : pillInactive}`}
                                >
                                    {ar}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audio Type */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-2">
                            Audio
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {AUDIO_TYPES.map(a => (
                                <button
                                    key={a.value}
                                    onClick={() => setAudioType(a.value)}
                                    className={`${pillBase} ${audioType === a.value ? pillActive : pillInactive}`}
                                >
                                    {isIT ? a.labelIT : a.labelEN}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-4 border-t border-light-border dark:border-dark-border flex-shrink-0 space-y-2">
                    <button
                        onClick={handleSubmit}
                        disabled={!hasImages}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-yellow text-dark-bg rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        {isIT ? 'Genera Storyboard' : 'Generate Storyboard'}
                    </button>
                    <p className="text-center text-xs text-light-text-muted dark:text-dark-text-muted">
                        {isIT ? '⌘+Invio per generare' : '⌘+Enter to generate'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShotsStoryboardModal;
