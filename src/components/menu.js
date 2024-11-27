const Menu = ({ volume, setVolume }) => {
    const handleVolumeChange = (e) => {
      setVolume(e.target.value); // Update the global volume
    };
  
    return (
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">React Soundboard Mixer</h1>
          <div className="flex items-center space-x-4">
            <label htmlFor="volume" className="text-sm">
              Volume
            </label>
            <input
              id="volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-36"
            />
          </div>
        </div>
      </header>
    );
  };
  
  export default Menu;
  