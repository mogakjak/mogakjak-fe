"use client";

import Switch, { SwitchProps } from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import { background } from "storybook/internal/theming";

const ToggleButton = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(() => ({
  width: 64,
  height: 36,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 2,
    margin: 2,
    transitionDuration: "200ms",
    "&.Mui-checked": {
      transform: "translateX(28px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#44d93a",
        opacity: 1,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 28,
    height: 28,
    backgroundColor: "#fff",
  },
  "& .MuiSwitch-track": {
    borderRadius: 9999,
    backgroundColor: "#C8CBD1",
    opacity: 1,
    transition: "background-color 200ms",
  },
}));

export default ToggleButton;
