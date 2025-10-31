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

// Single-file React component (TailwindCSS + Recharts)
// Default export so it can be dropped into a React app

export default function QuailCalculatorSaaS() {
  // --- Inputs ---
  const [birds, setBirds] = useState(100);
  const [pctFemale, setPctFemale] = useState(80);
  const [eggsPerHenWeek, setEggsPerHenWeek] = useState(5);
  const [eggPrice, setEggPrice] = useState(100);

  const [fertility, setFertility] = useState(85); // %
  const [hatchRate, setHatchRate] = useState(80); // %
  const [chickPrice, setChickPrice] = useState(1500);

  const [feedGramPerBird, setFeedGramPerBird] = useState(15);
  const [feedPriceKg, setFeedPriceKg] = useState(800);
  const [otherCostsMonth, setOtherCostsMonth] = useState(30000);
  const [cycleWeeks, setCycleWeeks] = useState(8);

  // sensitivity params toggles
  const [sensitivityOn, setSensitivityOn] = useState(true);

  // --- Core calculations (memoized) ---
  const results = useMemo(() => {
    const f = Math.round((birds * pctFemale) / 100);
    const eggsWeek = f * eggsPerHenWeek;
    const eggsMonth = eggsWeek * 4.33;
    const eggRevMonth = eggsMonth * eggPrice;

    const fertileWeek = eggsWeek * (fertility / 100);
    const totalEggsCycle = eggsWeek * cycleWeeks;
    const fertileCycle = totalEggsCycle * (fertility / 100);
    const chicksCycle = Math.round(fertileCycle * (hatchRate / 100));
    const chickRevCycle = chicksCycle * chickPrice;

    const feedKgPerDayTotal = (feedGramPerBird * birds) / 1000;
    const feedKgPerCycle = feedKgPerDayTotal * cycleWeeks * 7;
    const feedCostCycle = feedKgPerCycle * feedPriceKg;

    const otherCostCycle = (otherCostsMonth * cycleWeeks) / 4.33;

    const netEggCycle = eggRevMonth * (cycleWeeks / 4.33) - feedCostCycle - otherCostCycle;
    const netChickCycle = chickRevCycle - feedCostCycle - otherCostCycle;

    return {
      females: f,
      eggsWeek,
      eggsMonth,
      eggRevMonth,
      fertileWeek,
      totalEggsCycle,
      fertileCycle,
      chicksCycle,
      chickRevCycle,
      feedKgPerCycle,
      feedCostCycle,
      otherCostCycle,
      netEggCycle,
      netChickCycle,
    };
  }, [birds, pctFemale, eggsPerHenWeek, eggPrice, fertility, hatchRate, chickPrice, feedGramPerBird, feedPriceKg, otherCostsMonth, cycleWeeks]);

  // --- Sensitivity analysis ---
  // We'll generate three small arrays showing how net profit changes when varying
  // hatchRate, eggPrice and feedPriceKg one by one while keeping others fixed.
  const sensitivity = useMemo(() => {
    const hatchRange = Array.from({ length: 9 }, (_, i) => 50 + i * 5); // 50%..90%
    const eggPriceRange = Array.from({ length: 9 }, (_, i) => Math.round(50 + i * 25)); // MK50..MK250
    const feedPriceRange = Array.from({ length: 9 }, (_, i) => Math.round(400 + i * 80)); // MK400..MK1,040

    const dataByHatch = hatchRange.map((hr) => {
      const chicksCycle = Math.round(results.fertileCycle * (hr / 100));
      const chickRevCycle = chicksCycle * chickPrice;
      const netChick = chickRevCycle - results.feedCostCycle - results.otherCostCycle;
      return { name: `${hr}%`, value: Math.round(netChick) };
    });

    const dataByEggPrice = eggPriceRange.map((ep) => {
      const eggRevMonth = results.eggsMonth * ep;
      const netEggCycle = eggRevMonth * (cycleWeeks / 4.33) - results.feedCostCycle - results.otherCostCycle;
      return { name: `${ep}`, value: Math.round(netEggCycle) };
    });

    const dataByFeedPrice = feedPriceRange.map((fp) => {
      const feedCostCycle = results.feedKgPerCycle * fp;
      const netChick = results.chickRevCycle - feedCostCycle - results.otherCostCycle;
      return { name: `${fp}`, value: Math.round(netChick) };
    });

    return { dataByHatch, dataByEggPrice, dataByFeedPrice };
  }, [results, chickPrice, cycleWeeks]);

  // Auto-recalculate sensitivity when inputs change (simple UX touch)
  useEffect(() => {
    // placeholder for any side-effects or analytics
  }, [results]);

  // --- Small helper for CSV export of sensitivity ---
  function exportSensitivityCSV() {
    const lines = [
      ["type", "variable", "value"],
      ...sensitivity.dataByHatch.map((r) => ["hatchRate", r.name, r.value]),
      ...sensitivity.dataByEggPrice.map((r) => ["eggPrice", r.name, r.value]),
      ...sensitivity.dataByFeedPrice.map((r) => ["feedPrice", r.name, r.value]),
    ];
    const csv = lines.map((l) => l.join(",")).join("");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quail_sensitivity.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 min-h mx-auto text-black">
      <div className="bg-white rounded-2xl shadow p-6 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-2">Quail Business — Eggs vs Hatchlings</h2>
          <p className="text-sm text-gray-600 mb-4">Interactive calculator with sensitivity analysis. Tweak inputs to see instant profit changes.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of birds</label>
              <input type="number" className="w-full rounded-lg border p-2" value={birds} onChange={(e) => setBirds(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">% Female</label>
              <input type="number" className="w-full rounded-lg border p-2" value={pctFemale} onChange={(e) => setPctFemale(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Eggs / hen / week</label>
              <input type="number" className="w-full rounded-lg border p-2" value={eggsPerHenWeek} onChange={(e) => setEggsPerHenWeek(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-sm font-medium">Egg price (MK)</label>
              <input type="number" className="w-full rounded-lg border p-2" value={eggPrice} onChange={(e) => setEggPrice(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-medium">Chick sell price (MK)</label>
              <input type="number" className="w-full rounded-lg border p-2" value={chickPrice} onChange={(e) => setChickPrice(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-medium">Cycle duration (weeks)</label>
              <input type="number" className="w-full rounded-lg border p-2" value={cycleWeeks} onChange={(e) => setCycleWeeks(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div>
              <label className="text-sm font-medium">Fertility %</label>
              <input type="number" className="w-full rounded-lg border p-2" value={fertility} onChange={(e) => setFertility(Number(e.target.value))} />
            </div>


            <div>
              <label className="text-sm font-medium">Hatch rate %</label>
              <input type="number" className="w-full rounded-lg border p-2" value={hatchRate} onChange={(e) => setHatchRate(Number(e.target.value))} />
            </div>



            <div>
              <label className="text-sm font-medium">% Feed (g/bird/day)</label>
              <input type="number" className="w-full rounded-lg border p-2" value={feedGramPerBird} onChange={(e) => setFeedGramPerBird(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">

            <div>
              <label className="text-sm font-medium">Feed price (MK/kg)</label>
              <input type="number" className="w-full rounded-lg border p-2" value={feedPriceKg} onChange={(e) => setFeedPriceKg(Number(e.target.value))} />
            </div>

            <div>
              <label className="text-sm font-medium">Other costs (MK / month)</label>
              <input type="number" className="w-full rounded-lg border p-2" value={otherCostsMonth} onChange={(e) => setOtherCostsMonth(Number(e.target.value))} />
            </div>


          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Eggs / week</div>
                <div className="text-xl font-bold">{Math.round(results.eggsWeek).toLocaleString()}</div>
                <div className="text-sm text-gray-500">Egg revenue / month</div>
                <div className="text-lg font-semibold">MK {Math.round(results.eggRevMonth).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Estimated chicks / cycle</div>
                <div className="text-xl font-bold">{results.chicksCycle.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Chick revenue / cycle</div>
                <div className="text-lg font-semibold">MK {Math.round(results.chickRevCycle).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-sm text-gray-500">Feed cost / cycle</div>
              <div className="font-medium">MK {Math.round(results.feedCostCycle).toLocaleString()}</div>
              <div className="text-sm text-gray-500">Other cost / cycle</div>
              <div className="font-medium">MK {Math.round(results.otherCostCycle).toLocaleString()}</div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-500">Net profit (eggs) per cycle</div>
                <div className="text-lg font-bold">MK {Math.round(results.netEggCycle).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Net profit (chicks) per cycle</div>
                <div className="text-lg font-bold">MK {Math.round(results.netChickCycle).toLocaleString()}</div>
              </div>
            </div>
          </div>

        </div>

        <aside className="space-y-4">
          <div className="bg-white border rounded-lg p-3">
            <h4 className="font-semibold">Quick actions</h4>
            <div className="mt-3 grid gap-2">
              <button className="w-full bg-teal-600 text-white py-2 rounded-md" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(JSON.stringify({ inputs: { birds, pctFemale, eggsPerHenWeek, eggPrice, fertility, hatchRate, feedPriceKg, otherCostsMonth, cycleWeeks }, results })); }}>Copy snapshot</button>
              <button className="w-full border py-2 rounded-md" onClick={() => exportSensitivityCSV()}>Export sensitivity CSV</button>
              <button className="w-full border py-2 rounded-md" onClick={() => setSensitivityOn(!sensitivityOn)}>{sensitivityOn ? 'Hide' : 'Show'} sensitivity</button>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-3">
            <h4 className="font-semibold">Sensitivity (quick view)</h4>
            <div className="text-sm text-gray-600 mt-2">Change hatch rate, egg price or feed price to see profit sensitivity.</div>
            <div className="mt-3 space-y-2 ml-5">
              <div className="text-xs text-gray-500">Hatch rate impact (net chick profit)</div>
              <div style={{ width: '300px', height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%" className="">
                  <LineChart data={sensitivity.dataByHatch}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0ea5a4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 space-y-2 ml-5">
              <div className="text-xs text-gray-500">Egg price impact (net egg profit)</div>
              <div style={{ width: '300px', height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensitivity.dataByEggPrice}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 space-y-2 ml-5">
              <div className="text-xs text-gray-500">Feed price impact (net chick profit)</div>
              <div style={{ width: '300px', height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensitivity.dataByFeedPrice}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
