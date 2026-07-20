/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Coffee, Bookmark, Home as HomeIcon, Sparkles, Trash2, Download } from 'lucide-react';
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

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can add to home screen
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
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
    const isAlreadySaved = savedFortunes.some(f => f.text === currentFortune);
    if (isAlreadySaved) return;

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

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center bg-gray-50 relative pb-28">
      {/* Header */}
      <header className="w-full max-w-md mx-auto pt-8 pb-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Falım
        </h1>
        {isInstallable && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-full shadow-sm hover:bg-purple-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Yükle
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto overflow-y-auto hide-scrollbar px-6 flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col items-center justify-center space-y-8"
            >
              {/* Main Cup Action */}
              <div className="relative">
                <motion.button
                  onClick={generateFortune}
                  disabled={isGenerating}
                  whileTap={{ scale: 0.95 }}
                  className={`w-40 h-40 rounded-full flex items-center justify-center shadow-xl transition-colors ${
                    isGenerating ? 'bg-purple-100 text-purple-400' : 'bg-white text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <motion.div
                    animate={isGenerating ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: isGenerating ? Infinity : 0, duration: 1 }}
                  >
                    <Coffee className="w-16 h-16" strokeWidth={1.5} />
                  </motion.div>
                </motion.button>
                {/* Decorative rings */}
                <div className="absolute inset-0 border-2 border-purple-200 rounded-full scale-[1.15] -z-10 opacity-50" />
                <div className="absolute inset-0 border border-purple-100 rounded-full scale-[1.3] -z-10 opacity-30" />
              </div>

              {/* Status / Instruction */}
              {!currentFortune && !isGenerating && (
                <p className="text-gray-500 text-center font-medium">
                  Fincanı çevirmek için dokun
                </p>
              )}

              {isGenerating && (
                <p className="text-purple-600 text-center font-medium animate-pulse">
                  Fincanın soğuyor, telveler şekilleniyor...
                </p>
              )}

              {/* Fortune Result */}
              <AnimatePresence>
                {currentFortune && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-white rounded-3xl p-6 shadow-sm border border-purple-100 flex flex-col items-center gap-4 mt-4"
                  >
                    <p className="text-gray-700 leading-relaxed text-center">
                      "{currentFortune}"
                    </p>
                    
                    <button
                      onClick={handleSaveCurrent}
                      disabled={savedFortunes.some(f => f.text === currentFortune)}
                      className="mt-2 px-6 py-2.5 rounded-full bg-purple-100 text-purple-700 font-medium flex items-center gap-2 hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Bookmark className="w-4 h-4" />
                      {savedFortunes.some(f => f.text === currentFortune) ? 'Kaydedildi' : 'Falı Kaydet'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          ) : (
            <motion.div
              key="saved"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col w-full pb-8"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 px-2">Kaydedilen Fallar</h2>
              
              {savedFortunes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <Bookmark className="w-12 h-12 opacity-20" />
                  <p>Henüz kaydedilmiş falınız yok.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {savedFortunes.map((fortune) => (
                      <motion.div
                        key={fortune.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-purple-500 bg-purple-50 px-2 py-1 rounded-md">
                            {fortune.date}
                          </span>
                          <button 
                            onClick={() => removeFortune(fortune.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
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

      {/* Floating Circular Glass Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 h-16 rounded-full glass-nav flex items-center justify-around px-2 z-50">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
            activeTab === 'home' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-900 hover:bg-white/50'
          }`}
        >
          <HomeIcon className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        </button>
        
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
            activeTab === 'saved' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-900 hover:bg-white/50'
          }`}
        >
          <Bookmark className="w-5 h-5" strokeWidth={activeTab === 'saved' ? 2.5 : 2} />
        </button>
      </div>
    </div>
  );
}
