import { Oval } from "react-loader-spinner";

export default function FullPageLoader() {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center">
      <div className="absolute h-full w-full bg-gray-900/10 opacity-50"></div>
      <Oval
        height={80}
        width={80}
        strokeWidth={4}
        color="#5090FF"
        secondaryColor="#5090ff"
      />
    </div>
  );
}
