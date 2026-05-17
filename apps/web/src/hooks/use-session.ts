"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function useIsAuthenticated(): boolean | null {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    void supabase.auth.getSession().then(({ data }) => {
      setIsAuth(!!data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuth(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return isAuth;
}
