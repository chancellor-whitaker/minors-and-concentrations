import usePopover from "../hooks/usePopover";

export default function Dropdown({
  className,
  as = "div",
  defaultClassName = "dropdown",
  children,
  items,
  variant,
  ...rest
}) {
  const As = as;

  const { popover, isOpen, open } = usePopover();

  return (
    <As className={joinClassNames(defaultClassName, className)}>
      <DropdownButton active={isOpen} variant={variant} onClick={open}>
        {children}
      </DropdownButton>
      {isOpen && <DropdownMenu ref={popover}>{items}</DropdownMenu>}
    </As>
  );
}

function DropdownButton({
  active,
  className,
  toggle = true,
  as = "button",
  type = "button",
  children = "Dropdown",
  variant = "secondary",
  defaultClassName = "btn",
  ...rest
}) {
  const As = as;

  return (
    <As
      className={joinClassNames(
        defaultClassName,
        `btn-${variant}`,
        toggle && "dropdown-toggle",
        active && "active",
        className,
      )}
      type={type}
      {...rest}
    >
      {children}
    </As>
  );
}

function DropdownMenu({
  as = "ul",
  className,
  defaultClassName = "dropdown-menu d-block",
  render = (child, i) => <li key={i}>{child}</li>,
  ...rest
}) {
  const As = as;

  if ("children" in rest) {
    return (
      <As className={joinClassNames(defaultClassName, className)} {...rest}>
        {(Array.isArray(rest.children) ? rest.children : [rest.children]).map(
          render,
        )}
      </As>
    );
  }

  return (
    <As className={joinClassNames(defaultClassName, className)} {...rest}></As>
  );
}

function DropdownItem({
  active,
  className,
  as = "button",
  type = "button",
  children = "Action",
  defaultClassName = "dropdown-item",
  ...rest
}) {
  const As = as;

  return (
    <As
      className={joinClassNames(
        defaultClassName,
        active && "active",
        className,
      )}
      type={type}
      {...rest}
    >
      {children}
    </As>
  );
}

const joinClassNames = (...classNames) => classNames.filter(Boolean).join(" ");

Dropdown.Button = DropdownButton;

Dropdown.Menu = DropdownMenu;

Dropdown.Item = DropdownItem;
