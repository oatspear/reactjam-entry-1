import sfxScore from "./assets/score.wav";
import sfxWoosh from "./assets/woosh.wav";
import sfxThump from "./assets/thump.wav";
import sfxFail from "./assets/fail.wav";

const sounds = {
  "score": new Audio(sfxScore),
  "woosh": new Audio(sfxWoosh),
  "thump": new Audio(sfxThump),
  "fail": new Audio(sfxFail),
}

export const playSound = (name: keyof typeof sounds) => {
  const sound = sounds[name]
  try {
    sound.play()
  } catch (_e) {
    // Sounds may be blocked by browser
  }
}
