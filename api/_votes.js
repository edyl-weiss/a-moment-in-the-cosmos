// The daily vote's storage, shared by api/vote.js and the daily email (api/cron-daily.js).
//   votes:<day>   hash slot → count, kept for good (it is what Yesterday's winner and the archive read)
//   voters:<day>  hash visitor hash → slot, kept a few days so a visitor can change their pick
import { pipeline } from './_redis.js';

export const VOTER_TTL = 60 * 60 * 24 * 3;
const tally = (day) => `votes:${day}`, voters = (day) => `voters:${day}`;
export const toCounts = (flat, n) => {
  const h = {};
  for (let i = 0; i < (flat || []).length; i += 2) h[flat[i]] = Number(flat[i + 1]) || 0;
  return Array.from({ length: n }, (_, i) => Math.max(0, h[i] || 0));
};

export async function readCounts(day, n) {
  const [flat] = await pipeline([['HGETALL', tally(day)]]);
  return toCounts(flat, n);
}

export async function pickOf(day, who) {
  const [slot] = await pipeline([['HGET', voters(day), who]]);
  return slot == null ? null : Number(slot);
}

// Record (or move) one visitor's vote in a single step on the server, so two requests at once can't count twice.
const CAST = `local before = redis.call('HGET', KEYS[1], ARGV[1])
redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
redis.call('EXPIRE', KEYS[1], ARGV[3])
if before ~= ARGV[2] then
  if before then redis.call('HINCRBY', KEYS[2], before, -1) end
  redis.call('HINCRBY', KEYS[2], ARGV[2], 1)
end
return redis.call('HGETALL', KEYS[2])`;
export async function cast(day, who, slot, n) {
  const [flat] = await pipeline([['EVAL', CAST, '2', voters(day), tally(day), who, String(slot), String(VOTER_TTL)]]);
  return toCounts(flat, n);
}
