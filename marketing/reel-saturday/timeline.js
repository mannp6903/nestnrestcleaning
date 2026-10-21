// One cue sheet for picture and sound. reel.html reads window.TL; audio.py parses the JSON below.
// 120 BPM: one beat = 0.5s, one bar = 2s, 15 bars = 30s. Big moments sit on beats so the cuts land on the music.
window.TL = {
  "bpm": 120,
  "duration": 30,
  "fps": 30,
  "transitions": [
    { "type": "squeegee", "from": "s0",  "to": "s1",  "t": 1.5,  "d": 0.5,  "dir": 1 },
    { "type": "push",     "from": "s1",  "to": "s2",  "t": 4.0,  "d": 0.4 },
    { "type": "squeegee", "from": "s2",  "to": "s3",  "t": 6.0,  "d": 0.42, "dir": -1 },
    { "type": "house",    "from": "s3",  "to": "s4",  "t": 8.0,  "d": 0.5 },
    { "type": "cut",      "from": "s4",  "to": "s5",  "t": 10.5, "d": 0 },
    { "type": "squeegee", "from": "s5",  "to": "s6",  "t": 12.5, "d": 0.42, "dir": 1 },
    { "type": "push",     "from": "s6",  "to": "s7",  "t": 15.5, "d": 0.4 },
    { "type": "house",    "from": "s7",  "to": "s8",  "t": 17.5, "d": 0.5 },
    { "type": "squeegee", "from": "s8",  "to": "s9",  "t": 20.0, "d": 0.42, "dir": -1 },
    { "type": "zoom",     "from": "s9",  "to": "s10", "t": 23.0, "d": 0.3 },
    { "type": "squeegee", "from": "s10", "to": "s11", "t": 25.5, "d": 0.42, "dir": 1 },
    { "type": "fade",     "from": "s11", "to": "s0",  "t": 29.5, "d": 0.5 }
  ],
  "cues": {
    "glint": 2.1,
    "toast": 2.45,
    "strikes": [4.625, 4.875, 5.125, 5.375],
    "chips": [8.75, 9.0, 9.25],
    "odometer": 9.4,
    "silence": [10.25, 10.5],
    "ticks": [13.0, 13.5, 14.0, 14.5, 15.0],
    "spotWipe": 16.5,
    "days": 20.3,
    "dayTap": 20.875,
    "slot": 21.25,
    "access": 21.5,
    "bubbleIn": 22.0,
    "offerCount": 23.05,
    "logo": 25.75,
    "cta": 26.5,
    "hours": 26.85,
    "punches": [2.0, 10.5, 23.0]
  }
};
