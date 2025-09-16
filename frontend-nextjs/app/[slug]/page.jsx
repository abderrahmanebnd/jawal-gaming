// app/game/[id]/page.js
import GameClient from "./GameClient";

export async function generateMetadata({ params }) {
  const res = await fetch(`${process.env.API_URL}/games/${params.id}`, {
    next: { revalidate: 60 },
  });
  const game = await res.json();

  return {
    title: `${game.title} - Jawal Games`,
    description: game.description,
    openGraph: {
      title: `${game.title} - Jawal Games`,
      description: game.description,
      images: [game.thumbnail],
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/game/${params.id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.title} - Jawal Games`,
      description: game.description,
      images: [game.thumbnail],
    },
  };
}

export default async function GamePage({ params }) {
  const gameRes = await fetch(`${process.env.API_URL}/games/${params.id}`, {
    next: { revalidate: 60 }, // ISR (rebuild every 60s)
  });
  const game = await gameRes.json();

  const moreGamesRes = await fetch(
    `${process.env.API_URL}/games?page=1&pageSize=19`,
    {
      next: { revalidate: 120 }, // cache for 2 minutes
    }
  );
  const moreGames = await moreGamesRes.json();

  return <GameClient game={game} moreGames={moreGames.data} />;
}
