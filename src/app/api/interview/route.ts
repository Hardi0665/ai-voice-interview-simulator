import { openai } from "@/lib/openai";

let conversation: any[] = [
  {
    role: "system",
    content:
      "You are a professional recruiter conducting a job interview. Ask one concise question at a time.",
  },
];
const MAX_MESSAGES = 6;
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response("No audio", { status: 400 });
    }

    // -------- STT --------
    const sttStart = Date.now();

    const transcriptResult = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "gpt-4o-mini-transcribe",
      language: "fr",
    });

    console.log("STT:", Date.now() - sttStart, "ms");

    const transcript = transcriptResult.text;

    conversation.push({
      role: "user",
      content: transcript,
    });

    // -------- LLM --------
    const llmStart = Date.now();

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation,
      max_tokens: 80,
      temperature: 0.5,
    });

    console.log("LLM:", Date.now() - llmStart, "ms");

    const responseText = chat.choices[0].message.content ?? "";

    conversation.push({
      role: "assistant",
      content: responseText,
    });

    if (conversation.length > MAX_MESSAGES + 1) {
      conversation = [
        conversation[0], 
        ...conversation.slice(-MAX_MESSAGES),
      ];
    }
    // -------- TTS --------
    const ttsStart = Date.now();

    const speechResponse = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: responseText,
      //response_format: "mp3",
    });

    console.log("TTS:", Date.now() - ttsStart, "ms");

    const stream = speechResponse.body;

    return new Response(stream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
        "X-Transcript": encodeURIComponent(transcript),
        "X-Response-Text": encodeURIComponent(responseText),
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
}
