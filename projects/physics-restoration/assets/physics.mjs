// Independent numerical implementation of the textbook's physical models.
// h, kB, c and e are SI defining constants; masses and G are CODATA 2022.
// Solar mass is an approximate educational value; energies use eV where stated.
export const C = Object.freeze({k: 1.380649e-23, h: 6.62607015e-34, c: 299792458,
  e: 1.602176634e-19, G: 6.67430e-11, mn: 1.67492750056e-27, me: 9.1093837139e-31,
  solarMass: 1.98847e30, kEV: 8.617333262145e-5, R: 8.31446261815324});
export const HBAR = C.h / (2 * Math.PI);
export const SIGMA = 2 * Math.PI ** 5 * C.k ** 4 / (15 * C.c ** 2 * C.h ** 3);
export const WIEN = C.h * C.c / (C.k * 4.965114231744276);

export function occupancy(x, kind) {
  if (kind === 'MB') return Math.exp(-x);
  if (kind === 'BE') return x > 0 ? 1 / Math.expm1(x) : NaN;
  // Avoid overflow and catastrophic subtraction near either limiting value.
  return x >= 0 ? Math.exp(-x) / (1 + Math.exp(-x)) : 1 / (1 + Math.exp(x));
}
export function fermi(energy, mu, T) {
  if (T === 0) return energy < mu ? 1 : energy > mu ? 0 : 0.5;
  return occupancy((energy - mu) / (C.kEV * T), 'FD');
}
export function simpson(fn, a, b, intervals = 800) {
  if (a === b) return 0;
  const n = Math.max(2, 2 * Math.ceil(intervals / 2));
  const h = (b - a) / n;
  let s = fn(a) + fn(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * fn(a + i * h);
  return s * h / 3;
}
export function spectralRadiancy(nm, T) {
  if (nm <= 0 || T <= 0) return 0;
  const wavelength = nm * 1e-9;
  const x = C.h * C.c / (wavelength * C.k * T);
  if (x > 700) return 0;
  // Per nm, not per metre: W m^-2 nm^-1.
  return 2 * Math.PI * C.h * C.c ** 2 / wavelength ** 5 / Math.expm1(x) * 1e-9;
}
export function bandRadiancy(aNM, bNM, T) {
  if (T <= 0 || aNM === bNM) return 0;
  const [a, b] = [aNM, bNM].sort((x, y) => x - y);
  const factor = C.h * C.c / (C.k * T) * 1e9;
  const lower = b === Infinity ? 0 : factor / b;
  const upper = a <= 0 ? 100 : Math.min(100, factor / a);
  if (lower >= upper) return 0;
  const integral = simpson(x => x === 0 ? 0 : x ** 3 / Math.expm1(x), lower, upper, 1600);
  return SIGMA * T ** 4 * integral / (Math.PI ** 4 / 15);
}
export function einsteinCV(ratio) {
  if (ratio <= 0) return 0;
  const x = 1 / ratio, q = Math.exp(-x);
  return x * x * q / (-Math.expm1(-x)) ** 2; // C/(3Nk).
}
export function debyeCV(ratio) {
  if (ratio <= 0) return 0;
  const upper = Math.min(100, 1 / ratio);
  const value = simpson(x => {
    if (x === 0) return 0;
    const q = Math.exp(-x);
    return x ** 4 * q / (-Math.expm1(-x)) ** 2;
  }, 0, upper, 1200);
  return 3 * ratio ** 3 * value; // C/(3Nk).
}
export function stateConfigurations(kind, N, levels) {
  const results = [];
  function walk(counts, left) {
    if (counts.length === levels) {
      if (left === 0) results.push(counts);
      return;
    }
    const max = kind === 'FD' ? Math.min(1, left) : left;
    for (let n = 0; n <= max; n++) walk([...counts, n], left - n);
  }
  walk([], N);
  return results;
}
export function factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
export function classicalMultiplicity(counts) {
  return factorial(counts.reduce((a, b) => a + b, 0)) / counts.reduce((p, n) => p * factorial(n), 1);
}
export function modeWave(x, j, time = 0) {
  return Math.sin(Math.PI * j * x) * Math.cos(j * time);
}
export function modeCount(d, lower, upper, max = 7) {
  const result = [];
  function walk(v) {
    if (v.length === d) {
      const r = Math.hypot(...v);
      result.push({v, r, selected: r >= lower && r <= upper});
      return;
    }
    for (let i = 1; i <= max; i++) walk([...v, i]);
  }
  walk([]);
  return result;
}

// Integrate in u=sqrt(e/E_F) and split at the narrow thermal edge.
// This resolves both the DOS square-root endpoint and the Fermi step.
export function electronMoments(ef, T, mu = ef) {
  if (T === 0) {
    const edge = Math.max(0, mu / ef);
    return {number: edge ** 1.5, energy: 0.6 * ef * edge ** 2.5};
  }
  const kt = C.kEV * T;
  const edges = [0, Math.sqrt(Math.max(0, mu - 24 * kt) / ef),
    Math.sqrt(Math.max(0, mu) / ef), Math.sqrt(Math.max(0, mu + 24 * kt) / ef),
    Math.sqrt(Math.max(ef, mu + 45 * kt) / ef)];
  const points = [...new Set(edges)].sort((a, b) => a - b);
  let number = 0, energy = 0;
  for (let i = 1; i < points.length; i++) {
    number += simpson(u => 3 * u ** 2 * fermi(ef * u ** 2, mu, T), points[i - 1], points[i], 240);
    energy += simpson(u => 3 * ef * u ** 4 * fermi(ef * u ** 2, mu, T), points[i - 1], points[i], 240);
  }
  return {number, energy};
}
export function chemicalPotential(ef, T) {
  if (T === 0) return ef;
  let a = -50 * C.kEV * T, b = ef + 50 * C.kEV * T;
  for (let i = 0; i < 42; i++) {
    const m = (a + b) / 2;
    if (electronMoments(ef, T, m).number > 1) b = m; else a = m;
  }
  return (a + b) / 2;
}
export function neutronStar(massSolar) {
  const M = massSolar * C.solarMass;
  const R = (3 * Math.sqrt(Math.PI) / 2) ** (4 / 3) * (HBAR ** 6 / (C.G ** 3 * C.mn ** 8)) ** (1 / 3) / M ** (1 / 3);
  const V = 4 * Math.PI * R ** 3 / 3, N = M / C.mn;
  const ef = HBAR ** 2 / (2 * C.mn) * (3 * Math.PI ** 2 * N / V) ** (2 / 3);
  return {M, R, V, rho: M / V, pressure: 2 / 5 * N / V * ef,
    gravitationalPressure: C.G * M * M / (5 * V * R), efMEV: ef / C.e / 1e6};
}
