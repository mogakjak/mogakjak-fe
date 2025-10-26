import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack(config) {
    const assetRule = (config.module.rules as any[]).find(
      (rule) => rule?.test?.test && rule.test.test(".svg")
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
