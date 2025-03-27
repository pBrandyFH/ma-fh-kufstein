import { Navigate, NavigateProps, useLocation } from "react-router-dom";

interface CustomNavigateProps extends NavigateProps {
  preserveSearch?: boolean;
}

export function CustomNavigate({
  to,
  replace = false,
  state,
  preserveSearch = true,
}: CustomNavigateProps) {
  const location = useLocation();

  // If preserveSearch is true and we have search params, append them to the destination
  const finalPath =
    preserveSearch && location.search ? `${to}${location.search}` : to;

  return (
    <Navigate
      to={finalPath}
      replace={replace}
      state={state || { from: location }}
    />
  );
}
