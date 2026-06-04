import Image from "next/image";

export default function SpinningLogo() {
  return (
    <Image
      src="/ruins-logo.svg"
      alt="Ruins Ltd"
      width={160}
      height={49}
      priority
      style={{ display: "block", filter: "invert(1)" }}
    />
  );
}
