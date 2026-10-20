// One cue sheet for picture and sound. reel.html reads window.TL; audio.py parses the JSON below.
// 120 BPM: one beat = 0.5s, one bar = 2s. Big moments sit on beats so the cuts land on the music.
window.TL = {
  "bpm": 120,
  "duration": 24,
  "fps": 30,
  "transitions": [
    { "type": "squeegee", "from": "s0", "to": "s1", "t": 2.0,  "d": 0.42, "dir": 1 },
    { "type": "house",    "from": "s1", "to": "s2", "t": 4.5,  "d": 0.5 },
    { "type": "cut",      "from": "s2", "to": "s3", "t": 7.0,  "d": 0 },
    { "type": "squeegee", "from": "s3", "to": "s4", "t": 9.0,  "d": 0.42, "dir": -1 },
    { "type": "push",     "from": "s4", "to": "s5", "t": 12.0, "d": 0.4 },
    { "type": "house",    "from": "s5", "to": "s6", "t": 14.0, "d": 0.5 },
    { "type": "squeegee", "from": "s6", "to": "s7", "t": 16.5, "d": 0.42, "dir": 1 },
    { "type": "zoom",     "from": "s7", "to": "s8", "t": 19.0, "d": 0.3 },
    { "type": "squeegee", "from": "s8", "to": "s9", "t": 21.5, "d": 0.42, "dir": -1 },
    { "type": "squeegee", "from": "s9", "to": "s0", "t": 23.5, "d": 0.5,  "dir": 1 }
  ],
  "cues": {
    "strikes": [0.375, 0.75, 1.125, 1.5],
    "chips": [5.0, 5.25, 5.5],
    "odometer": 5.75,
    "silence": [6.75, 7.0],
    "ticks": [9.5, 10.0, 10.5, 11.0, 11.5],
    "spotWipe": 13.0,
    "bubbleOut": 17.0,
    "typing": 17.25,
    "bubbleIn": 17.75,
    "confirmed": 18.25,
    "offerCount": 19.05,
    "logo": 21.75,
    "cta": 22.5,
    "punches": [2.0, 7.0, 19.0]
  }
};
