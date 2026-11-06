"use client";

import type { FormEvent } from "react";
import { site } from "@/site.config";

export function ContactForm() {
  const { formAction, submitText } = site.contactSection;

  // No form service set: open the visitor's email app with the details filled in.
  const sendByEmail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = [...new FormData(e.currentTarget).entries()]
      .map(([k, v]) => `${k.replace("_", " ")}: ${v}`).join("\n");
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent("Consultation request")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="form reveal" {...(formAction ? { action: formAction, method: "POST" } : { onSubmit: sendByEmail })}>
      <label>First name<input name="first_name" required autoComplete="given-name" /></label>
      <label>Last name<input name="last_name" required autoComplete="family-name" /></label>
      <label>Email<input type="email" name="email" required autoComplete="email" /></label>
      <label>Phone<input type="tel" name="phone" autoComplete="tel" /></label>
      <label className="full">Interested in
        <select name="service" defaultValue="">
          <option value="">Select a treatment</option>
          {site.services.items.map((s) => <option key={s.name}>{s.name}</option>)}
          <option>Not sure yet</option>
        </select>
      </label>
      <label className="full">Message<textarea name="message" placeholder="Tell us about your goals" /></label>
      <button className="btn btn--primary full" type="submit">{submitText}</button>
    </form>
  );
}
