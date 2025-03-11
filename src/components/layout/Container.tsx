import React from "react";
import { Box, BoxProps, styled } from "@mui/material";

export interface ContainerProps extends BoxProps {
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  disableGutters?: boolean;
  component?: React.ElementType;
}

const maxWidthValues = {
  xs: "444px",
  sm: "600px",
  md: "900px",
  lg: "1200px",
  xl: "1536px",
};

const StyledContainer = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "maxWidth" && prop !== "disableGutters" && prop !== "component",
})<ContainerProps>(({ theme, maxWidth, disableGutters }) => ({
  width: "100%",
  marginLeft: "auto",
  marginRight: "auto",
  ...(maxWidth && {
    maxWidth: maxWidthValues[maxWidth],
  }),
  ...(!disableGutters && {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
  }),
}));

const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = "lg",
  disableGutters = false,
  component = "div",
  ...props
}) => {
  return (
    <StyledContainer
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      component={component}
      {...props}
    >
      {children}
    </StyledContainer>
  );
};

export default Container;
