export const getFedTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      INTERNATIONAL: "blue",
      REGIONAL: "cyan",
      NATIONAL: "green",
      STATE: "yellow",
      LOCAL: "orange",
    };
    return colors[type] || "gray";
  };

  