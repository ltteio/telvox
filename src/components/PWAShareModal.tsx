import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Smartphone, Monitor, ShieldCheck, Download } from 'lucide-react';

interface PWAShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PWAShareModal({ isOpen, onClose }: PWAShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamic link based on the loaded environment
      setAppUrl(window.location.origin);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // Generate QR code using a professional API with custom colors to fit the Telvox brand (emerald color and dark background)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=10b981&bgcolor=020617&data=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar animate-scale-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl cursor-pointer transition-all"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest inline-block mb-3">
            INSTALLATION & QR CODE
          </span>
          <h3 className="text-2xl font-sans font-black text-white uppercase tracking-wide">
            INSTALLER TELVOX SUR TES APPAREILS
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Telvox est entièrement configuré en tant que Progressive Web App (PWA). Installe-le sur ton téléphone ou ordinateur pour un accès direct hors ligne de qualité Élite.
          </p>
        </div>

        {/* Main Grid: Left is QR Code & copy link, Right is guides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: QR Code Container */}
          <div className="flex flex-col items-center bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 relative group overflow-hidden shadow-inner flex items-center justify-center">
              <img 
                src={qrCodeUrl} 
                alt="PWA Install QR Code" 
                className="w-44 h-44 rounded-lg relative z-10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-emerald-500/5 filter blur-md group-hover:bg-emerald-500/10 transition-all" />
            </div>

            <span className="text-[10px] font-mono text-emerald-400 mt-3 animate-pulse text-center uppercase tracking-widest font-bold">
              SCANDE AVEC TON SMARTPHONE
            </span>

            {/* Direct PWA install button for compatible devices */}
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="mt-4 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-black text-xs tracking-wider uppercase rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 animate-pulse"
              >
                <Download className="w-4 h-4 stroke-[3px]" />
                <span>INSTALLER DIRECTEMENT</span>
              </button>
            )}

            {/* App Link block with Copy Button */}
            <div className="mt-4 w-full">
              <span className="text-[10px] text-slate-500 font-mono block mb-1 uppercase tracking-wider text-left">Lien de l'application</span>
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                <input 
                  type="text" 
                  readOnly 
                  value={appUrl} 
                  className="bg-transparent border-none text-xs text-slate-300 select-all focus:outline-none flex-1 font-mono truncate"
                />
                <button
                  onClick={handleCopy}
                  className="p-1.5 bg-slate-850 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
                  title="Copier le lien de la PWA"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Guides */}
          <div className="space-y-5">
            {/* iOS Safari Guide */}
            <div className="space-y-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center space-x-2.5 text-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">SUR IPHONE & IPAD (iOS)</h4>
                  <span className="text-[10px] text-slate-500 font-mono block uppercase">Navigateur Safari</span>
                </div>
              </div>
              <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside pl-1 mt-2 font-medium">
                <li>Ouvre le lien ci-contre dans <span className="text-slate-200">Safari</span>.</li>
                <li>Appuie sur le bouton <span className="text-slate-200">Partager</span> (icône avec une flèche vers le haut).</li>
                <li>Fais défiler et sélectionne <span className="text-emerald-400 font-bold">Sur l'écran d'accueil</span>.</li>
                <li>Valide en cliquant sur <span className="text-slate-200">Ajouter</span> en haut à droite.</li>
              </ol>
            </div>

            {/* Android Guide */}
            <div className="space-y-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center space-x-2.5 text-slate-100">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">SUR ANDROID (Samsung, Xiaomi, Pixel...)</h4>
                  <span className="text-[10px] text-slate-500 font-mono block uppercase">Navigateur Chrome / Firefox</span>
                </div>
              </div>
              <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside pl-1 mt-2 font-medium">
                <li>Ouvre le lien ci-contre dans <span className="text-slate-200">Chrome</span>.</li>
                <li>Sélectionne l'icône des <span className="text-slate-200">3 points verticaux</span> en haut à droite.</li>
                <li>Sélectionne <span className="text-emerald-400 font-bold">Installer l'application</span> ou <span className="text-slate-200">Ajouter à l'écran d'accueil</span>.</li>
              </ol>
            </div>

            {/* Desktop Guide */}
            <div className="space-y-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center space-x-2.5 text-slate-100">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">SUR WINDOWS & MACOS</h4>
                  <span className="text-[10px] text-slate-500 font-mono block uppercase">Tout navigateur moderne</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 pl-1 leading-relaxed">
                Clique sur l'icône de <span className="text-emerald-400 font-bold">téléchargement / écran</span> située dans la barre d'adresse de ton navigateur (Chrome, Edge, Brave) pour transformer instantanément Telvox en une application autonome sur ton bureau.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Security Badge */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Application 100% Sécurisée & Certifiée conforme PWA</span>
        </div>

      </div>
    </div>
  );
}
