"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useWinnersMotion(root: RefObject<HTMLDivElement | null>) {
  useGSAP(() => {
    const container = root.current;
    if (!container) return;
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
        const showPanel = (nextPanel: number) => {
          if (nextPanel === activePanel) return;
          activePanel = nextPanel;
          panels.forEach((panel, index) => {
            const isActive = index === nextPanel;
            gsap.set(panel, { autoAlpha: isActive ? 1 : 0 });
            panel.inert = !isActive;
            panel.setAttribute("aria-hidden", isActive ? "false" : "true");
          });
        };

        showPanel(0);
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

    const syncAnchor = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id || !/^(winner-category-\d+|winners-202[56])$/.test(id)) return;
      const target = document.getElementById(id);
      if (!target) return;
      const stage = target.querySelector<HTMLElement>("[data-category-stage]");
      const pin = stage && ScrollTrigger.getAll().find((trigger) => trigger.trigger === stage);
      const top = pin ? pin.start : target.getBoundingClientRect().top + window.scrollY;
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
      media.revert();
      categories.forEach((category) => { delete category.dataset.animated; });
    };
  }, { scope: root });
}
