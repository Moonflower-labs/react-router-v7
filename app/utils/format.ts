import { formatDistanceToNow, formatRelative } from "date-fns";
import { es } from "date-fns/locale/es";

//**
// DATE FORMATING
// **/
export const formatDayTime = (date: Date): string => {
  // el lunes pasado a las 17:43
  return formatRelative(date, new Date(), { locale: es });
};

export const formatDistanceToNowEs = (date: Date | string | number | undefined) => {
  if (!date) return;

  const dateObj = date instanceof Date ? date : new Date(date);

  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
};

//**
// LIKES
// **/

export const formatLikes = (likes: any | null) => {
  if (likes) {
    const likers = likes.slice(0, 3).map((like: { user: any }) => like.user);
    const likersString = likers.join(", ");
    const additionalLikes = likes.length > 3 ? ` y ${likes.length - 3} mas.` : "";
    return `${likersString}${additionalLikes}`;
  }
  return "0 me gusta";
};
