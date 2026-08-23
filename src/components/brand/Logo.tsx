import wordmarkDark from "@/assets/vardbemanning-wordmark-dark.svg.asset.json";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <img
      src={wordmarkDark.url}
      alt="vårdbemanning.ai"
      className={className}
      width={841}
      height={99}
    />
  );
}