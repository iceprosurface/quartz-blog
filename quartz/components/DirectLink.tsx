import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
type Props = {
  link?: string,
  title?: string,
};

export default (((setting?: Props) => {
  const Component: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (<div class={displayClass}>
      <a href={setting?.link} class="internal">
        {setting?.title}
      </a>
    </div>)
  }
  return Component;
}) satisfies QuartzComponentConstructor) 