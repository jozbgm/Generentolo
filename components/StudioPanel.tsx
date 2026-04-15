import React, { useState } from 'react';
import { CameraIcon, LightbulbIcon, ShirtIcon, LayoutGridIcon, ChevronDownIcon, SparklesIcon, TargetIcon } from './icons';
import CustomSelect from './CustomSelect';
import {
    CAMERAS, LENSES, FOCAL_LENGTHS, LIGHT_DIRECTIONS,
    WARDROBE_CATEGORIES, SHOTS, PRODUCTION_KITS, FOCUS_PRESETS
} from '../data/studioPresets';

interface StudioPanelProps {
    t: any;
    studioConfig: any;
    setStudioConfig: (config: any) => void;
}

const StudioPanel: React.FC<StudioPanelProps> = ({ t, studioConfig, setStudioConfig }) => {
    const [openSection, setOpenSection] = useState<string | null>('cinema');

    const updateConfig = (key: string, value: any) => {
        if (value === null || value === undefined || value === '') {
            const newConfig = { ...studioConfig };
            delete newConfig[key];
            setStudioConfig(newConfig);
        } else {
            setStudioConfig({ ...studioConfig, [key]: value });
        }
    };

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    const renderDropdown = (label: string, value: string, options: any[], onChange: (val: string) => void) => (
        <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-yellow">
                {label}
            </label>
            <CustomSelect
                value={value || null}
                placeholder={t.noneOption}
                options={options.map((opt: any) => ({ value: opt.id, label: opt.name }))}
                onChange={(val) => onChange(val || '')}
            />
        </div>
    );

    return (
        <div className="space-y-3 animate-in fade-in duration-300">
            {/* Cinema Rig Section */}
            <div className="border border-dark-border rounded-2xl overflow-hidden">
                <button
                    onClick={() => toggleSection('cinema')}
                    className={`w-full flex items-center justify-between p-3 font-semibold transition-all ${openSection === 'cinema' ? 'bg-brand-yellow text-dark-bg' : 'text-dark-text hover:bg-white/5 bg-transparent'}`}
                >
                    <div className="flex items-center gap-2 text-sm">
                        <CameraIcon className={`w-4 h-4 ${openSection === 'cinema' ? 'text-dark-bg' : 'text-brand-yellow'}`} />
                        <span>{t.studioCinemaRigTitle}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${openSection === 'cinema' ? 'rotate-180 text-dark-bg' : 'opacity-50 text-dark-text'}`} />
                </button>
                {openSection === 'cinema' && (
                    <div className="p-3 space-y-3 bg-white/5 border-t border-dark-border animate-in slide-in-from-top-1 duration-200">
                        {renderDropdown(t.studioCameraModel, studioConfig.camera, CAMERAS, (val) => updateConfig('camera', val))}
                        {renderDropdown(t.studioLensModel, studioConfig.lens, LENSES, (val) => updateConfig('lens', val))}
                        {renderDropdown(t.studioFocalLength, studioConfig.focal, FOCAL_LENGTHS, (val) => updateConfig('focal', val))}
                    </div>
                )}
            </div>

            {/* Light Forge Section */}
            <div className="border border-dark-border rounded-2xl overflow-hidden">
                <button
                    onClick={() => toggleSection('light')}
                    className={`w-full flex items-center justify-between p-3 font-semibold transition-all ${openSection === 'light' ? 'bg-brand-yellow text-dark-bg' : 'text-dark-text hover:bg-white/5 bg-transparent'}`}
                >
                    <div className="flex items-center gap-2 text-sm">
                        <LightbulbIcon className={`w-4 h-4 ${openSection === 'light' ? 'text-dark-bg' : 'text-brand-yellow'}`} />
                        <span>{t.studioLightForgeTitle}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${openSection === 'light' ? 'rotate-180 text-dark-bg' : 'opacity-50 text-dark-text'}`} />
                </button>
                {openSection === 'light' && (
                    <div className="p-3 space-y-3 bg-white/5 border-t border-dark-border animate-in slide-in-from-top-1 duration-200">
                        {renderDropdown(t.studioLightDirection, studioConfig.lightDir, LIGHT_DIRECTIONS, (val) => updateConfig('lightDir', val))}

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
                                {t.studioLightQuality}
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateConfig('lightQuality', 'soft')}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${studioConfig.lightQuality === 'soft' ? 'bg-brand-yellow text-black border-brand-yellow shadow-[0_0_10px_rgba(255,217,61,0.4)]' : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border opacity-60'}`}
                                >
                                    {t.studioLightSoft}
                                </button>
                                <button
                                    onClick={() => updateConfig('lightQuality', 'hard')}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${studioConfig.lightQuality === 'hard' ? 'bg-brand-yellow text-black border-brand-yellow shadow-[0_0_10px_rgba(255,217,61,0.4)]' : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border opacity-60'}`}
                                >
                                    {t.studioLightHard}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
                                {t.studioLightColor}
                            </label>
                            <div className="flex gap-1.5 flex-wrap">
                                {['#FFFFFF', '#c8f23a', '#e8e8e0', '#6b6b60', '#111110'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => updateConfig('lightColor', color)}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform ${studioConfig.lightColor === color ? 'border-brand-yellow scale-125 shadow-lg' : 'border-transparent hover:scale-110'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={studioConfig.lightColor || '#FFFFFF'}
                                    onChange={(e) => updateConfig('lightColor', e.target.value)}
                                    className="w-6 h-6 rounded-full overflow-hidden border-none p-0 cursor-pointer bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Wardrobe Studio Section */}
            <div className="border border-dark-border rounded-2xl overflow-hidden">
                <button
                    onClick={() => toggleSection('wardrobe')}
                    className={`w-full flex items-center justify-between p-3 font-semibold transition-all ${openSection === 'wardrobe' ? 'bg-brand-yellow text-dark-bg' : 'text-dark-text hover:bg-white/5 bg-transparent'}`}
                >
                    <div className="flex items-center gap-2 text-sm">
                        <ShirtIcon className={`w-4 h-4 ${openSection === 'wardrobe' ? 'text-dark-bg' : 'text-brand-yellow'}`} />
                        <span>{t.studioWardrobeTitle}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${openSection === 'wardrobe' ? 'rotate-180 text-dark-bg' : 'opacity-50 text-dark-text'}`} />
                </button>
                {openSection === 'wardrobe' && (
                    <div className="p-3 space-y-3 bg-white/5 border-t border-dark-border animate-in slide-in-from-top-1 duration-200">
                        {renderDropdown(t.studioWardrobeGender, studioConfig.wardrobeGender, WARDROBE_CATEGORIES.gender, (val) => updateConfig('wardrobeGender', val))}
                        {renderDropdown(t.studioWardrobeTop, studioConfig.wardrobeTop, WARDROBE_CATEGORIES.tops, (val) => updateConfig('wardrobeTop', val))}
                        {renderDropdown(t.studioWardrobeOuter, studioConfig.wardrobeOuter, WARDROBE_CATEGORIES.outerwear, (val) => updateConfig('wardrobeOuter', val))}
                        {renderDropdown(t.studioWardrobeBottom, studioConfig.wardrobeBottom, WARDROBE_CATEGORIES.bottoms, (val) => updateConfig('wardrobeBottom', val))}
                        {renderDropdown(t.studioWardrobeSet, studioConfig.wardrobeSet, WARDROBE_CATEGORIES.sets, (val) => updateConfig('wardrobeSet', val))}
                    </div>
                )}
            </div>

            {/* Shot Grid Section */}
            <div className="border border-dark-border rounded-2xl overflow-hidden">
                <button
                    onClick={() => toggleSection('shots')}
                    className={`w-full flex items-center justify-between p-3 font-semibold transition-all ${openSection === 'shots' ? 'bg-brand-yellow text-dark-bg' : 'text-dark-text hover:bg-white/5 bg-transparent'}`}
                >
                    <div className="flex items-center gap-2 text-sm">
                        <LayoutGridIcon className={`w-4 h-4 ${openSection === 'shots' ? 'text-dark-bg' : 'text-brand-yellow'}`} />
                        <span>{t.studioShotGridTitle}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${openSection === 'shots' ? 'rotate-180 text-dark-bg' : 'opacity-50 text-dark-text'}`} />
                </button>
                {openSection === 'shots' && (
                    <div className="p-3 bg-white/5 border-t border-dark-border animate-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-2 gap-2">
                            {SHOTS.map(shot => (
                                <button
                                    key={shot.id}
                                    onClick={() => updateConfig('shot', shot.id)}
                                    className={`px-2 py-2 rounded-xl text-[10px] font-bold transition-all border text-center ${studioConfig.shot === shot.id ? 'bg-brand-yellow text-dark-bg border-brand-yellow shadow-md' : 'bg-transparent border-dark-border opacity-60 hover:opacity-100 hover:border-brand-yellow'}`}
                                >
                                    {shot.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Focus Section */}
            <div className="border border-dark-border rounded-2xl overflow-hidden">
                <button
                    onClick={() => toggleSection('focus')}
                    className={`w-full flex items-center justify-between p-3 font-semibold transition-all ${openSection === 'focus' ? 'bg-brand-yellow text-dark-bg' : 'text-dark-text hover:bg-white/5 bg-transparent'}`}
                >
                    <div className="flex items-center gap-2 text-sm">
                        <TargetIcon className={`w-4 h-4 ${openSection === 'focus' ? 'text-dark-bg' : 'text-brand-yellow'}`} />
                        <span>{t.studioFocusTitle || 'Focus & Depth'}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${openSection === 'focus' ? 'rotate-180 text-dark-bg' : 'opacity-50 text-dark-text'}`} />
                </button>
                {openSection === 'focus' && (
                    <div className="p-3 bg-white/5 border-t border-dark-border animate-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-2 gap-2">
                            {FOCUS_PRESETS.map(fp => (
                                <button
                                    key={fp.id}
                                    onClick={() => updateConfig('focus', studioConfig.focus === fp.id ? '' : fp.id)}
                                    className={`px-2 py-2 rounded-xl text-[10px] font-bold transition-all border text-center ${studioConfig.focus === fp.id ? 'bg-brand-yellow text-dark-bg border-brand-yellow shadow-md' : 'bg-transparent border-dark-border opacity-60 hover:opacity-100 hover:border-brand-yellow'}`}
                                >
                                    {fp.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 🚀 Production Kits (Production Workflow) */}
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 px-1">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted">{t.studioProductionKitsTitle}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {PRODUCTION_KITS.map(kit => (
                        <button
                            key={kit.id}
                            onClick={() => {
                                // If clicking the same kit, deselect it. Otherwise, select the new kit.
                                const newKitValue = studioConfig.kit === kit.id ? null : kit.id;
                                updateConfig('kit', newKitValue);
                            }}
                            className={`flex flex-col items-start p-2.5 rounded-xl border-2 transition-all ${studioConfig.kit === kit.id ? 'border-brand-yellow bg-brand-yellow/10 shadow-sm' : 'border-light-border dark:border-dark-border/50 bg-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <span className="text-xs font-bold">{kit.name}</span>
                            <span className="text-[9px] opacity-60 mt-0.5 leading-tight text-left">
                                {kit.id === 'urban-cut' ? t.kitUrbanCutDesc :
                                    kit.id === 'bts' ? t.kitBtsDesc :
                                        t.kitBillboardDesc}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudioPanel;
