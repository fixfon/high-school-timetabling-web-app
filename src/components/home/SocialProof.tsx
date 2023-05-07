import Image from "next/image";

export default function SocialProof() {
  return (
    <div className="mx-auto grid h-60 w-full grid-flow-col select-none place-content-center items-center bg-[url('/bg-social-pattern.svg')] bg-cover bg-bottom bg-no-repeat px-16">
      <Image
        src="/bahcesehirkoleji.png"
        alt="Bahcesehir Koleji"
        className="scale-50 cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={300}
        height={244}
      />
      <Image
        src="/bilfenkurumlari.png"
        alt="Bilfen Egitim Kurumlari"
        className="scale-50 cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={361}
        height={121}
      />
      <Image
        src="/dogakoleji.png"
        alt="Doga Koleji"
        className="scale-50 cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={170}
        height={258}
      />
      <Image
        src="/mektebimkoleji.png"
        alt="Mektebim Koleji"
        className="scale-[0.4] cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={340}
        height={322}
      />
      <Image
        src="/finalokullari.png"
        alt="Final Okullari"
        className="scale-50 cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={242}
        height={185}
      />
      <Image
        src="/ugurokullari.png"
        alt="Ugur Okullari"
        className="scale-[0.4] cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={346}
        height={265}
      />
      <Image
        src="/okyanuskoleji.png"
        alt="Okyanus Koleji"
        className="scale-[0.4] cursor-pointer brightness-110 grayscale transition-all hover:grayscale-0"
        width={251}
        height={256}
      />
    </div>
  );
}
