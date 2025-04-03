export default function urlEncode(obj: { [key: string]: any }): string {
  return Object.keys(obj)
    .filter((key) => obj[key])
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
}
