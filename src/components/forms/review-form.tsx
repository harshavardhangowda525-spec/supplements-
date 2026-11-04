"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReview, type FormState } from "@/lib/public-actions";
import { fzButton } from "@/components/brand/button-styles";
import { cn } from "@/lib/utils";
import { Field, FormMessage, Honeypot, TextArea, TextInput } from "./fields";

const initial: FormState = { status: "idle" };

export function ReviewForm() {
  const [state, action, pending] = useActionState(submitReview, initial);
  const [rating, setRating] = useState(5);
  const e = state.fieldErrors ?? {};

  if (state.status === "success") return <FormMessage status="success" message={state.message} />;

  return (
    <form action={action} className="relative space-y-4" noValidate>
      <Honeypot />
      <fieldset>
        <legend className="mb-2 text-xs font-medium text-white/80">Your rating</legend>
        <div className="flex gap-1" role="radiogroup">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer rounded-md p-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lime">
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="sr-only" />
              <Star className={cn("size-7 transition-colors", n <= rating ? "fill-lime text-lime" : "text-white/25")} />
              <span className="sr-only">{n} star{n > 1 ? "s" : ""}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Your name" name="name" error={e.name}>
        <TextInput name="name" required maxLength={60} autoComplete="given-name" invalid={!!e.name} />
      </Field>
      <Field label="Your experience" name="comment" error={e.comment}>
        <TextArea name="comment" required maxLength={800} invalid={!!e.comment} />
      </Field>
      <FormMessage status={state.status} message={state.message} />
      <button type="submit" disabled={pending} className={fzButton("primary", "md")}>
        {pending ? "Submitting…" : "Submit review"}
      </button>
      <p className="text-xs text-white/60">Website reviews are published after moderation and are shown separately from Google reviews.</p>
    </form>
  );
}
