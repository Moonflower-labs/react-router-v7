import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const formatDate = (date: Date | string | number | undefined) => {
  if (!date) return;

  const dateObj = date instanceof Date ? date : new Date(date);

  return dateObj.toLocaleString("en-GB");
};
export const formatDistanceToNowEs = (date: Date | string | number | undefined) => {
  if (!date) return;

  const dateObj = date instanceof Date ? date : new Date(date);

  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
};

export const formatUnixDate = (unixTimestamp: number, locale = "en-GB", options?: Intl.DateTimeFormatOptions) => {
  return new Date(unixTimestamp * 1000).toLocaleString(locale, options);
};

export const formatLikes = (likes: any | null) => {
  if (likes) {
    const likers = likes.slice(0, 3).map((like: { user: any }) => like.user);
    const likersString = likers.join(", ");
    const additionalLikes = likes.length > 3 ? ` y ${likes.length - 3} mas.` : "";
    return `${likersString}${additionalLikes}`;
  }
  return "0 me gusta";
};
