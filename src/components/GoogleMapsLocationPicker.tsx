import { useState, useMemo } from "react";
import {
  MapPin,
  Search,
  ExternalLink,
  Navigation,
  Sparkles,
  Check,
  CheckCircle2,
  Info,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SHOP,
  inr,
  calculateDistanceKm,
  calculateDeliveryFee,
  getGoogleMapsRouteUrl,
  LUCKNOW_DETAILED_LANDMARKS,
  type LucknowLandmark,
} from "@/lib/shop";

interface GoogleMapsLocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAddress: string;
  currentDistanceKm: number;
  modeTitle?: string; // "Salon Pickup & Drop" or "Tailor Home Visit"
  onConfirm: (data: {
    address: string;
    areaName: string;
    distanceKm: number;
    extraFee: number;
    isFree: boolean;
    lat?: number;
    lng?: number;
  }) => void;
}

export function GoogleMapsLocationPicker({
  open,
  onOpenChange,
  currentAddress,
  currentDistanceKm,
  modeTitle = "Pickup & Drop",
  onConfirm,
}: GoogleMapsLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLandmark, setSelectedLandmark] = useState<LucknowLandmark | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number>(currentDistanceKm || 3);
  const [customAddress, setCustomAddress] = useState<string>(currentAddress || "");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Map pin position offset representation (based on Lucknow lat/lng bounding box)
  // Center ~ Kabir Pur (26.7925, 81.0234)
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number }>({
    lat: 26.7925,
    lng: 81.0234,
  });

  const categories = useMemo(() => {
    const set = new Set(LUCKNOW_DETAILED_LANDMARKS.map((l) => l.category));
    return ["All", ...Array.from(set)];
  }, []);

  const filteredLandmarks = useMemo(() => {
    return LUCKNOW_DETAILED_LANDMARKS.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, activeCategory]);

  const deliveryFeeObj = calculateDeliveryFee(selectedDistance);

  // When a landmark is picked
  const handleSelectLandmark = (landmark: LucknowLandmark) => {
    setSelectedLandmark(landmark);
    setSelectedDistance(landmark.distanceKm);
    setCustomerCoords({ lat: landmark.lat, lng: landmark.lng });
    setCustomAddress(`${landmark.name}, Lucknow`);
  };

  // When user clicks anywhere on the simulated interactive Lucknow map
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1 (lng direction)
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1 (lat direction)

    // Map bounding box for Lucknow
    // Lat range: 26.72 to 26.94 (~25km)
    // Lng range: 80.88 to 81.08 (~20km)
    const minLat = 26.72;
    const maxLat = 26.94;
    const minLng = 80.88;
    const maxLng = 81.08;

    const newLat = Number((maxLat - y * (maxLat - minLat)).toFixed(4));
    const newLng = Number((minLng + x * (maxLng - minLng)).toFixed(4));

    const computedDist = calculateDistanceKm(SHOP.lat, SHOP.lng, newLat, newLng);
    setCustomerCoords({ lat: newLat, lng: newLng });
    setSelectedDistance(computedDist);
    setSelectedLandmark(null);

    // Find nearest landmark name
    let nearest: LucknowLandmark | null = null;
    let minD = 999;
    for (const lm of LUCKNOW_DETAILED_LANDMARKS) {
      const d = calculateDistanceKm(newLat, newLng, lm.lat, lm.lng);
      if (d < minD) {
        minD = d;
        nearest = lm;
      }
    }

    if (nearest && minD < 2) {
      setCustomAddress(`Near ${nearest.name}, Lucknow`);
    } else {
      setCustomAddress(`Selected Point on Map (${newLat}, ${newLng}), Lucknow`);
    }
  };

  const handleApply = () => {
    const finalAddress =
      customAddress.trim() || `${selectedLandmark?.name || "Lucknow"}, Uttar Pradesh`;
    const areaName = selectedLandmark?.name || "Selected Location";
    onConfirm({
      address: finalAddress,
      areaName,
      distanceKm: selectedDistance,
      extraFee: deliveryFeeObj.deliveryFee,
      isFree: deliveryFeeObj.isFree,
      lat: customerCoords.lat,
      lng: customerCoords.lng,
    });
    onOpenChange(false);
  };

  // Convert lat/lng to percent coordinates for the map visual
  const getMapPercent = (lat: number, lng: number) => {
    const minLat = 26.72;
    const maxLat = 26.94;
    const minLng = 80.88;
    const maxLng = 81.08;

    const left = Math.max(5, Math.min(95, ((lng - minLng) / (maxLng - minLng)) * 100));
    const top = Math.max(5, Math.min(95, ((maxLat - lat) / (maxLat - minLat)) * 100));
    return { left: `${left}%`, top: `${top}%` };
  };

  const shopPos = getMapPercent(SHOP.lat, SHOP.lng);
  const custPos = getMapPercent(customerCoords.lat, customerCoords.lng);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  Select {modeTitle} Location
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Pick your Lucknow locality or click on the map to calculate exact road distance
                  from Shivi Parlour.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm">
          {/* Rate Info Banner */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <Car className="size-4 text-primary shrink-0" />
              <span>
                <strong>First 5 km: 100% FREE</strong> • Beyond 5 km: <strong>₹15/km</strong> extra
                travel charge
              </span>
            </div>
            <a
              href={getGoogleMapsRouteUrl(
                customerCoords.lat,
                customerCoords.lng,
                customAddress || selectedLandmark?.name,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-[11px] shrink-0 bg-background px-2.5 py-1 rounded-md border shadow-2xs"
            >
              <span>Google Maps Route</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* Interactive Map Visual with Pins & Connection Line */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <Label className="font-semibold flex items-center gap-1.5">
                <Navigation className="size-3.5 text-primary" />
                Interactive Lucknow Map (Click to set location)
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Shop: Kabir Pur, Sultanpur Rd
              </span>
            </div>

            <div
              onClick={handleMapClick}
              className="relative h-48 sm:h-56 w-full rounded-xl border border-border bg-radial from-amber-500/5 via-primary/5 to-muted/80 overflow-hidden cursor-crosshair select-none shadow-inner"
              style={{
                backgroundImage:
                  "radial-gradient(#d1d5db 1px, transparent 1px), radial-gradient(#e5e7eb 1px, #fafafa 1px)",
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0, 12px 12px",
              }}
            >
              {/* Road Grid / Lucknow Landmark Markers Background */}
              <div className="absolute inset-0 p-3 pointer-events-none opacity-40">
                <div className="absolute top-4 left-6 text-[9px] font-semibold text-muted-foreground">
                  North / Aliganj
                </div>
                <div className="absolute top-1/4 left-1/3 text-[9px] font-semibold text-muted-foreground">
                  Hazratganj
                </div>
                <div className="absolute top-1/4 right-1/4 text-[9px] font-semibold text-muted-foreground">
                  Gomti Nagar
                </div>
                <div className="absolute bottom-1/3 right-1/4 text-[9px] font-semibold text-muted-foreground">
                  Shaheed Path / Lulu Mall
                </div>
                <div className="absolute bottom-6 left-12 text-[9px] font-semibold text-muted-foreground">
                  South / Alambagh
                </div>
              </div>

              {/* 5 km Radius Circle Around Salon */}
              <div
                className="absolute rounded-full border-2 border-emerald-500/40 bg-emerald-500/10 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  left: shopPos.left,
                  top: shopPos.top,
                  width: "120px",
                  height: "120px",
                }}
              >
                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-background/80 px-1 py-0.2 rounded shadow-2xs">
                  5km Free Zone
                </span>
              </div>

              {/* Connecting Distance Line */}
              <svg className="absolute inset-0 size-full pointer-events-none">
                <line
                  x1={shopPos.left}
                  y1={shopPos.top}
                  x2={custPos.left}
                  y2={custPos.top}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className={deliveryFeeObj.isFree ? "text-emerald-500" : "text-amber-500"}
                />
              </svg>

              {/* Salon Pin (Origin) */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
                style={{ left: shopPos.left, top: shopPos.top }}
              >
                <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md animate-pulse border-2 border-white">
                  <Sparkles className="size-3.5" />
                </div>
                <span className="text-[9px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded shadow mt-0.5 whitespace-nowrap">
                  🌸 Shivi Salon
                </span>
              </div>

              {/* Customer Pin (Destination) */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-20"
                style={{ left: custPos.left, top: custPos.top }}
              >
                <div
                  className={`size-7 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-white ${
                    deliveryFeeObj.isFree ? "bg-emerald-600" : "bg-amber-600"
                  }`}
                >
                  <MapPin className="size-4" />
                </div>
                <span className="text-[10px] font-bold bg-card text-foreground border px-2 py-0.5 rounded-full shadow mt-0.5 whitespace-nowrap">
                  📍 {selectedDistance} km
                </span>
              </div>

              {/* Map Controls Guide */}
              <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-xs text-[10px] px-2 py-1 rounded border shadow-xs text-muted-foreground pointer-events-none">
                👉 Click anywhere on map to pin your home location
              </div>
            </div>
          </div>

          {/* Distance Slider & Quick Fee Summary */}
          <div className="rounded-xl border bg-card p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Driving Distance from Salon
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Adjust manually or pick a locality from the list below
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-foreground">
                  {selectedDistance} km
                </span>
                <div className="mt-0.5">
                  {deliveryFeeObj.isFree ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px] font-semibold">
                      <Check className="size-3 mr-1" /> 100% FREE Delivery
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-500/30 text-[10px] font-semibold"
                    >
                      +{inr(deliveryFeeObj.deliveryFee)} ({deliveryFeeObj.extraKm} km extra @
                      ₹15/km)
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Slider
              value={[selectedDistance]}
              min={0.5}
              max={30}
              step={0.5}
              onValueChange={(val) => {
                const d = val[0] ?? 5;
                setSelectedDistance(d);
                setSelectedLandmark(null);
              }}
              className="py-1"
            />
          </div>

          {/* Search Area & Locality Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Select Locality or Landmark in Lucknow
              </Label>
              <span className="text-[10px] text-muted-foreground">
                {filteredLandmarks.length} localities available
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area (e.g., Lulu Mall, Gomti Nagar, Shaheed Path, Ahimamau...)"
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors border ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Landmarks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1 border rounded-lg bg-muted/20">
              {filteredLandmarks.map((lm) => {
                const isSelected = selectedLandmark?.name === lm.name;
                const isFree = lm.distanceKm <= 5;
                return (
                  <button
                    key={lm.name}
                    type="button"
                    onClick={() => handleSelectLandmark(lm)}
                    className={`flex items-center justify-between p-2 rounded-md text-left transition-all border text-xs ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary font-semibold shadow-2xs"
                        : "bg-card hover:bg-muted/60 border-border/70 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <MapPin
                        className={`size-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span className="truncate">{lm.name}</span>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 font-mono text-[11px]">
                      <span>{lm.distanceKm} km</span>
                      {isFree ? (
                        <span className="text-emerald-600 font-bold text-[9px] bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/20">
                          FREE
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 text-[9px] bg-amber-50 dark:bg-amber-950/60 px-1 py-0.2 rounded border border-amber-500/20">
                          +₹{calculateDeliveryFee(lm.distanceKm).deliveryFee}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Custom Address Box */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Complete Delivery / Pickup Address</Label>
            <Input
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="House/Flat No, Landmark, Society/Street, Lucknow"
              className="text-xs h-9"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs">
            <span className="text-muted-foreground">Calculated Extra: </span>
            <strong className={deliveryFeeObj.isFree ? "text-emerald-600" : "text-primary"}>
              {deliveryFeeObj.isFree ? "₹0 (100% Free)" : `+${inr(deliveryFeeObj.deliveryFee)}`}
            </strong>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="font-semibold shadow-xs"
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Apply Location ({selectedDistance} km)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
