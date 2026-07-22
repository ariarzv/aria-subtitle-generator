import React from 'react';
import { Moon, Cloud, Sun } from 'lucide-react';

const themes = [
  { id: 'dark', name: 'رویال تاریک', icon: Moon, description: 'مشکی عمیق' },
  { id: 'charcoal', name: 'رویال زغالی', icon: Cloud, description: 'خاکستری تیره' },
  { id: 'light', name: 'رویال روشن', icon: Sun, description: 'کرم عاجی' }
];

export default function ThemeSwitcher({ currentTheme, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-1">
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isActive = currentTheme === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            title={`${theme.name} - ${theme.description}`}
            className={`p-2 rounded-lg transition-all ${
              isActive
                ? 'bg-gradient-to-br from-[var(--gold-bright)] to-[var(--gold-deep)] text-black shadow-lg'
                : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-primary)]'
            }`}
            style={isActive ? { boxShadow: '0 0 15px var(--accent-glow)' } : {}}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}