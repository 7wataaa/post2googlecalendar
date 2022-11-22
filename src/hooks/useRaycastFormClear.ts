import { useState } from "react";

export const useRaycastFormClear = (): [
  {
    value: string;
    onChange: (str: string) => void;
  },
  () => void
] => {
  const [value, setValue] = useState("");

  const targetFormProps = {
    value: value,
    onChange: (str: string) => setValue(str),
  };

  const clear = () => setValue("");

  return [targetFormProps, clear];
};
