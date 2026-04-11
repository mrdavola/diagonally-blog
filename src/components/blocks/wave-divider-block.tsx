import { WaveDivider } from "@/components/wave-divider"

export default function WaveDividerBlock({ props }: { props: Record<string, unknown> }) {
  const topColor = (props.topColor as string) ?? "#FAF9F6"
  const bottomColor = (props.bottomColor as string) ?? "#FFFFFF"

  return <WaveDivider topColor={topColor} bottomColor={bottomColor} />
}
