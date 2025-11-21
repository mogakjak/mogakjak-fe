import type { NextConfig } from "next";
import path from "path";
import type { RuleSetRule } from "webpack";

const nextConfig: NextConfig = {
  // 배포 환경에서 정적 파일 경로를 올바르게 설정
  // 프로덕션 환경에서는 assetPrefix를 사용하지 않음 (같은 도메인에서 서빙)
  // assetPrefix는 CDN이나 다른 도메인에서 정적 파일을 서빙할 때만 사용

  async rewrites() {
    const apiProxy =
      process.env.NEXT_PUBLIC_API_PROXY || "https://mogakjak.site";
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/api/:path*",
          destination: `${apiProxy}/api/:path*`,
        },
      ],
    };
  },
  images: {
    domains: ["kr.object.ncloudstorage.com"],
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
  htmlLimitedBots: /(kakaotalk|facebookexternalhit|twitterbot|slackbot)/i,
};

export default nextConfig;
