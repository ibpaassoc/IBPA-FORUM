"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

export function useWinnersMotion(root: RefObject<HTMLDivElement | null>) {
  useGSAP((_context, contextSafe) => {
    const container = root.current;
    if (!container || !contextSafe) return;
    const categories = Array.from(container.querySelectorAll<HTMLElement>("[data-category]"));
    categories.forEach((category) => { category.dataset.animated = "true"; });
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const hero = container.querySelector<HTMLElement>("[data-winners-hero]");
      const image = container.querySelector<HTMLElement>("[data-hero-image]");
      if (hero && image) {
        gsap.timeline({ defaults: { ease: "power3.out" } })
          .fromTo("[data-hero-line]", { yPercent: 110 }, { yPercent: 0, duration: 1.15, stagger: 0.13 }, 0.15)
          .fromTo("[data-hero-intro]", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.13 }, 0.65);

        gsap.fromTo(image, { scale: 1.09, yPercent: -2 }, {
          scale: 1, yPercent: 5, ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.65 },
        });
      }
    });

    media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const animatedPanels: HTMLElement[][] = [];

      container.querySelectorAll<HTMLElement>("[data-category]").forEach((category) => {
        const stage = category.querySelector<HTMLElement>("[data-category-stage]");
        const word = category.querySelector<HTMLElement>("[data-category-word]");
        const panels = Array.from(category.querySelectorAll<HTMLElement>("[data-spotlight]"));
        if (!stage || !word || !panels.length) return;

        gsap.fromTo(word, { xPercent: 3 }, {
          xPercent: -3,
          ease: "none",
          scrollTrigger: { trigger: category, start: "top bottom", end: "bottom top", scrub: 0.25 },
        });

        if (panels.length === 1) return;

        animatedPanels.push(panels);
        let activePanel = -1;
        const showPanel = contextSafe((nextPanel: number, immediate = false) => {
          if (nextPanel === activePanel) return;
          const previousPanel = activePanel;
          const direction = previousPanel < nextPanel ? 1 : -1;
          activePanel = nextPanel;

          panels.forEach((panel, index) => {
            const isActive = index === nextPanel;
            panel.inert = !isActive;
            panel.setAttribute("aria-hidden", isActive ? "false" : "true");
          });

          gsap.killTweensOf(panels);
          const incoming = panels[nextPanel];
          const outgoing = previousPanel >= 0 ? panels[previousPanel] : null;

          if (immediate || !outgoing) {
            gsap.set(panels, { autoAlpha: 0, y: 0 });
            gsap.set(incoming, { autoAlpha: 1 });
            return;
          }

          panels.forEach((panel, index) => {
            if (index !== previousPanel && index !== nextPanel) gsap.set(panel, { autoAlpha: 0, y: 0 });
          });
          gsap.set(incoming, { autoAlpha: 0, y: direction * 14 });
          gsap.timeline()
            .to(outgoing, { autoAlpha: 0, y: direction * -10, duration: 0.14, ease: "power2.in" }, 0)
            .to(incoming, { autoAlpha: 1, y: 0, duration: 0.22, ease: "power3.out" }, 0.045)
            .set(outgoing, { y: 0 });
        });

        showPanel(0, true);
        ScrollTrigger.create({
          id: `winners-${category.id}`,
          trigger: stage,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * (panels.length - 1) * 0.48)}`,
          pin: true,
          refreshPriority: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const nextPanel = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
            showPanel(nextPanel);
          },
        });
      });

      return () => {
        animatedPanels.flat().forEach((panel) => {
          panel.inert = false;
          panel.removeAttribute("aria-hidden");
        });
      };
    });

    media.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      container.querySelectorAll<HTMLElement>("[data-category]").forEach((category) => {
        const title = category.querySelector<HTMLElement>("[data-category-title]");
        const word = category.querySelector<HTMLElement>("[data-category-word]");
        if (title && word) {
          gsap.timeline({ scrollTrigger: { trigger: category, start: "top 94%", end: "top 44%", scrub: 0.55 } })
            .fromTo(title, { xPercent: -13, autoAlpha: 0.35 }, { xPercent: 0, autoAlpha: 1, ease: "none", duration: 1 }, 0)
            .fromTo(word, { xPercent: 10 }, { xPercent: -8, ease: "none", duration: 1 }, 0);
        }
        category.querySelectorAll<HTMLElement>("[data-spotlight]").forEach((panel) => {
          const photo = panel.querySelector<HTMLElement>("[data-spotlight-photo]");
          const name = panel.querySelector<HTMLElement>("[data-spotlight-name]");
          const awards = panel.querySelector<HTMLElement>("[data-spotlight-awards]");
          if (!photo || !name || !awards) return;
          gsap.fromTo(photo, { y: 52, xPercent: 8, scale: 1.09, rotation: 1.5 }, {
            y: 0, xPercent: 0, scale: 1, rotation: 0, ease: "none",
            scrollTrigger: { trigger: photo, start: "top 94%", end: "top 39%", scrub: 0.55 },
          });
          gsap.fromTo(name, { yPercent: 105 }, {
            yPercent: 0, ease: "none",
            scrollTrigger: { trigger: name, start: "top 95%", end: "top 74%", scrub: 0.4 },
          });
          gsap.fromTo(awards, { y: 25, autoAlpha: 0.35 }, {
            y: 0, autoAlpha: 1, ease: "none",
            scrollTrigger: { trigger: awards, start: "top 96%", end: "top 75%", scrub: 0.4 },
          });
        });
      });
    });

    const setupArchiveMotion = () => {
      const archiveIntro = container.querySelector<HTMLElement>("[data-archive-intro]");
      const yearDigits = archiveIntro?.querySelectorAll<HTMLElement>("[data-archive-year-digit]");
      const archiveCopy = archiveIntro?.querySelector<HTMLElement>("[data-archive-intro-copy]");
      if (archiveIntro && yearDigits?.length && archiveCopy) {
        gsap.timeline({
          scrollTrigger: { trigger: archiveIntro, start: "top 88%", end: "top 28%", scrub: 0.7 },
        })
          .fromTo(yearDigits, { yPercent: 120, rotation: 7 }, { yPercent: 0, rotation: 0, ease: "none", duration: 0.78, stagger: 0.13 }, 0)
          .fromTo(archiveCopy, { x: 28, autoAlpha: 0.25 }, { x: 0, autoAlpha: 1, ease: "none", duration: 0.65 }, 0.42);
      }

      const carousel = container.querySelector<HTMLElement>("[data-archive-carousel]");
      const track = carousel?.querySelector<HTMLElement>("[data-archive-track]");
      const progress = carousel?.querySelector<HTMLElement>("[data-archive-progress]");
      const position = carousel?.querySelector<HTMLElement>("[data-archive-position]");
      const cards = track?.querySelectorAll<HTMLElement>("article");
      if (!carousel || !track || !progress || !position || !cards?.length) return;

      carousel.dataset.animated = "true";
      const total = cards.length;
      const distance = () => Math.max(1, track.scrollWidth - carousel.clientWidth);
      let horizontalTween: gsap.core.Tween | null = null;
      horizontalTween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        onUpdate: () => {
          const value = horizontalTween?.progress() ?? 0;
          progress.style.transform = `scaleX(${value})`;
          position.textContent = `${String(Math.min(total, 1 + Math.round(value * (total - 1)))).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
        },
        scrollTrigger: {
          trigger: carousel,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.7,
          snap: { snapTo: 1 / (total - 1), duration: { min: 0.22, max: 0.5 }, delay: 0.12, ease: "power2.inOut" },
          refreshPriority: -1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        delete carousel.dataset.animated;
        progress.style.transform = "";
        position.textContent = `01 / ${String(total).padStart(2, "0")}`;
      };
    };
    media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", setupArchiveMotion);
    media.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", setupArchiveMotion);

    const topicNav = container.querySelector<HTMLElement>("[data-winners-topic-nav]");
    const topicLinks = Array.from(container.querySelectorAll<HTMLAnchorElement>("[data-topic-link]"));
    const archive = container.querySelector<HTMLElement>("#winners-2025");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const usesHorizontalTopics = window.matchMedia("(max-width: 1279px)");
    let activeTopic = "";
    let topicScrollTween: gsap.core.Tween | null = null;
    let restoreScrollBehavior: (() => void) | null = null;

    const stopTopicScroll = () => {
      topicScrollTween?.kill();
      topicScrollTween = null;
      restoreScrollBehavior?.();
      restoreScrollBehavior = null;
    };

    const activateTopic = contextSafe((id: string) => {
      if (id === activeTopic) return;
      activeTopic = id;
      let activeLink: HTMLAnchorElement | undefined;

      topicLinks.forEach((link) => {
        const isActive = link.hash === `#${id}`;
        link.dataset.active = isActive ? "true" : "false";
        if (isActive) {
          link.setAttribute("aria-current", "location");
          activeLink = link;
        } else {
          link.removeAttribute("aria-current");
        }
      });

      if (!topicNav || !activeLink || !usesHorizontalTopics.matches || topicNav.scrollWidth <= topicNav.clientWidth) return;
      const left = Math.max(0, activeLink.offsetLeft - (topicNav.clientWidth - activeLink.offsetWidth) / 2);
      gsap.to(topicNav, {
        scrollTo: { x: left },
        duration: prefersReducedMotion.matches ? 0 : 0.24,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    if (topicNav && archive && categories.length) {
      const topicSections = [...categories, archive];
      const updateTopics = () => {
        const anchorLine = window.innerHeight * 0.52;
        const firstRect = topicSections[0].getBoundingClientRect();
        const archiveRect = archive.getBoundingClientRect();
        const isVisible = firstRect.top <= window.innerHeight * 0.78 && archiveRect.bottom > 0;
        topicNav.dataset.visible = isVisible ? "true" : "false";
        if (!isVisible) return;

        let activeSection = topicSections[0];
        topicSections.forEach((section) => {
          if (section.getBoundingClientRect().top <= anchorLine) activeSection = section;
        });
        activateTopic(activeSection.id);
      };

      ScrollTrigger.create({
        id: "winners-topic-tracker",
        trigger: container,
        start: 0,
        end: "max",
        onUpdate: updateTopics,
        onRefresh: updateTopics,
      });
      updateTopics();
    }

    const topicTop = (id: string) => {
      const target = document.getElementById(id);
      if (!target) return null;
      const pinned = id.startsWith("winner-category-") ? ScrollTrigger.getById(`winners-${id}`) : null;
      const rawTop = pinned ? pinned.start : target.getBoundingClientRect().top + window.scrollY;
      if (id === "winners-2025" && usesHorizontalTopics.matches) {
        const headerHeight = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--site-header-height")) || 0;
        return Math.max(0, rawTop - headerHeight);
      }
      return rawTop;
    };

    const onTopicClick = contextSafe((event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.currentTarget as HTMLAnchorElement;
      const id = decodeURIComponent(link.hash.slice(1));
      const top = topicTop(id);
      if (top === null) return;

      event.preventDefault();
      window.history.replaceState(null, "", `#${id}`);
      activateTopic(id);
      stopTopicScroll();

      if (prefersReducedMotion.matches) {
        window.scrollTo({ top, behavior: "instant" });
        return;
      }

      const distance = Math.abs(window.scrollY - top);
      const duration = Math.min(0.62, Math.max(0.26, 0.22 + (distance / window.innerHeight) * 0.045));
      const html = document.documentElement;
      const previousScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      restoreScrollBehavior = () => { html.style.scrollBehavior = previousScrollBehavior; };
      const finishTopicScroll = () => {
        topicScrollTween = null;
        restoreScrollBehavior?.();
        restoreScrollBehavior = null;
      };
      topicScrollTween = gsap.to(window, {
        scrollTo: { y: top, autoKill: false },
        duration,
        ease: "power3.inOut",
        overwrite: "auto",
        onComplete: finishTopicScroll,
        onInterrupt: finishTopicScroll,
      });
    });

    topicLinks.forEach((link) => link.addEventListener("click", onTopicClick));

    const syncAnchor = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id || !/^(winner-category-\d+|winners-202[56])$/.test(id)) return;
      const top = topicTop(id);
      if (top === null) return;
      window.scrollTo({ top, behavior: "instant" });
    };

    let active = true;
    let frame = 0;
    const onHashChange = () => { frame = requestAnimationFrame(syncAnchor); };
    window.addEventListener("hashchange", onHashChange);
    document.fonts.ready.then(() => {
      if (!active) return;
      ScrollTrigger.refresh();
      frame = requestAnimationFrame(syncAnchor);
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHashChange);
      topicLinks.forEach((link) => link.removeEventListener("click", onTopicClick));
      stopTopicScroll();
      if (topicNav) delete topicNav.dataset.visible;
      media.revert();
      categories.forEach((category) => { delete category.dataset.animated; });
    };
  }, { scope: root });
}
