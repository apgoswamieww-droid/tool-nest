"use client";

import * as React from "react";
import { Grid3x3 } from "lucide-react";
import { getTool } from "@/lib/registry";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tool = getTool("flooring-calculator")!;
const FAQ = [
  { question: "How do I calculate flooring tiles?", answer: "Enter room length and width, tile length and width, and wastage percentage. The calculator determines how many tiles you need to cover the floor." },
  { question: "Why add wastage for flooring?", answer: "Tiles break during cutting and installation, and you need to cut tiles to fit edges. A 10% wastage factor is standard for most flooring projects." },
  { question: "Does this work for wood/laminate flooring?", answer: "Yes. Enter the plank dimensions (length × width) instead of tile dimensions. The same calculation applies." },
];

interface FloorResult {
  roomArea: number;
  tileArea: number;
  tilesNeeded: number;
  tilesWithWastage: number;
  totalAreaCovered: number;
}

export default function FlooringCalculatorPage() {
  const [roomLength, setRoomLength] = React.useState(12);
  const [roomWidth, setRoomWidth] = React.useState(10);
  const [tileLength, setTileLength] = React.useState(2);
  const [tileWidth, setTileWidth] = React.useState(2);
  const [wastage, setWastage] = React.useState(10);

  const result: FloorResult | null = React.useMemo(() => {
    if (roomLength <= 0 || roomWidth <= 0 || tileLength <= 0 || tileWidth <= 0) return null;
    const roomArea = roomLength * roomWidth;
    const tileArea = tileLength * tileWidth;
    const tilesNeeded = Math.ceil(roomArea / tileArea);
    const tilesWithWastage = Math.ceil(tilesNeeded * (1 + wastage / 100));
    const totalAreaCovered = tilesWithWastage * tileArea;
    return { roomArea, tileArea, tilesNeeded, tilesWithWastage, totalAreaCovered };
  }, [roomLength, roomWidth, tileLength, tileWidth, wastage]);

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Room & Tile Dimensions" icon={<Grid3x3 className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            <div><Label>Room Length (ft)</Label><Input type="number" min={0.1} step={0.1} value={roomLength} onChange={(e) => setRoomLength(parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Room Width (ft)</Label><Input type="number" min={0.1} step={0.1} value={roomWidth} onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Tile/Plank Length (ft)</Label><Input type="number" min={0.1} step={0.1} value={tileLength} onChange={(e) => setTileLength(parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Tile/Plank Width (ft)</Label><Input type="number" min={0.1} step={0.1} value={tileWidth} onChange={(e) => setTileWidth(parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Wastage (%)</Label><Input type="number" min={0} max={50} value={wastage} onChange={(e) => setWastage(parseInt(e.target.value) || 0)} className="mt-1.5" /></div>
          </div>
        </ToolInputPanel>

        {result && (
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader className="pb-2"><CardTitle className="text-lg">Flooring Required</CardTitle></CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary">{result.tilesWithWastage}</div>
                <p className="text-sm text-muted-foreground mt-2">{result.tilesNeeded} tiles + {wastage}% wastage</p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.roomArea}</p><p className="text-xs text-muted-foreground">Room Area (ft²)</p></CardContent></Card>
              <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.tileArea}</p><p className="text-xs text-muted-foreground">Tile Area (ft²)</p></CardContent></Card>
              <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.totalAreaCovered}</p><p className="text-xs text-muted-foreground">Total Covered (ft²)</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Formula</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p><strong>Room Area</strong> = {roomLength} × {roomWidth} = {result.roomArea} ft²</p>
                <p><strong>Tile Area</strong> = {tileLength} × {tileWidth} = {result.tileArea} ft²</p>
                <p><strong>Tiles Needed</strong> = ⌈{result.roomArea} ÷ {result.tileArea}⌉ = {result.tilesNeeded}</p>
                <p><strong>With Wastage</strong> = ⌈{result.tilesNeeded} × (1 + {wastage}%)⌉ = {result.tilesWithWastage}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
