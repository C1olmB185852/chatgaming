import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ChadBox.css"; // Archivo CSS con los estilos gaming

export default function ChadBox() { 
    const [messages, setMessages] = useState([]); 
    const [userInput, setUserInput] = useState(""); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [typingEffect, setTypingEffect] = useState("");

    // Efecto de máquina de escribir para el loading
    useEffect(() => {
        if (isLoading) {
            const dots = [".", "..", "..."];
            let i = 0;
            const interval = setInterval(() => {
                setTypingEffect(dots[i % dots.length]);
                i++;
            }, 500);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            const userMessage = {role: "user", parts: [{text: userInput}]};
            const newMessages = [...messages, userMessage];
            setMessages(newMessages);
            setUserInput("");
            
            const response = await axios.post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent', 
                {
                    contents: [
                        {
                            role: "model",
                            parts: [{text: "Eres GamerBot, un asistente especializado en videojuegos con actitud gamer. Usa jerga gaming, emojis y respuestas energéticas. Solo habla de juegos, hardware, esports y cultura gamer. Si preguntan por otros temas, responde con algo como: '¡Error 404! Tema no encontrado en mi base de datos gaming. Pregúntame sobre CoD, LoL, Fortnite o los últimos lanzamientos!'"}]
                        },
                        ...newMessages
                    ],
                    generationConfig: {
                        temperature: 0.9,
                        maxOutputTokens: 200
                    }
                },
                {
                    params: {
                        key: "AIzaSyAQ7Gfjc5xD7KdMXgBYTQZKgjeaMlcH-5k" 
                    },
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            
            const botMessage = {
                role: "model",
                parts: [{text: response.data.candidates[0].content.parts[0].text}]
            };
            setMessages(prev => [...prev, botMessage]);
            
        } catch (err) {
            console.error("Error al llamar a la API:", err);
            
            let errorMessage = "¡Glitch en la matrix! 🎮 No pude procesar tu mensaje. Prueba de nuevo.";
            
            if (err.response) {
                if (err.response.status === 400) {
                    errorMessage = "¡Input inválido, gamer! ✖️ Verifica tu mensaje.";
                } else if (err.response.status === 403) {
                    errorMessage = "🔒 Error de autenticación. API key no válida.";
                } else if (err.response.status === 429) {
                    errorMessage = "⚠️ ¡Demasiados headshots! Espera un momento antes de seguir jugando.";
                }
            } else if (err.request) {
                errorMessage = "📡 ¡Conexión perdida! Verifica tu internet.";
            }
            
            setError(errorMessage);
            setMessages(prev => [...prev, {
                role: "model",
                parts: [{text: errorMessage}]
            }]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="chadbox-container">
            <div className="header-glitch" data-text="GAMERBOT 1.5">
                <h1>GamerBot</h1>
            </div>
            
            <div className="avatar-container">
                <div className="avatar-frame">
                    <img src="src/img/kratos.png" />
                </div>
            </div>

            {/* Chat container con estilo de HUD */}
            <div className="chat-hud">
                <div className="hud-top">
                    <span>CHAT LOG</span>
                    <div className="hud-stats">
                        <span>MSG: {messages.length}</span>
                        <span>LVL: 99</span>
                    </div>
                </div>
                
                <div className="chat-container">
                    {messages.length === 0 ? (
                        <div className="welcome-message">
                            <p>¡Bienvenido, gamer! Soy <span className="neon-text">GamerBot</span> 🤖</p>
                            <p>Pregúntame sobre:</p>
                            <ul className="game-list">
                                <li>🎯 Últimos lanzamientos</li>
                                <li>⚔️ Trucos y guías</li>
                                <li>🏆 Torneos y esports</li>
                                <li>🖥️ Hardware gaming</li>
                            </ul>
                            <p className="glow-text">¡Escribe tu mensaje abajo para empezar!</p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`message-container ${
                                    message.role === "user" ? "user-message" : "bot-message"
                                }`}
                            >
                                <div className="message-header">
                                    <span className={`message-role ${message.role === "user" ? "player-tag" : "bot-tag"}`}>
                                        {message.role === "user" ? "PLAYER" : "GAMERBOT"}
                                    </span>
                                    <span className="message-time">
                                        {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className="message-content">
                                    {message.parts[0].text}
                                </div>
                            </div>
                        ))
                    )}
                    
                    {isLoading && (
                        <div className="loading-message">
                            <div className="scanlines"></div>
                            <div className="typing-indicator">
                                <span className="pulsing-text">PROCESANDO</span>
                                <span className="typing-dots">{typingEffect}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <form className="input-terminal" onSubmit={handleSubmit}>
                <div className="terminal-header">
                    <span>ESCRIBA AQUI</span>
                    <div className="terminal-lights">
                        <span className="light red"></span>
                        <span className="light yellow"></span>
                        <span className="light green"></span>
                    </div>
                </div>
                <textarea 
                    name="textAreaInput" 
                    id="textAreaInput"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="> Escribe tu comando gaming aquí..."
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !userInput.trim()}
                    className={`send-button ${isLoading ? "loading" : ""}`}
                >
                    {isLoading ? (
                        <span className="button-loading">
                            <span className="spinner"></span>
                            ENVIANDO
                        </span>
                    ) : (
                        "ENVIAR [ENTER]"
                    )}
                </button>
            </form>

            <div className="game-footer">
                <div className="credits">
                    <span>© 2025 GEMINI API</span>
                    <span>•</span>
                    <span>DANIEL ESTEBAN</span>
                </div>
            </div>
        </div>
    );
}