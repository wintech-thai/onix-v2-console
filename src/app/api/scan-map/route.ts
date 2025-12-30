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
    const dateFrom =
      searchParams.get("dateFrom") || dayjs().startOf("day").toISOString();
    const dateTo =
      searchParams.get("dateTo") || dayjs().endOf("day").toISOString();
    const orgId = searchParams.get("orgId") || "";
    const fullTextSearch = searchParams.get("searchValue") || "";

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

    const filters: any[] = [
      { term: { "data.api.OrgId.keyword": orgId } },
      { term: { "data.Environment.keyword": envRun } },
      { term: { "data.api.ApiName.keyword": "Verify" } },
      {
        range: {
          "@timestamp": {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      },
      // Only get records with valid geoip location
      {
        exists: {
          field: "geoip.location",
        },
      },
    ];

    const should: any[] = [];

    if (fullTextSearch) {
      // Wildcard search for partial matching
      const wildcardQuery = `*${fullTextSearch}*`;

      should.push({
        query_string: {
          query: wildcardQuery,
          fields: [
            "data.ContextData.Serial^5",
            "data.ContextData.Pin^4",
            "data.ContextData.CustomerEmail.keyword^3",
            "data.ContextData.ProductCode.keyword^3",
            "data.ContextData.FolderName.keyword^2",
            "geoip.country_name.keyword",
            "geoip.city_name.keyword",
          ],
          default_operator: "AND",
        },
      });
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

    // Fetch map data (limited to 1000 records)
    const mapDataResult = await esClient.search({
      index: indexPattern,
      size: 1000,
      track_total_hits: true,
      sort: [{ "@timestamp": { order: "desc" } }],
      query: esQuery,
      _source: [
        "geoip.location",
        "geoip.country_name",
        "geoip.city_name",
        "data.ContextData.ProductCode",
        "data.ContextData.ProductDesc",
        "data.ContextData.CustomerEmail",
      ],
    });

    // Fetch aggregations
    const aggResult = await esClient.search({
      index: indexPattern,
      size: 0,
      query: esQuery,
      aggs: {
        by_product: {
          terms: {
            field: "data.ContextData.ProductCode.keyword",
            size: 10,
            order: { _count: "desc" },
          },
          aggs: {
            product_desc: {
              terms: {
                field: "data.ContextData.ProductDesc.keyword",
                size: 1,
              },
            },
          },
        },
        by_province: {
          terms: {
            field: "geoip.city_name.keyword",
            size: 10,
            order: { _count: "desc" },
          },
        },
        by_email: {
          terms: {
            field: "data.ContextData.CustomerEmail.keyword",
            size: 10,
            order: { _count: "desc" },
          },
        },
      },
    });

    const mapData = (mapDataResult.hits.hits || []).map((hit: any) => ({
      id: hit._id,
      location: hit._source?.geoip?.location,
      country: hit._source?.geoip?.country_name,
      province: hit._source?.geoip?.city_name,
      productCode: hit._source?.data?.ContextData?.ProductCode,
      productDesc: hit._source?.data?.ContextData?.ProductDesc,
      email: hit._source?.data?.ContextData?.CustomerEmail,
    }));

    const aggregations = {
      byProduct: (aggResult.aggregations?.by_product as any)?.buckets?.map(
        (bucket: any) => ({
          productCode: bucket.key,
          productDesc: bucket.product_desc?.buckets?.[0]?.key || bucket.key,
          count: bucket.doc_count,
        })
      ) || [],
      byProvince: (aggResult.aggregations?.by_province as any)?.buckets?.map(
        (bucket: any) => ({
          province: bucket.key,
          count: bucket.doc_count,
        })
      ) || [],
      byEmail: (aggResult.aggregations?.by_email as any)?.buckets?.map(
        (bucket: any) => ({
          email: bucket.key,
          count: bucket.doc_count,
        })
      ) || [],
    };

    return NextResponse.json(
      {
        mapData,
        aggregations,
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
