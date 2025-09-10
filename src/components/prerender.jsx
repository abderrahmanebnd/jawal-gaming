import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "../App";
import { apiEndPoints } from "../api/api";

// Node-safe fetch
async function safeFetch(url) {
  try {
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.data || null;
  } catch (err) {
    console.error("Safe fetch error:", err);
    return null;
  }
}

export async function prerender({ url }) {
  let html = "";
  let gameMeta = null;

  // 1️⃣ Fetch all games safely
  let allGames = await safeFetch(apiEndPoints.viewGame);
  if (!Array.isArray(allGames)) allGames = [];

  // 2️⃣ If this URL is a game, find its meta
  if (url !== "/") {
    const slug = url.slice(1); // remove leading slash
  
      const gameData = await safeFetch(
        `${apiEndPoints.byIdGame}?id=${slug}`
      );
      if (gameData) gameMeta = gameData;
    
  }

  // 3️⃣ Render your app using StaticRouter (Node-safe)
  html = ReactDOMServer.renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  // 4️⃣ Generate links safely
  const links = new Set(
    Array.isArray(allGames)
      ? allGames.map(
          (g) => `/${g.title?.toLowerCase().replace(/\s+/g, "-") || g.id || ""}`
        )
      : []
  );

  // 5️⃣ Return prerender result
 return {
   html,
   links,
   head: {
     title: gameMeta
       ? `${gameMeta.title} - Jawal Games`
       : "Jawal Games - Play Now!",
     elements: new Set([
       // Standard description
       {
         type: "meta",
         props: {
           name: "description",
           content:
             gameMeta?.description ||
             "Jawal Games, your go-to platform for free online games.",
         },
       },

       // Open Graph
       {
         type: "meta",
         props: {
           property: "og:title",
           content: gameMeta
             ? `${gameMeta.title} - Jawal Games`
             : "Jawal Games - Play Now!",
         },
       },
       {
         type: "meta",
         props: {
           property: "og:description",
           content: gameMeta?.description || "Play free online games.",
         },
       },
       {
         type: "meta",
         props: {
           property: "og:image",
           content: gameMeta?.thumbnail || "/web-icons/icon-512.png",
         },
       },
       {
         type: "meta",
         props: {
           property: "og:type",
           content: "game",
         },
       },
       {
         type: "meta",
         props: {
           property: "og:url",
           content: `https://jawalgames.net${url}`, // dynamically use the prerendered page URL
         },
       },

       // Twitter
       {
         type: "meta",
         props: {
           name: "twitter:card",
           content: "summary_large_image",
         },
       },
       {
         type: "meta",
         props: {
           name: "twitter:title",
           content: gameMeta
             ? `${gameMeta.title} - Jawal Games`
             : "Jawal Games - Play Now!",
         },
       },
       {
         type: "meta",
         props: {
           name: "twitter:description",
           content: gameMeta?.description || "Play free online games.",
         },
       },
       {
         type: "meta",
         props: {
           name: "twitter:image",
           content: gameMeta?.thumbnail || "/web-icons/icon-512.png",
         },
       },
     ]),
   },
 };

}
