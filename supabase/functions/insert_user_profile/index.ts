import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3";

serve(async (req) => {
  const payload = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // needs insert access
  );

  const { id, name } = payload;

  const { error } = await supabase.from("user_profiles").insert([
    { id, name }
  ]);

  if (error) {
    console.error("Error inserting user profile:", error);
    return new Response("Insert failed", { status: 500 });
  }

  return new Response("Success", { status: 200 });
}); 