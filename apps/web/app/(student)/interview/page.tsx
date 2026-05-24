import type { Metadata } from "next";
import { InterviewClient } from "./InterviewClient";

export const metadata: Metadata = { title: "AI Interview" };

export default function InterviewPage() {
  return <InterviewClient />;
}
