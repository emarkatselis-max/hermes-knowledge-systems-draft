import { createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

const COOKIE = "hermes_maintainer";
const MAX_AGE = 60 * 60 * 8; // 8 ώρες

function secret() {
  const s = process.env["MAINTAINER_SESSION_SECRET"];
  if (!s) throw new Error("missing session secret");
  return s;
}
function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}
function safeEqual(a: string, b: string) {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function passwordConfigured() {
  return Boolean(process.env["MAINTAINER_PASSWORD"]) && Boolean(process.env["MAINTAINER_SESSION_SECRET"]);
}

export function checkPassword(input: string) {
  const expected = process.env["MAINTAINER_PASSWORD"];
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function startSession() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  setCookie(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function endSession() {
  deleteCookie(COOKIE, { path: "/" });
}

export function isMaintainer() {
  if (!passwordConfigured()) return false;
  const raw = getCookie(COOKIE);
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now() / 1000;
}
