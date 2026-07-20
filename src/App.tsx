import React, { useState, useEffect } from 'react';
import { Coffee, Bookmark, Home as HomeIcon, Sparkles, Trash2, Download, Info, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Fortune {
  id: string;
  date: string;
  text: string;
}

const MOCK_FORTUNES = [
  "Fincanında beliren yollar, yakın zamanda çıkacağın uzun ve ferah bir yolculuğu işaret ediyor. Gideceğin yerde seni güzel sürprizler bekliyor.",
  "Kuş figürü, beklediğin o müjdeli haberin çok yakında sana ulaşacağını gösteriyor. İçini ferah tut.",
  "Kalp şekli, aşk hayatında yeni ve heyecan verici bir döneme gireceğinin habercisi. Sevgi dolu günler çok yakın.",
  "Fincanın dibindeki telve birikimi, bir süredir kafana taktığın maddi bir sorunun beklenmedik bir şekilde çözüleceğine işaret ediyor.",
  "At figürü murattır. Çok yakında büyük bir arzuna kavuşacak, başarıdan başarıya koşacaksın.",
  "Ay ve yıldız yan yana çıkmış, bu senin için çok aydınlık ve şanslı bir dönemin başlangıcını müjdeliyor."
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'saved'>('home');
  const [currentFortune, setCurrentFortune] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedFortunes, setSavedFortunes] = useState<Fortune[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Auto-show the beautiful install banner if not installed
      if (!sessionStorage.getItem('installPromptDismissed')) {
        setTimeout(() => setShowInstallPrompt(true), 1500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      setShowInstallPrompt(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('kahve-fali-saved');
    if (saved) {
      try {
        setSavedFortunes(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveToStorage = (fortunes: Fortune[]) => {
    setSavedFortunes(fortunes);
    localStorage.setItem('kahve-fali-saved', JSON.stringify(fortunes));
  };

  const generateFortune = () => {
    setIsGenerating(true);
    setCurrentFortune(null);
    setTimeout(() => {
      const random = MOCK_FORTUNES[Math.floor(Math.random() * MOCK_FORTUNES.length)];
      setCurrentFortune(random);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSaveCurrent = () => {
    if (!currentFortune) return;
    if (savedFortunes.some(f => f.text === currentFortune)) return;

    const newFortune: Fortune = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('tr-TR', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }),
      text: currentFortune
    };
    saveToStorage([newFortune, ...savedFortunes]);
  };

  const removeFortune = (id: string) => {
    saveToStorage(savedFortunes.filter(f => f.id !== id));
  };

  const inIframe = window.self !== window.top;

  const handleInstallClick = async () => {
    if (deferredPrompt && !inIframe) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
      setShowInstallPrompt(false);
    } else {
      // If we cannot prompt directly (iOS Safari or iframe)
      if (inIframe) {
        alert("Lütfen önce uygulamayı yeni sekmede açın (sağ üst menüden).");
      } else {
        alert("Tarayıcınızın Paylaş butonuna tıklayıp 'Ana Ekrana Ekle' seçeneğini kullanarak yükleyebilirsiniz.");
      }
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  return (
    <div className="flex-1 w-full h-[100dvh] flex flex-col items-center bg-gray-50 relative overflow-hidden text-slate-800">
      
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-[env(safe-area-inset-top)] left-0 right-0 z-50 bg-rose-500 text-white text-xs font-medium py-1.5 flex justify-center items-center gap-2 shadow-md"
          >
            <WifiOff className="w-3 h-3" />
            İnternet bağlantısı yok (Çevrimdışı Mod)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="w-full max-w-md mx-auto pt-8 pb-6 px-6 flex items-center justify-between z-10 shrink-0 mt-[env(safe-area-inset-top)]">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-purple-950 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Falım
          </h1>
          <p className="text-sm font-medium text-purple-600/70 mt-0.5">Sanal Kahve Falı</p>
        </div>
        
        {/* Manual Install Button if not standalone */}
        {!isStandalone && !showInstallPrompt && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowInstallPrompt(true)}
            className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 hover:bg-purple-200 transition-colors"
          >
            <Download className="w-5 h-5" />
          </motion.button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto overflow-y-auto hide-scrollbar px-6 flex flex-col relative pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center min-h-[50vh]"
            >
              <div className="relative">
                <motion.button
                  onClick={generateFortune}
                  disabled={isGenerating || isOffline}
                  whileTap={{ scale: 0.92 }}
                  className={`w-44 h-44 rounded-full flex items-center justify-center shadow-2xl transition-colors relative z-10 ${
                    isGenerating ? 'bg-purple-100 text-purple-400' : 
                    isOffline ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <motion.div
                    animate={isGenerating ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: isGenerating ? Infinity : 0, duration: 1 }}
                  >
                    <Coffee className="w-20 h-20" strokeWidth={1.5} />
                  </motion.div>
                </motion.button>
                <div className="absolute inset-0 border-[3px] border-purple-200 rounded-full scale-[1.12] -z-10 opacity-60" />
                <div className="absolute inset-0 border border-purple-100 rounded-full scale-[1.28] -z-10 opacity-30" />
              </div>

              <div className="mt-12 h-32 w-full max-w-sm">
                {!currentFortune && !isGenerating && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500 text-center font-medium">
                    {isOffline ? "Fal bakmak için internet bağlantısı gerekiyor." : "Fincanı çevirmek için dokun"}
                  </motion.p>
                )}

                {isGenerating && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-purple-600 text-center font-medium animate-pulse">
                    Fincanın soğuyor, telveler şekilleniyor...
                  </motion.p>
                )}

                <AnimatePresence>
                  {currentFortune && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full bg-white rounded-3xl p-6 shadow-sm border border-purple-100/50 flex flex-col items-center gap-5"
                    >
                      <p className="text-slate-700 leading-relaxed text-center font-medium">
                        "{currentFortune}"
                      </p>
                      
                      <button
                        onClick={handleSaveCurrent}
                        disabled={savedFortunes.some(f => f.text === currentFortune)}
                        className="px-6 py-2.5 rounded-full bg-purple-50 text-purple-700 font-bold text-sm flex items-center gap-2 hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Bookmark className="w-4 h-4" />
                        {savedFortunes.some(f => f.text === currentFortune) ? 'Kaydedildi' : 'Falı Kaydet'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="saved"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col w-full"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-6 px-1">Kaydedilen Fallar</h2>
              
              {savedFortunes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 mt-12">
                  <Bookmark className="w-16 h-16 opacity-20" />
                  <p className="font-medium text-slate-500">Henüz kaydedilmiş falınız yok.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {savedFortunes.map((fortune) => (
                      <motion.div
                        key={fortune.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                        className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100/60 relative"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                            {fortune.date}
                          </span>
                          <button 
                            onClick={() => removeFortune(fortune.id)}
                            className="p-2 -mt-1 -mr-1 text-slate-300 hover:text-rose-500 transition-colors rounded-full hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
                          {fortune.text}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Bottom Install Prompt Banner */}
      <AnimatePresence>
        {showInstallPrompt && !isStandalone && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            className="absolute bottom-28 left-4 right-4 z-40 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-5 overflow-hidden"
          >
            <button onClick={dismissInstallPrompt} className="absolute top-3 right-4 text-slate-400 hover:text-slate-600 text-lg p-1 font-sans">
              ✕
            </button>
            <div className="flex items-center gap-4 mb-4 mt-1">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center shrink-0">
                <Coffee className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">Uygulamayı Yükle</h3>
                <p className="text-xs text-slate-500 mt-0.5">Daha hızlı ve çevrimdışı kullanım için</p>
              </div>
            </div>
            
            {inIframe ? (
              <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>AI Studio önizlemesindeyken yüklenemez. Lütfen sağ üstten <b>Yeni Sekmede Aç</b> seçeneğine tıklayın.</p>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full bg-purple-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
              >
                Hemen Ekle
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation */}
      <div className="absolute bottom-[env(safe-area-inset-bottom)] left-0 right-0 p-6 z-50 pointer-events-none">
        <div className="w-full max-w-[16rem] mx-auto h-16 rounded-full glass-nav flex items-center justify-around px-2 pointer-events-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 relative ${
              activeTab === 'home' ? 'text-purple-700' : 'text-slate-400 hover:bg-white/50'
            }`}
          >
            {activeTab === 'home' && (
              <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white rounded-full shadow-sm" />
            )}
            <HomeIcon className="w-[22px] h-[22px] relative z-10" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          </button>
          
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 relative ${
              activeTab === 'saved' ? 'text-purple-700' : 'text-slate-400 hover:bg-white/50'
            }`}
          >
            {activeTab === 'saved' && (
              <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white rounded-full shadow-sm" />
            )}
            <Bookmark className="w-[22px] h-[22px] relative z-10" strokeWidth={activeTab === 'saved' ? 2.5 : 2} />
          </button>
        </div>
      </div>
    </div>
  );
}
