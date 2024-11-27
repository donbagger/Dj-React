import React, { useState } from "react";
import { mixAudio } from "../utils/mixer"; // Mixing logic with FFmpeg

const Mixer = ({ queue, setQueue, volume }) => {
  const [isPlaying, setIsPlaying] = useState(false); // Track whether playback is active
  const [audioInstances, setAudioInstances] = useState([]); // Store all audio instances for stopping
  const [isMixing, setIsMixing] = useState(false); // Track mixing state
  const [mixReady, setMixReady] = useState(false); // Track if the mix is ready
  const [mixUrl, setMixUrl] = useState(null); // URL for the mixed audio file

  // Play all sounds in the queue sequentially
  const playQueue = () => {
    if (isPlaying) {
      audioInstances.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      setIsPlaying(false);
      setAudioInstances([]);
      return;
    }

    setIsPlaying(true);

    const instances = queue.map((sound) => {
      const audio = new Audio(sound.url);
      audio.volume = volume;
      return audio;
    });
    setAudioInstances(instances);

    instances
      .reduce((promise, audio) => {
        return promise.then(() => {
          return new Promise((resolve) => {
            audio.play();
            audio.onended = resolve;
          });
        });
      }, Promise.resolve())
      .finally(() => {
        setIsPlaying(false);
        setAudioInstances([]);
      });
  };

  // Remove a sound from the queue
  const removeFromQueue = (index) => {
    setQueue((prevQueue) => prevQueue.filter((_, i) => i !== index));
  };

  // Handle mixing locally
  const handleMix = async () => {
    setIsMixing(true); // Indicate mixing is in progress
    setMixReady(false);

    try {
      // Convert sound URLs to local blobs
      const blobs = await Promise.all(
        queue.map(async (sound) => {
          const response = await fetch(sound.url);
          return await response.blob();
        })
      );

      // Save temporary files locally
      const fileHandles = await Promise.all(
        blobs.map((blob, index) =>
          window.showSaveFilePicker({
            suggestedName: `temp${index}.mp3`,
            types: [
              {
                description: "Audio File",
                accept: { "audio/mp3": [".mp3"] },
              },
            ],
          })
        )
      );

      // Write files to temporary storage
      await Promise.all(
        fileHandles.map((handle, index) =>
          handle.createWritable().then((writable) => writable.write(blobs[index]))
        )
      );

      // Mix files using FFmpeg
      const mixedBlob = await mixAudio(fileHandles.map((handle) => handle.name));

      // Create download link for the mixed file
      const mixUrl = URL.createObjectURL(mixedBlob);
      setMixUrl(mixUrl);
      setMixReady(true);

      // Cleanup temporary files
      await Promise.all(
        fileHandles.map(async (handle) => {
          const writable = await handle.createWritable();
          await writable.close();
        })
      );
    } catch (error) {
      console.error("Error during mixing:", error);
    } finally {
      setIsMixing(false);
    }
  };

  return (
    <section className="my-5 w-full text-center">
      <h2 className="text-2xl font-bold mb-4">Mixer</h2>
      <button
        onClick={playQueue}
        className={`px-6 py-2 rounded-md text-white mb-6 ${
          isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isPlaying ? "Stop Playing" : "Play Queue"}
      </button>
      <div className="flex flex-wrap gap-4 justify-center items-center">
        {queue.map((sound, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg shadow-md min-w-[120px]">
              <span className="text-sm font-semibold mb-2">{sound.name}</span>
              <button
                onClick={() => removeFromQueue(index)}
                className="bg-red-500 text-white px-4 py-1 rounded-md text-sm hover:bg-red-600"
              >
                Remove
              </button>
            </div>
            {index < queue.length - 1 && (
              <div className="text-2xl font-bold text-green-500">→</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mixing Button */}
      {queue.length > 0 && (
        <button
          onClick={handleMix}
          disabled={isMixing}
          className={`mt-6 px-6 py-2 rounded-md text-white ${
            isMixing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isMixing ? "Mixing..." : "Mix it up Dj!"}
        </button>
      )}

      {/* Progress Bar */}
      {isMixing && (
        <div className="mt-4 w-1/2 mx-auto bg-gray-300 h-4 rounded-md overflow-hidden">
          <div className="bg-blue-500 h-full animate-pulse"></div>
        </div>
      )}

      {/* Download Button */}
      {mixReady && mixUrl && (
        <a
          href={mixUrl}
          download="mix.mp3"
          className="mt-6 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md inline-block"
        >
          Download MP3
        </a>
      )}
    </section>
  );
};

export default Mixer;
