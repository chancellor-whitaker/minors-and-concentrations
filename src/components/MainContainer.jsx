export default function MainContainer({
  as = "main",
  defaultClassName = "container",
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
  as = "div",
  defaultClassName = "my-3 p-3 bg-body rounded shadow-sm",
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
