import { supabase } from "@/integrations/supabase/client";

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
  website?: string;
}

export interface ContactResult {
  sent: boolean;
  message: string;
}

export async function submitContactForm(payload: ContactSubmission): Promise<ContactResult> {
  const { data, error } = await supabase.functions.invoke<ContactResult>("contact", {
    body: payload,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("The contact service returned an empty response.");

  return data;
}
