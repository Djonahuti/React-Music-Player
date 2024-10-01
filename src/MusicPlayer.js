// src/MusicPlayer.js
import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationRef = useRef(null);

  const songs = [
    {
      name: "LOVE. (feat. Zacari)",
      src: "./Assets/songs/kendrick-lamar-love.mp3",
      artist: "Kendrick Lamar",
      album: "DAMN",
      albumArt: "./Assets/Images/kendrick-lamar-love.jpg"
    },
    {
      name: "Where'd You Go",
      src: "./Assets/songs/fort-minor-where-d-you-go.mp3",
      artist: "Fort Minor",
      album: "Album 1",
      albumArt: "./Assets/Images/fort-minor-where-d-you-go.jpg"
    },
    {
      name: "I'll be there",
      src: "./Assets/songs/jess-glynne-i-ll-be-there.mp3",
      artist: "Jess Glynne",
      album: "Album 1",
      albumArt: "./Assets/Images/jess-glynne-i-ll-be-there.jpg"
    },
    {
      name: "Give Me Your Love",
      src: "./Assets/songs/deam-gimme-your-love.mp3",
      artist: "DEAMN",
      album: "Album 1",
      albumArt: "./Assets/Images/deam-gimme-your-love.jpg"
    },
    {
      name: "God is a Woman",
      src: "./Assets/songs/ariana-grande-god-is-a-woman.mp3",
      artist: "Ariana Grande",
      album: "Album 1",
      albumArt: "./Assets/Images/ariana-grande-god-is-a-woman.jpg"
    },
    {
      name: "Hideaway",
      src: "./Assets/songs/kiesza-hideaway.mp3",
      artist: "Kiesza",
      album: "Album 1",
      albumArt: "./Assets/Images/kiesza-hideaway.jpg"
    },
    {
      name: "Elevate",
      src: "./Assets/songs/st-lucia-elevate.mp3",
      artist: "St. Lucia",
      album: "Album 1",
      albumArt: "./Assets/Images/st-lucia-elevate.jpg"
    },
    {
      name: "Rollin feat. Future & Khalid",
      src: "./Assets/songs/calvin-harris-rollin.mp3",
      artist: "Calvin Harris",
      album: "Album 1",
      albumArt: "./Assets/Images/calvin-harris-rollin.jpg"
    }
  ];

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);  // Shuffle mode
  const [repeatMode, setRepeatMode] = useState('no-repeat');
  const [isPlaylistVisible, setIsPlaylistVisible] = useState(false);

  // Play or Pause handler
  const playPauseHandler = () => {
    if (isPlaying) {
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current);
    } else {
      audioRef.current.play();
      visualizeAudio();
    }
    setIsPlaying(!isPlaying);
  };

  const changeSong = (newIndex) => {
    setIsPlaying(false);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentSongIndex(newIndex);
    audioRef.current.load();
  };

  useEffect(() => {
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => console.error("Error playing audio:", error));
      }
    }
  }, [currentSongIndex, isPlaying]);

  const nextSong = () => {
    let nextIndex;
    if (repeatMode === 'repeat-one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = (currentSongIndex + 1) % songs.length;
    }

    changeSong(nextIndex);
  };

  const prevSong = () => {
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) {
      prevIndex = songs.length - 1;
    }
    changeSong(prevIndex);
  };

  const toggleRepeatMode = () => {
    if (repeatMode === 'no-repeat') {
      setRepeatMode('repeat-all');
    } else if (repeatMode === 'repeat-all') {
      setRepeatMode('repeat-one');
    } else {
      setRepeatMode('no-repeat');
    }
  };

  // Audio visualization using Canvas
  const visualizeAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      analyserRef.current.fftSize = 64;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width = canvas.clientWidth;
    const HEIGHT = canvas.height = canvas.clientHeight;

    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
      ctx.beginPath();
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      for(let i = 0; i < dataArrayRef.current.length; i++){
        let v = dataArrayRef.current[i] / 10; // dataArray[i] = 0-255
        ctx.arc(WIDTH/2, HEIGHT/2, Math.abs(100 + v), 0, 2*Math.PI);
        ctx.shadowColor = '#66ccff'
        ctx.shadowBlur = 3;
        ctx.strokeStyle = 'white';
        ctx.stroke(); 
      }
    };

    renderFrame();
  };

  const onProgressBarClick = (e) => {
    const width = e.target.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const seekTo = (clickX / width) * duration;
    audioRef.current.currentTime = seekTo;
  };

  useEffect(() => {
    audioRef.current.addEventListener('timeupdate', () => {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      setDuration(audioRef.current.duration);
    });

    return () => {
      audioRef.current.removeEventListener('timeupdate', () => {});
    };
  }, []);

  return (
<><div className='container'>
    <div className="icontain">
      <main>
  <div className="card">
        <div className="nav">
        
        <div className='text-center'>

        <div className='badge bg-gradient-primary-to-secondary text-black center'>
                    <div className='text-uppercase text-center'> Music Player</div>
            </div></div>

            {/* Toggle Playlist Visibility Button */}
            <button onClick={() => setIsPlaylistVisible(!isPlaylistVisible)} aria-label="Toggle Playlist" className="btn btn-link">
            {isPlaylistVisible ? <i className="bi bi-list-task"></i> : <i className="bi bi-music-note-list"></i>}
            </button>

            {/* Playlist (conditionally rendered) */}
            {isPlaylistVisible && (
            <div className="playlist">
              <div className='header'>
                <div>

                  {/* Playlist Shuffle Button*/}
                  <div>
                  <i className="bi bi-shuffle" onClick={() => setIsShuffle(!isShuffle)} aria-label="Shuffle"
                      style={{ color: isShuffle ? '#00ffbf' : 'black' }}></i>
                  </div>

                    <span>Playlist</span>
                </div>

                  {/* Playlist Repeat Mode Button */}
                  <div onClick={toggleRepeatMode} aria-label="Repeat Mode">
                            {repeatMode === 'no-repeat' && <i className="bi bi-arrow-repeat "></i>}
                            {repeatMode === 'repeat-all' && <i className="bi bi-repeat "></i>}
                            {repeatMode === 'repeat-one' && <i className="bi bi-repeat-1 "></i>}
                  </div>

              </div>
                <ul>
                {songs.map((song, index) => (
                    <li 
                    key={index}
                    onClick={() => changeSong(index)}
                    className={currentSongIndex === index ? "playing" : ""}
                    >
                    <div className='row'>
                      <span>{song.name}</span>
                      <p>{song.artist}</p>
                    </div>
                    <span className="duration"><i className="bi bi-heart-fill"></i></span>
                    
                    </li>
                ))}
                </ul>
            </div>
            )}

        </div>

        <div className="img">
            <img src={songs[currentSongIndex].albumArt}  alt='albumArt'
            className={`${isPlaying ? 'playing' : ''}`} />
            {/* Canvas for Visualization */}
            <canvas ref={canvasRef} />
        </div>

        <div className="details">
            <p className="title">{songs[currentSongIndex].name}</p>
            <p className="artist">{songs[currentSongIndex].artist}</p>
        </div>
        

        {/* Progress Bar */}
        <div className="progress-bar" onClick={onProgressBarClick}>
          <div className="progress" style={{
                background: `linear-gradient(to right,
                #000000 ${progress}%,
                #e5e5e5 ${progress}%)`
            }}></div>
        </div>

        <div className="controls">

      {/* Repeat Mode Button */}
            <div onClick={toggleRepeatMode} aria-label="Repeat Mode" className="btn btn-link">
                {repeatMode === 'no-repeat' && <i className="bi bi-arrow-repeat "></i>}
                {repeatMode === 'repeat-all' && <i className="bi bi-repeat "></i>}
                {repeatMode === 'repeat-one' && <i className="bi bi-repeat-1 "></i>}
            </div>

      {/* Previous Button */}
            <button onClick={prevSong} aria-label="Previous" className="btn btn-link">
                <i className="bi bi-skip-backward-fill prev"></i>
            </button>

      {/* Play/Pause Button */}
            <button onClick={playPauseHandler} aria-label="Play/Pause" className="btn btn-link play">
                {isPlaying ? (
                <i className="bi bi-pause-fill"></i>
                ) : (
                <i className="bi bi-play-fill"></i>
                )}
            </button>

      {/* Next Button */}
            <button onClick={nextSong} aria-label="Next" className="btn btn-link">
                <i className="bi bi-skip-forward-fill next"></i>
            </button>

            {/* Shuffle Button */}
            <div className='btn btn-link'>
              <i className="bi bi-shuffle" onClick={() => setIsShuffle(!isShuffle)} aria-label="Shuffle"
                style={{ color: isShuffle ? '#00ffbf' : 'black' }}></i>
            </div>

        </div>

        {/* Repeate and Shuffle */}
        <div>

        </div>

      {/* Audio Element */}
            <audio ref={audioRef} src={songs[currentSongIndex].src} onEnded={nextSong} />
    </div>
      </main>
    </div>
        
</div></>
    
  );
};

export default MusicPlayer;
