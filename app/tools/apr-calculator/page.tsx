"use client";

import * as React from "react";
import { Receipt, AlertTriangle } from "lucide-react";
import { getTool } from "@/lib/registry";
import { calculateApr, validateAprInput } from "@/lib/tools/apr-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tool = getTool("apr-calculator")!;

const FAQ = [
  { question: "What is APR?", answer: "APR (Annual Percentage Rate) is the true yearly cost of borrowing, including interest and fees. It gives a more complete picture than the interest rate alone." },
  { question: "How is APR different from interest rate?", answer: "Interest rate only reflects the cost of borrowing the principal. APR includes origination fees, closing costs, and other charges, giving you the true cost of the loan." },
  { question: "What is an amortization schedule?", answer: "An amortization schedule shows each monthly payment broken down into principal and interest portions, along with the remaining balance. Early payments are mostly interest; later payments are mostly principal." },
  { question: "Why is my APR higher than the interest rate?", answer: "Because APR includes fees (origination fees, closing costs) spread over the loan term. The more fees, the higher the APR compared to the stated interest rate." },
];

export default function AprCalculatorPage() {
  const [input, setInput] = React.useState({
    loanAmount: 250000,
    interestRate: 6.5,
    loanTerm: 360,
    originationFee: 2500,
    closingCosts: 3000,
    otherFees: 500,
  });

  const result = React.useMemo(() => {
    if (validateAprInput(input)) return null;
    return calculateApr(input);
  }, [input]);

  const update = (field: string, value: number) => setInput(prev => ({ ...prev, [field]: value }));

  const scheduleCsv = React.useMemo(() => {
    if (!result) return "";
    const header = "Month,Payment,Principal,Interest,Balance";
    const rows = result.amortizationSchedule.map(e => `${e.month},${e.payment},${e.principal},${e.interest},${e.balance}`);
    return [header, ...rows].join("\n");
  }, [result]);

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Loan Details" icon={<Receipt className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            <div><Label>Loan Amount ($)</Label><Input type="number" min={0} value={input.loanAmount} onChange={(e) => update("loanAmount", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Interest Rate (% per year)</Label><Input type="number" step={0.1} min={0} value={input.interestRate} onChange={(e) => update("interestRate", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Loan Term (months)</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {[{l:"12 mo",v:12},{l:"36 mo",v:36},{l:"60 mo",v:60},{l:"120 mo",v:120},{l:"180 mo",v:180},{l:"240 mo",v:240},{l:"360 mo",v:360}].map(t => (
                  <Button key={t.v} variant={input.loanTerm === t.v ? "default" : "outline"} size="sm" className="text-xs" onClick={() => update("loanTerm", t.v)}>{t.l}</Button>
                ))}
              </div>
            </div>
            <div><Label>Origination Fee ($)</Label><Input type="number" min={0} value={input.originationFee} onChange={(e) => update("originationFee", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Closing Costs ($)</Label><Input type="number" min={0} value={input.closingCosts} onChange={(e) => update("closingCosts", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Other Fees ($)</Label><Input type="number" min={0} value={input.otherFees} onChange={(e) => update("otherFees", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-lg">Annual Percentage Rate (APR)</CardTitle><Badge variant="outline">{input.loanTerm / 12} year loan</Badge></div></CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary">{result.apr}%</div>
                  <p className="text-sm text-muted-foreground mt-2">True cost of borrowing including ${result.totalFees.toLocaleString()} in fees</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">${result.monthlyPayment.toLocaleString()}</p><p className="text-xs text-muted-foreground">Monthly Payment</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">${result.totalInterest.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Interest</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">${result.totalCost.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Cost</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.feePercentage}%</p><p className="text-xs text-muted-foreground">Fee Percentage</p></CardContent></Card>
              </div>

              {/* Amortization preview */}
              <Card>
                <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base">Amortization Schedule (first 12 months)</CardTitle><CopyButton text={scheduleCsv} label="Export CSV" size="sm" /></div></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">Month</th><th className="py-2 pr-3">Payment</th><th className="py-2 pr-3">Principal</th><th className="py-2 pr-3">Interest</th><th className="py-2">Balance</th></tr></thead>
                      <tbody>
                        {result.amortizationSchedule.slice(0, 12).map(e => (
                          <tr key={e.month} className="border-b last:border-0"><td className="py-1.5 pr-3">{e.month}</td><td className="py-1.5 pr-3">${e.payment.toLocaleString()}</td><td className="py-1.5 pr-3 text-green-600">${e.principal.toLocaleString()}</td><td className="py-1.5 pr-3 text-orange-500">${e.interest.toLocaleString()}</td><td className="py-1.5">${e.balance.toLocaleString()}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.amortizationSchedule.length > 12 && <p className="text-xs text-muted-foreground mt-2 text-center">Showing 12 of {result.amortizationSchedule.length} months • Export CSV for full schedule</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Formula</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Monthly Payment</strong> = P × [r(1+r)ⁿ] ÷ [(1+r)ⁿ − 1] where P=${input.loanAmount.toLocaleString()}, r={input.interestRate}/12/100, n={input.loanTerm}</p>
                  <p><strong>Total Fees</strong> = ${input.originationFee} + ${input.closingCosts} + ${input.otherFees} = ${result.totalFees.toLocaleString()}</p>
                  <p><strong>Effective Borrowing</strong> = ${input.loanAmount.toLocaleString()} − ${result.totalFees.toLocaleString()} = ${result.effectiveBorrowingAmount.toLocaleString()}</p>
                  <p><strong>APR</strong> = Rate where PV of all payments = Effective Borrowing = {result.apr}%</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
