import "@/styles/globals.css";
import type { AppProps } from "next/app";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { FaGithubAlt } from "react-icons/fa";

import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const tabs = [
  { name: "IBC", href: "/" },
  { name: "Addr", href: "/addr" },
];

const animation = {
  initial: { opacity: 0, y: -120 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 120 },
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <div className={inter.variable}>
      <div className="font-sans">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={router.pathname}
            initial={animation.initial}
            animate={animation.animate}
            exit={animation.exit}
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>

        <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4">
          <div className="flex w-full max-w-[380px] items-center justify-between rounded-full bg-white p-1">
            <span className="pl-3 font-black uppercase text-stone-900">
              stridef
            </span>

            <div className="flex gap-2 rounded-full bg-stone-900 p-1">
              {tabs.map((tab, i) => {
                const isActive = tab.href === router.pathname;

                return (
                  <Link
                    href={tab.href}
                    key={tab.name}
                    className={clsx(
                      "relative isolate px-4 py-2 font-bold uppercase text-white",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 top-0 z-10 rounded-full bg-stone-700"
                        layoutId="canopy-tab-bar"
                      />
                    )}
                    <span className="relative z-20">{tab.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bottom fixed bottom-0 left-0 top-0 flex items-end p-2">
          <div className="flex flex-col">
            <a
              href="https://twitter.com/_srph"
              target="_blank"
              title="Open Twitter (X) profile of Kier Borromeo"
              className="inline-block scale-100 px-4 py-4 text-xl text-stone-500 transition-all duration-100 hover:scale-110"
            >
              <FaXTwitter />
            </a>

            <a
              href="https://github.com/srph/stridef"
              target="_blank"
              title="Open GitHub repository of stridef"
              className="inline-block scale-100 px-4 py-4 text-xl text-stone-500 transition-all duration-100 hover:scale-110"
            >
              <FaGithubAlt />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
