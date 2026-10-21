#!/usr/bin/env python3
"""Original soundtrack and sound design for the Saturday reel, synthesised from scratch (no samples, no licences).

Soft house, 120 BPM, F major. It follows the same cue sheet as the picture (timeline.js), so every cut,
tick and sparkle lands on the frame it belongs to. The 24s track loops seamlessly: reverb and delay
tails that run past the end are folded back onto the start.

    python3 audio.py      -> build/soundtrack.wav (-14 LUFS, -1 dBTP), soundtrack.m4a (browser preview)
                             and build/soundtrack-sfx-only.wav (effects only, for adding a trending song)

Needs numpy, scipy and ffmpeg.
"""
import json
import pathlib
import re
import subprocess

import numpy as np
from scipy import signal
from scipy.io import wavfile

HERE = pathlib.Path(__file__).resolve().parent
TL = json.loads(re.search(r"window\.TL\s*=\s*(\{.*\})\s*;", (HERE / "timeline.js").read_text(), re.S).group(1))
C = TL["cues"]
SR = 48000
BEAT = 60 / TL["bpm"]
BAR = 4 * BEAT
S16 = BEAT / 4
DUR = TL["duration"]
TAIL = 3.0
N = int((DUR + TAIL) * SR)
rng = np.random.default_rng(20261020)


# ---------- basics ----------
def tt(d):
    return np.arange(int(d * SR)) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def bus():
    return np.zeros((2, N))


def place(dst, sig, t, gain=1.0, pan=0.0):
    """Mix a mono (equal-power panned) or stereo signal into dst at time t."""
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.vstack([sig * np.cos(a), sig * np.sin(a)]) * np.sqrt(2)
    i = int(round(t * SR))
    if i < 0:
        sig, i = sig[:, -i:], 0
    n = min(sig.shape[1], N - i)
    if n > 0:
        dst[:, i:i + n] += gain * sig[:, :n]


def sos(kind, fc, order=2):
    return signal.butter(order, fc, kind, fs=SR, output="sos")


def filt(s, x):
    return signal.sosfilt(s, x, axis=-1)


def rbj(kind, fc, q):
    w0 = 2 * np.pi * min(fc, SR * 0.45) / SR
    cw, al = np.cos(w0), np.sin(w0) / (2 * q)
    if kind == "lp":
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
    else:  # band-pass, 0 dB peak
        b = [al, 0, -al]
    a = [1 + al, -2 * cw, 1 - al]
    return np.array(b) / a[0], np.array(a) / a[0]


def tv_filter(x, cutoff, kind="lp", q=0.75, stages=2, block=128):
    """Time-varying biquad (cutoff given per sample), applied block by block with carried state."""
    x = np.atleast_2d(x)
    out = x.copy()
    for _ in range(stages):
        y = np.zeros_like(out)
        zi = np.zeros((out.shape[0], 2))
        for s in range(0, out.shape[1], block):
            b, a = rbj(kind, cutoff[min(s, len(cutoff) - 1)], q)
            for ch in range(out.shape[0]):
                y[ch, s:s + block], zi[ch] = signal.lfilter(b, a, out[ch, s:s + block], zi=zi[ch])
        out = y
    return out


def env_adsr(n, a=0.005, d=0.1, s=0.7, r=0.05):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na, endpoint=False) if na else e[:na]
    e[na:na + nd] = np.linspace(1, s, len(e[na:na + nd]))
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def fade(x, fin=0.002, fout=0.01):
    x = x.copy()
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[..., :a] *= np.linspace(0, 1, a)
    if b:
        x[..., -b:] *= np.linspace(1, 0, b)
    return x


def saw(f, n, detune_phase=0.0):
    dt = f / SR
    ph = (detune_phase + np.arange(n) * dt) % 1.0
    y = 2 * ph - 1
    m = ph < dt
    x = ph[m] / dt
    y[m] -= x + x - x * x - 1
    m = ph > 1 - dt
    x = (ph[m] - 1) / dt
    y[m] -= x * x + x + x + 1
    return y


def noise(n):
    return rng.standard_normal(n)


# ---------- instruments ----------
def kick():
    t = tt(0.5)
    f = 46 + 120 * np.exp(-t / 0.032)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2) * np.minimum(1, t / 0.0015 + 0.2)
    click = filt(sos("high", 2500), noise(len(t))) * np.exp(-t / 0.004) * 0.35
    return np.tanh(1.6 * (body + click)) / np.tanh(1.6)


def clap():
    t = tt(0.45)
    e = np.zeros_like(t)
    for k, o in enumerate([0, 0.009, 0.019, 0.03]):
        m = t >= o
        e[m] += np.exp(-(t[m] - o) / (0.006 if k < 3 else 0.12))
    return filt(sos("bandpass", [900, 3200]), noise(len(t))) * e


def hat(open_=False):
    t = tt(0.35 if open_ else 0.08)
    x = filt(sos("high", 6500 if open_ else 8000, 4), noise(len(t)))
    return x * np.exp(-t / (0.12 if open_ else 0.022))


def shaker():
    t = tt(0.1)
    return filt(sos("bandpass", [5000, 11000]), noise(len(t))) * np.minimum(1, t / 0.012) * np.exp(-t / 0.035)


def bass(m, d):
    n = int(d * SR)
    f = mtof(m)
    x = 0.8 * np.sin(2 * np.pi * f * np.arange(n) / SR) + 0.55 * filt(sos("low", 650, 4), saw(f, n))
    return np.tanh(1.4 * x * env_adsr(n, 0.004, 0.08, 0.75, 0.03))


def epiano(m, d):
    """FM electric piano: bell-ish attack, warm body."""
    n = int((d + 0.6) * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    idx = 1.6 * np.exp(-t / 0.22) + 0.3
    y = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    y += 0.12 * np.sin(2 * np.pi * f * 7.02 * t) * np.exp(-t / 0.05)
    amp = np.exp(-t / 1.1) * np.minimum(1, t / 0.003)
    rel = np.ones(n)
    k = int(d * SR)
    rel[k:] = np.exp(-(t[k:] - d) / 0.12)
    return y * amp * rel


def pad(notes, d):
    n = int((d + 0.4) * SR)
    y = np.zeros(n)
    for m in notes:
        for cents in (-14, -6, 0, 7, 15):
            y += saw(mtof(m) * 2 ** (cents / 1200), n, rng.random())
    y = filt(sos("low", 1700, 4), y) / (len(notes) * 5)
    return y * env_adsr(n, 0.18, 0.4, 0.85, 0.4)


def pluck(m):
    t = tt(0.45)
    f = mtof(m)
    y = sum((1 / k ** 1.25) * np.sin(2 * np.pi * k * f * t) * np.exp(-t * (7 + 3.2 * k)) for k in range(1, 12) if k * f < SR / 2.2)
    return y * np.minimum(1, t / 0.002)


def bell(m, d=1.2, ratio=3.5, index=2.4):
    t = tt(d)
    f = mtof(m)
    y = np.sin(2 * np.pi * f * t + index * np.exp(-t / 0.25) * np.sin(2 * np.pi * f * ratio * t))
    return y * np.exp(-t / (d * 0.35)) * np.minimum(1, t / 0.002)


# ---------- sound design ----------
def whoosh(d=0.45, f0=300, f1=4000, peak=0.6):
    n = int(d * SR)
    u = np.linspace(0, 1, n)
    fc = f0 * (f1 / f0) ** u
    x = tv_filter(noise(n), fc, "bp", q=1.2, stages=1)[0]
    e = np.where(u < peak, (u / peak) ** 2, ((1 - u) / (1 - peak)) ** 1.5)
    return x * e


def squeegee(d=0.42, direction=1):
    """Wiper swish (filtered noise) plus a short rubber squeak, panned across the frame."""
    n = int(d * SR)
    sw = whoosh(d, 600, 5500, 0.55)
    t = np.arange(n) / SR
    f = 950 + 650 * np.sin(np.pi * np.clip(t / d, 0, 1)) + 25 * np.sin(2 * np.pi * 31 * t)
    sq = (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.35 * np.sin(4 * np.pi * np.cumsum(f) / SR))
    sq *= np.sin(np.pi * np.clip(t / d, 0, 1)) ** 3 * 0.18
    mono = sw + sq
    pan = np.linspace(-0.85, 0.85, n) * direction
    a = (pan + 1) * np.pi / 4
    return np.vstack([mono * np.cos(a), mono * np.sin(a)]) * np.sqrt(2)


def riser(d=1.0):
    n = int(d * SR)
    u = np.linspace(0, 1, n)
    x = tv_filter(noise(n), 300 * (9000 / 300) ** u, "bp", q=0.9, stages=1)[0]
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (u * 2.3)) / SR) * 0.25
    return (x + tone) * u ** 2.2


def reverse_crash(d=0.5):
    t = tt(d)
    x = filt(sos("bandpass", [2500, 12000]), noise(len(t)))
    return x * (t / d) ** 3


def impact():
    t = tt(1.4)
    f = 42 + 70 * np.exp(-t / 0.06)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45)
    hit = filt(sos("low", 2800), noise(len(t))) * np.exp(-t / 0.09) * 0.6
    crash = filt(sos("high", 4000), noise(len(t))) * np.exp(-t / 0.7) * 0.18
    return np.tanh(1.3 * (sub + hit + crash))


def click(f=2200):
    t = tt(0.03)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.004) + 0.5 * np.sin(2 * np.pi * f / 2 * t) * np.exp(-t / 0.008))


def blip(m):
    t = tt(0.18)
    f = mtof(m) * (1 - 0.1 * np.exp(-t / 0.012))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR + 0.6 * np.sin(2 * np.pi * np.cumsum(f) * 2 / SR) * np.exp(-t / 0.03))
    return y * np.exp(-t / 0.07) * np.minimum(1, t / 0.002)


def swipe():
    t = tt(0.16)
    x = tv_filter(noise(len(t)), np.geomspace(7000, 1500, len(t)), "bp", q=1.0, stages=1)[0]
    thock = np.sin(2 * np.pi * 170 * t) * np.exp(-t / 0.03)
    return x * np.exp(-t / 0.05) * 0.8 + thock * 0.5


def pop(f0=320, f1=980):
    t = tt(0.09)
    f = f0 + (f1 - f0) * (1 - np.exp(-t / 0.02))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035)


def ticker(start, d=0.6, n_ticks=14):
    """Odometer: clicks that slow down, then a landing chime."""
    times = start + d * (np.linspace(0, 1, n_ticks) ** 1.8)
    return times


# ---------- arrangement ----------
VOICE = {  # (bass midi, chord voicing)
    "Csus": (36, [55, 60, 65, 70]),
    "C": (36, [55, 60, 64, 67]),
    "Fmaj7": (41, [57, 60, 64, 67]),
    "Am7": (45, [55, 60, 64, 69]),
    "Bbmaj7": (46, [57, 62, 65, 69]),
    "Dm7": (38, [57, 60, 65, 69]),
}
BARS = ["Csus", "Fmaj7", "Am7", "Bbmaj7", "Fmaj7", "Am7", "Dm7", "Bbmaj7",
        "Fmaj7", "Bbmaj7", "Fmaj7", "Dm7", "Bbmaj7", "Fmaj7", "C"]
LAST = len(BARS) - 1
BREAK = {9}  # bar index with the founder: drums drop out, warmer

drums, music, keys, arp_bus, sfx, verb_send = bus(), bus(), bus(), bus(), bus(), bus()
K, CL, HC, HO, SH = kick(), clap(), hat(), hat(True), shaker()
kick_times = []

for bi, name in enumerate(BARS):
    b0 = bi * BAR
    root, chord = VOICE[name]
    full = 0 < bi < LAST  # the first and last bars stay muffled and sparse, so the loop joins cleanly
    # drums
    if bi not in BREAK:
        for beat in range(4):
            tk = b0 + beat * BEAT
            place(drums, K, tk, 0.95)
            kick_times.append(tk)
            if beat in (1, 3) and full:
                place(drums, CL, tk, 0.32, 0.05)
                place(verb_send, CL, tk, 0.18)
        for s in range(16):
            ts = b0 + s * S16
            accent = 1.0 if s % 4 == 2 else (0.55 if s % 2 else 0.35)
            place(drums, HC, ts, 0.11 * accent, 0.25 if s % 2 else -0.15)
            if s % 4 == 2 and full:
                place(drums, HO, ts, 0.075, 0.3)
            if 10 <= bi <= 13:
                place(drums, SH, ts + 0.006, 0.05 * (1.0 if s % 2 else 0.6), -0.4)
    # bass: off-beat eighths, octave lift on the third
    for k, off in enumerate([0.25, 0.75, 1.25, 1.75]):
        m = root + (12 if k == 2 else 0)
        place(music, bass(m, 0.21), b0 + off * 2 * BEAT, 0.42 if bi not in BREAK else 0.28)
    # pad
    place(keys, pad(chord, BAR), b0, 0.5)
    # e-piano stabs on a syncopated grid
    for s, d, g in [(0, 0.7, 1.0), (6, 0.25, 0.7), (10, 0.5, 0.85)]:
        for m in chord:
            place(keys, epiano(m, d), b0 + s * S16, 0.055 * g, rng.uniform(-0.3, 0.3))
    # plucked arpeggio from the calendar to the offer; the end card breathes without it
    if 2 <= bi <= 12:
        pattern = [0, None, 2, 1, None, 3, 2, None, 0, None, 2, 1, 3, None, 1, 2]
        for s, p in enumerate(pattern):
            if p is None:
                continue
            g = 0.09 if bi not in BREAK else 0.06
            place(arp_bus, pluck(chord[p] + 12), b0 + s * S16, g * (1.1 if s % 4 == 0 else 0.9))

# build-up into the offer: clap roll in the half bar before the zoom
offer = next(tr["t"] for tr in TL["transitions"] if tr["type"] == "zoom")
for k, tr in enumerate(np.linspace(offer - 0.5, offer, 12, endpoint=False)):
    place(drums, CL, tr, 0.08 + 0.02 * k, 0.0)

# sidechain pump from the kick
duck = np.ones(N)
seg_t = tt(0.35)
for tk in kick_times:
    i = int(tk * SR)
    seg = 1 - 0.62 * np.minimum(1, seg_t / 0.003) * np.exp(-seg_t / 0.12)
    n = min(len(seg), N - i)
    duck[i:i + n] = np.minimum(duck[i:i + n], seg[:n])

# arp through a dotted-eighth ping-pong delay
delay = bus()
d = int(0.75 * BEAT * SR)
mono = arp_bus.sum(axis=0) * 0.5
for k in range(1, 6):
    delay[k % 2, k * d:] += (0.42 ** k) * mono[:N - k * d]
delay = filt(sos("low", 3800), delay)
music = (music + keys + arp_bus + delay * 0.8) * duck
music_dry = 0.62 * drums + 1.5 * music  # keep the chords and bass forward; phones lose the low kick anyway

# filter automation for the musical bus: muffled hook, open drop, warm founder bar, closing into the loop
tsec = np.arange(N) / SR
cut = np.full(N, 18000.0)
cut[tsec < 1.0] = 650
m = (tsec >= 1.0) & (tsec < 2.0)
cut[m] = 650 * (4200 / 650) ** ((tsec[m] - 1.0) / 1.0)
b9 = min(BREAK) * BAR
cut[(tsec >= b9) & (tsec < b9 + BAR)] = 2600
c0, c1 = DUR - 1.5, DUR - 0.25
m = (tsec >= c0) & (tsec < c1)
cut[m] = 18000 * (650 / 18000) ** ((tsec[m] - c0) / (c1 - c0))
cut[tsec >= c1] = 650
music_dry = tv_filter(music_dry, cut, "lp", q=0.8)

# the half-beat drop-out before "$0"
gate = np.ones(N)
s0, s1 = C["silence"]
i0, i1 = int(s0 * SR), int(s1 * SR)
r = int(0.012 * SR)
gate[i0:i1] = 0
gate[i0 - r:i0] = np.linspace(1, 0, r)
gate[i1:i1 + r] = np.linspace(0, 1, r)
music_dry *= gate

# ---------- sound design cues ----------
first = TL["transitions"][0]
place(sfx, riser(1.0), first["t"] + first["d"] - 1.0, 0.22)
place(sfx, reverse_crash(0.5), first["t"], 0.16)
for k, m in enumerate([89, 93, 96, 101]):  # glint across the clean glass
    place(sfx, bell(m, 0.7, 2.0, 1.4), C["glint"] + k * 0.03, 0.06, -0.6 + 0.4 * k)
place(sfx, pop(420, 1200), C["toast"], 0.18, 0.0)  # "Screen cleaned" notification
place(sfx, bell(88, 0.7, 2.0, 1.0), C["toast"] + 0.03, 0.08, 0.0)
place(sfx, bell(93, 0.7, 2.0, 1.0), C["toast"] + 0.12, 0.06, 0.0)
for k, ts in enumerate(C["strikes"]):  # chores deleted: swipe + a blip that climbs
    place(sfx, swipe(), ts, 0.32, -0.3)
    place(sfx, blip([79, 81, 84, 86][k]), ts + 0.02, 0.16, 0.2)
for hit in C["punches"]:
    place(sfx, impact(), hit, 0.62)
    place(verb_send, impact(), hit, 0.25)
for tr in TL["transitions"]:
    if tr["type"] == "squeegee":  # the first wipe drags the hair off the glass: give its squeak more presence
        place(sfx, squeegee(tr["d"], tr.get("dir", 1)), tr["t"], 0.5 if tr is first else 0.34)
    elif tr["type"] == "house":
        place(sfx, whoosh(0.55, 200, 2400, 0.7), tr["t"] - 0.05, 0.32, 0.0)
    elif tr["type"] == "push":
        place(sfx, whoosh(0.45, 400, 6000, 0.6), tr["t"], 0.3, 0.0)
    elif tr["type"] == "zoom":
        place(sfx, whoosh(0.5, 300, 7000, 0.85), tr["t"] - 0.4, 0.34, 0.0)
    elif tr["type"] == "fade":
        place(sfx, whoosh(0.6, 2500, 400, 0.3), tr["t"], 0.14, 0.0)
for k, ts in enumerate(C["chips"]):  # calculator taps
    place(sfx, click(2000 + 200 * k), ts, 0.22, 0.25)
for ts in ticker(C["odometer"], 0.62, 13):  # odometer
    place(sfx, click(3200), ts, 0.07, 0.1)
place(sfx, bell(84, 1.0, 2.0, 1.2), C["odometer"] + 0.66, 0.1, 0.2)
place(sfx, reverse_crash(0.25), C["silence"][1] - 0.25, 0.12)
for k, ts in enumerate(C["ticks"]):  # standard checklist: climbing checks
    m = [76, 77, 79, 81, 84][k]
    place(sfx, blip(m), ts, 0.17, 0.15)
    place(sfx, blip(m + 7), ts + 0.06, 0.1, 0.15)
place(sfx, squeegee(0.5, 1) * 0.9, C["spotWipe"], 0.3)
for k, m in enumerate([77, 81, 84, 89]):  # sparkle on the clean "24h"
    place(sfx, bell(m + 12, 0.9), C["spotWipe"] + 0.5 + k * 0.045, 0.06, -0.4 + 0.27 * k)
for k in range(7):  # the Mon-Sun strip lands
    place(sfx, click(2600 + 120 * k), C["days"] + k * 0.045, 0.05, -0.6 + 0.2 * k)
place(sfx, click(1800), C["dayTap"], 0.24, -0.2)  # tap Tuesday
place(sfx, pop(360, 980), C["dayTap"] + 0.01, 0.12, -0.2)
place(sfx, click(2100), C["slot"], 0.2, 0.0)
place(sfx, pop(300, 900), C["access"], 0.14, 0.1)
place(sfx, bell(86, 0.8, 2.0, 1.0), C["bubbleIn"], 0.11, -0.3)  # text received
place(sfx, bell(93, 0.8, 2.0, 1.0), C["bubbleIn"] + 0.09, 0.08, -0.3)
place(sfx, riser(1.0), offer - 1.0, 0.2)
place(sfx, reverse_crash(0.45), offer - 0.45, 0.15)
for ts in ticker(C["offerCount"], 0.5, 9):
    place(sfx, click(3000), ts, 0.06, -0.1)
for k, m in enumerate([77, 81, 84, 88, 89]):  # end card shimmer as the logo builds
    place(sfx, bell(m + 12, 1.1), C["logo"] + 0.15 + k * 0.05, 0.07, -0.5 + 0.25 * k)
place(sfx, pop(300, 900), C["cta"], 0.18, 0.0)
place(sfx, click(2400), C["hours"], 0.06, 0.2)

# ---------- mix ----------
ir_t = tt(2.2)
ir = rng.standard_normal((2, len(ir_t))) * 10 ** (-3 * ir_t / 1.7)
w = np.clip(ir_t / 1.7, 0, 1)
ir = ir * (1 - w) ** 2 + filt(sos("low", 2800), ir) * 2 * w * (1 - w) + filt(sos("low", 1100), ir) * w ** 2
ir[:, :int(0.022 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
send = verb_send + 0.28 * keys * gate + 0.22 * sfx + 0.12 * arp_bus
verb = np.vstack([signal.fftconvolve(send[c], ir[c])[:N] for c in range(2)]) * 0.55
verb = filt(sos("high", 180), verb)

mix = music_dry + verb + sfx
mix = filt(sos("high", 32), mix)
mix -= 0.32 * filt(sos("low", 95), mix)  # ~3 dB low shelf: phone speakers can't play it, and it eats the loudness budget

from scipy.ndimage import minimum_filter1d  # noqa: E402

build = HERE / "build"
build.mkdir(exist_ok=True)


def master(x, name, lufs):
    """Fold the tail onto the start (seamless loop), glue, peak-limit, then two-pass loudness normalise."""
    L = int(DUR * SR)
    out = x[:, :L].copy()
    out[:, :N - L] += x[:, L:]
    out /= np.max(np.abs(out)) * 0.95
    out = np.tanh(out * 1.15) / np.tanh(1.15)
    ceiling = 0.89
    need = np.minimum(1.0, ceiling / np.maximum(np.max(np.abs(out), axis=0), 1e-9))
    g = minimum_filter1d(need, size=2 * int(0.005 * SR) + 1)
    b, a = signal.butter(1, 12, fs=SR)
    out *= np.minimum(g, signal.filtfilt(b, a, g))
    out /= max(1e-9, np.max(np.abs(out))) / ceiling
    raw = build / f"{name}-raw.wav"
    wavfile.write(raw, SR, out.T.astype(np.float32))
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", f"loudnorm=I={lufs}:TP=-1.0:LRA=11:print_format=json",
                           "-f", "null", "-"], capture_output=True, text=True).stderr
    mj = json.loads(meas[meas.rfind("{"):meas.rfind("}") + 1])
    ln = (f"loudnorm=I={lufs}:TP=-1.0:LRA=11:measured_I={mj['input_i']}:measured_TP={mj['input_tp']}:"
          f"measured_LRA={mj['input_lra']}:measured_thresh={mj['input_thresh']}:offset={mj['target_offset']}:linear=true")
    final = build / f"{name}.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", ln, "-ar", str(SR), "-c:a", "pcm_s24le", str(final)], check=True)
    print(f"{name}: input {mj['input_i']} LUFS, {mj['input_tp']} dBTP -> {final} at {lufs} LUFS")
    return final


# -14 LUFS is the level social and streaming apps commonly normalise to, so the app shouldn't need to touch it.
final = master(mix, "soundtrack", -14)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(final), "-c:a", "aac", "-b:a", "192k", str(HERE / "soundtrack.m4a")], check=True)

# Sound effects alone, for laying a trending track underneath in the Instagram editor.
sfx_verb = np.vstack([signal.fftconvolve(0.3 * sfx[c], ir[c])[:N] for c in range(2)]) * 0.55
master(filt(sos("high", 32), sfx + sfx_verb), "soundtrack-sfx-only", -16)
