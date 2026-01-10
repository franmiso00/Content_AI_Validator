"use client";

import { useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { ResultsDisplay } from "@/components/landing/ResultsDisplay";
import { toast } from "sonner";

interface ValidationResult {
  demand_score: number;
  demand_interpretation: string;
  demand_summary: string;
  strategic_recommendation: {
    verdict: "create" | "pilot" | "reconsider";
    reasoning: string[];
    target_fit: string;
    success_conditions: string;
  };
  data_signals: {
    conversations_analyzed: number;
    recency: string;
    engagement_type: string;
  };
  business_impact: {
    primary_objective: "leads" | "authority" | "sales";
    monetization_potential: string;
    commercial_risks: string;
  };
  pain_points: string[];
  questions: string[];
  content_angles: {
    format: string;
    hook: string;
    complexity: "básico" | "avanzado";
    description: string;
  }[];
  not_recommended_if: string[];
  confidence_score: number;
  remaining_validations?: number;
}

export default function LandingPage() {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [validatedTopic, setValidatedTopic] = useState("");

  const handleValidate = async (topic: string, audience: string) => {
    setIsValidating(true);
    setResult(null);

    try {
      const response = await fetch("/api/validate-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          toast.error("Has alcanzado el límite gratuito. Crea una cuenta para continuar.");
        } else {
          toast.error(error.error || "Error al validar la idea");
        }
        return;
      }

      const data = await response.json();
      setResult(data);
      setValidatedTopic(topic);

      // Scroll to results
      setTimeout(() => {
        window.scrollTo({ top: window.innerHeight * 0.8, behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setValidatedTopic("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <Hero onValidate={handleValidate} isValidating={isValidating} />

        {result && (
          <ResultsDisplay
            result={result}
            topic={validatedTopic}
            onReset={handleReset}
          />
        )}

        {/* Simple footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4 text-center space-y-4">
            <p className="text-gray-400 text-sm">
              © 2026 ContentValidator. Valida ideas de contenido con datos reales.
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
                Iniciar sesión
              </a>
              <a href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">
                Crear cuenta
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
