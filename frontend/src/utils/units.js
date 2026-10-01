// Unit Conversion & Formatting Utilities

export function formatTemperature(celsiusVal, unitSystem = "metric") {
  if (celsiusVal === undefined || celsiusVal === null || isNaN(celsiusVal)) return { value: "--", unit: unitSystem === "imperial" ? "°F" : "°C" };
  const num = typeof celsiusVal === "number" ? celsiusVal : parseFloat(celsiusVal);
  if (unitSystem === "imperial") {
    const fahrenheit = (num * 9) / 5 + 32;
    return { value: fahrenheit.toFixed(1), unit: "°F" };
  }
  return { value: num.toFixed(1), unit: "°C" };
}

export function formatWeight(kgVal, unitSystem = "metric") {
  if (kgVal === undefined || kgVal === null || isNaN(kgVal)) return { value: "--", unit: unitSystem === "imperial" ? "lbs" : "kg" };
  const num = typeof kgVal === "number" ? kgVal : parseFloat(kgVal);
  if (unitSystem === "imperial") {
    const lbs = num * 2.20462;
    return { value: lbs.toFixed(1), unit: "lbs" };
  }
  return { value: num.toFixed(1), unit: "kg" };
}

export function formatWater(mlVal, unitSystem = "metric") {
  if (mlVal === undefined || mlVal === null || isNaN(mlVal)) return { value: "--", unit: unitSystem === "imperial" ? "fl oz" : "L" };
  const num = typeof mlVal === "number" ? mlVal : parseFloat(mlVal);
  if (unitSystem === "imperial") {
    const flOz = num / 29.5735;
    return { value: flOz.toFixed(0), unit: "fl oz" };
  }
  return { value: (num / 1000).toFixed(1), unit: "L" };
}

export function formatSleep(minutesVal) {
  if (minutesVal === undefined || minutesVal === null || isNaN(minutesVal)) return { value: "--", unit: "hrs" };
  const num = typeof minutesVal === "number" ? minutesVal : parseFloat(minutesVal);
  const hrs = Math.floor(num / 60);
  const mins = num % 60;
  return {
    display: `${hrs}h ${mins}m`,
    hoursDecimal: (num / 60).toFixed(1),
    hrs,
    mins
  };
}
