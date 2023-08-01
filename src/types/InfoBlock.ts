export type InfoBlock =
  | {
      name: string;
      type: "image";
    }
  | {
      text: string;
      type: "text";
    };
