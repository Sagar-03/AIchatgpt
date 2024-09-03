import React, { useContext, useEffect, useState } from "react";
import "./Main.css";
import { FaUser, FaCompass, FaLightbulb, FaHandsHelping, FaCode, FaPaperPlane, FaImages, FaMicrophone } from "react-icons/fa";
import { Context } from "../../context/Context";

const Main = () => {
    const { onSent, recentPrompt, showResult, loading, resultData, setInput, input } = useContext(Context);
    const [recognition, setRecognition] = useState(null);
    const [listening, setListening] = useState(false);

    useEffect(() => {
        // Initialize speech recognition on component mount
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.onresult = (event) => {
                const transcript = event.results[event.resultIndex][0].transcript;
                setInput(transcript); // Set the recognized speech into the search box
                takeCommand(transcript.toLowerCase()); // Execute the recognized command
                onSent(); // Automatically trigger the search after recognizing the speech
                clearInput(); // Clear the input after the search
            };
            setRecognition(recognitionInstance);
        } else {
            alert("Sorry, your browser does not support speech recognition.");
        }

        // Greet the user when the page loads
        speak("Initializing DELTA...");
        wishMe();
    }, []);

    const speak = (text) => {
        const text_speak = new SpeechSynthesisUtterance(text);
        text_speak.rate = 1;
        text_speak.volume = 1;
        text_speak.pitch = 1;
        window.speechSynthesis.speak(text_speak);
    };

    const wishMe = () => {
        const day = new Date();
        const hour = day.getHours();
        if (hour >= 0 && hour < 12) {
            speak("Good Morning ..");
        } else if (hour >= 12 && hour < 17) {
            speak("Good Afternoon ...");
        } else {
            speak("Good Evening ...");
        }
    };

    const handleMicrophoneClick = () => {
        if (recognition) {
            if (listening) {
                recognition.stop();
                setListening(false);
            } else {
                setListening(true);
                recognition.start();
            }
        }
    };

    const takeCommand = (message) => {
        console.log("Received message:", message); // Log the received message

        let finalText = "";
        if (message.includes('hi') || message.includes('hello')) {
            finalText = "Hello Sir, How May I Help You?";
        } else if (message.includes("open google")) {
            window.open("https://google.com", "_blank");
            finalText = "Opening Google...";
        } else if (message.includes("open youtube")) {
            window.open("https://youtube.com", "_blank");
            finalText = "Opening Youtube...";
        } else if (message.includes("open facebook")) {
            window.open("https://facebook.com", "_blank");
            finalText = "Opening Facebook...";
        } else if (message.includes("open instagram")) {
            window.open("https://instagram.com", "_blank");
            finalText = "Opening Instagram...";
        } else if (message.includes("open my git hub") || message.includes('open git hub') || message.includes('open get hub')) {
            window.open("https://github.com", "_blank");
            finalText = "Opening Your GitHub...";
        } else if (message.includes("open my linkedin") || message.includes('open linkedin')) {
            window.open("https://www.linkedin.com", "_blank");
            finalText = "Opening Your LinkedIn...";
        } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
            window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
            finalText = "This is what I found on the internet regarding " + message;
        } else if (message.includes('wikipedia')) {
            window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "").trim()}`, "_blank");
            finalText = "This is what I found on Wikipedia regarding " + message;
        } else if (message.includes('time')) {
            const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
            finalText = "The current time is " + time;
        } else if (message.includes('date')) {
            const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
            finalText = "Today's date is " + date;
        } else if (message.includes('calculator')) {
            window.open('Calculator:///');
            finalText = "Opening Calculator";
        } else {
            window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
            finalText = "I found some information for " + message + " on Google";
        }

        speak(finalText);
        setInput(message); // Set the input value for display
        setResultData(finalText); // Ensure resultData is set
    };

    const clearInput = () => {
        setInput(""); // Clear the input field
    };

    return (
        <div className="main">
            <div className="nav">
                <p>Welcome</p>
                <FaUser size={35} />
            </div>
            <div className="main-container">
                {!showResult
                    ? <>
                        <div className="greet">
                            <p><span>Welcome!!.</span></p>
                            <p>How Can I Help You today?</p>
                        </div>
                        <div className="cards">
                            <div className="card">
                                <p>Suggest beautiful place to see on an upcoming road trip</p>
                                <FaCompass size={25} />
                            </div>
                            <div className="card">
                                <p>Briefly summarize this concept: urban planning</p>
                                <FaLightbulb size={25} />
                            </div>
                            <div className="card">
                                <p>Brainstorm team bonding activities for our work retreat</p>
                                <FaHandsHelping size={25} />
                            </div>
                            <div className="card">
                                <p>Improve the readability of the following code</p>
                                <FaCode size={25} />
                            </div>
                        </div>
                    </>
                    : <div className="result">
                        <div className="result-title">
                            <FaUser size={35} />
                            <p>{recentPrompt}</p>
                        </div>
                        <div className="result-data">
                            <FaUser size={35} />
                            {loading ?
                                <div className="loader">
                                    <hr />
                                    <hr />
                                    <hr />
                                </div>
                                : <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
                            }
                        </div>
                    </div>
                }

                <div className="main-bottom">
                    <div className="search-box">
                        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="Enter a prompt here" />
                        <div>
                            <FaImages size={22} />
                            <FaMicrophone size={22} onClick={handleMicrophoneClick} style={{ color: listening ? 'red' : 'black' }} /> {/* Toggle microphone color when active */}
                            {input ? <FaPaperPlane size={22} onClick={() => { onSent(); clearInput(); }} /> : null}
                        </div>
                    </div>
                    <p className="bottom-info">
                        Gemini may display your message to improve its responses, so double-check its responses. Your privacy and Gemini Apps.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Main;
