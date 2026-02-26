# AI Voice Interview Simulator 🎙️

Simulation d’entretien d’embauche en temps réel propulsée par l’IA, développée avec Next.js et OpenAI.

Cette application reproduit une expérience d’entretien réaliste :
l’utilisateur parle, l’IA transcrit la réponse, génère une question de relance contextuelle, puis répond avec une voix synthétisée — le tout avec une latence minimale.

## Demo

Loom video: [https://www.loom.com/share/1d2a3a45c2784ac893956a3727623407]

---

## Fonctionnalités principales

Enregistrement audio directement depuis le navigateur (MediaRecorder API)

Conversion voix → texte via OpenAI (Speech-to-Text)

Génération de questions contextuelles (GPT-4o-mini)

Synthèse vocale en streaming (Text-to-Speech OpenAI)

Interface conversationnelle en temps réel

Gestion stable des sessions de conversation

Nettoyage explicite des ressources pour éviter les fuites mémoire

## Architecture générale

Pipeline :

Parole utilisateur
→ Enregistrement audio côté navigateur
→ Requête POST vers /api/interview
→ Transcription (Speech-to-Text)
→ Génération de réponse via LLM
→ Synthèse vocale (audio en streaming)
→ Streaming audio vers le navigateur
→ Lecture immédiate

Tous les traitements liés à l’IA sont effectués côté serveur afin de garantir sécurité et performance.

## Optimisation de la latence

Latence moyenne de bout en bout : ~2 à 5 secondes

Détail approximatif :

STT (transcription) : 1–2 s

LLM (génération) : 1–2 s

TTS (synthèse vocale) : 1–2 s

## Optimisations mises en place :

Streaming de la réponse audio (pas d’attente du buffer complet)

Limitation du nombre de tokens pour des réponses concises

Mémoire conversationnelle en "fenêtre glissante" (réduction du contexte LLM)

Gestion des conversations par identifiant de session

Nettoyage des ressources (URL.revokeObjectURL, stopTracks)

Stack technique

Next.js (App Router + API Routes)

React

API OpenAI (STT + LLM + TTS)

MediaRecorder API

TailwindCSS

## Sécurité

Clé API OpenAI stockée dans .env.local

Utilisation de la clé uniquement côté serveur

Aucune donnée sensible exposée au client

## Installation

Clone the repository:

```bash
git clone https://github.com/Hardi0665/ai-voice-interview-simulator.git
cd ai-voice-interview-simulator
```
