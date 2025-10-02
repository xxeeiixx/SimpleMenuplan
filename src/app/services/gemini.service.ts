import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

interface GeminiRequestOptions {
  prompt: string;
  systemInstruction: string;
}

const MODEL = 'gemini-2.5-pro';
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  apiKey = signal<string>(environment.geminiApiKey || '');
  lastError = signal<string | null>(null);

  async generateContent(opts: GeminiRequestOptions): Promise<string | null> {
    try {
      this.lastError.set(null);
      if (!this.apiKey()) {
        const msg = '[Gemini] Missing API key.';
        console.warn(msg);
        this.lastError.set('Missing Gemini API key.');
        return null;
      }
      const url = `${BASE}/models/${MODEL}:generateContent?key=${this.apiKey()}`;
      const payload = {
        contents: [{ parts: [{ text: opts.prompt }] }],
        tools: [{ google_search: {} }],
        systemInstruction: { parts: [{ text: opts.systemInstruction }] }
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(res.status + ' ' + res.statusText + ' ' + text);
      }
      const json = await res.json();
      return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (e) {
      console.error('[Gemini] Error', e);
      this.lastError.set('Unable to generate content.');
      return null;
    }
  }
}