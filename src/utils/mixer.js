import { FFmpeg } from "@ffmpeg/ffmpeg";

let ffmpeg;

export const mixAudio = async (queue) => {
  try {
    if (!ffmpeg) {
      // Initialize FFmpeg if it hasn't been created yet
      ffmpeg = new FFmpeg({ log: true });
      console.log("Initializing FFmpeg...");
      await ffmpeg.load(); // Load FFmpeg
      console.log("FFmpeg loaded successfully.");
    }

    // Add all files to FFmpeg's virtual filesystem
    for (let i = 0; i < queue.length; i++) {
      const sound = queue[i];
      const fileName = `input${i}.mp3`;

      // Fetch and write each file
      const response = await fetch(sound.url);
      const arrayBuffer = await response.arrayBuffer();
      ffmpeg.FS("writeFile", fileName, new Uint8Array(arrayBuffer));
      console.log(`File written: ${fileName}`);
    }

    console.log("Generating concat.txt...");
    const concatFileList = queue
      .map((_, i) => `file input${i}.mp3`)
      .join("\n");
    ffmpeg.FS("writeFile", "concat.txt", new TextEncoder().encode(concatFileList));
    console.log("concat.txt written.");

    console.log("Running FFmpeg...");
    await ffmpeg.run(
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      "concat.txt",
      "-c",
      "copy",
      "output.mp3"
    );
    console.log("FFmpeg run completed.");

    const data = ffmpeg.FS("readFile", "output.mp3");
    console.log("Output file retrieved.");

    return new Blob([data.buffer], { type: "audio/mp3" });
  } catch (error) {
    console.error("Error during mixing:", error);
    throw new Error("Mixing failed");
  }
};
