
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthFormFooterProps {
  text: string;
  linkText: string;
  linkTo: string;
}

export function AuthFormFooter({ text, linkText, linkTo }: AuthFormFooterProps) {
  return (
    <p className="text-sm text-muted-foreground">
      {text}{" "}
      <Link to={linkTo} className="text-primary font-medium">
        {linkText}
      </Link>
    </p>
  );
}
