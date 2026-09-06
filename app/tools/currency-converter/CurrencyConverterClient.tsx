"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { DollarSign, ArrowLeftRight, Wifi, WifiOff } from "lucide-react";
import {
  convertCurrency,
  crossRate,
  formatMoney,
  formatRate,
  currencyLabel,
  SUPPORTED_CODES,
  type CurrencyRateSet,
} from "@/lib/tools/currency-converter";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { ResetButton } from "@/components/tool/ResetButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CurrencyConverterClientProps {
  /** Resolved on the server: live ECB rates or the offline snapshot. */
  rateSet: CurrencyRateSet;
}

export default function CurrencyConverterClient({ rateSet }: CurrencyConverterClientProps) {
  const tool = getTool("currency-converter")!;
  const [amount, setAmount] = React.useState("100");
  const [from, setFrom] = React.useState("USD");
  const [to, setTo] = React.useState("INR");
  const [query, setQuery] = React.useState<"from" | "to" | null>(null);
  const [search, setSearch] = React.useState("");

  const n = parseFloat(amount);
  const value = Number.isFinite(n) ? n : 0;
  const result = value > 0 ? convertCurrency(value, from, to, rateSet.rates) : null;
  const rate = crossRate(from, to, rateSet.rates);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SUPPORTED_CODES;
    return SUPPORTED_CODES.filter(
      (c) => c.toLowerCase().includes(q) || currencyLabel(c).toLowerCase().includes(q)
    );
  }, [search]);

  const pick = (code: string) => {
    if (query === "from") setFrom(code);
    if (query === "to") setTo(code);
    setQuery(null);
    setSearch("");
  };

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolInputPanel title="Convert" icon={<DollarSign className="h-5 w-5" />}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cur-amount">Amount</Label>
              <Input
                id="cur-amount"
                type="number"
                min={0}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div>
                <Label>From</Label>
                <Button
                  variant="outline"
                  className="w-full justify-between mt-1.5 font-normal"
                  onClick={() => { setQuery("from"); setSearch(""); }}
                >
                  <span className="truncate">{from}</span>
                  <span className="text-xs text-muted-foreground">change</span>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Swap currencies"
                onClick={swap}
                className="mb-0.5"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
              <div>
                <Label>To</Label>
                <Button
                  variant="outline"
                  className="w-full justify-between mt-1.5 font-normal"
                  onClick={() => { setQuery("to"); setSearch(""); }}
                >
                  <span className="truncate">{to}</span>
                  <span className="text-xs text-muted-foreground">change</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <ResetButton onClick={() => { setAmount("100"); setFrom("USD"); setTo("INR"); }} />
            </div>
          </div>
        </ToolInputPanel>

        <ToolResultPanel
          title="Converted Amount"
          icon={<DollarSign className="h-5 w-5" />}
          isEmpty={!result}
          empty="Enter an amount and choose currencies."
        >
          {result && (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-4xl sm:text-5xl font-bold text-primary break-words">
                  {formatMoney(result.converted, to)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {formatMoney(result.amount, from)} = {formatMoney(result.converted, to)}
                </p>
              </div>

              <p className="text-center text-sm">
                <span className="text-muted-foreground">Exchange rate: </span>
                <span className="font-medium">
                  1 {from} = {formatRate(rate ?? 0)} {to}
                </span>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {rateSet.source === "live" ? (
                  <Badge variant="secondary" className="gap-1">
                    <Wifi className="h-3 w-3" /> Live ECB rates
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <WifiOff className="h-3 w-3" /> Offline snapshot
                  </Badge>
                )}
                <Badge variant="outline">Rate date: {rateSet.date}</Badge>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                European Central Bank reference rates — for information only, not a
                quote for transactions.
              </p>
            </div>
          )}
        </ToolResultPanel>
      </div>

      {/* Currency picker dialog */}
      {query && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setQuery(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b">
              <Input
                autoFocus
                placeholder="Search currency or code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ul className="max-h-80 overflow-y-auto p-1">
              {filtered.map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent flex items-center justify-between text-sm"
                    onClick={() => pick(code)}
                  >
                    <span>
                      <span className="font-medium">{code}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {currencyLabel(code).replace(` (${code})`, "")}
                      </span>
                    </span>
                    {((query === "from" && code === from) || (query === "to" && code === to)) && (
                      <span className="text-xs text-primary">selected</span>
                    )}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No matching currency
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
