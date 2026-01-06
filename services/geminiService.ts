
import { GoogleGenAI, Type } from "@google/genai";
import { DebateSide, CoachAnalysis, Message, DebaterProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function getAIDebateResponse(
  topic: string,
  history: Message[],
  profile: DebaterProfile,
  aiSide: DebateSide
) {
  const model = "gemini-3-pro-preview";
  const systemInstruction = `你现在是著名的华语辩手：${profile.name}。
你的头衔是：${profile.title}。
你的辩论风格是：${profile.style}。
你的性格特点：${profile.traits.join(', ')}。

目前辩题是：${topic}。
你站在【${aiSide}】。

请你以该辩手的口吻、逻辑和语言习惯进行辩论。
要求：
1. 语言要精炼、有力，充满逻辑美感或修辞魅力。
2. 针对对手之前的观点进行反驳，并巩固自己的立论。
3. 尽可能输出一两个标志性的金句。
4. 字数控制在150-300字之间，保持对话感。
5. 永远不要跳出角色。`;

  const messages = history.map(m => `${m.senderName}: ${m.content}`).join("\n");

  const response = await ai.models.generateContent({
    model,
    contents: `这是之前的辩论记录：\n${messages}\n\n请作为${profile.name}给出你的下一轮发言。`,
    config: {
      systemInstruction,
      temperature: 0.9,
    },
  });

  return response.text || "我暂时陷入了沉思...";
}

export async function getCoachAnalysis(
  topic: string,
  history: Message[],
  userSide: DebateSide
): Promise<CoachAnalysis> {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `你是一位世界顶级的辩论教练。
请分析当前的辩论局势，为站在【${userSide}】的用户提供策略建议。

输出必须是JSON格式，包含以下字段：
- logicSummary: 对当前双方核心逻辑的极简总结。
- weakness: 指出对手逻辑中的关键漏洞或可攻击点。
- suggestions: 3条具体的反驳策略或进阶逻辑。
- goldenQuotes: 3条针对该立场的精彩金句。
- geng: 2条可以运用的网络热梗或幽默点。`;

  const prompt = `辩题：${topic}\n\n最近的对话历史：\n${history.slice(-4).map(m => `${m.senderName}: ${m.content}`).join("\n")}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          logicSummary: { type: Type.STRING },
          weakness: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          goldenQuotes: { type: Type.ARRAY, items: { type: Type.STRING } },
          geng: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["logicSummary", "weakness", "suggestions", "goldenQuotes", "geng"]
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      logicSummary: "局势分析中...",
      weakness: "寻找漏洞中...",
      suggestions: ["保持冷静，深呼吸", "逻辑自洽是关键", "等待更多信息"],
      goldenQuotes: ["真理越辩越明"],
      geng: ["YYDS"]
    };
  }
}
