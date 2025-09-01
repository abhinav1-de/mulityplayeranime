import axios from "axios";

export default async function getSlayKnightInfo(anilistId, episode) {
  try {
    const response = await axios.get(
      `https://slay-knight.xyz/api/get-server?id=${anilistId}&ep=${episode}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Slay Knight server info:", error);
    return null;
  }
}
