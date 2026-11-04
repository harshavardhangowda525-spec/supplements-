"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitInquiry, type FormState } from "@/lib/public-actions";
import { fzButton } from "@/components/brand/button-styles";
import { Field, FormMessage, Honeypot, SelectInput, TextArea, TextInput } from "./fields";

const initial: FormState = { status: "idle" };

export function InquiryForm() {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const e = state.fieldErrors ?? {};

  if (state.status === "success") {
    return <FormMessage status="success" message={state.message} />;
  }

  return (
    <form action={action} className="relative space-y-4" noValidate>
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" error={e.name}>
          <TextInput name="name" required autoComplete="name" maxLength={80} invalid={!!e.name} />
        </Field>
        <Field label="Mobile number" name="phone" error={e.phone}>
          <TextInput name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="98765 43210" invalid={!!e.phone} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="I’m asking about" name="kind">
          <SelectInput name="kind" defaultValue="product">
            <option value="product">A product</option>
            <option value="availability">Stock availability</option>
            <option value="order">An order</option>
            <option value="store">Store help / other</option>
          </SelectInput>
        </Field>
        <Field label="Product (optional)" name="productRef" error={e.productRef}>
          <TextInput name="productRef" maxLength={160} placeholder="e.g. whey protein 2 kg chocolate" />
        </Field>
      </div>
      <Field label="Message" name="message" error={e.message}>
        <TextArea name="message" required maxLength={1000} invalid={!!e.message} />
      </Field>
      <FormMessage status={state.status} message={state.message} />
      <button type="submit" disabled={pending} className={fzButton("primary", "md", "w-full sm:w-auto")}>
        <Send /> {pending ? "Sending…" : "Send inquiry"}
      </button>
      <p className="text-xs text-white/60">
        We only use your details to reply to this inquiry. See our <a href="/privacy" className="underline hover:text-lime">privacy policy</a>.
      </p>
    </form>
  );
}
