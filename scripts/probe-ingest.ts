import { fetchLiveNotices } from "../src/lib/shutdowns/parser";

async function main() {
  const r = await fetchLiveNotices();
  console.log(
    JSON.stringify(
      {
        source: r.source,
        count: r.notices.length,
        tried: r.tried,
        error: r.error,
        sample: r.notices.slice(0, 5).map((n) => ({
          title: n.title,
          localities: n.localities.slice(0, 8),
          startsAt: n.startsAt,
          endsAt: n.endsAt,
          source: n.source,
          sourceLabel: n.sourceLabel,
        })),
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
