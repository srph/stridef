import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Image from "next/image";
import React, { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  HiClipboardList,
  HiCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
} from "react-icons/hi";
import useMeasure from "react-use-measure";

// Given an address, we can convert it to its provided bech32Prefix counterpart
const convert = (address: string, bech32Prefix: string): string => {
  return toBech32(bech32Prefix, fromBech32(address).data);
};

// @source https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
const sha256 = async (value: string): Promise<string> => {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  const array = Array.from(new Uint8Array(hash));
  return array.map((b) => b.toString(16).padStart(2, "0")).join("");
};

// @source gpt-4
const ellipsis = (str: string, limit: number = 20): string => {
  const placeholder = "...";
  const lcursor = limit / 2;
  const rcursor = str.length - limit / 2 + placeholder.length;
  return str.substr(0, lcursor) + "..." + str.substr(rcursor);
};

// @source gpt-4
const copy = (value: string) => {
  var textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px"; // Move the textarea off-screen
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
};

const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

// Auto-reset boolean state after a certain time
const useEphemeralBooleanState = (ms: number): [boolean, () => void] => {
  const [state, internalSetState] = useState(false);
  const timeoutRef = useRef<number>(null);

  const flip = () => {
    internalSetState(true);

    timeoutRef.current = setTimeout(() => {
      internalSetState(false);
    }, ms);
  };

  return [state, flip];
};

const animation = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: { duration: 0.1 },
};

const CopyButton = ({ value, title }) => {
  const [isCopied, toggleIsCopied] = useEphemeralBooleanState(2000);

  const handleCopy = () => {
    if (isCopied) return;
    copy(value);
    toggleIsCopied();
  };

  return (
    <button
      type="button"
      className="px-2 py-2 text-xl text-stone-600 transition-all duration-100 ease-in-out active:scale-110"
      onClick={handleCopy}
      title={title ?? "Copy to clipboard"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isCopied ? (
          <motion.span
            key="success"
            initial={animation.initial}
            animate={animation.animate}
            exit={animation.exit}
            transition={animation.transition}
          >
            <HiCheckCircle />
          </motion.span>
        ) : (
          <motion.span
            key="clipboard"
            initial={animation.initial}
            animate={animation.animate}
            exit={animation.exit}
            transition={animation.transition}
          >
            <HiClipboardList />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

const mtn = {
  initial: { x: "110%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "-110%", opacity: 0 },
};

const AddrTools = () => {
  const [address, setAddress] = useState(
    "cosmos1jl249rmkkdh783nazp48h5j0sjdrwk5yevrgln",
  );
  const [bech32Prefix, setBech32Prefix] = useState("stride");
  const [output, setOutput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOutput(convert(address, bech32Prefix));
  };

  const handleReset = () => {
    setOutput("");
  };

  const [ref, bounds] = useMeasure();

  return (
    <div className="mx-auto w-[470px] py-[120px]">
      <h2 className="text-2xl uppercase leading-none">Address Conversion</h2>

      <div className="mb-2" />

      <p className="leading-normal text-stone-500">
        Convert a cosmos address to its counterpart on a different chain, using
        a bech32 prefix. This requires both chains to be fully cosmos-based with
        the same bip44 values.
      </p>

      <div className="mb-9" />

      <form onSubmit={handleSubmit}>
        <motion.div
          className="relative overflow-hidden rounded-md bg-stone-800"
          initial={{ height: "auto" }}
          animate={{ height: bounds.height }}
        >
          <div className="p-6" ref={ref}>
            <MotionConfig
              transition={{ duration: 0.5, type: "spring", bounce: 0 }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {output ? (
                  <motion.div
                    key="success"
                    initial={mtn.initial}
                    animate={mtn.animate}
                    exit={mtn.exit}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <pre
                        title={output}
                        className="text-ellipsis text-stone-400"
                      >
                        {ellipsis(output, 40)}
                      </pre>

                      <CopyButton value={output} title="Copy the IBC denom" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={mtn.initial}
                    animate={mtn.animate}
                    exit={mtn.exit}
                  >
                    <div>
                      <div>
                        <label className="block text-stone-500">
                          Origin Address
                        </label>

                        <div className="mb-1" />

                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="block w-full rounded-md bg-stone-700 px-3 py-4 text-stone-300 placeholder:text-stone-500"
                          placeholder="transfer/channel-0"
                        />
                      </div>

                      <div className="mb-4" />

                      <div>
                        <label className="block text-stone-500">
                          Destination Bech32 Prefix
                        </label>

                        <div className="mb-1" />

                        <input
                          type="text"
                          value={bech32Prefix}
                          onChange={(e) => setBech32Prefix(e.target.value)}
                          className="block w-full rounded-md bg-stone-700 px-3 py-4 text-stone-300 placeholder:text-stone-500"
                          placeholder="uatom"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </MotionConfig>
          </div>
        </motion.div>

        <div className="mb-4" />

        {output ? (
          <button
            type="button"
            className="group inline-flex items-center gap-2 rounded-full py-3"
            onClick={handleReset}
          >
            <span className="text-lg text-stone-500 transition-all duration-100 ease-in group-hover:-translate-x-1">
              <HiOutlineArrowLeft />
            </span>

            <span className="translate-x-0 text-sm font-bold uppercase text-stone-50">
              Reset
            </span>
          </button>
        ) : (
          <div className="flex justify-end">
            <button className="group inline-flex gap-2 rounded-full bg-orange-500 px-8 py-3 font-bold uppercase text-white">
              Get
              <span className="translate-x-0 text-orange-900 transition-all duration-100 ease-in group-hover:translate-x-1">
                <HiOutlineArrowRight />
              </span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export { AddrTools };
