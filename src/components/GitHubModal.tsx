import React, { useState } from 'react';
import { X, Github, Terminal, Copy, Check, ExternalLink, Code2, Sparkles, ShieldCheck } from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Inicializar Git y primer commit',
      cmd: `git init\ngit add .\ngit commit -m "feat: iPhone Liquid Glass Wardrobe & AI Stylist"`,
    },
    {
      title: '2. Crear repositorio en GitHub',
      cmd: `gh repo create mi-armario-liquid-glass --public --source=. --remote=origin\n# O créalo manualmente en https://github.com/new y luego:\ngit remote add origin https://github.com/TU_USUARIO/mi-armario-liquid-glass.git`,
    },
    {
      title: '3. Subir código a la rama principal (main)',
      cmd: `git branch -M main\ngit push -u origin main`,
    },
    {
      title: '4. Configurar tu API Key de Gemini en tu entorno o hosting',
      cmd: `# En tu archivo local .env:\nGEMINI_API_KEY=tu_api_key_aqui\n\n# O en Vercel / Railway / Cloud Run como Environment Variable:\n# Name: GEMINI_API_KEY\n# Value: tu_clave_de_google_ai_studio`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="liquid-glass-card rounded-[2rem] max-w-xl w-full max-h-[85vh] overflow-y-auto border border-white/80 shadow-2xl p-6 sm:p-7 relative text-slate-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Listo para Subir a GitHub
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Git Ready
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Guía rápida para publicar tu repositorio y desplegar tu app de iPhone
            </p>
          </div>
        </div>

        {/* Informative highlight */}
        <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs text-sky-900 space-y-1 mb-5">
          <div className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Código limpio, modular y con README.md profesional</span>
          </div>
          <p className="text-[11px] text-sky-800 leading-relaxed">
            Se incluye un archivo <code>README.md</code> completo con capturas, características de la interfaz <strong>Liquid Glass de iPhone</strong>, arquitectura Express+Vite, y configuración de Gemini AI.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{step.title}</span>
                <button
                  onClick={() => copyToClipboard(step.cmd, idx)}
                  className="flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 font-medium cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar comandos</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-950 text-slate-200 p-3 rounded-xl text-[11px] font-mono whitespace-pre-wrap overflow-x-auto border border-slate-800">
                {step.cmd}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom security notice */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Las API Keys nunca se exponen al cliente (proxy en server.ts)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
