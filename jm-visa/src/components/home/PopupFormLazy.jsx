"use client";
import dynamic from "next/dynamic";

const PopupForm = dynamic(() => import("./PopupForm"), {
  loading: () => null,
  ssr: false
});

const PopupFormLazy = () => <PopupForm />;

export default PopupFormLazy;

