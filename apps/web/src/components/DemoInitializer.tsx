"use client";

import { useEffect } from "react";
import { setupDemoInterceptor } from "@/lib/demo/demoInterceptor";

export default function DemoInitializer() {
  useEffect(() => {
    setupDemoInterceptor();
  }, []);

  return null;
}
