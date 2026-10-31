# Encodes the Reel frames from `render.mjs --reels` into MP4s (needs ffmpeg).
# Usage: python3 marketing/social/tools/mkreel.py <frames dir printed by render.mjs> <output.mp4>
import subprocess, sys, glob, os
def build(dirn, out, hook=2.6, each=2.3, end=3.4, xf=0.35):
    frames = sorted(glob.glob(os.path.join(dirn, 'f*.png')), key=lambda f: int(os.path.basename(f)[1:-4]))
    durs = [hook] + [each]*(len(frames)-2) + [end]
    args = ['ffmpeg', '-y', '-loglevel', 'error']
    for f, d in zip(frames, durs):
        args += ['-loop', '1', '-t', f'{d + xf:.2f}', '-framerate', '30', '-i', f]
    filt = []; prev = '[0:v]'; t = 0
    for i in range(1, len(frames)):
        t += durs[i-1]
        tr = 'fade' if i in (1, len(frames)-1) else 'smoothleft'
        lab = f'[v{i}]'
        filt.append(f'{prev}[{i}:v]xfade=transition={tr}:duration={xf}:offset={t:.2f}{lab}')
        prev = lab
    filt.append(f'{prev}format=yuv420p[out]')
    args += ['-filter_complex', ';'.join(filt), '-map', '[out]', '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-movflags', '+faststart', out]
    subprocess.run(args, check=True)
    print(out, os.path.getsize(out)//1024, 'KB', round(sum(durs), 1), 's')
if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
