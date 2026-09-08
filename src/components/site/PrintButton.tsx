"use client";

import { Button } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()}>
      Print receipt
    </Button>
  );
}
