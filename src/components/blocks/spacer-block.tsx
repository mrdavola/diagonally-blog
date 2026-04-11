export default function SpacerBlock({ props }: { props: Record<string, unknown> }) {
  const height = (props.height as number) ?? 64

  return <div style={{ height: `${height}px` }} aria-hidden="true" />
}
