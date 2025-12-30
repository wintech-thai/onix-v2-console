/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getESClient } from "@/lib/es-client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get("orgId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const searchValue = searchParams.get("searchValue") || "";

    if (!orgId || !dateFrom || !dateTo) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Calculate appropriate interval based on date range
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

    let interval: string;
    if (daysDiff <= 2) {
      interval = "1h";
    } else if (daysDiff <= 7) {
      interval = "3h";
    } else if (daysDiff <= 30) {
      interval = "6h";
    } else {
      interval = "1d";
    }

    const esClient = getESClient();
    const indexPattern = process.env.ES_INDEX_PATTERN || "onix-v2-*";

    // Build query with optional search
    const mustClauses: any[] = [
      {
        term: {
          "data.ContextData.OrgId.keyword": orgId,
        },
      },
      {
        range: {
          "@timestamp": {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      },
    ];

    // Add search filter if provided
    if (searchValue) {
      mustClauses.push({
        query_string: {
          query: `*${searchValue}*`,
          fields: [
            "data.ContextData.CustomerEmail.keyword",
            "data.ContextData.ProductCode.keyword",
            "data.ContextData.FolderName.keyword",
            "geoip.country_name.keyword",
            "geoip.city_name.keyword",
          ],
        },
      });
    }

    const response = await esClient.search({
      index: indexPattern,
      body: {
        size: 0,
        query: {
          bool: {
            must: mustClauses,
          },
        },
        aggs: {
          timeline: {
            date_histogram: {
              field: "@timestamp",
              fixed_interval: interval,
              time_zone: "Asia/Bangkok",
              min_doc_count: 0,
              extended_bounds: {
                min: dateFrom,
                max: dateTo,
              },
            },
            aggs: {
              by_product: {
                terms: {
                  field: "data.ContextData.ProductCode.keyword",
                  size: 50,
                  missing: "Unknown",
                },
              },
            },
          },
        },
      },
    });

    // Transform aggregation results
    const buckets = (response.aggregations?.timeline as any)?.buckets || [];

    const timelineData = buckets.map((bucket: any) => {
      const productCounts: Record<string, number> = {};

      bucket.by_product.buckets.forEach((productBucket: any) => {
        productCounts[productBucket.key] = productBucket.doc_count;
      });

      return {
        timestamp: bucket.key_as_string || bucket.key,
        total: bucket.doc_count,
        productCounts,
      };
    });

    return NextResponse.json({
      data: timelineData,
      interval,
      total: response.hits.total,
    });
  } catch (error) {
    console.error("Error fetching scan timeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan timeline" },
      { status: 500 }
    );
  }
}
