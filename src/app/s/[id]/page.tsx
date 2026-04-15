import { Metadata } from "next";
import { getReceipt } from "@/lib/kv";
import FriendView from "./FriendView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const receipt = await getReceipt(id);

  if (!receipt) {
    return {
      title: "paymebackpls",
      description: "Split bills with friends. No app, no signup, just a link.",
    };
  }

  const title = `pay${receipt.payerName}backpls`;
  const desc = receipt.description
    ? `${receipt.description} — tap to claim your items`
    : `${receipt.payerName} shared a bill with you — tap to claim your items`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: "website",
      siteName: "paymebackpls",
    },
    twitter: {
      card: "summary",
      title,
      description: desc,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <FriendView id={id} />;
}
