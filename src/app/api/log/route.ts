/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getESClient } from "@/lib/es-client";
import dayjs from "dayjs";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const esClient = getESClient();
    const indexPattern = process.env.ES_INDEX_PATTERN || "onix-v2-*";
    const envRun = process.env.ENV_RUN || process.env.NODE_ENV || "Development";

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? "50");
    const offset = Number(searchParams.get("offset") ?? "0");
    const fullTextSearch = searchParams.get("searchValue") || "";
    const dateFrom =
      searchParams.get("dateFrom") || dayjs().startOf("day").toISOString();
    const dateTo =
      searchParams.get("dateTo") || dayjs().endOf("day").toISOString();
    const orgId = searchParams.get("orgId") || "";

    // Validate if user has access to the organization
    if (!orgId) {
      return NextResponse.json(
        {
          error: "ORG_ID_REQUIRED",
          message: "Organization ID is required",
        },
        { status: 400 }
      );
    }

    const size = Number.isNaN(limit) || limit <= 0 ? 50 : limit;
    const from = Number.isNaN(offset) || offset < 0 ? 0 : offset;

    const filters: any[] = [
      { term: { "data.api.OrgId.keyword": orgId } },
      { term: { "data.Environment.keyword": envRun } },
      {
        range: {
          "@timestamp": {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      },
    ];

    const should: any[] = [];

    if (fullTextSearch) {
      // fulltext กับ field ข้อความ
      should.push({
        multi_match: {
          query: fullTextSearch,
          type: "best_fields",
          fields: [
            "data.userInfo.UserName^5",
            "data.api.ApiName^3",
            "data.userInfo.Role",
            "data.UserAgent",
            "data.CfClientIp",
            "data.ClientIp",
          ],
          // operator: "and",
          fuzziness: "AUTO",
        },
      });

      const asNumber = Number(fullTextSearch);
      if (!Number.isNaN(asNumber)) {
        should.push({
          term: {
            "data.StatusCode": asNumber,
          },
        });
      }
    }

    const esQuery: any = {
      bool: {
        filter: filters,
        ...(should.length
          ? {
              should,
              minimum_should_match: 1,
            }
          : {}),
      },
    };

    const result = await esClient.search({
      index: indexPattern,
      size,
      from,
      track_total_hits: true,
      sort: [{ "@timestamp": { order: "desc" } }],
      query: esQuery,
    });

    const hits = (result.hits.hits || []).map((hit: any) => ({
      id: hit._id,
      index: hit._index,
      source: hit._source,
    }));

    const totalRaw: any = result.hits.total;
    const total =
      typeof totalRaw === "number" ? totalRaw : totalRaw?.value ?? 0;

    return NextResponse.json(
      {
        total,
        limit: size,
        offset: from,
        items: hits,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("ES search error:", err);
    return NextResponse.json(
      {
        error: "ES_SEARCH_FAILED",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
