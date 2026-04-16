export type InputMode = 'direct' | 'scrape' | 'reference';

export type VoiceRole = 'host' | 'guest';

export interface DialogueTurn {
  role: VoiceRole;
  speaker: string;
  text: string;
}

export interface InterviewConfig {
  topic: string;
  hostName: string;
  guestName: string;
  tone: 'formal' | 'casual';
}

export interface GenerationProgress {
  step: 'idle' | 'script' | 'audio' | 'video' | 'done' | 'error';
  progress: number;
  message: string;
}

export interface HistoryItem {
  id: string;
  topic: string;
  script: DialogueTurn[];
  audioUrl?: string;
  videoUrl?: string;
  coverUrl?: string;
  createdAt: string;
}
