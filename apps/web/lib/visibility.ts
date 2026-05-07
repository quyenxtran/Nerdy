import type { SocialRepost, VisibilityDecision } from "@/lib/contracts";
import type { FeedPaper, PaperCard } from "@/lib/mock-data";

export function evaluatePaperProvenance(paper: FeedPaper): VisibilityDecision {
  if (!paper.cards.length) {
    return {
      action: "label",
      label: "Needs evidence",
      reason: "This paper has no source-backed insight cards yet."
    };
  }

  if (paper.cards.some((card) => isWeakSource(card.source))) {
    return {
      action: "label",
      label: "Verify source",
      reason: "At least one insight card is synthesized or imported and should be checked before citing."
    };
  }

  return { action: "allow" };
}

export function evaluateCitationProvenance(card: PaperCard): VisibilityDecision {
  if (isWeakSource(card.source)) {
    return {
      action: "label",
      label: "Needs verification",
      reason: "This citation points to synthesized or imported context rather than a source page."
    };
  }

  return { action: "allow" };
}

export function citationConfidence(card: PaperCard) {
  return evaluateCitationProvenance(card).action === "allow" ? 0.82 : 0.48;
}

export function evaluatePublicRepost(repost: SocialRepost): VisibilityDecision {
  if (repost.visibility === "Private draft") {
    return {
      action: "drop",
      label: "Private draft",
      reason: "Private draft reposts are not available on public share pages."
    };
  }

  if (repost.visibility === "Lab only") {
    return {
      action: "label",
      label: "Lab-only redaction",
      reason: "The original note is lab-only, so public preview only shows paper metadata."
    };
  }

  return { action: "allow" };
}

export function redactRepostForPublicShare(repost: SocialRepost): SocialRepost {
  const decision = evaluatePublicRepost(repost);

  if (decision.action !== "label") {
    return repost;
  }

  return {
    ...repost,
    note: "This repost is lab-only. Public preview hides the author's private note while keeping paper metadata visible."
  };
}

function isWeakSource(source: string) {
  return /papergraph synthesis|manual import|import placeholder|mock/i.test(source);
}
