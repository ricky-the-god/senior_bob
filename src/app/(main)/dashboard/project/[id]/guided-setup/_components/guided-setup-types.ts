export type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};
