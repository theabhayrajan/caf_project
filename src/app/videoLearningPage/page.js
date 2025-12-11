"use client";
import { useState, useRef, useEffect } from "react";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Settings,
    Maximize,
    Star,
    Users,
} from "lucide-react";
import Header from "../../components/Header";

export default function Home() {
    const [selectedVideo, setSelectedVideo] = useState({
        title: "Socio-psychological values",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        instructor: "David Frank",
        role: "Human-Centered Experience Specialist",
    });

    const videos = [
        {
            title: "Socio-psychological values",
            subtitle: "Training attended by 1000+ students.",
            url: " https://www.w3schools.com/html/movie.mp4  ",
            thumb: `${process.env.NEXT_PUBLIC_PROD_URL}/videoThum1.png`,
        },
        {
            title: "Parents : Socio-psychological values",
            subtitle: "Training attended by 1000+ students.",
            url: "https://www.w3schools.com/html/movie.mp4",
            thumb: `${process.env.NEXT_PUBLIC_PROD_URL}/videoThum2.png`,
        },
        {
            title: "Teachers : Socio-psychological values",
            subtitle: "Training attended by 1000+ students.",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumb: `${process.env.NEXT_PUBLIC_PROD_URL}/videoThum3.png`,
        },
    ];

    // Video Player States
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState("0:00");
    const [duration, setDuration] = useState("0:00");
    const [showSettings, setShowSettings] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            const percent = (video.currentTime / video.duration) * 100;
            setProgress(percent || 0);
            setCurrentTime(formatTime(video.currentTime));
            setDuration(formatTime(video.duration));
        };

        video.addEventListener("timeupdate", updateProgress);
        video.addEventListener("loadedmetadata", updateProgress);

        return () => {
            video.removeEventListener("timeupdate", updateProgress);
            video.removeEventListener("loadedmetadata", updateProgress);
        };
    }, []);

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgressChange = (e) => {
        const value = e.target.value;
        const video = videoRef.current;
        video.currentTime = (value / 100) * video.duration;
        setProgress(value);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        video.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e) => {
        const value = parseFloat(e.target.value);
        const video = videoRef.current;
        video.volume = value;
        setVolume(value);
        if (value === 0) setIsMuted(true);
        else setIsMuted(false);
    };

    const toggleFullScreen = () => {
        const videoContainer = videoRef.current.parentElement;
        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleSpeedChange = (speed) => {
        const video = videoRef.current;
        video.playbackRate = speed;
        setPlaybackRate(speed);
        setShowSettings(false);
    };

    return (
        <>
            <Header />
            <div className="flex flex-col lg:flex-row bg-[#f4f4f4] min-h-screen">
                {/* Sidebar */}
                <aside className="w-full lg:w-1/4 xl:w-1/5 h-auto lg:h-screen overflow-y-auto sticky top-0 p-4 lg:ml-10 xl:ml-20 order-2 lg:order-1">
                    <div className="space-y-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6">
                        {videos.map((video, i) => (
                            <div
                                key={i}
                                onClick={() =>
                                    setSelectedVideo({
                                        title: video.title,
                                        url: video.url,
                                        instructor: "David Frank",
                                        role: "Human-Centered Experience Specialist",
                                    })
                                }
                                className="cursor-pointer group bg-white py-5 px-3 sm:p-2 md:py-7 md:px-4 lg:p-2 rounded-md shadow-sm hover:shadow-md transition"
                            >
                                <div className="relative h-80 sm:h-48 md:h-80 lg:h-48 w-full overflow-hidden rounded-md">
                                    <img
                                        src={video.thumb}
                                        alt={video.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-opacity-30 flex items-center justify-center">
                                        <div className="bg-white p-3 rounded-full shadow-md">
                                            <Play className="w-4 h-4 text-[#519cd5] fill-[#519cd5]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-3">
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="text-gray-800 font-semibold text-base md:text-lg truncate">
                                            {video.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 truncate">
                                            {video.subtitle}
                                        </p>
                                    </div>
                                    <img
                                        src="/caf/videosectionlogo.svg"
                                        alt="badge"
                                        className="w-8 h-8 ml-2 flex-shrink-0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto flex justify-center py-6 px-4 sm:px-6 lg:px-8 order-1 lg:order-2 lg:mt-5 2xl:mt-10">
                    <div className="w-full max-w-6xl">
                        <div className="w-full">
                            <div className="2xl:w-[85%]">
                                <h2 className="text-[#519cd5] text-[1.3rem] sm:text-[1.4rem] font-sans mb-5">
                                    {selectedVideo.title}
                                </h2>

                                {/* Video Player */}
                                <div className="w-full aspect-video bg-black overflow-hidden mb-4 relative">
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                        src={selectedVideo.url}
                                    ></video>

                                    {/* Controls */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 px-3 sm:px-4 py-1 sm:py-4 flex flex-col space-y-2">
                                        {/* Controls Row */}
                                        <div className="flex flex-wrap justify-between items-center text-white text-xs sm:text-sm">
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-6 md:gap-8">
                                                {/* Play / Pause */}
                                                <button onClick={togglePlay}>
                                                    {isPlaying ? (
                                                        <Pause className="w-5 h-5 text-white fill-white" />
                                                    ) : (
                                                        <Play className="w-5 h-5 text-white fill-white" />
                                                    )}
                                                </button>

                                                {/* Volume */}
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={toggleMute}>
                                                        {isMuted ? (
                                                            <VolumeX className="w-5 h-5 text-white fill-white" />
                                                        ) : (
                                                            <Volume2 className="w-5 h-5 text-white fill-white" />
                                                        )}
                                                    </button>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="1"
                                                        step="0.01"
                                                        value={volume}
                                                        onChange={handleVolumeChange}
                                                        className="w-16 sm:w-20 h-[4px] accent-white cursor-pointer"
                                                    />
                                                </div>

                                                {/* Time */}
                                                <span className="text-xs sm:text-sm">
                                                    {currentTime} / {duration}
                                                </span>
                                            </div>

                                            {/* Settings + Fullscreen */}
                                            <div className="flex items-center space-x-3 sm:space-x-4 relative mt-2 sm:mt-0">
                                                {/* Settings Dropdown */}
                                                <div className="relative">
                                                    <button onClick={() => setShowSettings(!showSettings)}>
                                                        <Settings className="w-5 sm:w-6 h-5 sm:h-6 cursor-pointer" />
                                                    </button>
                                                    {showSettings && (
                                                        <div className="absolute bottom-8 right-0 bg-gray-800 text-white text-xs rounded shadow-lg p-2 w-28">
                                                            {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                                                                <button
                                                                    key={speed}
                                                                    onClick={() => handleSpeedChange(speed)}
                                                                    className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-700 ${playbackRate === speed ? "bg-gray-700" : ""
                                                                        }`}
                                                                >
                                                                    {speed}x
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <Maximize
                                                    className="w-5 sm:w-6 h-5 mb-1 sm:h-6 cursor-pointer text-white"
                                                    onClick={toggleFullScreen}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Instructor Info */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 gap-4">
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-7">
                                        <div className="flex items-center space-x-1 sm:space-x-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="w-5 h-5 text-[#e9a642] fill-[#e9a642]"
                                                />
                                            ))}
                                        </div>

                                        <div className="hidden sm:block text-gray-400 text-2xl">|</div>

                                        <div className="flex items-center space-x-2 text-gray-600 text-sm sm:text-base md:text-lg gap-2">
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_PROD_URL}/feedbacklogo.svg`}
                                                alt="feedback"
                                                className="w-7 h-7"
                                            />
                                            <span>Users feedback</span>
                                        </div>
                                    </div>

                                    <div className="text-left">
                                        <h4 className="text-[1.1rem] sm:text-[1.2rem] font-semibold text-gray-800">
                                            {selectedVideo.instructor}
                                        </h4>
                                        <p className="text-sm sm:text-base">{selectedVideo.role}</p>
                                    </div>
                                </div>
                            </div>


                            {/* Overview Section */}
                            <section>
                                <h3 className="text-[1.3rem] sm:text-[1.4rem] font-semibold mb-4 text-gray-800">
                                    Overview:
                                </h3>
                                <p className="text-gray-500 text-[1rem] sm:text-[1.1rem] leading-relaxed">
                                    The social-psychological aspects of a child’s development
                                    encompass their emotional well-being, interpersonal skills,
                                    self-awareness, and ability to navigate relationships. These
                                    aspects are critical for fostering healthy interactions,
                                    emotional resilience, and a sense of belonging.
                                </p>

                                <h4 className="mt-4 text-[1rem] sm:text-[1.1rem] text-gray-500 mb-4">
                                    What is Emotional Regulation
                                </h4>
                                <p className="text-gray-500 text-[1rem] sm:text-[1.1rem] mt-1 leading-relaxed">
                                    Emotional regulation refers to a child’s ability to recognize,
                                    understand, and manage their emotions in response to different
                                    situations. This skill helps them handle challenges, conflicts,
                                    and stress effectively.
                                </p>
                                <ul className="list-disc list-inside text-gray-500 text-[1rem] sm:text-[1.1rem] leading-relaxed ml-3">
                                    <li>
                                        Children who regulate emotions well are better equipped to
                                        cope with frustration, anxiety, or disappointment.
                                    </li>
                                    <li>
                                        It lays the foundation for mental health, self-confidence and
                                        positive relationships.
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );

}
