export const fetcher = async (url: string) => {
  const res = await fetch(url);
  console.log("Fetching from:", url); // Check if API is being called
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};
