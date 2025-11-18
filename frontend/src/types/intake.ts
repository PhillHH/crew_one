export type IntakeRole = 'user' | 'assistant';

export interface IntakeTurn {
  role: IntakeRole;
  content: string;
}

export interface IntakeChatStatus {
  is_complete?: boolean;
}

export interface IntakeChatPayload {
  history: IntakeTurn[];
}

