import usePopover from "../hooks/usePopover";

export default function Dropdown({
  children: renderMenu = (c) => c,
  defaultClassName = "dropdown",
  renderButton = (c) => c,
  as = "div",
  className,
  ...rest
}) {
  const As = as;

  const { onClick, active, ref } = usePopover();

  return (
    <As className={joinClassNames(defaultClassName, className)} {...rest}>
      {renderButton({ onClick, active })}
      {active && renderMenu({ ref })}
    </As>
  );
}

function DropdownItem({
  defaultClassName = "dropdown-item d-flex align-items-center gap-2",
  children = "Action",
  type = "button",
  as = "button",
  className,
  active,
  ...rest
}) {
  const As = as;

  return (
    <As
      className={joinClassNames(defaultClassName, className)}
      type={type}
      {...rest}
    >
      {active ? (
        <svg
          className="bi bi-check-square-fill"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 16 16"
          height={16}
          width={16}
        >
          <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="bi bi-square"
          fill="currentColor"
          viewBox="0 0 16 16"
          height={16}
          width={16}
        >
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
        </svg>
      )}
      {children}
    </As>
  );
}

function DropdownMenu({
  defaultClassName = "dropdown-menu d-block overflow-y-scroll",
  renderItem = (child, i) => <li key={i}>{child}</li>,
  maxHeight = 209,
  as = "ul",
  className,
  style,
  ...rest
}) {
  const As = as;

  const normalProps = {
    className: joinClassNames(defaultClassName, className),
    style: { maxHeight, ...style },
  };

  if ("children" in rest) {
    const { children, ...withoutChildren } = rest;

    return (
      <As {...normalProps} {...withoutChildren}>
        {(Array.isArray(children) ? children : [children]).map(renderItem)}
      </As>
    );
  }

  return <As {...normalProps} {...rest}></As>;
}

function DropdownButton({
  defaultClassName = "btn",
  children = "Dropdown",
  variant = "secondary",
  type = "button",
  as = "button",
  toggle = true,
  className,
  active,
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

const joinClassNames = (...classNames) => classNames.filter(Boolean).join(" ");

Dropdown.Button = DropdownButton;

Dropdown.Menu = DropdownMenu;

Dropdown.Item = DropdownItem;
