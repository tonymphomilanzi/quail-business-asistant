import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function QuailCalculatorSaaS() {
  // --- Inputs ---
  const [birds, setBirds] = useState(100);
  const [pctFemale, setPctFemale] = useState(80);
  const [eggsPerHenWeek, setEggsPerHenWeek] = useState(5);
  const [eggPrice, setEggPrice] = useState(100);
  const [fertility, setFertility] = useState(85);
  const [hatchRate, setHatchRate] = useState(80);
  const [chickPrice, setChickPrice] = useState(1500);
  const [feedGramPerBird, setFeedGramPerBird] = useState(15);
  const [feedPriceKg, setFeedPriceKg] = useState(800);
  const [otherCostsMonth, setOtherCostsMonth] = useState(30000);
  const [cycleWeeks, setCycleWeeks] = useState(8);
  const [sensitivityOn, setSensitivityOn] = useState(true);

  // --- Core calculations ---
  const results = useMemo(() => {
    const f = Math.round((birds * pctFemale) / 100);
    const eggsWeek = f * eggsPerHenWeek;
    const eggsMonth = eggsWeek * 4.33;
    const eggRevMonth = eggsMonth * eggPrice;

    const fertileCycle = eggsWeek * cycleWeeks * (fertility / 100);
    const chicksCycle = Math.round(fertileCycle * (hatchRate / 100));
    const chickRevCycle = chicksCycle * chickPrice;

    const feedKgPerCycle = ((feedGramPerBird * birds) / 1000) * cycleWeeks * 7;
    const feedCostCycle = feedKgPerCycle * feedPriceKg;
    const otherCostCycle = (otherCostsMonth * cycleWeeks) / 4.33;

    const netEggCycle = eggRevMonth * (cycleWeeks / 4.33) - feedCostCycle - otherCostCycle;
    const netChickCycle = chickRevCycle - feedCostCycle - otherCostCycle;

    return {
      f,
      eggsWeek,
      eggsMonth,
      eggRevMonth,
      fertileCycle,
      chicksCycle,
      chickRevCycle,
      feedKgPerCycle,
      feedCostCycle,
      otherCostCycle,
      netEggCycle,
      netChickCycle,
    };
  }, [
    birds,
    pctFemale,
    eggsPerHenWeek,
    eggPrice,
    fertility,
    hatchRate,
    chickPrice,
    feedGramPerBird,
    feedPriceKg,
    otherCostsMonth,
    cycleWeeks,
  ]);

  // --- Sensitivity ---
  const sensitivity = useMemo(() => {
    const hatchRange = Array.from({ length: 9 }, (_, i) => 50 + i * 5);
    const eggPriceRange = Array.from({ length: 9 }, (_, i) => Math.round(50 + i * 25));
    const feedPriceRange = Array.from({ length: 9 }, (_, i) => Math.round(400 + i * 80));

    return {
      dataByHatch: hatchRange.map((hr) => ({
        name: `${hr}%`,
        value: Math.round(results.fertileCycle * (hr / 100) * chickPrice - results.feedCostCycle - results.otherCostCycle),
      })),
      dataByEggPrice: eggPriceRange.map((ep) => ({
        name: `${ep}`,
        value: Math.round(results.eggsMonth * ep * (cycleWeeks / 4.33) - results.feedCostCycle - results.otherCostCycle),
      })),
      dataByFeedPrice: feedPriceRange.map((fp) => ({
        name: `${fp}`,
        value: Math.round(results.chickRevCycle - results.feedKgPerCycle * fp - results.otherCostCycle),
      })),
    };
  }, [results, chickPrice, cycleWeeks]);

  function exportSensitivityCSV() {
    const lines = [
      ["type", "variable", "value"],
      ...sensitivity.dataByHatch.map((r) => ["hatchRate", r.name, r.value]),
      ...sensitivity.dataByEggPrice.map((r) => ["eggPrice", r.name, r.value]),
      ...sensitivity.dataByFeedPrice.map((r) => ["feedPrice", r.name, r.value]),
    ];
    const csv = lines.map((l) => l.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quail_sensitivity.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 text-black">
      <div className="bg-white rounded-2xl shadow p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- MAIN PANEL --- */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">Quail Business — Eggs vs Hatchlings</h2>
          <p className="text-sm text-gray-600">
            Interactive calculator with sensitivity analysis. Tweak inputs to see instant profit changes.
          </p>

          {/* Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              ["Number of birds", birds, setBirds],
              ["% Female", pctFemale, setPctFemale],
              ["Eggs / hen / week", eggsPerHenWeek, setEggsPerHenWeek],
              ["Egg price (MK)", eggPrice, setEggPrice],
              ["Chick sell price (MK)", chickPrice, setChickPrice],
              ["Cycle (weeks)", cycleWeeks, setCycleWeeks],
              ["Fertility %", fertility, setFertility],
              ["Hatch rate %", hatchRate, setHatchRate],
              ["Feed (g/bird/day)", feedGramPerBird, setFeedGramPerBird],
              ["Feed price (MK/kg)", feedPriceKg, setFeedPriceKg],
              ["Other costs (MK/month)", otherCostsMonth, setOtherCostsMonth],
            ].map(([label, value, setter]) => (
              <div key={label} className="flex flex-col">
                <label className="text-xs md:text-sm font-medium">{label}</label>
                <input
                  type="number"
                  className="w-full rounded-lg border p-2 text-sm"
                  value={value}
                  onChange={(e) => setter(Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          {/* Results summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm md:text-base">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-gray-500">Eggs / week</div>
                <div className="font-bold text-lg">{results.eggsWeek.toLocaleString()}</div>
                <div className="text-gray-500">Egg revenue / month</div>
                <div className="font-semibold text-teal-700">
                  MK {results.eggRevMonth.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Chicks / cycle</div>
                <div className="font-bold text-lg">{results.chicksCycle.toLocaleString()}</div>
                <div className="text-gray-500">Chick revenue / cycle</div>
                <div className="font-semibold text-teal-700">
                  MK {results.chickRevCycle.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-gray-500">Feed cost / cycle</div>
              <div>MK {results.feedCostCycle.toLocaleString()}</div>
              <div className="text-gray-500">Other cost / cycle</div>
              <div>MK {results.otherCostCycle.toLocaleString()}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div>
                <div className="text-gray-500">Net profit (eggs)</div>
                <div className="font-bold text-green-600">
                  MK {results.netEggCycle.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Net profit (chicks)</div>
                <div className="font-bold text-green-600">
                  MK {results.netChickCycle.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SIDEBAR --- */}
        <aside className="space-y-4">
          <div className="bg-gray-50 border rounded-lg p-3">
            <h4 className="font-semibold text-sm md:text-base">Quick actions</h4>
            <div className="mt-3 grid gap-2">
              <button
                className="w-full bg-teal-600 text-white py-2 rounded-md text-sm"
                onClick={() =>
                  navigator.clipboard.writeText(
                    JSON.stringify({
                      inputs: {
                        birds,
                        pctFemale,
                        eggsPerHenWeek,
                        eggPrice,
                        fertility,
                        hatchRate,
                        feedPriceKg,
                        otherCostsMonth,
                        cycleWeeks,
                      },
                      results,
                    })
                  )
                }
              >
                Copy snapshot
              </button>
              <button
                className="w-full border py-2 rounded-md text-sm"
                onClick={exportSensitivityCSV}
              >
                Export sensitivity CSV
              </button>
              <button
                className="w-full border py-2 rounded-md text-sm"
                onClick={() => setSensitivityOn(!sensitivityOn)}
              >
                {sensitivityOn ? "Hide" : "Show"} sensitivity
              </button>
            </div>
          </div>

          {sensitivityOn && (
            <div className="bg-gray-50 border rounded-lg p-3">
              <h4 className="font-semibold text-sm md:text-base mb-2">Sensitivity (quick view)</h4>
              <div className="text-xs text-gray-600 mb-3">
                Scroll horizontally to view full chart on mobile.
              </div>

              {/* Responsive scroll container for charts */}
              <div className="space-y-4 overflow-x-auto">
                {[
                  ["Hatch rate impact (net chick profit)", sensitivity.dataByHatch, "#0ea5a4"],
                  ["Egg price impact (net egg profit)", sensitivity.dataByEggPrice, "#f59e0b"],
                  ["Feed price impact (net chick profit)", sensitivity.dataByFeedPrice, "#ef4444"],
                ].map(([title, data, color]) => (
                  <div key={title} className="min-w-[280px] w-full h-[160px]">
                    <div className="text-xs text-gray-500 mb-1">{title}</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
