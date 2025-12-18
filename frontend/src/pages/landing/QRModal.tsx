import { useState, useEffect } from 'react';
import { X, Sparkles, Star } from 'lucide-react';
import powered from './assets/powered.png';


// Componente QR Modal
function QRModal({ isOpen, onClose, qrImageUrl }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop con blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] animate-fadeIn"
        onClick={onClose}
        style={{
          animation: 'fadeIn 0.3s ease-out'
        }}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-3 pointer-events-none">
        <div
          className="pointer-events-auto relative max-w-sm w-full"
          style={{
            animation: 'dropFromSky 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Glow effect animado */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-3xl blur-2xl"
            style={{
              animation: 'pulse 3s ease-in-out infinite'
            }}
          />

          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-white/95 via-white/90 to-orange-50/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-white/60">
            {/* Sparkles decorativos */}
            <div className="absolute top-4 left-4">
              <div style={{ animation: 'rotate 4s linear infinite' }}>
                <Sparkles className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            
            <div className="absolute top-4 right-16">
              <div style={{ animation: 'rotateReverse 5s linear infinite' }}>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Content */}
            <div className="p-8 pt-12">
              {/* Header */}
              <div
                className="text-center mb-6"
                style={{
                  animation: 'fadeInUp 0.5s ease-out 0.5s both'
                }}
              >
                
                <div className="inline-flex items-center gap-2 mb-3">
                    <div style={{ animation: 'wiggle 2s ease-in-out infinite' }}>
                     <span className="text-2xl">🍽️</span>
                    </div>
                    <div style={{ animation: 'wiggle 2s ease-in-out infinite' }}>
                    <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
                    </div>
                  <h2 className="font-bold text-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  ¡Bienvenido!
                </h2>
                  <div style={{ animation: 'wiggle 2s ease-in-out infinite' }}>
                    <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
                  </div>
                  <div style={{ animation: 'wiggle 2s ease-in-out infinite' }}>
                     <span className="text-2xl">🍽️</span>
                    </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Escanea el código QR para registrarte rápidamente
                </p>
              </div>

              {/* QR Code Container */}
              <div
                className="relative mb-6 "
                style={{
                  animation: 'scaleIn 0.4s ease-out 0.7s both'
                }}
              >
                

                {/* QR Background glow */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl blur-xl"
                  style={{
                    animation: 'pulseGlow 2s ease-in-out infinite'
                  }}
                />
                
                {/* QR Code */}
                <div className="relative p-8">
                  <img 
                    src={qrImageUrl}
                    alt="QR Code para registrarse" 
                    className="w-full h-auto"
                    style={{
                      imageRendering: 'crisp-edges',
                      mixBlendMode: 'multiply'
                    }}
                  />
                </div>
              </div>

              {/* Footer text */}
              <div
                className="text-center"
                style={{
                  animation: 'fadeInUp 0.4s ease-out 0.9s both'
                }}
              >
                <img 
                    src={powered}
                    alt="RestaurantApp Powered By Devlights" 
                    className="mx-auto mb-4 w-48 h-auto"
                    style={{
                      imageRendering: 'crisp-edges',
                      mixBlendMode: 'multiply'
                    }}
                  />
                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                >
                  Continuar
                </button>
              </div>
            </div>

            {/* Decorative gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-100/50 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes dropFromSky {
          0% {
            transform: translateY(-1000px) rotate(-45deg) scale(0.3);
            opacity: 0;
          }
          60% {
            transform: translateY(30px) rotate(5deg) scale(1.05);
            opacity: 1;
          }
          80% {
            transform: translateY(-10px) rotate(-2deg) scale(0.98);
          }
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.02);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          to {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes rotateReverse {
          from {
            transform: rotate(360deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          to {
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(10deg);
          }
          75% {
            transform: rotate(-10deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
export default QRModal;
