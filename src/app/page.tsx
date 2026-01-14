"use client";

import { useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { ResultsDisplay } from "@/components/landing/ResultsDisplay";
import { EarlyAdopterModal } from "@/components/early-adopter/EarlyAdopterModal";
import { ValidationCounter } from "@/components/early-adopter/ValidationCounter";
import { useValidationLimit } from "@/hooks/use-validation-limit";
import { toast } from "sonner";
import ValioLogo from "@/components/ui/ValioLogo";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";

import { ValidationInput, ValidationResult } from "@/lib/perplexity";

export default function LandingPage() {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [validatedTopic, setValidatedTopic] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [showEarlyAdopterModal, setShowEarlyAdopterModal] = useState(false);
  const [modalReason, setModalReason] = useState<"limit_reached" | "voluntary">("voluntary");

  // Rate limiting hook
  const {
    remaining,
    total,
    isLimited,
    isLoading: limitLoading,
    isEarlyAdopter,
    fingerprint,
    recordUsage,
    grantEarlyAdopterBonus,
  } = useValidationLimit();

  const handleValidate = async (inputData: ValidationInput) => {
    // Check if user has validations remaining
    if (isLimited) {
      setModalReason("limit_reached");
      setShowEarlyAdopterModal(true);
      return;
    }

    setIsValidating(true);
    setResult(null);

    try {
      const response = await fetch("/api/validate-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inputData,
          clientId: fingerprint
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          // Rate limited - show modal
          setModalReason("limit_reached");
          setShowEarlyAdopterModal(true);
          toast.error("Has alcanzado el límite gratuito.");
          return;
        }
        throw new Error(error.error || "Error al validar la idea");
      }

      const data: ValidationResult = await response.json();
      setResult(data);
      setValidatedTopic(inputData.topic);

      // Record the usage in DB
      await recordUsage();

      // Show warning if low on validations
      if (remaining - 1 === 1) {
        toast.warning("Te queda 1 validación gratuita", {
          action: {
            label: "Obtener más",
            onClick: () => {
              setModalReason("limit_reached");
              setShowEarlyAdopterModal(true);
            },
          },
        });
      } else if (remaining - 1 === 0) {
        toast.info("Has usado todas tus validaciones gratuitas", {
          action: {
            label: "Unirme a Early Access",
            onClick: () => {
              setModalReason("limit_reached");
              setShowEarlyAdopterModal(true);
            },
          },
        });
      }

      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById("results");
        if (resultsElement) {
          resultsElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        } else {
          window.scrollTo({ top: window.innerHeight * 0.8, behavior: "smooth" });
        }
      }, 100);

    } catch (error: any) {
      console.error("Validation error:", error);
      toast.error(error.message || "Error al conectar con el servidor");
    } finally {
      setIsValidating(false);
    }
  };

  const handleEarlyAdopterSuccess = () => {
    grantEarlyAdopterBonus();
    toast.success("¡+5 validaciones desbloqueadas!");
  };

  const handleReformulate = (newTopic: string) => {
    setCurrentTopic(newTopic);
    setResult(null);
    setValidatedTopic("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setResult(null);
    setValidatedTopic("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingHeader onJoinWaitlist={() => {
        setModalReason("voluntary");
        setShowEarlyAdopterModal(true);
      }} />

      {/* Floating validation counter */}
      {!limitLoading && (remaining < total || result) && (
        <div className="fixed top-20 right-4 z-40 animate-in slide-in-from-right duration-300">
          <ValidationCounter
            remaining={remaining}
            total={total}
            isEarlyAdopter={isEarlyAdopter}
            onUpgradeClick={() => {
              setModalReason("limit_reached");
              setShowEarlyAdopterModal(true);
            }}
          />
        </div>
      )}

      <main>
        <Hero
          onValidate={handleValidate}
          isValidating={isValidating}
          initialTopic={currentTopic}
        />

        {result && (
          <div id="results">
            <ResultsDisplay
              result={result}
              topic={validatedTopic}
              onReset={handleReset}
              onReformulate={handleReformulate}
              onJoinWaitlist={() => {
                setModalReason("voluntary");
                setShowEarlyAdopterModal(true);
              }}
            />
          </div>
        )}

        <FAQSection />

        {!result && <CTASection />}

        {/* Early Adopter Modal */}
        <EarlyAdopterModal
          open={showEarlyAdopterModal}
          onOpenChange={setShowEarlyAdopterModal}
          clientId={fingerprint}
          maxFreeValidations={3}
          onSuccess={handleEarlyAdopterSuccess}
          reason={modalReason}
        />

        <footer className="bg-slate-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4 text-center md:text-left">
                <ValioLogo size={32} variant="white" />
                <p className="text-slate-400 max-w-sm">
                  Valida antes de crear. Decisiones basadas en señales, no en intuición.
                </p>
              </div>

              <div className="flex flex-col items-center md:items-end gap-4">
                <button
                  onClick={() => {
                    setModalReason("voluntary");
                    setShowEarlyAdopterModal(true);
                  }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 border border-white/10"
                >
                  Unirme al Early Access
                </button>
                <p className="text-slate-500 text-sm">
                  © 2026 valio.pro. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
