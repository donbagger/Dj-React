import { useState } from "react";
import sounds from "../data/sounds";

const SoundLibrary = ({ addToMixer, volume }) => {
  const [playingSound, setPlayingSound] = useState(null); // Track the currently playing sound
  const [audioInstance, setAudioInstance] = useState(null); // Store the current audio instance

  const handlePlayPause = (sound) => {
    // If the clicked sound is currently playing, stop it
    if (playingSound === sound.name && audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0; // Reset to the start
      setPlayingSound(null);
      setAudioInstance(null);
      return;
    }

    // Otherwise, play the new sound
    const audio = new Audio(sound.url);

    // Stop the previous sound if one is playing
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
    }

    audio.volume = volume;

    // Set the new sound as the currently playing sound
    setPlayingSound(sound.name);
    setAudioInstance(audio);

    // Play the sound
    audio.play();

    // Reset the button when the sound finishes
    audio.onended = () => {
      setPlayingSound(null);
      setAudioInstance(null);
    };
  };

  return (
    <section className="my-5 max-w-7xl">
      <h2 className="text-2xl font-bold text-center mb-6">Sound Library</h2>
      <div className="flex flex-wrap gap-6 justify-center">
        {sounds.map((sound, index) => (
          <div
            key={index}
            className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-lg w-40 text-center"
          >
            <button
              onClick={() => handlePlayPause(sound)}
              className="mb-3"
            >
              <img
                src={
                  playingSound === sound.name
                    ? "/stopbutton.png" // Use Stop button image when playing
                    : "/playbutton.png" // Use Play button image otherwise
                }
                alt={playingSound === sound.name ? "Stop Button" : "Play Button"}
                className="w-12 h-12"
              />
            </button>
            <span className="text-sm font-semibold mb-2">{sound.name}</span>
            <button
              onClick={() => addToMixer(sound)}
              className="bg-purple-600 text-white px-4 py-1 rounded-md text-sm hover:bg-purple-700"
            >
              Add to Mixer
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SoundLibrary;
