import React, { useState } from "react";
import Mixer from "./components/mixer";
import Menu from "./components/menu";
import SoundLibrary from "./components/SoundLibrary";
import Footer from "./components/footer";

const App = () => {
  const [mixerQueue, setMixerQueue] = useState([]); 
  const [volume, setVolume] = useState(0.6); 

  const addToMixer = (sound) => {
    setMixerQueue((prevQueue) => [...prevQueue, sound]);
  };

  return (
    <div className="flex flex-col min-h-screen">   
      <Menu volume={volume} setVolume={setVolume} />
      <main className="flex-grow flex flex-col items-center">
        <Mixer queue={mixerQueue} setQueue={setMixerQueue} volume={volume} />
        <SoundLibrary addToMixer={addToMixer} volume={volume} />
      </main>
      <Footer />
    </div>
  );
};

export default App;
