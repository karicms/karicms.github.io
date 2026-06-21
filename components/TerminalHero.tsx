import { siteConfig } from "@/lib/site-config";
import { profile } from "@/data/profile";

const lines = [
  { prompt: "$", text: "whoami", output: siteConfig.name },
  { prompt: "$", text: "cat role.txt", output: profile.role },
  { prompt: "$", text: "echo $STACK", output: siteConfig.title },
  { prompt: "$", text: "git status", output: "On branch main · building cool stuff..." },
];

export function TerminalHero() {
  return (
    <div className="geek-panel overflow-hidden rounded-2xl">
      <div className="geek-terminal-bar flex items-center gap-2 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="geek-chip ml-2 text-[#8b8b96]">karicms@dev ~ zsh</span>
      </div>
      <div className="space-y-3 px-5 py-6 font-mono text-sm leading-relaxed sm:px-6 sm:py-8">
        {lines.map((line, i) => (
          <div key={i}>
            <p>
              <span className="text-[#00ff88]">{line.prompt} </span>
              <span className="text-[#e8e8ed]">{line.text}</span>
            </p>
            <p className="mt-1 pl-4 text-[#8b8b96]">{line.output}</p>
          </div>
        ))}
        <p>
          <span className="text-[#00ff88]">$ </span>
          <span className="text-[#e8e8ed]">_</span>
          <span className="geek-cursor inline-block h-4 w-2 translate-y-0.5 bg-[#00ff88]" />
        </p>
      </div>
    </div>
  );
}
