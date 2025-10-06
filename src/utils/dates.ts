import dayjs from "dayjs";

export const formatDate = (date: string | number | Date | null | undefined) =>
  dayjs(date).locale("nb").format("DD.MM.YYYY");
