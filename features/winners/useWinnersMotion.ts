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

      container.querySelectorAll<HTMLElement>("[data-archive-card]").forEach((card) => {
        const photo = card.querySelector<HTMLElement>("[data-archive-image]");
        const name = card.querySelector<HTMLElement>("[data-archive-name]");
        if (!photo || !name) return;
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 94%", end: "top 42%", scrub: 0.6 },
        });
        timeline
          .fromTo(card, { y: 30 }, { y: 0, ease: "none", duration: 1 }, 0)
          .fromTo(photo, { scale: 1.12, yPercent: 5 }, { scale: 1, yPercent: 0, ease: "none", duration: 1 }, 0)
          .fromTo(name, { yPercent: 95 }, { yPercent: 0, ease: "none", duration: 0.62 }, 0.28);
      });
    });

    media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      container.querySelectorAll<HTMLElement>("[data-category]").forEach((category) => {
        const stage = category.querySelector<HTMLElement>("[data-category-stage]");
        const title = category.querySelector<HTMLElement>("[data-category-title]");
        const word = category.querySelector<HTMLElement>("[data-category-word]");
        const panels = Array.from(category.querySelectorAll<HTMLElement>("[data-spotlight]"));
        if (!stage || !title || !word || !panels.length) return;

        if (panels.length > 1) gsap.set(panels.slice(1), { autoAlpha: 0 });
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * (0.4 + panels.length * 0.78))}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .fromTo(title, { xPercent: -6, autoAlpha: 0.48 }, { xPercent: 0, autoAlpha: 1, duration: 0.55 }, 0)
          .fromTo(word, { xPercent: 7 }, { xPercent: -7, duration: Math.max(1.1, panels.length) }, 0);

        panels.forEach((panel, index) => {
          const photo = panel.querySelector<HTMLElement>("[data-spotlight-photo]");
          const name = panel.querySelector<HTMLElement>("[data-spotlight-name]");
          const awards = panel.querySelector<HTMLElement>("[data-spotlight-awards]");
          const copy = panel.querySelector<HTMLElement>("[data-spotlight-copy]");
          if (!photo || !name || !awards || !copy) return;
          const enterAt = index === 0 ? 0 : 0.72 + (index - 1) * 1.02;

          if (index > 0) {
            const previous = panels[index - 1];
            const oldPhoto = previous.querySelector<HTMLElement>("[data-spotlight-photo]");
            const oldCopy = previous.querySelector<HTMLElement>("[data-spotlight-copy]");
            if (oldPhoto && oldCopy) {
              timeline
                .to(oldPhoto, { xPercent: -30, scale: 0.88, autoAlpha: 0, duration: 0.38 }, enterAt + 0.08)
                .to(oldCopy, { xPercent: -7, autoAlpha: 0, duration: 0.2 }, enterAt)
                .set(previous, { autoAlpha: 0 }, enterAt + 0.45);
            }
            timeline.set(panel, { autoAlpha: 1 }, enterAt);
          }

          timeline
            .fromTo(photo, { xPercent: index ? 30 : 0, scale: index ? 1.14 : 1.055, autoAlpha: index ? 0 : 1 }, { xPercent: 0, scale: 1, autoAlpha: 1, duration: 0.5 }, enterAt)
            .fromTo(name, { yPercent: index ? 90 : 18 }, { yPercent: 0, duration: 0.35 }, enterAt + (index ? 0.23 : 0))
            .fromTo(awards, { y: index ? 25 : 9, autoAlpha: index ? 0 : 0.8 }, { y: 0, autoAlpha: 1, duration: 0.34 }, enterAt + (index ? 0.36 : 0));
        });
      });
    });

    media.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      container.querySelectorAll<HTMLElement>("[data-category]").forEach((category) => {
        const title = category.querySelector<HTMLElement>("[data-category-title]");
        if (title) gsap.fromTo(title, { x: -14 }, { x: 0, ease: "none", scrollTrigger: { trigger: category, start: "top 95%", end: "top 42%", scrub: 0.5 } });
        category.querySelectorAll<HTMLElement>("[data-spotlight]").forEach((panel) => {
          const photo = panel.querySelector<HTMLElement>("[data-spotlight-photo]");
          const name = panel.querySelector<HTMLElement>("[data-spotlight-name]");
          if (!photo || !name) return;
          gsap.fromTo(photo, { y: 24, scale: 1.055 }, { y: 0, scale: 1, ease: "none", scrollTrigger: { trigger: panel, start: "top 94%", end: "top 48%", scrub: 0.45 } });
          gsap.fromTo(name, { yPercent: 80 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: panel, start: "top 84%", end: "top 45%", scrub: 0.45 } });
        });
      });
    });

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
