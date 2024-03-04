import { maxWith } from "jsr:@std/collections@^0.218.2";
import { compare, format, parse, SemVer } from "jsr:@std/semver@^0.218.2";
import { Application, Router, RouterContext } from "jsr:@oak/oak@14";
import { Format, makeBadge, ValidationError } from "npm:badge-maker@3.3.1";

async function getVersion(
  { scope, name, filter }: {
    scope: string;
    name: string;
    filter: "stable" | "unstable";
  },
): Promise<SemVer | null> {
  const response = await fetch(`https://jsr.io/@${scope}/${name}/meta.json`, {
    headers: { accept: "application/json" },
  });
  const json = await response.json();
  const versions: SemVer[] = [];
  for (const v in json.versions) {
    if (json.versions[v].yanked) continue;
    const version = parse(v);
    if (
      filter === "stable" && version.prerelease != null &&
      version.prerelease.length > 0
    ) continue;
    versions.push(version);
  }
  return maxWith(versions, compare) ?? null;
}

function respondWithBadge<T extends string>(
  context: RouterContext<T>,
  { scope, name, version }: {
    scope: string;
    name: string;
    version: SemVer | null;
  },
) {
  const query = context.request.url.searchParams;
  const label = query.get("label");
  const cacheSecondsStr = query.get("cacheSeconds");
  context.response.type = "image/svg+xml";
  const cacheSeconds = cacheSecondsStr?.match(/^\d+$/) == null
    ? 3600
    : parseInt(cacheSecondsStr);
  context.response.headers.set(
    "Cache-Control",
    `max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
  );
  const now = new Date();
  context.response.headers.set("Last-Modified", now.toUTCString());
  context.response.headers.set(
    "Expires",
    new Date(now.getTime() + cacheSeconds * 1000).toUTCString(),
  );
  try {
    context.response.body = makeBadge({
      label: label == null ? `jsr.io/@${scope}/${name}` : label,
      message: version == null ? "not released" : `v${format(version)}`,
      color: query.get("color") ?? "fe7d37",
      labelColor: query.get("labelColor") ?? "gray",
      style: query.get("style") as Format["style"] ?? "flat",
    });
  } catch (e) {
    if (e instanceof ValidationError) {
      context.response.status = 400;
      context.response.body = makeBadge({
        label: "error",
        message: e.message,
        color: "red",
      });
      return;
    }
    throw e;
  }
}

const router = new Router();
router.get("/@:scope/:name/unstable.svg", async (context) => {
  const version = await getVersion({ ...context.params, filter: "unstable" });
  respondWithBadge(context, { ...context.params, version });
});
router.get("/@:scope/:name/stable.svg", async (context) => {
  const version = await getVersion({ ...context.params, filter: "stable" });
  respondWithBadge(context, { ...context.params, version });
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

if (import.meta.main) {
  await app.listen({ port: 8000 });
}
