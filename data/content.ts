export type Confession = { id: number; text: string; category: string; time: string; punya: number; paapa: number; soul: string };

export const initialConfessions: Confession[] = [
  { id: 1, text: "I told my manager I had finished the task. I had not even opened the ticket.", category: "Career", time: "18 min ago", punya: 38, paapa: 142, soul: "#A701" },
  { id: 2, text: "I still think about the friend I stopped talking to because I was too proud to admit I was wrong.", category: "Regret", time: "42 min ago", punya: 91, paapa: 17, soul: "#A702" },
  { id: 3, text: "I told everyone I was stuck in traffic. I was still at home deciding whether to leave.", category: "Petty Sin", time: "1 hr ago", punya: 54, paapa: 118, soul: "#A703" },
  { id: 4, text: "I was genuinely happy when my friend got promoted. I also secretly wished it had been me.", category: "Love", time: "2 hr ago", punya: 113, paapa: 44, soul: "#A704" },
  { id: 5, text: "I took credit for a teammate’s idea because I knew the manager would remember my name.", category: "Career", time: "4 hr ago", punya: 11, paapa: 287, soul: "#A705" },
  { id: 6, text: "I paid for a stranger’s medicine and made sure they never knew it was me.", category: "Deep Secret", time: "Yesterday", punya: 219, paapa: 6, soul: "#A706" },
];

export const narakaMotifs = [
  { name: "Tāmisra", theme: "Deprivation / darkness", detail: "A traditional Naraka motif often connected in summaries with taking what belongs to another. In the product, use it as a sourced consequence motif rather than a literal verdict." },
  { name: "Andhatāmisra", theme: "Loss / betrayal", detail: "A traditional darkness-and-loss motif frequently associated with betrayal of a spouse in popular accounts. Treat textual mappings as source-sensitive." },
  { name: "Raurava", theme: "Harm / cruelty", detail: "A severe consequence motif associated with harmful conduct. Reserve for serious cases and educational lore." },
  { name: "Vaitarani", theme: "Difficult crossing", detail: "A difficult crossing motif in afterlife narratives; useful in the product as a journey/reflection metaphor." },
  { name: "Kumbhīpāka", theme: "Severe consequence", detail: "A severe punishment motif appearing in traditional lists. Avoid graphic simulation." },
  { name: "Avīci", theme: "Extreme consequence", detail: "A severe hell motif in traditional literature; should never be used casually for everyday confessions." },
];

export const repairGuides = [
  { title: "Repair the harm", concept: "Satya · Truth", detail: "Correct the lie, admit the mistake, return what was taken, and repair the harm where possible." },
  { title: "Repair the pattern", concept: "Self-restraint", detail: "Understand the trigger, change the habit, and avoid repeating the same action." },
  { title: "Positive action", concept: "Seva · Service", detail: "Help another person without turning kindness into a transaction for karma points." },
  { title: "Traditional layer", concept: "Prāyaścitta", detail: "When relevant, explain traditional approaches to atonement with sources instead of inventing a universal ritual." },
];
