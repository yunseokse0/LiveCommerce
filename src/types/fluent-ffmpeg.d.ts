declare module 'fluent-ffmpeg' {
  interface FFmpegOptions {
    [key: string]: any;
  }

  interface FFmpeg {
    addOptions(options: string[]): FFmpeg;
    output(path: string): FFmpeg;
    on(event: string, callback: (...args: any[]) => void): FFmpeg;
    run(): any;
    kill(signal?: string): void;
  }

  function ffmpeg(input?: string | any): FFmpeg;

  export = ffmpeg;
}
