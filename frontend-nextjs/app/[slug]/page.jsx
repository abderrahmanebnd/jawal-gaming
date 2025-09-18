import GamePageClient from "@/features/games/GamePageClient";
import { Suspense } from "next";
import { notFound } from "next/navigation";


async function fetchGameDetails(slug) {
  const res = await fetch(`${process.env.API_BASE_URL}/game/id-game?id=${slug}`,{
    credentials:"include",
    next: {
      revalidate: false, // ← Static forever (title, description, thumbnail, etc.)
      tags: [`game-details-${slug}`],
    },
  });

  if (!res.ok) return null;
  return res.json();
}

// Fetch dynamic game stats (not cached - fresh views/likes)
async function fetchGameStats(slug) {
  const res = await fetch(`${process.env.API_BASE_URL}/game/stats?id=${slug}`,{
    credentials: "include",
    next: {
      revalidate: 0, // ← Never cache (always fresh views/likes)
      tags: [`game-stats-${slug}`],
      
    },
  });

  if (!res.ok) return { views: 0, likes: 0 };
  return res.json();
}

// Fetch more games (cached daily)
async function fetchMoreGames() {
 
  const res = await fetch(`${process.env.API_BASE_URL}/game/view-game?pageSize=50`, {
    next: {
      revalidate: 86400, // ← 24 hours
      tags: ["more-games"],
    },
  });

  if (!res.ok) return [];
  return res.json();
}

// Pre-generate popular games
export async function generateStaticParams() {
  try {
    const popularGames = await fetch(
      `${process.env.API_BASE_URL}/game/top?top=100`
    );
    const games = await popularGames.json();
    return (
      games.data.data?.map((game) => ({
        slug: game.title.replace(/\s+/g, "-").toLowerCase(),
      })) || []
    );
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export const dynamicParams = true;

// SEO metadata (static data only)
export async function generateMetadata({ params }) {
  const slug = (await params).slug
  const gameData = await fetchGameDetails(slug);

  if (!gameData?.data) {
    return {
      title: "Game Not Found - Jawal Games",
      description: "The requested game could not be found.",
    };
  }

  const game = gameData.data.data;
  const gameUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`;
  return {
    title: `${game.title} - Jawal Games`,
    description: game.description,
    alternates: { canonical: gameUrl },
    openGraph: {
      title: `${game.title} - Jawal Games`,
      description: game.description,
      images: [
        {
          url: game.thumbnail,
          width: 1200,
          height: 630,
          alt: game.title,
        },
      ],
      url: gameUrl,
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

// Main server component
export default async function GamePage({ params }) {
  const slug = (await params).slug
  const [gameDetailsData, gameStatsData, moreGamesData] = await Promise.all([
    fetchGameDetails(slug), // Static forever
    fetchGameStats(slug), // Never cached
    fetchMoreGames(), // Daily cache
  ])

  if (!gameDetailsData?.data) {
    notFound();
  }

  const gameDetails = gameDetailsData.data.data;
  const gameStats = gameStatsData.data.data || { views: 0, likes: 0 };
  const moreGames = moreGamesData?.data.data || [];
  return (
    // <Suspense fallback={<GamePageSkeleton />}>
      <GamePageClient
        gameDetails={gameDetails}
        initialGameStats={gameStats}
        moreGames={moreGames}
        slug={slug}
      />
    // </Suspense>
  );
}

function GamePageSkeleton() {
  return (
    <div className="container">
      <div className="py-3">
        <div className="btn btn-outline-light rounded-pill mb-3 placeholder-glow">
          <span className="placeholder col-3"></span>
        </div>
      </div>
      <div className="text-center mb-4">
        <div className="placeholder-glow">
          <span
            className="placeholder col-6 mb-3"
            style={{ height: "2rem" }}
          ></span>
        </div>
        <div className="placeholder-glow mb-5">
          <span
            className="placeholder col-12"
            style={{ height: "400px" }}
          ></span>
        </div>
      </div>
    </div>
  );
}
