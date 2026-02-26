"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function Recorder() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    mediaRecorder.current = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    chunks.current = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.current.push(event.data);
      }
    };

    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(chunks.current, {
        type: "audio/webm",
      });

      chunks.current = [];

      await sendAudio(blob);
    };

    mediaRecorder.current.start(250);
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
    setRecording(false);
  }

  async function sendAudio(blob: Blob) {
    setLoading(true);

    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    const res = await fetch("/api/interview", {
      method: "POST",
      body: formData,
    });

    const transcript = decodeURIComponent(
      res.headers.get("X-Transcript") || "",
    );

    const responseText = decodeURIComponent(
      res.headers.get("X-Response-Text") || "",
    );

    // setMessages((prev) => [
    //   ...prev,
    //   { role: "user", text: transcript },
    //   { role: "assistant", text: responseText },
    // ]);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: transcript },
      { role: "assistant", text: responseText },
    ]);
    setLoading(false);
    const audioBlob = await res.blob();
    const url = URL.createObjectURL(audioBlob);

    playAudio(url);

    setLoading(false);
  }

  function playAudio(url: string) {
    if (audioRef.current) {
      audioRef.current.src = url;

      setSpeaking(true);

      audioRef.current.play();

      audioRef.current.onended = () => {
        setSpeaking(false);
      };
    }
  }

  function resetConversation() {
    setMessages([]);
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-xl shadow-lg">
      <div className="p-4 border-b font-semibold text-lg bg-gray-500">
        AI Interview Simulator
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`
                max-w-[70%]
                px-4 py-2
                rounded-lg
                shadow
                ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-black"
                }
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-left text-gray-500 animate-pulse">
            AI is thinking...
          </div>
        )}

        {speaking && (
          <div className="text-left text-blue-500 animate-pulse">
            AI is speaking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex items-center justify-between bg-white">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`
            px-6 py-3 rounded-full font-semibold
            ${recording ? "bg-red-500 text-white" : "bg-green-500 text-white"}
          `}
        >
          {recording ? "Stop" : "Speak"}
        </button>

        <button
          onClick={resetConversation}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Reset
        </button>
      </div>

      <audio ref={audioRef} />
    </div>
  );
}
