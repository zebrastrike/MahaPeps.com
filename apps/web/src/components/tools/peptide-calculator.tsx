"use client";

import { useState } from "react";
import { Calculator, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface CalculationResult {
  volumePerDose: number;
  totalDoses: number;
  concentration: number;
  unit: string;
}

export function PeptideCalculator() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [peptideAmount, setPeptideAmount] = useState<string>("");
  const [peptideUnit, setPeptideUnit] = useState<"mg" | "mcg">("mg");
  const [bacteriostaticWater, setBacteriostaticWater] = useState<string>("");
  const [desiredDose, setDesiredDose] = useState<string>("");
  const [doseUnit, setDoseUnit] = useState<"mg" | "mcg">("mcg");
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalculate = () => {
    if (!acknowledged) {
      alert("Please acknowledge the disclaimer before using the calculator");
      return;
    }

    const peptideAmountNum = parseFloat(peptideAmount);
    const waterAmountNum = parseFloat(bacteriostaticWater);
    const desiredDoseNum = parseFloat(desiredDose);

    if (!peptideAmountNum || !waterAmountNum || !desiredDoseNum) {
      alert("Please fill in all fields");
      return;
    }

    // Convert everything to mcg for calculation
    const peptideInMcg = peptideUnit === "mg" ? peptideAmountNum * 1000 : peptideAmountNum;
    const doseInMcg = doseUnit === "mg" ? desiredDoseNum * 1000 : desiredDoseNum;

    // Calculate concentration (mcg/mL)
    const concentration = peptideInMcg / waterAmountNum;

    // Calculate volume per dose (mL)
    const volumePerDose = doseInMcg / concentration;

    // Calculate total doses
    const totalDoses = Math.floor(peptideInMcg / doseInMcg);

    setResult({
      volumePerDose: parseFloat(volumePerDose.toFixed(3)),
      totalDoses,
      concentration: parseFloat(concentration.toFixed(2)),
      unit: "mcg/mL",
    });
  };

  const handleReset = () => {
    setPeptideAmount("");
    setBacteriostaticWater("");
    setDesiredDose("");
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Warning Banner */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-2">
              CRITICAL RESEARCH DISCLAIMER
            </h3>
            <ul className="text-sm text-red-800 space-y-1 mb-4">
              <li>
                • This calculator is provided for IN VITRO laboratory research calculations ONLY
              </li>
              <li>• NOT for human consumption, medical use, or therapeutic applications</li>
              <li>
                • All calculations must be verified by qualified research personnel
              </li>
              <li>
                • Results are theoretical and for educational/research planning purposes
              </li>
              <li>
                • MAHA Peptides assumes no liability for misuse of this tool
              </li>
            </ul>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
              />
              <span className="font-semibold text-red-900">
                I acknowledge this is for research calculations only and understand the risks
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Peptide Reconstitution Calculator
            </h2>
            <p className="text-sm text-gray-600">For laboratory research planning</p>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-6">
          {/* Peptide Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peptide Amount
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={peptideAmount}
                onChange={(e) => setPeptideAmount(e.target.value)}
                disabled={!acknowledged}
                placeholder="5"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <select
                value={peptideUnit}
                onChange={(e) => setPeptideUnit(e.target.value as any)}
                disabled={!acknowledged}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="mg">mg</option>
                <option value="mcg">mcg</option>
              </select>
            </div>
          </div>

          {/* Bacteriostatic Water */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bacteriostatic Water Volume (mL)
            </label>
            <input
              type="number"
              step="0.1"
              value={bacteriostaticWater}
              onChange={(e) => setBacteriostaticWater(e.target.value)}
              disabled={!acknowledged}
              placeholder="2"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Desired Dose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desired Dose per Administration
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={desiredDose}
                onChange={(e) => setDesiredDose(e.target.value)}
                disabled={!acknowledged}
                placeholder="250"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <select
                value={doseUnit}
                onChange={(e) => setDoseUnit(e.target.value as any)}
                disabled={!acknowledged}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="mg">mg</option>
                <option value="mcg">mcg</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCalculate}
              disabled={!acknowledged}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Calculate
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Calculation Results</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Volume per Dose</div>
                <div className="text-2xl font-bold text-blue-600">
                  {result.volumePerDose} mL
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Doses</div>
                <div className="text-2xl font-bold text-purple-600">{result.totalDoses}</div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Final Concentration</div>
                <div className="text-2xl font-bold text-green-600">
                  {result.concentration} {result.unit}
                </div>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">Research Protocol:</p>
                  <p>
                    For each research administration, withdraw{" "}
                    <span className="font-bold text-blue-600">
                      {result.volumePerDose} mL
                    </span>{" "}
                    of the reconstituted solution. This vial contains approximately{" "}
                    <span className="font-bold text-purple-600">
                      {result.totalDoses} total doses
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <strong>Verification Required:</strong> All calculations must be independently
              verified by qualified laboratory personnel before use in any research
              application. Store reconstituted peptides at 2-8°C and use within the
              manufacturer's recommended timeframe.
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Recommended Equipment</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Sterile bacteriostatic water for injection</li>
            <li>• Insulin syringes (0.3-1mL)</li>
            <li>• Alcohol swabs</li>
            <li>• Sterile vial adapter</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Storage Guidelines</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Lyophilized: -20°C to -80°C</li>
            <li>• Reconstituted: 2-8°C</li>
            <li>• Use within 30 days after reconstitution</li>
            <li>• Avoid freeze-thaw cycles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
