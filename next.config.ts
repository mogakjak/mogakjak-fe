import type { NextConfig } from "next";
import path from "path";
import type { RuleSetRule } from "webpack";

const nextConfig: NextConfig = {
  // 배포 환경에서 정적 파일 경로를 올바르게 설정
  // 프로덕션 환경에서는 assetPrefix를 사용하지 않음 (같은 도메인에서 서빙)
  // assetPrefix는 CDN이나 다른 도메인에서 정적 파일을 서빙할 때만 사용

  compress: true, // gzip 압축 활성화
  productionBrowserSourceMaps: false, // 프로덕션 소스맵 비활성화 (빌드 크기 감소)

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
  webpack(config, { dev, isServer }) {
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

    // 프로덕션 빌드 시 minification 최적화
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          ...(config.optimization?.minimizer || []),
        ],
      };
    }

    // CSS 최적화 설정 - Material-UI/Emotion 최적화
    if (!dev) {
      // Emotion의 CSS-in-JS 최적화
      config.resolve.alias = {
        ...config.resolve.alias,
        "@emotion/react": require.resolve("@emotion/react"),
        "@emotion/styled": require.resolve("@emotion/styled"),
      };
    }

    return config;
  },
};

export default nextConfig;
