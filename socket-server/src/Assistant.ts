import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { Socket } from "socket.io";
import { prisma } from "./utils/prisma";
import dotenv from "dotenv";
dotenv.config();

class AIAssistant {
  private static instance: AIAssistant;

  private messages: { [key: string]: string[] } = {};
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  private constructor() {
    console.log("initializing AI assistant");

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
    });
  }

  static getInstance = () => {
    if (!AIAssistant.instance) {
      AIAssistant.instance = new AIAssistant();
    }
    return AIAssistant.instance;
  };

  addMessage(text: string, room: string) {
    const parsedText = text.toLowerCase().replace(/[^\w\s]/gi, "");

    const isMoreThanOneWord = parsedText.trim().split(" ").length > 1;
    if (!isMoreThanOneWord) {
      return;
    }

    this.messages[room] = this.messages[room] || [];
    this.messages[room].push(parsedText);
  }

  async generateSummary(socket: Socket, room: string) {
    console.log("generating summary for:", room);

    if (!this.messages[room] || this.messages[room].length === 0) {
      console.log("no messages to summarize");
      return socket.emit("summary", "[]");
    }

    const prompt = this.generatePrompt(room);
    const result = await this.model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log(text);

    socket.emit("summary", text);

    console.log("saving summary");

    try {
      await prisma.summary.create({ data: { roomId: room, summary: text } });
    } catch (e) {
      console.log("error saving summary");
      console.log(e);
    }

    this.messages[room] = [];
  }

  private generatePrompt(room: string) {
    const initializer = `You are an assistant to a teacher. Your input is going to be a list of questions asked by students. Your task is to group the questions based on contextual similarity, do not focus on exact wordings. If you think that the question is unclear or not specific, you are allowed to skip it. Rank these groups on the basis of number of questions inside them, the greater the number of questions the higher the rank. Then, you are going to provide a broader question for each group. Display the broader questions only as an array in []. Please wrap each question in "". Do not display the questions or the groups that you have created. List of questions:`;

    const prompt = `${initializer}\n${this.messages[room].join("\n")}`;

    return prompt;
  }
}

export default AIAssistant.getInstance();
