/** @type {import('next').NextConfig} */
const remotePatterns = [
	{ protocol: 'http', hostname: 'localhost', port: '8082', pathname: '/uploads/**' },
	{ protocol: 'http', hostname: '127.0.0.1', port: '8082', pathname: '/uploads/**' },
];

// If an API URL is provided, also allow its host
if (process.env.NEXT_PUBLIC_API_URL) {
	try {
		const u = new URL(process.env.NEXT_PUBLIC_API_URL);
		remotePatterns.push({
			protocol: u.protocol.replace(':', ''),
			hostname: u.hostname,
			port: u.port || '',
			pathname: '/uploads/**',
		});
	} catch {}
}

const nextConfig = {
	images: {
		remotePatterns,
	},
	// async redirects() {
	// 	return [
	// 		{ source: '/products', destination: '/resources', permanent: true },
	// 		{ source: '/products/:id', destination: '/resources/:id', permanent: true },
	// 		{ source: '/admin/products', destination: '/admin/resources', permanent: true },
	// 	];
	// },
};

export default nextConfig;
