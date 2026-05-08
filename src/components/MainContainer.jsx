export default function MainContainer({
  defaultClassName = "container",
  as = "main",
  className,
  ...rest
}) {
  const As = as;

  return (
    <As
      className={[defaultClassName, className].filter(Boolean).join(" ")}
      {...rest}
    ></As>
  );
}

function SubContainer({
  defaultClassName = "p-3 bg-body rounded shadow-sm",
  as = "div",
  className,
  ...rest
}) {
  const As = as;

  return (
    <As
      className={[defaultClassName, className].filter(Boolean).join(" ")}
      {...rest}
    ></As>
  );
}

MainContainer.SubContainer = SubContainer;
