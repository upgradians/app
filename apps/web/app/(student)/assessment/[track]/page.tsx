import { notFound } from "next/navigation";
import { getTrack } from "@/lib/assessment-questions";
import { AssessmentClient } from "./AssessmentClient";

interface Props {
  params: Promise<{ track: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { track: slug } = await params;
  const track = getTrack(slug);
  return { title: track ? `${track.label} Assessment | Upgradian` : "Assessment" };
}

export default async function AssessmentTrackPage({ params }: Props) {
  const { track: slug } = await params;
  const track = getTrack(slug);
  if (!track) notFound();
  return <AssessmentClient track={track} />;
}
