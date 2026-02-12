import Lottie from "lottie-react";
import owl from "../assets/anime.json";

export default function TestLottie() {
  return (
    <Lottie
      animationData={owl}
      loop
      autoplay
      style={{ width: 800 }}
    />
  );
}