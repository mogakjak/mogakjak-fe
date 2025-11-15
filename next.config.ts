import type { NextConfig } from "next";
import path from "path";
import type { RuleSetRule } from "webpack";

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
