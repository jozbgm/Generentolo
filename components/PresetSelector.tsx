import React, { useState } from 'react';
import { SparklesIcon, ChevronRightIcon } from './icons';
import presetsData from '../config/nano-banana-presets.json';

interface PresetSelectorProps {
  onApplyPreset: (prompt: string, model: string, aspectRatio: string) => void;
  language: 'en' | 'it';
  onClose: () => void;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({ onApplyPreset, language, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = {
    photography: language === 'it' ? 'Fotografia' : 'Photography',
    art_design: language === 'it' ? 'Arte & Design' : 'Art & Design',
    commercial: language === 'it' ? 'Commerciale' : 'Commercial',
    illustration: language === 'it' ? 'Illustrazione' : 'Illustration',
    landscape: language === 'it' ? 'Paesaggi' : 'Landscape'
  };

  const handlePresetClick = (preset: any) => {
    const example = preset.examples[0];
    onApplyPreset(example, preset.model, preset.aspectRatio);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-light-bg dark:bg-dark-bg rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-yellow to-brand-magenta p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {language === 'it' ? '🎨 Presets Professionali v1.3' : '🎨 Professional Presets v1.3'}
              </h2>
              <p className="text-white/90 text-sm">
                {language === 'it'
                  ? 'Template ottimizzati per Nano Banana Flash & Pro 3.0'
                  : 'Optimized templates for Nano Banana Flash & Pro 3.0'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedCategory ? (
            // Category Selection
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(categories).map(([key, label]) => {
                const categoryPresets = presetsData.presets[key as keyof typeof presetsData.presets];
                const presetCount = Object.keys(categoryPresets).length;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6 hover:border-brand-purple hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                        {label}
                      </h3>
                      <ChevronRightIcon className="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {presetCount} {language === 'it' ? 'preset disponibili' : 'presets available'}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            // Preset Selection
            <div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-brand-purple hover:text-brand-magenta mb-4 transition-colors"
              >
                ← {language === 'it' ? 'Torna alle categorie' : 'Back to categories'}
              </button>

              <div className="space-y-4">
                {Object.entries(presetsData.presets[selectedCategory as keyof typeof presetsData.presets]).map(([key, preset]: [string, any]) => (
                  <div
                    key={key}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-5 hover:border-brand-purple transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-light-text dark:text-dark-text mb-1">
                          {preset.name}
                        </h4>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {preset.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePresetClick(preset)}
                        className="px-4 py-2 bg-gradient-to-r from-brand-yellow to-brand-magenta text-white rounded-lg hover:scale-105 transition-transform font-semibold text-sm whitespace-nowrap ml-4"
                      >
                        {language === 'it' ? 'Usa' : 'Use'}
                      </button>
                    </div>

                    {/* Preset Info */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-brand-purple/20 text-brand-purple rounded-full text-xs font-medium">
                        {preset.model === 'gemini-2.5-flash-image' ? '⚡ Flash' : '⭐ PRO'}
                      </span>
                      {preset.resolution && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                          {preset.resolution}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                        {preset.aspectRatio}
                      </span>
                    </div>

                    {/* Example Preview */}
                    <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-3 text-xs text-light-text-secondary dark:text-dark-text-secondary font-mono overflow-x-auto">
                      {preset.examples[0].substring(0, 150)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border p-4">
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary text-center">
            {language === 'it'
              ? '💡 I preset applicano automaticamente prompt ottimizzati, modello e aspect ratio consigliati'
              : '💡 Presets automatically apply optimized prompts, recommended model and aspect ratio'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PresetSelector;