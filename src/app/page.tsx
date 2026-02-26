import Recorder from "@/components/recorder";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">AI Interview Simulator</h1>

      <Recorder />
    </main>
  );
}