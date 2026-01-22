import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ["www.gravatar.com", "i.imgur.com"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
        ],
    },
};

export default nextConfig;
