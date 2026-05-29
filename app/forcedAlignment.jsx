import { Redirect } from "expo-router";

/** @deprecated Use /lesson/1 instead */
export default function ForcedAlignment() {
  return <Redirect href="/lesson/1" />;
}
