// Quick test of the title scoring logic
function normalise(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function titleScore(target, candidate) {
  const t = normalise(target);
  const c = normalise(candidate);
  if (c === t) return 4;
  const cBase = c.replace(/\s*(\(?[12][09]\d{2}\)?|[2-9](nd|rd|th)\s*season|season\s*[2-9]|\bpart\s*\d+|\bfinal\s*(series|season)?\b).*/, '').trim();
  if (cBase === t) return 3;
  if (c.startsWith(t + ' ') || c.startsWith(t)) return 2;
  const words = t.split(' ').filter(Boolean);
  if (words.every(w => c.includes(w))) return 1;
  return 0;
}

const query = 'Fairy Tail';
const candidates = [
  'Fairy Tail (2018)',
  'Fairy Tail',
  'Fairy Tail: Final Series',
  'Fairy Tail 2nd Season',
  'Fairy Tail x Rave',
];

candidates.forEach(c => {
  console.log(`"${c}" → score ${titleScore(query, c)}`);
});

const sorted = [...candidates].sort((a, b) => titleScore(query, b) - titleScore(query, a));
console.log('\nBest match:', sorted[0]);

// Test disambiguation: searching for the 2018 series
console.log('\n--- Searching for "Fairy Tail (2018)" ---');
candidates.forEach(c => {
  console.log(`"${c}" → score ${titleScore('Fairy Tail (2018)', c)}`);
});
