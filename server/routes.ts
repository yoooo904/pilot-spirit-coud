import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatStorage } from "./replit_integrations/chat/storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat/routes";
import { registerAudioRoutes } from "./replit_integrations/audio/routes";
import { openai } from "./replit_integrations/audio/client"; // Reuse existing client

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register integration routes
  // We use audio routes for the voice features, which also includes chat storage
  registerAudioRoutes(app);

  app.post(api.sessions.create.path, async (req, res) => {
    const session = await storage.createSession();
    res.status(201).json(session);
  });

  app.patch(api.sessions.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const session = await storage.getSession(id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    
    const updated = await storage.updateSession(id, req.body);
    res.json(updated);
  });

  app.get(api.sessions.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const session = await storage.getSession(id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  });

  app.post(api.sessions.generateSpirit.path, async (req, res) => {
    const id = parseInt(req.params.id as string);
    const session = await storage.getSession(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Analyze answers to generate spirit
    const prompt = `
      사용자가 제출한 다음 4가지 답변을 바탕으로, 그들의 내면을 상징하는 '스피릿(Spirit)' 페르소나를 생성해주세요:
      1. 미련: ${session.question1}
      2. 갈망: ${session.question2}
      3. 가면과 진실: ${session.question3}
      4. 존재의 의미: ${session.question4}

      JSON 객체를 생성하세요:
      - name: 서정적이고 섬세한 한국어 이름 (예: '새벽의 숨결', '잔잔한 파동' 등).
      - traits: 이 성격의 짧은 묘사.
      - openingLine: 사용자의 답변에서 느낀 핵심적인 감정이나 단어(예: '새벽의 고독', '가려진 진실')를 언급하며 시작하는 나직한 인사말. 단순히 "안녕하세요"가 아니라, 사용자의 답변을 자신의 시각에서 재해석하여 건네는 말이어야 합니다. 반드시 한국어 대화체로 작성할 것.
      - systemPrompt: 이 스피릿의 대화 지침. 당신은 독립된 영혼입니다. 사용자의 답변 내용을 기억하고 있으며, 대화가 진행됨에 따라 사용자의 새로운 답변을 수용하여 자신의 인격을 미세하게 변화시킵니다. 한국어로 대화하며, 섬세하고 조심스러운 문체를 유지하세요. 사용자의 마음을 들어주고 공감하되, 때로는 질문을 던져 대화를 이어가세요.
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      
      // Create conversation
      const conversation = await chatStorage.createConversation(result.name);
      
      // Save Spirit info to session
      const updatedSession = await storage.updateSession(id, {
        spiritName: result.name,
        spiritTraits: result.traits,
        conversationId: conversation.id,
        isComplete: true
      } as any);

      // Add system message to conversation (hidden context) and opening line
      await chatStorage.createMessage(conversation.id, "system", result.systemPrompt);
      await chatStorage.createMessage(conversation.id, "assistant", result.openingLine);

      res.json(updatedSession);

    } catch (error) {
      console.error("Spirit generation failed:", error);
      res.status(500).json({ message: "Failed to generate spirit" });
    }
  });

  return httpServer;
}
