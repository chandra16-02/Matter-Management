import React, { useState } from 'react';
import { Download, Smartphone, Apple, X, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, don't show prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-xs transition-all cursor-pointer ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs sm:text-sm'
        }`}
        title="Install Matter HRMS app on your device"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>Install App</span>
      </button>
    );
  }

  // Apple iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs transition-all cursor-pointer border border-slate-700 ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs sm:text-sm'
          }`}
          title="Install on iPhone / iPad"
        >
          <Apple className="w-3.5 h-3.5 text-slate-200" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Apple className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Install on iPhone / iPad</h3>
                    <p className="text-[11px] text-slate-500">Apple Safari Installation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 flex items-center gap-1">
                      Tap the <Share2 className="w-3.5 h-3.5 text-indigo-600" /> Share button
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Safari browser ke bottom toolbar me Share icon par click karein.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 flex items-center gap-1">
                      Select <PlusSquare className="w-3.5 h-3.5 text-indigo-600" /> Add to Home Screen
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Menu me scroll karke <strong>"Add to Home Screen"</strong> par tap karein.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Ready to Use
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Top-right me <strong>"Add"</strong> dabayein. App icon aapke iPhone screen par ban jayega!
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
              >
                Samajh Gaya (Done)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for general browsers: show an install / home screen button that opens instructions
  return (
    <>
      <button
        onClick={() => setShowIOSGuide(true)}
        className={`flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer ${
          compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-xs sm:text-sm'
        }`}
        title="Mobile App Options (Apple & Android)"
      >
        <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
        <span>Mobile App</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Apple & Android Installation</h3>
                  <p className="text-[11px] text-slate-500">Save to Home Screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  🤖 Android (Google Chrome):
                </p>
                <p className="text-[11px] text-slate-600">
                  Browser ke 3-dots menu <strong>(⋮)</strong> par tap karein aur <strong>"Add to Home screen"</strong> ya <strong>"Install app"</strong> chunein.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  🍎 Apple iPhone (Safari):
                </p>
                <p className="text-[11px] text-slate-600">
                  Safari me niche <strong>Share icon</strong> par tap karein aur <strong>"Add to Home Screen"</strong> par click karein.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
            >
              Theek Hai (Close)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
