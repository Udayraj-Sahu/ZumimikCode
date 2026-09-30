import { describe, expect, it } from "vitest";
import { parseCommitmentSpeech, isEmptyVoiceParse } from "@/lib/story/commitment-speech";
import type { StoryCommitment } from "@/lib/types/onboarding";

const base: StoryCommitment = {
  dailyMinutes: 30,
  reminderTime: "00:00",
  reclaimSlot: "Lunch Break",
  reclaimWindow: "00:00 - 00:00",
  triggerType: "Deep Focus Sprint",
  triggerTime: "00:00",
  weekDays: [true, true, true, true, true, false, false],
  reclaimConfigs: {
    "Subway Commute": { window: "08:00 - 08:10", days: [true, false, false, false, false, false, false] },
    "Evening Walk": { window: "19:00 - 19:20", days: [false, false, false, false, false, false, true] },
  },
};

const parse = (text: string) => parseCommitmentSpeech(text, base);

describe("minutes", () => {
  it("reads a spoken duration", () => {
    expect(parse("45 minutes a day").patch.dailyMinutes).toBe(45);
  });

  it("snaps to an option the stepper can render", () => {
    expect(parse("25 minutes").patch.dailyMinutes).toBe(30);
    expect(parse("70 minutes").patch.dailyMinutes).toBe(60);
  });

  it("understands half an hour and an hour", () => {
    expect(parse("half an hour please").patch.dailyMinutes).toBe(30);
    expect(parse("an hour").patch.dailyMinutes).toBe(60);
  });

  it("never reads the duration itself as a clock time", () => {
    const { patch } = parse("30 minutes a day");
    expect(patch.reminderTime).toBeUndefined();
    expect(patch.triggerTime).toBeUndefined();
    expect(patch.reclaimWindow).toBeUndefined();
  });
});

describe("reclaim slot", () => {
  it.each([
    ["do it on my commute", "Subway Commute"],
    ["during my lunch break", "Lunch Break"],
    ["an evening walk works", "Evening Walk"],
    ["at midday", "Lunch Break"],
  ])("maps %s to %s", (text, slot) => {
    expect(parse(text).patch.reclaimSlot).toBe(slot);
  });

  it("leaves the slot alone when nothing matches", () => {
    expect(parse("20 minutes of reading").patch.reclaimSlot).toBeUndefined();
  });
});

describe("cadence", () => {
  it("reads weekdays as Monday to Friday", () => {
    expect(parse("weekdays").patch.weekDays).toEqual([true, true, true, true, true, false, false]);
  });

  it("reads weekends as Saturday and Sunday only", () => {
    expect(parse("just weekends").patch.weekDays).toEqual([false, false, false, false, false, true, true]);
  });

  it("reads every day as all seven", () => {
    expect(parse("every day").patch.weekDays).toEqual([true, true, true, true, true, true, true]);
  });

  it("reads named days individually", () => {
    expect(parse("monday wednesday and friday").patch.weekDays).toEqual([
      true,
      false,
      true,
      false,
      true,
      false,
      false,
    ]);
  });

  it("gives every short day name the same index as its full spelling", () => {
    // Monday-first, matching the weekDays array the form renders.
    const days = [
      { full: "monday", short: "mon" },
      { full: "tuesday", short: "tue" },
      { full: "wednesday", short: "wed" },
      { full: "thursday", short: "thu" },
      { full: "friday", short: "fri" },
      { full: "saturday", short: "sat" },
      { full: "sunday", short: "sun" },
    ];
    days.forEach(({ full, short }, index) => {
      const expected = days.map((_, i) => i === index);
      expect(parse(`just ${full}`).patch.weekDays, full).toEqual(expected);
      expect(parse(`just ${short}`).patch.weekDays, short).toEqual(expected);
    });
  });
});

describe("times", () => {
  it("reads an explicit reminder", () => {
    expect(parse("remind me at 7 am").patch.reminderTime).toBe("07:00");
  });

  it("reads pm", () => {
    expect(parse("remind me at 1 pm").patch.reminderTime).toBe("13:00");
  });

  it("reads noon and midnight correctly", () => {
    expect(parse("remind me at 12 am").patch.reminderTime).toBe("00:00");
    expect(parse("remind me at 12 pm").patch.reminderTime).toBe("12:00");
  });

  it("treats a bare small hour as afternoon", () => {
    expect(parse("remind me at 6").patch.reminderTime).toBe("18:00");
  });

  it("routes a time to the trigger when the phrase says start", () => {
    const { patch } = parse("start at 7:30 pm");
    expect(patch.triggerTime).toBe("19:30");
    expect(patch.reminderTime).toBeUndefined();
  });

  it("splits reminder then trigger when two times are given", () => {
    const { patch } = parse("remind me at 7 am and start at 9 am");
    expect(patch.reminderTime).toBe("07:00");
    expect(patch.triggerTime).toBe("09:00");
  });
});

describe("window", () => {
  it("reads an explicit range", () => {
    const { patch } = parse("commute from 8 to 9 am");
    expect(patch.reclaimWindow).toBe("08:00 - 09:00");
    expect(patch.reclaimSlot).toBe("Subway Commute");
  });

  it("ends a bare start time at the preset length", () => {
    expect(parse("lunch break at 1 pm").patch.reclaimWindow).toBe("13:00 - 13:15");
    expect(parse("evening walk at 7 pm").patch.reclaimWindow).toBe("19:00 - 19:20");
  });

  it("ignores a range that is not a clock time", () => {
    expect(parse("2 to 3 sprints").patch.reclaimWindow).toBeUndefined();
  });

  it("ignores a range that does not move forward", () => {
    expect(parse("from 9 pm to 8 pm").patch.reclaimWindow).toBeUndefined();
  });
});

describe("reclaimConfigs are merged, not replaced", () => {
  it("leaves the other presets' windows intact", () => {
    const { patch } = parse("switch to an evening walk on weekends");
    expect(patch.reclaimConfigs?.["Evening Walk"]).toEqual({
      window: "19:00 - 19:20",
      days: [false, false, false, false, false, true, true],
    });
    expect(patch.reclaimConfigs?.["Subway Commute"]).toEqual({
      window: "08:00 - 08:10",
      days: [true, false, false, false, false, false, false],
    });
  });

  it("only writes a slot the phrase actually mentioned", () => {
    const { patch } = parse("20 minutes a day");
    expect(patch.reclaimConfigs).toBeUndefined();
  });

  it("does not invent a window for a slot that has none", () => {
    const current: StoryCommitment = { ...base, reclaimConfigs: undefined };
    const { patch } = parseCommitmentSpeech("lunch break on monday", current);
    expect(patch.reclaimConfigs?.["Lunch Break"]).toEqual({
      window: "00:00 - 00:00",
      days: [true, false, false, false, false, false, false],
    });
  });
});

describe("the documented example", () => {
  it("fills every field at once", () => {
    const { patch, labels } = parse("30 minutes on my lunch break, weekdays, remind me at 1 pm");
    expect(patch.dailyMinutes).toBe(30);
    expect(patch.reclaimSlot).toBe("Lunch Break");
    expect(patch.weekDays).toEqual([true, true, true, true, true, false, false]);
    expect(patch.reminderTime).toBe("13:00");
    expect(labels).toEqual(["30 min/day", "Lunch Break", "Weekdays", "Reminder 1:00 PM"]);
  });
});

describe("unrecognised speech", () => {
  it("reports nothing understood", () => {
    const parseResult = parse("hello there how are you doing today");
    expect(isEmptyVoiceParse(parseResult)).toBe(true);
    expect(parseResult.patch).toEqual({});
  });

  it("handles an empty transcript", () => {
    expect(isEmptyVoiceParse(parse("   "))).toBe(true);
  });
});