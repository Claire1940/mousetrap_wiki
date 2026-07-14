"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// 模块标题上方的小标签 - 统一主题色样式
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 md:mb-5
                 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--nav-theme-light))]" />
      <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[hsl(var(--nav-theme-light))]">
        {children}
      </span>
    </div>
  );
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mousetrap.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Mouse Trap Wiki",
        description:
          "Complete Mouse Trap Wiki covering rules, cheese strategies, trap mechanics, multiplayer guides, mouse outfits, and platform details for the digital board game.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 640,
          caption: "Mouse Trap - Chaotic Chain-Reaction Board Game",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Mouse Trap Wiki",
        alternateName: "Mouse Trap",
        url: siteUrl,
        description:
          "Complete Mouse Trap Wiki resource hub for rules, cheese strategies, trap mechanics, multiplayer guides, and mouse outfits",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 640,
          caption: "Mouse Trap Wiki - Chaotic Chain-Reaction Board Game",
        },
        sameAs: [
          "https://www.marmaladegamestudio.com/games/mousetrap",
          "https://store.steampowered.com/app/2280420/Mouse_Trap/",
          "https://discord.gg/J58mUwTehc",
          "https://www.youtube.com/channel/UCumvfXfBRw_KhfKgAREpgnw",
          "https://www.instagram.com/marmaladegames",
          "https://x.com/MarmaladeGames",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Mouse Trap",
        gamePlatform: ["iOS", "Android", "Nintendo Switch", "PlayStation 4"],
        applicationCategory: "Game",
        genre: ["Board Game", "Family", "Party", "Multiplayer"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 4,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://apps.apple.com/us/app/mouse-trap-the-board-game/id1643532048",
        },
      },
      {
        "@type": "VideoObject",
        name: "MOUSE TRAP | OUT NOW",
        description:
          "Official Mouse Trap launch trailer from Marmalade Game Studio featuring the chain-reaction board game gameplay.",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/gnyn6hjRx4w",
        url: "https://www.youtube.com/watch?v=gnyn6hjRx4w",
      },
    ],
  };

  // How to Play accordion state
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // 导航卡片 → section 锚点映射（8 个模块）
  const sectionIds = [
    "beginner-guide",
    "how-to-play",
    "cheese-strategy-guide",
    "multiplayer-guide",
    "trap-chain-reaction-guide",
    "mice-outfits-guide",
    "game-modes-guide",
    "platforms-release-dates",
  ];

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("beginner-guide")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.marmaladegamestudio.com/games/mousetrap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 区域之后（容器 max-w-5xl） */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="gnyn6hjRx4w"
              title="MOUSE TRAP | OUT NOW"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（位于视频区之后、Latest Updates 之前，容器 max-w-5xl） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = sectionIds[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Latest Updates Section（保留模板模块，位于 Tools Grid 之后） */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* Module 1: Beginner Guide (step-by-step) */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow>{t.modules.mouseTrapBeginnerGuide.eyebrow}</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.mouseTrapBeginnerGuide.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.mouseTrapBeginnerGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-3 md:space-y-4">
            {t.modules.mouseTrapBeginnerGuide.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-center gap-3 md:flex-col md:items-center md:gap-2 mb-3 md:mb-0">
                    <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                      <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    {step.tip && (
                      <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-[hsl(var(--nav-theme)/0.05)] border-l-2 border-[hsl(var(--nav-theme-light))]">
                        <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        <span className="text-xs md:text-sm text-muted-foreground">
                          {step.tip}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: How to Play (accordion) */}
      <section id="how-to-play" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow>{t.modules.mouseTrapHowToPlay.eyebrow}</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.mouseTrapHowToPlay.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.mouseTrapHowToPlay.intro}
            </p>
          </div>
          <div className="scroll-reveal space-y-2">
            {t.modules.mouseTrapHowToPlay.faqs.map(
              (faq: any, index: number) => (
                <div
                  key={index}
                  className="border border-border rounded-xl overflow-hidden bg-white/5"
                >
                  <button
                    onClick={() =>
                      setFaqExpanded(faqExpanded === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${faqExpanded === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {faqExpanded === index && (
                    <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 3: Cheese Strategy Guide (card-list) */}
      <section id="cheese-strategy-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow>{t.modules.mouseTrapCheeseStrategy.eyebrow}</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.mouseTrapCheeseStrategy.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.mouseTrapCheeseStrategy.intro}
            </p>
          </div>
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.mouseTrapCheeseStrategy.strategies.map(
              (s: any, index: number) => (
                <div
                  key={index}
                  className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                        s.priority === "Essential"
                          ? "bg-[hsl(var(--nav-theme))] text-white border-transparent"
                          : s.priority === "High"
                            ? "bg-[hsl(var(--nav-theme)/0.15)] text-[hsl(var(--nav-theme-light))] border-[hsl(var(--nav-theme)/0.3)]"
                            : "bg-[hsl(var(--nav-theme)/0.08)] text-muted-foreground border-border"
                      }`}
                    >
                      {s.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {s.description}
                  </p>
                  <div className="mt-auto space-y-2 text-xs">
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-[hsl(var(--nav-theme-light))]">
                        Best when:
                      </span>{" "}
                      {s.bestWhen}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-[hsl(var(--nav-theme-light))]">
                        Result:
                      </span>{" "}
                      {s.result}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 4: Multiplayer Guide (comparison cards) */}
      <section id="multiplayer-guide" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow>{t.modules.mouseTrapMultiplayerGuide.eyebrow}</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.mouseTrapMultiplayerGuide.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.mouseTrapMultiplayerGuide.intro}
            </p>
          </div>
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.mouseTrapMultiplayerGuide.modes.map(
              (m: any, index: number) => (
                <div
                  key={index}
                  className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
                >
                  <h3 className="font-bold text-lg mb-3 text-[hsl(var(--nav-theme-light))]">
                    {m.mode}
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-foreground/80 min-w-[90px]">Players</span>
                      <span className="text-muted-foreground">{m.players}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-foreground/80 min-w-[90px]">Connection</span>
                      <span className="text-muted-foreground">{m.connection}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-foreground/80 min-w-[90px]">Hardware</span>
                      <span className="text-muted-foreground">{m.hardware}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-foreground/80 min-w-[90px]">Subscription</span>
                      <span className="text-muted-foreground">{m.subscription}</span>
                    </div>
                  </div>
                  <p className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                    <span className="font-semibold text-[hsl(var(--nav-theme-light))]">
                      Best for:
                    </span>{" "}
                    {m.bestFor}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 5: 中部停顿 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 5: Trap and Chain Reaction (timeline) */}
      <section id="trap-chain-reaction-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow>{t.modules.mouseTrapTrapChainReaction.eyebrow}</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.mouseTrapTrapChainReaction.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.mouseTrapTrapChainReaction.intro}
            </p>
          </div>
          <div className="scroll-reveal relative pl-8 md:pl-10 border-l-2 border-[hsl(var(--nav-theme)/0.3)] space-y-6">
            {t.modules.mouseTrapTrapChainReaction.stages.map(
              (stage: any, index: number) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[1.7rem] md:-left-[2.1rem] w-8 h-8 md:w-9 md:h-9 rounded-full bg-[hsl(var(--nav-theme))] border-4 border-background flex items-center justify-center">
                    <span className="text-xs md:text-sm font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                    <h3 className="font-bold text-lg mb-2">{stage.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {stage.description}
                    </p>
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[hsl(var(--nav-theme)/0.05)] border-l-2 border-[hsl(var(--nav-theme-light))]">
                      <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {stage.strategy}
                      </span>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 6: Mice and Outfits (gallery-grid) */}
      <section id="mice-outfits-guide" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow>{t.modules.mouseTrapMiceOutfits.eyebrow}</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.mouseTrapMiceOutfits.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.mouseTrapMiceOutfits.intro}
            </p>
          </div>
          <div className="scroll-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.mouseTrapMiceOutfits.items.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-[hsl(var(--nav-theme-light))] font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3 flex-1">
                    {item.description}
                  </p>
                  <div className="space-y-1.5 text-xs pt-3 border-t border-border">
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground/80">Platform:</span>{" "}
                      {item.platform}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground/80">Availability:</span>{" "}
                      <span className="text-[hsl(var(--nav-theme-light))]">{item.availability}</span>
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 7: Game Modes (card-list) */}
      <section id="game-modes-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow>{t.modules.mouseTrapGameModes.eyebrow}</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.mouseTrapGameModes.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.mouseTrapGameModes.intro}
            </p>
          </div>
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.mouseTrapGameModes.modes.map(
              (m: any, index: number) => (
                <div
                  key={index}
                  className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{m.name}</h3>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                        m.connection === "Online"
                          ? "bg-[hsl(var(--nav-theme)/0.15)] text-[hsl(var(--nav-theme-light))] border-[hsl(var(--nav-theme)/0.3)]"
                          : "bg-[hsl(var(--nav-theme)/0.05)] text-muted-foreground border-border"
                      }`}
                    >
                      {m.connection}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-3">
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground/80">Players:</span>{" "}
                      {m.players}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground/80">Opponents:</span>{" "}
                      {m.opponents}
                    </p>
                  </div>
                  <p className="mt-auto pt-3 border-t border-border text-xs text-muted-foreground">
                    <span className="font-semibold text-[hsl(var(--nav-theme-light))]">
                      Best for:
                    </span>{" "}
                    {m.bestFor}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 8: Platforms and Release Dates (table) */}
      <section id="platforms-release-dates" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow>{t.modules.mouseTrapPlatformsReleaseDates.eyebrow}</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.mouseTrapPlatformsReleaseDates.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.mouseTrapPlatformsReleaseDates.intro}
            </p>
          </div>
          {/* 桌面端表格 */}
          <div className="scroll-reveal hidden md:block overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[hsl(var(--nav-theme)/0.1)] border-b border-border">
                  <th className="text-left p-4 font-semibold">Platform</th>
                  <th className="text-left p-4 font-semibold">Release</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Players</th>
                  <th className="text-left p-4 font-semibold">Modes</th>
                  <th className="text-left p-4 font-semibold">Languages</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.mouseTrapPlatformsReleaseDates.platforms.map(
                  (p: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-border last:border-b-0 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 font-semibold text-[hsl(var(--nav-theme-light))]">
                        {p.platform}
                      </td>
                      <td className="p-4 text-muted-foreground">{p.release}</td>
                      <td className="p-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                            p.status === "Available"
                              ? "bg-[hsl(var(--nav-theme)/0.15)] text-[hsl(var(--nav-theme-light))] border-[hsl(var(--nav-theme)/0.3)]"
                              : "bg-[hsl(var(--nav-theme)/0.05)] text-muted-foreground border-border"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{p.players}</td>
                      <td className="p-4 text-muted-foreground">{p.playModes}</td>
                      <td className="p-4 text-muted-foreground">{p.languages}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
          {/* 移动端卡片 */}
          <div className="scroll-reveal md:hidden space-y-3">
            {t.modules.mouseTrapPlatformsReleaseDates.platforms.map(
              (p: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 border border-border rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[hsl(var(--nav-theme-light))]">
                      {p.platform}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border font-semibold ${
                        p.status === "Available"
                          ? "bg-[hsl(var(--nav-theme)/0.15)] text-[hsl(var(--nav-theme-light))] border-[hsl(var(--nav-theme)/0.3)]"
                          : "bg-[hsl(var(--nav-theme)/0.05)] text-muted-foreground border-border"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground/80">Release:</span>{" "}
                      {p.release}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground/80">Players:</span>{" "}
                      {p.players}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground/80">Modes:</span>{" "}
                      {p.playModes}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground/80">Languages:</span>{" "}
                      {p.languages}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.gg/J58mUwTehc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition inline-flex items-center gap-1"
                  >
                    {t.footer.discord}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@marmaladegamestudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition inline-flex items-center gap-1"
                  >
                    {t.footer.youtube}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/MarmaladeGames"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition inline-flex items-center gap-1"
                  >
                    {t.footer.twitter}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://store.steampowered.com/app/2280420/Mouse_Trap/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition inline-flex items-center gap-1"
                  >
                    {t.footer.steamStore}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href={locale === "en" ? "/about" : `/${locale}/about`}
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href={locale === "en" ? "/privacy-policy" : `/${locale}/privacy-policy`}
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href={locale === "en" ? "/terms-of-service" : `/${locale}/terms-of-service`}
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href={locale === "en" ? "/copyright" : `/${locale}/copyright`}
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
