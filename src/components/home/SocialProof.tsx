import Image from "next/image";

export default function SocialProof() {
  return (
    <div className="mx-auto grid py-8 lg:py-0 gap-6 lg:gap-12 grid-flow-row place-items-center lg:h-48 w-full lg:grid-flow-col select-none place-content-center items-center bg-[url('/bg-social-pattern.svg')] bg-cover bg-bottom bg-no-repeat px-4 lg:px-16">
      <Image
        src="/bahcesehirkoleji.png"
        alt="Bahcesehir Koleji"
        className="cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={120}
        height={244}
      />
      <Image
        src="/bilfenkurumlari.png"
        alt="Bilfen Egitim Kurumlari"
        className="cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={140}
        height={121}
      />
      <Image
        src="/dogakoleji.png"
        alt="Doga Koleji"
        className="cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={70}
        height={258}
      />
      <Image
        src="/mektebimkoleji.png"
        alt="Mektebim Koleji"
        className="cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={110}
        height={322}
      />
      <Image
        src="/finalokullari.png"
        alt="Final Okullari"
        className="cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={110}
        height={185}
      />
      <Image
        src="/ugurokullari.png"
        alt="Ugur Okullari"
        className="cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={110}
        height={265}
      />
      <Image
        src="/okyanuskoleji.png"
        alt="Okyanus Koleji"
        className="cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={90}
        height={256}
      />
    </div>
  );
}
