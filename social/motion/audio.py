"""Original soundtrack for the motion videos: a music bed plus sound effects on every cue.

Everything is synthesised here, so the audio is fully owned (no licensing). Reads the plan that
render.mjs exports from motion.html, writes one loudness-normalised WAV per video
(-14 LUFS integrated, -1 dBTP: Instagram and Facebook's playback target).

    python3 audio.py plan.json OUT_DIR [v1 v2 ...]
Needs numpy, scipy and ffmpeg.
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
rng = np.random.default_rng(7)


# ---------- basics ----------
def secs(n):
    return np.arange(n) / SR


def samples(d):
    return int(round(d * SR))


def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x, axis=-1)


def noise(n):
    return rng.standard_normal(n)


def env_ad(n, attack=0.002, decay=8.0):
    t = secs(n)
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t * decay)


def saw(f, t, detune=0.0):
    """Band-limited saw (additive)."""
    f = f * (1 + detune)
    k_max = int(min(48, (SR / 2) // f))
    y = np.zeros_like(t)
    for k in range(1, k_max + 1):
        y += np.sin(2 * np.pi * k * f * t) / k
    return y * (2 / np.pi)


def sweep_sine(f0, f1, n, curve=30.0):
    t = secs(n)
    f = f1 + (f0 - f1) * np.exp(-t * curve)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def stereo(x, pan=0.0):
    a = (pan + 1) * np.pi / 4
    return np.vstack([x * np.cos(a), x * np.sin(a)]) * np.sqrt(2)


def place(bus, x, t, gain=1.0, pan=0.0):
    if x.ndim == 1:
        x = stereo(x, pan)
    i = samples(t)
    if i >= bus.shape[1]:
        return
    j = min(bus.shape[1], i + x.shape[1])
    if i < 0:
        x = x[:, -i:]
        j = min(bus.shape[1], x.shape[1])
        i = 0
    bus[:, i:j] += gain * x[:, : j - i]


def make_ir(rt=1.6, seed=3):
    r = np.random.default_rng(seed)
    n = samples(rt)
    t = secs(n)
    ir = r.standard_normal((2, n)) * np.exp(-6.9 * t / rt)
    ir = filt(ir, "low", 6500, 1)
    ir[:, : samples(0.012)] = 0
    return ir / np.sqrt((ir ** 2).sum() / 2)


IR = make_ir()


def reverb(x, wet=0.25):
    if x.ndim == 1:
        x = stereo(x)
    y = np.vstack([signal.fftconvolve(x[c], IR[c])[: x.shape[1]] for c in range(2)])
    return x + wet * y


# ---------- drums ----------
def kick():
    n = samples(0.42)
    t = secs(n)
    body = sweep_sine(170, 48, n, 26) * np.exp(-t * 6.5)
    click = filt(noise(n) * np.exp(-t * 700), "band", [1500, 6000])
    return np.tanh(1.7 * body) * 0.95 + 0.22 * click


def clap():
    n = samples(0.35)
    t = secs(n)
    e = np.zeros(n)
    for o in (0, 0.011, 0.023):
        e += (t >= o) * np.exp(-np.clip(t - o, 0, None) * 170)
    e += (t >= 0.03) * np.exp(-np.clip(t - 0.03, 0, None) * 13) * 0.55
    return filt(noise(n) * e, "band", [900, 5200]) * 1.1


def hat(open_=False):
    n = samples(0.28 if open_ else 0.06)
    t = secs(n)
    x = filt(noise(n), "high", 7500, 4) * np.exp(-t * (11 if open_ else 65))
    return x * 0.6


def crash():
    n = samples(1.8)
    t = secs(n)
    x = filt(noise(n), "high", 4500, 2) * np.exp(-t * 2.6)
    return x * 0.45


def tick(freq=1.0):
    n = samples(0.03)
    t = secs(n)
    x = filt(noise(n), "band", [2200 * freq, 7000]) * np.exp(-t * 420)
    x += 0.5 * np.sin(2 * np.pi * 3200 * freq * t) * np.exp(-t * 300)
    return x * 0.7


def woodblock(freq=1800):
    n = samples(0.09)
    t = secs(n)
    x = np.sin(2 * np.pi * freq * t) * np.exp(-t * 55) + 0.4 * np.sin(2 * np.pi * freq * 2.7 * t) * np.exp(-t * 90)
    return x * 0.5


# ---------- tonal ----------
def bell(f, d=1.6):
    n = samples(d)
    t = secs(n)
    x = np.zeros(n)
    for ratio, amp, dec in ((1, 1, 3.0), (2.0, 0.45, 4.2), (2.76, 0.32, 5.5), (5.4, 0.18, 8), (8.9, 0.07, 13)):
        x += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * dec)
    return x * np.minimum(1, t / 0.0015) * 0.45


def bass_note(f, d=0.24):
    n = samples(d)
    t = secs(n)
    x = 0.75 * np.sin(2 * np.pi * f * t) + 0.5 * saw(f, t)
    x = filt(x, "low", 1100, 2)
    x *= np.minimum(1, t / 0.004) * np.exp(-t * 4.5)
    x[-samples(0.01):] *= np.linspace(1, 0, samples(0.01))
    return np.tanh(2.0 * x) * 0.7


def pluck(freqs, d=0.5):
    n = samples(d)
    t = secs(n)
    L = np.zeros(n)
    R = np.zeros(n)
    for f in freqs:
        L += saw(f, t, -0.004) + 0.6 * saw(f, t, 0.007)
        R += saw(f, t, 0.004) + 0.6 * saw(f, t, -0.007)
    x = np.vstack([L, R]) / (1.6 * len(freqs))
    bright = filt(x, "low", 4200, 2) * np.exp(-t * 14)
    dark = filt(x, "low", 1000, 2) * np.exp(-t * 4.5)
    y = (bright + dark) * np.minimum(1, t / 0.003)
    y[:, -samples(0.01):] *= np.linspace(1, 0, samples(0.01))
    return y


def pad(freqs, d):
    n = samples(d)
    t = secs(n)
    L = np.zeros(n)
    R = np.zeros(n)
    for f in freqs:
        L += saw(f, t, -0.006) + saw(f, t, 0.003)
        R += saw(f, t, 0.006) + saw(f, t, -0.003)
    x = filt(np.vstack([L, R]), "low", 1300, 2) / (2 * len(freqs))
    e = np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.3)
    return x * np.clip(e, 0, 1)


def lead_note(f, d=0.3):
    n = samples(d)
    t = secs(n)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) + 0.15 * np.sin(2 * np.pi * 3 * f * t)
    return x * env_ad(n, 0.002, 9) * 0.5


# ---------- sound effects ----------
def sweep_filter(x, centre, width_oct=0.9):
    """Band-pass whose centre (Hz) follows centre(p), p from 0 to 1 over the sound."""
    n = len(x)
    win, hop = 2048, 512
    w = np.hanning(win)
    pad_ = np.concatenate([np.zeros(win), x, np.zeros(win)])
    out = np.zeros_like(pad_)
    norm = np.zeros_like(pad_)
    f = np.fft.rfftfreq(win, 1 / SR)
    for s in range(0, len(pad_) - win, hop):
        p = np.clip((s + win / 2 - win) / n, 0, 1)
        H = np.exp(-0.5 * (np.log2(np.maximum(f, 20) / centre(p)) / width_oct) ** 2)
        out[s:s + win] += np.fft.irfft(np.fft.rfft(pad_[s:s + win] * w) * H) * w
        norm[s:s + win] += w * w
    return (out / np.maximum(norm, 1e-6))[win:win + n]


def whoosh(d=0.6, up=True, pan=(-0.7, 0.7)):
    n = samples(d)
    x = sweep_filter(noise(n), lambda p: 250 * 18 ** (p if up else 1 - p), 0.8)
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    x *= e / (np.abs(x).max() + 1e-9)
    pans = np.linspace(pan[0], pan[1], n)
    a = (pans + 1) * np.pi / 4
    return np.vstack([x * np.cos(a), x * np.sin(a)]) * np.sqrt(2) * 0.8


def swish(d=0.28):
    return whoosh(d, True, (-0.3, 0.3)) * 0.8


def riser(d=1.2):
    n = samples(d)
    t = secs(n)
    x = sweep_filter(noise(n), lambda p: 400 * 16 ** p, 0.6)
    x = x / (np.abs(x).max() + 1e-9)
    tone = np.sin(2 * np.pi * np.cumsum(220 * 4 ** (t / d)) / SR) * 0.25
    e = (t / d) ** 2.2
    return (x * 0.8 + tone) * e


def impact(big=False):
    n = samples(1.6 if big else 0.9)
    t = secs(n)
    boom = sweep_sine(120, 36, n, 9) * np.exp(-t * (2.6 if big else 4.5))
    crack = filt(noise(n), "low", 3500, 1) * np.exp(-t * 22)
    x = np.tanh(1.5 * (boom + 0.6 * crack))
    return reverb(x * (1.0 if big else 0.8), 0.18)


def hit(p=1.0, big=False):
    n = samples(0.32)
    t = secs(n)
    thump = sweep_sine(220 * p, 70 * p, n, 30) * np.exp(-t * 14)
    snap = filt(noise(n), "band", [1200, 6000]) * np.exp(-t * 60)
    x = np.tanh(1.6 * thump) * 0.8 + 0.35 * snap
    return reverb(x * (1.25 if big else 1.0), 0.12)


def pop(p=1.0):
    n = samples(0.1)
    t = secs(n)
    f = 560 * p * (1 + 1.1 * np.exp(-t * 55))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40) * np.minimum(1, t / 0.001)
    return x * 0.8


def sparkle(seed=0):
    r = np.random.default_rng(100 + seed)
    notes = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0, 2349.3, 2637.0]
    out = np.zeros(samples(1.4))
    for k in range(3):
        f = notes[r.integers(len(notes))]
        b = bell(f, 1.0) * (0.7 ** k)
        i = samples(0.03 * k)
        out[i:i + len(b)] += b[: len(out) - i]
    shimmer = filt(noise(len(out)), "high", 8000, 2) * np.exp(-secs(len(out)) * 9) * 0.12
    return reverb(out + shimmer, 0.45)


def chime():
    """Sonic logo: three rising bell notes and a shimmer."""
    out = np.zeros(samples(2.2))
    for k, f in enumerate((1046.5, 1318.5, 1568.0, 2093.0)):
        b = bell(f, 1.6) * (1.0 if k < 3 else 0.6)
        i = samples(0.085 * k)
        out[i:i + len(b)] += b[: len(out) - i]
    shimmer = filt(noise(len(out)), "high", 7000, 2) * np.exp(-secs(len(out)) * 5) * 0.08
    return reverb(out + shimmer, 0.5)


def ding(f=1568.0):
    return reverb(bell(f, 1.4) * 1.1, 0.35)


def jackpot():
    out = np.zeros(samples(2.0))
    for k, f in enumerate((1046.5, 1318.5, 1568.0, 2093.0, 2637.0)):
        b = bell(f, 1.3)
        i = samples(0.055 * k)
        out[i:i + len(b)] += b[: len(out) - i]
    coins = coin_jingle(0.6, 18)
    out[: len(coins)] += coins
    return reverb(out, 0.4)


def coin_jingle(d=0.5, count=14):
    n = samples(d)
    out = np.zeros(n)
    r = np.random.default_rng(5)
    for _ in range(count):
        i = r.integers(0, n - samples(0.12))
        m = samples(0.12)
        t = secs(m)
        f = r.uniform(3500, 7500)
        out[i:i + m] += np.sin(2 * np.pi * f * t) * np.exp(-t * 45) * r.uniform(0.2, 0.5)
    return out


def cash():
    out = np.zeros(samples(1.6))
    b1, b2 = bell(2093.0, 1.2), bell(2637.0, 1.3)
    out[: len(b1)] += b1
    out[samples(0.07):samples(0.07) + len(b2)] += b2[: len(out) - samples(0.07)]
    c = coin_jingle(0.45, 16)
    out[: len(c)] += c
    clunk = filt(noise(samples(0.08)), "band", [300, 2000]) * np.exp(-secs(samples(0.08)) * 60)
    out[: len(clunk)] += 0.6 * clunk
    return reverb(out, 0.3)


def counter(d=0.4):
    out = np.zeros(samples(d + 0.05))
    k = 0
    tt = 0.0
    while tt < d:
        x = tick(1 + k * 0.04)
        i = samples(tt)
        out[i:i + len(x)] += x[: len(out) - i]
        tt += 0.032
        k += 1
    return out * 0.7


def slot(until, start):
    d = until - start
    out = np.zeros(samples(d + 0.05))
    tt = 0.0
    while tt < d:
        x = tick(0.9)
        i = samples(tt)
        out[i:i + len(x)] += x[: len(out) - i]
        tt += 0.034 + 0.08 * (tt / d) ** 2
    return out * 0.8


def squeak(p=1.0):
    n = samples(0.32)
    t = secs(n)
    f = (1000 + 700 * (t / t[-1]) + 60 * np.sin(2 * np.pi * 28 * t)) * p
    x = np.tanh(2.5 * np.sin(2 * np.pi * np.cumsum(f) / SR))
    x = filt(x, "band", [800, 5000])
    e = np.sin(np.pi * t / t[-1]) ** 0.7
    return x * e * 0.22


def stomp(p=1.0):
    n = samples(0.45)
    t = secs(n)
    thud = sweep_sine(140 * p, 42 * p, n, 22) * np.exp(-t * 9)
    mud = filt(noise(n), "low", 900, 2) * np.exp(-t * 16)
    squelch = filt(noise(n), "band", [300, 1500]) * np.exp(-t * 10) * (0.6 + 0.4 * np.sin(2 * np.pi * 38 * t))
    x = np.tanh(1.8 * thud) + 0.55 * mud + 0.35 * squelch
    return reverb(x * 0.9, 0.12)


def tap(low=False):
    n = samples(0.06)
    t = secs(n)
    f = 700 if low else 1900
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 90) + 0.4 * filt(noise(n), "band", [2000, 8000]) * np.exp(-t * 400)
    return x * 0.7


def boing():
    n = samples(0.45)
    t = secs(n)
    f = 330 * (1 + 0.35 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 5)) * (1 + 0.4 * np.exp(-t * 20))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * 0.5


def reveal():
    w = whoosh(0.6, True, (0, 0))
    out = np.zeros((2, samples(1.6)))
    out[:, : w.shape[1]] += w * 0.8
    b = impact(False) * 0.55
    i = samples(0.45)
    out[:, i:i + b.shape[1]] += b[:, : out.shape[1] - i]
    return out


# ---------- music bed ----------
CHORDS = [  # C, G, Am, F: (stab voicing, bass root)
    ([261.63, 329.63, 392.00], 65.41),
    ([246.94, 293.66, 392.00], 98.00),
    ([261.63, 329.63, 440.00], 110.00),
    ([261.63, 349.23, 440.00], 87.31),
]
LEAD = [0, 1, 2, 1, 3, 2, 1, 2]  # chord-tone order, 8ths


def music(plan, dur):
    bpm, drop, intro = plan["bpm"], plan["drop"], plan["intro"]
    beat = 60 / bpm
    step = beat / 4
    N = samples(dur)
    drums = np.zeros((2, N))
    duck = np.zeros((2, N))  # sidechained: bass, stabs, pad
    lead = np.zeros((2, N))
    kicks = []
    n0 = -int(np.floor(drop / step))
    n1 = int((dur - drop) / step) + 1
    K, C, Ho, Hc = kick(), clap(), hat(True), hat(False)
    for n in range(n0, n1):
        t0 = drop + n * step
        if t0 < -1e-9 or t0 >= dur:
            continue
        main = n >= 0
        bar, s = n // 16, n % 16
        stabs, root = CHORDS[bar % 4]
        if main or intro == "muffled":
            if s % 4 == 0:
                place(drums, K, t0, 0.8)
                kicks.append(t0)
            if s in (4, 12):
                place(drums, C, t0, 0.55)
            if s in (2, 6, 10, 14):
                place(drums, Ho, t0, 0.2, 0.25)
            if s % 2 == 1:
                place(drums, Hc, t0, 0.11, -0.3)
            if s in (2, 6, 10, 14, 15):
                place(duck, bass_note(root, step * 1.8), t0, 0.62)
            if s in (0, 3, 6, 10, 12):
                place(duck, pluck(stabs, step * 2.6), t0, 0.33)
            if s == 0:
                place(duck, pad([f / 2 for f in stabs], beat * 4 + 0.35), t0, 0.2)
            if main and bar >= 1 and s % 2 == 0:
                f = sorted(stabs)[LEAD[(s // 2) % 8] % 3] * 2 * (2 if LEAD[(s // 2) % 8] == 3 else 1)
                x = lead_note(f, step * 2.4)
                place(lead, x, t0, 0.24, -0.35)
                place(lead, x, t0 + 3 * step, 0.24 * 0.35, 0.45)
                place(lead, x, t0 + 6 * step, 0.24 * 0.14, -0.45)
        else:
            if intro == "tick" and s % 4 == 0:
                place(drums, woodblock(1900 if (s // 4) % 2 == 0 else 1500), t0, 0.5)
            if intro == "stomp" and s % 8 == 0:
                place(drums, K, t0, 0.5)
            if s == 0:
                place(duck, pad([f / 2 for f in stabs], beat * 4 + 0.35), t0, 0.12)
    # sidechain pump
    g = np.ones(N)
    for tk in kicks:
        i = samples(tk)
        m = min(N - i, samples(0.3))
        if m > 0:
            g[i:i + m] = np.minimum(g[i:i + m], 1 - 0.6 * np.exp(-secs(m) / 0.09))
    bed = drums + duck * g + reverb(lead, 0.35)
    # intro treatments before the drop
    if drop > 0:
        d = samples(drop)
        if intro == "muffled":
            bed[:, :d] = filt(bed[:, :d], "low", 380, 2) * 0.6
        if intro in ("stomp", "riser", "tick"):
            drone = filt(saw(55, secs(d)) + saw(55.4, secs(d)), "low", 300, 2) * 0.18
            bed[:, :d] += stereo(drone * np.minimum(1, secs(d) / 0.4))
        r = riser(min(1.2, drop))
        place(bed, r, drop - len(r) / SR, 0.35)
        place(bed, crash(), drop, 0.5)
    fade = samples(0.35)
    bed[:, -fade:] *= np.linspace(1, 0, fade)
    return bed


# ---------- render ----------
FX = {
    "impact": lambda o, c: impact(bool(o.get("big"))),
    "hit": lambda o, c: hit(o.get("p", 1.0), bool(o.get("big"))),
    "swish": lambda o, c: swish(o.get("d", 0.28)),
    "whoosh": lambda o, c: whoosh(o.get("d", 0.6), not o.get("down")),
    "squeak": lambda o, c: squeak(o.get("p", 1.0)),
    "pop": lambda o, c: pop(o.get("p", 1.0)),
    "sparkle": lambda o, c: sparkle(o.get("seed", 0)),
    "chime": lambda o, c: chime(),
    "ding": lambda o, c: ding(o.get("f", 1568.0)),
    "bell": lambda o, c: reverb(bell(o.get("f", 1568.0), 1.6), 0.4),
    "jackpot": lambda o, c: jackpot(),
    "cash": lambda o, c: cash(),
    "counter": lambda o, c: counter(o.get("d", 0.4)),
    "slot": lambda o, c: slot(o["until"], c),
    "stomp": lambda o, c: stomp(o.get("p", 1.0)),
    "tap": lambda o, c: tap(bool(o.get("low"))),
    "tick": lambda o, c: tick(),
    "boing": lambda o, c: boing(),
    "reveal": lambda o, c: reveal(),
}
LEVEL = {"impact": 0.8, "hit": 0.55, "swish": 0.4, "whoosh": 0.55, "squeak": 0.9, "pop": 0.45, "sparkle": 0.55,
         "chime": 0.8, "ding": 0.6, "bell": 0.6, "jackpot": 0.7, "cash": 0.75, "counter": 0.6, "slot": 0.6,
         "stomp": 0.9, "tap": 0.6, "tick": 0.5, "boing": 0.6, "reveal": 0.75}


def render(plan):
    dur = plan["dur"]
    N = samples(dur)
    fx = np.zeros((2, N))
    for t, kind, o in plan["cues"]:
        x = FX[kind](o, t)
        place(fx, x, t, LEVEL[kind] * o.get("g", 1.0))
    bed = music(plan["music"], dur)
    # duck the music a little under the effects so every hit reads
    envl = np.abs(fx).max(axis=0)
    envl = signal.sosfilt(sos("low", 12, 1), envl)
    g = 1 - 0.45 * np.clip(envl / (envl.max() + 1e-9) * 1.8, 0, 1)
    mix = bed * 0.5 * g + fx
    mix = filt(mix, "high", 28, 2)
    mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.25) * 0.9
    return mix


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    pcm = (x.T * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def loudnorm(src, dst, target=-14.0, tp=-1.0):
    base = f"loudnorm=I={target}:TP={tp}:LRA=11"
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", base + ":print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = json.loads(p.stderr[p.stderr.rindex("{"):p.stderr.rindex("}") + 1])
    af = (f"{base}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-af", af, "-ar", str(SR),
                    "-c:a", "pcm_s24le", dst], check=True)


def main():
    plan_path, out_dir = sys.argv[1], sys.argv[2]
    plans = json.load(open(plan_path))
    ids = sys.argv[3:] or list(plans)
    os.makedirs(out_dir, exist_ok=True)
    for vid in ids:
        mix = render(plans[vid])
        raw = os.path.join(out_dir, vid + "-raw.wav")
        write_wav(raw, mix)
        loudnorm(raw, os.path.join(out_dir, vid + ".wav"))
        os.remove(raw)
        print(vid + ".wav")


if __name__ == "__main__":
    main()
