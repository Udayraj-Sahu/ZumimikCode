"use client";

import type { CSSProperties } from "react";
import { BadgeCheck, User } from "lucide-react";

import styles from "@/components/onboarding/review-carousel.module.css";

interface Review {
  name: string;
  initials: string;
  title: string;
  text: string;
}

const REVIEWS: Review[] = [
  {
    name: "Arnav James",
    initials: "AJ",
    title: "Finally cracked DI",
    text: "The data interpretation drills felt brutal for two weeks, then everything clicked. My sectional accuracy jumped from 61% to 88% before the mains.",
  },
  {
    name: "Priya Nair",
    initials: "PN",
    title: "Solid with a few quirks",
    text: "Adaptive sets read my weak areas accurately. Occasionally the difficulty spikes faster than expected, but that pressure is exactly what exam day feels like.",
  },
  {
    name: "Rahul Verma",
    initials: "RV",
    title: "Built a daily habit",
    text: "Spaced revision reminders kept me consistent for 90 plus days straight. I stopped cramming the night before and started trusting the schedule.",
  },
];

const QUOTE =
  "Arena replaced my scattered note apps with one system that actually adapts to how I study. The mock analytics alone were worth switching for.";

interface ReviewCarouselProps {
  seconds?: number;
  className?: string;
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          {review.initials || <User size={14} />}
        </span>
        <span className={styles.name}>{review.name}</span>
        <span className={styles.badge}>
          <BadgeCheck size={13} aria-hidden="true" />
        </span>
      </div>

      <span className={styles.title}>{review.title}</span>
      <p className={styles.text}>{review.text}</p>
    </article>
  );
}

export function ReviewCarousel({ seconds = 28, className }: ReviewCarouselProps) {
  return (
    <section
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      style={{ "--loop": `${seconds}s` } as CSSProperties}
      aria-label="Student reviews"
    >
      <div className={styles.panel}>
        <div className={styles.track}>
          <div className={styles.group}>
            {REVIEWS.map((review) => (
              <ReviewCard key={review.name} review={review} />
            ))}
          </div>
          <div className={styles.group} aria-hidden="true">
            {REVIEWS.map((review) => (
              <ReviewCard key={`dup-${review.name}`} review={review} />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.rating}>
        <blockquote className={styles.quote}>{QUOTE}</blockquote>
        <p className={styles.score}>User rating 4.9/5</p>
      </div>
    </section>
  );
}
