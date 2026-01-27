
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  generateBuildId: async () => {
    // This will create a new build id every time, forcing a clean build.
    return new Date().getTime().toString();
  },
};

export default nextConfig;
