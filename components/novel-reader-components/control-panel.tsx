import { cn } from "@/lib/utils";
import type { FontSize } from "./theme";
import { Button } from "../ui/button";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../ui/select";
import {
  ChevronRightIcon,
  MenuIcon,
  PauseIcon,
  PlayIcon,
  XIcon,
} from "lucide-react";
import type { TTSHookState } from "tts-react";
import { Slider } from "../ui/slider";

export default function ControlPanel({
  isMenuExpanded,
  toc,
  currentChapter,
  onChapterChange,
  onToggleMenu,
  fontSize,
  onFontSizeChange,
  ttsState,
  ttsPlay,
  ttsPause,
  ttsStop,
  //   onPitchChange,
  onRateChange,
  onVoiceChange,
  //   pitch,
  rate,
  voice,
  voices,
}: {
  isMenuExpanded: boolean;
  toc: { href: string; label: string }[];
  currentChapter: string;
  onChapterChange: (href: string) => void;
  onToggleMenu: () => void;
  onToggleTTS: () => void;
  isSpeaking: boolean;
  fontSize: FontSize;
  onFontSizeChange: (newSize: FontSize) => void;
  ttsState: TTSHookState;
  ttsPlay: () => void;
  ttsPause: () => void;
  ttsStop: () => void;
  //   onPitchChange: (pitch: number) => void;
  onRateChange: (rate: number) => void;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
  //   pitch: number;
  rate: number;

  voice?: SpeechSynthesisVoice;
  voices: SpeechSynthesisVoice[];
}) {
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm z-[9999] border border-border rounded-lg shadow-lg transition-all duration-300 ease-in-out",
        isMenuExpanded ? "w-[calc(100%-2rem)] md:w-[400px] p-4" : "w-12 h-12"
      )}
    >
      <div
        className={cn(
          "inset-0 p-4 pt-10 transition-all duration-300 ease-in-out space-y-4 z-[9999]",
          isMenuExpanded
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <Button
          onClick={onToggleMenu}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <div className="flex space-x-2">
          <Button
            onClick={ttsPlay}
            variant="default"
            size="sm"
            className="flex-1"
            disabled={ttsState.isPlaying}
          >
            <PlayIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={ttsPause}
            variant="default"
            size="sm"
            className="flex-1"
            disabled={!ttsState.isPlaying}
          >
            <PauseIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={ttsStop}
            variant="default"
            size="sm"
            className="flex-1"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Rate:</p>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[rate]}
              onValueChange={([value]) => onRateChange(value)}
            />
            <span className="text-sm">{rate.toFixed(1)}</span>
          </div>

          <Select
            value={voice?.name}
            onValueChange={(value) => {
              const selectedVoice = voices.find((v) => v.name === value);
              if (selectedVoice) onVoiceChange(selectedVoice);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              {voices.map((v) => (
                <SelectItem key={v.name} value={v.name}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={fontSize} onValueChange={onFontSizeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Font Size" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value="80%">Small (80%)</SelectItem>
            <SelectItem value="90%">Medium Small (90%)</SelectItem>
            <SelectItem value="100%">Normal (100%)</SelectItem>
            <SelectItem value="110%">Medium Large (110%)</SelectItem>
            <SelectItem value="120%">Large (120%)</SelectItem>
            <SelectItem value="130%">X-Large (130%)</SelectItem>
            <SelectItem value="140%">XX-Large (140%)</SelectItem>
            <SelectItem value="150%">XXX-Large (150%)</SelectItem>
            <SelectItem value="200%">Blind Yourself (200%)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={currentChapter} onValueChange={onChapterChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chapter" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            {toc.map((chapter) => (
              <SelectItem key={chapter.href} value={chapter.href}>
                {chapter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={onToggleMenu}
        variant="default"
        size="sm"
        className={cn(
          "absolute bottom-0 right-0 w-full h-full p-0 transition-all duration-300 ease-in-out",
          isMenuExpanded
            ? "opacity-0 scale-95 pointer-events-none"
            : "opacity-100 scale-100",
          "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <MenuIcon className="h-6 w-6" />
      </Button>
    </div>
  );
}
