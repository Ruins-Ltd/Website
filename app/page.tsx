import dynamic from "next/dynamic";
import SpinningLogo from "@/components/SpinningLogo";

const EventCard = dynamic(() => import("@/components/EventCard"), {
  ssr: false,
});

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        width: "100vw",
        gap: "0",
        padding: "40px 24px 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <SpinningLogo />
      </div>
      <div style={{ flex: 1, width: "100%", maxWidth: 520, minHeight: 0 }}>
        <EventCard />
      </div>
    </main>
  );
}
