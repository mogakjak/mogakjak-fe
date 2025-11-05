import type { NextConfig } from "next";
import path from "path";
import type { RuleSetRule } from "webpack";
const RAW = process.env.NEXT_PUBLIC_API_PROXY; // 정확히 이 키로 설정했는지 확인
console.log("[build] NEXT_PUBLIC_API_PROXY =", JSON.stringify(RAW));

const BASE = RAW?.replace(/\/+$/, ""); // 끝의 / 제거

if (!BASE) {
  throw new Error(
    "❌ Missing env NEXT_PUBLIC_API_PROXY. " +
      "Vercel Project > Settings > Environment Variables에 " +
      "http(s)://로 시작하는 값으로 넣고, Redeploy 하세요."
  );
}
if (!/^https?:\/\//.test(BASE)) {
  throw new Error(
    "❌ NEXT_PUBLIC_API_PROXY는 반드시 http:// 또는 https:// 로 시작해야 합니다. 현재: " +
      JSON.stringify(BASE)
  );
}
const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_API_PROXY}/api/:path*`,
        },
      ],
    };
  },

  webpack(config) {
    const assetRule = (config.module.rules as RuleSetRule[]).find(
      (rule) => rule?.test instanceof RegExp && rule.test.test(".svg")
    );
    if (assetRule) {
      assetRule.exclude = /\.svg$/i;
    }

    config.module.rules.push({
      test: /\.svg$/i,
      oneOf: [
        { resourceQuery: /url/, type: "asset/resource" },
        {
          issuer: /\.[jt]sx?$/,
          use: [
            {
              loader: "@svgr/webpack",
              options: {
                svgo: true,
                svgoConfig: {
                  plugins: [
                    { name: "removeAttrs", params: { attrs: "(fill|stroke)" } },
                  ],
                },
                typescript: true,
                expandProps: "end",
              },
            },
          ],
        },
      ],
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      "/Icons": path.resolve(process.cwd(), "public/Icons"),
    };

    return config;
  },
};

export default nextConfig;
